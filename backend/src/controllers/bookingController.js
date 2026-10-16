const db = require('../config/db');
const { hotelBookingsTotal, hotelRevenueTotal } = require('../config/metrics');

// Hàm tạo mã đặt phòng ngẫu nhiên duy nhất (VD: BK-749215)
const generateBookingCode = () => {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `BK-${randomNum}`;
};

// 1. TẠO ĐẶT PHÒNG MỚI (Atomic Transaction, Khóa dòng & Lưu Customers)
const createBooking = async (req, res, next) => {
  const client = await db.pool.connect();
  try {
    const {
      room_id,
      customer_name,
      customer_email,
      customer_phone,
      id_card = '',
      address = '',
      check_in_date,
      check_out_date,
      num_guests = 1,
      special_requests = '',
    } = req.body;

    // 1.1 Kiểm tra các trường bắt buộc
    if (!room_id || !customer_name || !customer_email || !customer_phone || !check_in_date || !check_out_date) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ các thông tin: Họ tên, Email, Số điện thoại, Phòng và Ngày lưu trú',
      });
    }

    // 1.2 Kiểm tra logic ngày nhận và trả phòng
    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Định dạng ngày nhận/trả phòng không hợp lệ (định dạng chuẩn: YYYY-MM-DD)',
      });
    }

    // Không cho phép ngày trả phòng trước hoặc bằng ngày nhận phòng
    if (checkOut <= checkIn) {
      return res.status(400).json({
        success: false,
        message: 'Ngày trả phòng phải sau ngày nhận phòng ít nhất 1 đêm',
      });
    }

    // Tính số đêm lưu trú hoàn toàn tại máy chủ
    const diffTime = Math.abs(checkOut - checkIn);
    const totalNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (totalNights <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Thời gian lưu trú tối thiểu là 1 đêm',
      });
    }

    // Bắt đầu giao dịch cơ sở dữ liệu (Transaction) để đảm bảo an toàn toàn vẹn dữ liệu
    await client.query('BEGIN');

    // 1.3 Lấy thông tin phòng và khóa dòng (Row-level lock) để ngăn đặt trùng phòng cùng tích tắc
    const roomQuery = `
      SELECT r.*, rt.code AS room_type_code, rt.name AS room_type_name 
      FROM rooms r
      JOIN room_types rt ON r.room_type_id = rt.id
      WHERE r.id = $1 
      FOR UPDATE
    `;
    const roomResult = await client.query(roomQuery, [room_id]);

    if (roomResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Phòng được chọn không tồn tại trong hệ thống',
      });
    }

    const room = roomResult.rows[0];

    // Kiểm tra trạng thái bảo trì
    if (room.status === 'maintenance') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Phòng này hiện đang trong quá trình bảo trì, vui lòng chọn phòng khác',
      });
    }

    // Kiểm tra sức chứa
    if (parseInt(num_guests, 10) > room.max_guests) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: `Số lượng khách (${num_guests}) vượt quá sức chứa tối đa của phòng (${room.max_guests} người)`,
      });
    }

    // 1.4 Kiểm tra xung đột ngày đặt phòng (Chống Double-Booking an toàn tuyệt đối)
    const conflictQuery = `
      SELECT id, booking_code, check_in_date, check_out_date 
      FROM bookings
      WHERE room_id = $1 
        AND status NOT IN ('cancelled')
        AND NOT (check_out_date <= $2::date OR check_in_date >= $3::date)
    `;
    const conflictResult = await client.query(conflictQuery, [room_id, check_in_date, check_out_date]);

    if (conflictResult.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        success: false,
        message: 'Rất tiếc! Phòng này đã có khách đặt trong khoảng thời gian quý khách đã chọn. Vui lòng chọn khoảng thời gian hoặc phòng khác.',
      });
    }

    // 1.5 Tìm hoặc tạo hồ sơ khách hàng trong bảng customers
    const cleanEmail = customer_email.trim().toLowerCase();
    const cleanPhone = customer_phone.trim();
    const cleanName = customer_name.trim();

    let customerId;
    const findCustomerQuery = `
      SELECT id FROM customers 
      WHERE LOWER(email) = $1 AND phone = $2
    `;
    const customerResult = await client.query(findCustomerQuery, [cleanEmail, cleanPhone]);

    if (customerResult.rows.length > 0) {
      customerId = customerResult.rows[0].id;
      // Cập nhật lại họ tên nếu có thay đổi
      await client.query(
        'UPDATE customers SET full_name = $1, id_card = COALESCE(NULLIF($2, \'\'), id_card), address = COALESCE(NULLIF($3, \'\'), address) WHERE id = $4',
        [cleanName, id_card, address, customerId]
      );
    } else {
      const insertCustomerQuery = `
        INSERT INTO customers (full_name, email, phone, id_card, address)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `;
      const newCustomer = await client.query(insertCustomerQuery, [cleanName, cleanEmail, cleanPhone, id_card, address]);
      customerId = newCustomer.rows[0].id;
    }

    // 1.6 Tính tổng tiền tại backend (KHÔNG TIN TƯỞNG GIÁ TỪ FRONTEND)
    const roomPrice = parseFloat(room.price_per_night);
    const totalAmount = totalNights * roomPrice;
    const bookingCode = generateBookingCode();

    // 1.7 Chèn bản ghi đặt phòng mới
    const insertBookingQuery = `
      INSERT INTO bookings (
        booking_code, customer_id, room_id, check_in_date, check_out_date,
        num_guests, total_nights, room_price, total_amount, special_requests,
        status, payment_status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'confirmed', 'unpaid')
      RETURNING *
    `;

    const bookingValues = [
      bookingCode,
      customerId,
      room_id,
      check_in_date,
      check_out_date,
      parseInt(num_guests, 10),
      totalNights,
      roomPrice,
      totalAmount,
      special_requests,
    ];

    const newBookingResult = await client.query(insertBookingQuery, bookingValues);
    const createdBooking = newBookingResult.rows[0];

    // 1.8 Ghi nhật ký lịch sử trạng thái ban đầu (booking_status_history)
    const insertHistoryQuery = `
      INSERT INTO booking_status_history (booking_id, old_status, new_status, changed_by, notes)
      VALUES ($1, NULL, 'confirmed', 'customer', 'Khách hàng hoàn tất đặt phòng trực tuyến')
    `;
    await client.query(insertHistoryQuery, [createdBooking.id]);

    await client.query('COMMIT');

    // Cập nhật Prometheus Metrics
    hotelBookingsTotal.inc({ status: 'confirmed' });
    hotelRevenueTotal.inc({ room_type: room.room_type_code }, totalAmount);

    res.status(201).json({
      success: true,
      message: 'Đặt phòng thành công! Mã đặt phòng của quý khách là: ' + bookingCode,
      data: {
        ...createdBooking,
        customer_name: cleanName,
        customer_email: cleanEmail,
        customer_phone: cleanPhone,
        room_title: room.title,
        room_number: room.room_number,
        room_type_name: room.room_type_name,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

// 2. TRA CỨU ĐẶT PHÒNG BẢO MẬT (Bắt buộc Mã đặt phòng VÀ Email để chống xem trộm)
const lookupBooking = async (req, res, next) => {
  try {
    const { code, email } = req.query;

    if (!code || !email) {
      return res.status(400).json({
        success: false,
        message: 'Để bảo vệ quyền riêng tư, vui lòng nhập chính xác cả Mã đặt phòng và Email đã đăng ký.',
      });
    }

    const queryText = `
      SELECT 
        b.*,
        c.full_name AS customer_name,
        c.email AS customer_email,
        c.phone AS customer_phone,
        r.room_number,
        r.title AS room_title,
        r.image_url AS room_image,
        rt.name AS room_type_name
      FROM bookings b
      JOIN customers c ON b.customer_id = c.id
      JOIN rooms r ON b.room_id = r.id
      JOIN room_types rt ON r.room_type_id = rt.id
      WHERE UPPER(b.booking_code) = UPPER($1) 
        AND LOWER(c.email) = LOWER($2)
    `;

    const result = await db.query(queryText, [code.trim(), email.trim()]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn đặt phòng phù hợp với mã và email đã cung cấp.',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// 3. HỦY ĐẶT PHÒNG BẢO MẬT (Có quy tắc thời gian và ghi lịch sử)
const cancelBooking = async (req, res, next) => {
  const client = await db.pool.connect();
  try {
    const { code } = req.params;
    const { email, reason = 'Khách yêu cầu hủy qua website' } = req.body;

    // Yêu cầu email xác thực nếu không phải request từ quản trị viên
    const isAdmin = req.user && req.user.role === 'admin';
    if (!isAdmin && !email) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp email đăng ký để xác nhận quyền hủy đơn đặt phòng.',
      });
    }

    await client.query('BEGIN');

    // Tìm đơn đặt phòng kèm khóa dòng
    let findQuery = `
      SELECT b.*, c.email AS customer_email 
      FROM bookings b
      JOIN customers c ON b.customer_id = c.id
      WHERE UPPER(b.booking_code) = UPPER($1)
      FOR UPDATE
    `;
    const findResult = await client.query(findQuery, [code.trim()]);

    if (findResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn đặt phòng yêu cầu.',
      });
    }

    const booking = findResult.rows[0];

    // Kiểm tra tính hợp lệ của email khách
    if (!isAdmin && booking.customer_email.toLowerCase() !== email.trim().toLowerCase()) {
      await client.query('ROLLBACK');
      return res.status(403).json({
        success: false,
        message: 'Email xác nhận không khớp với thông tin đơn đặt phòng.',
      });
    }

    // Không cho phép hủy khi đã check-in hoặc check-out hoặc đã hủy trước đó
    if (booking.status === 'checked_in' || booking.status === 'checked_out') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Không thể hủy đơn đặt phòng khi khách đã nhận phòng hoặc đã hoàn tất kỳ nghỉ.',
      });
    }

    if (booking.status === 'cancelled') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Đơn đặt phòng này đã được hủy trước đó.',
      });
    }

    // Quy tắc: Khách chỉ được hủy trước ngày nhận phòng ít nhất 24 giờ (Admin có quyền override)
    const checkInDate = new Date(booking.check_in_date);
    const now = new Date();
    const hoursDifference = (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (!isAdmin && hoursDifference < 24) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Theo chính sách khách sạn, chỉ được hủy phòng trước giờ nhận phòng ít nhất 24 tiếng. Vui lòng liên hệ hotline lễ tân (+84 236 3888 999).',
      });
    }

    // Cập nhật trạng thái thành 'cancelled' (Soft cancel, không xóa dữ liệu)
    const updateResult = await client.query(`
      UPDATE bookings
      SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [booking.id]);

    // Ghi nhật ký vào booking_status_history
    const changedBy = isAdmin ? `admin (${req.user.username})` : 'customer';
    await client.query(`
      INSERT INTO booking_status_history (booking_id, old_status, new_status, changed_by, notes)
      VALUES ($1, $2, 'cancelled', $3, $4)
    `, [booking.id, booking.status, changedBy, reason]);

    await client.query('COMMIT');

    hotelBookingsTotal.inc({ status: 'cancelled' });

    res.json({
      success: true,
      message: 'Hủy đơn đặt phòng thành công.',
      data: updateResult.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

// 4. LẤY TOÀN BỘ ĐẶT PHÒNG (Dành riêng cho Quản trị viên & Nhân viên)
const getAllBookings = async (req, res, next) => {
  try {
    const { status, search, limit = 50, page = 1 } = req.query;

    let queryText = `
      SELECT 
        b.*,
        c.full_name AS customer_name,
        c.email AS customer_email,
        c.phone AS customer_phone,
        c.id_card AS customer_id_card,
        r.room_number,
        r.title AS room_title,
        rt.name AS room_type_name
      FROM bookings b
      JOIN customers c ON b.customer_id = c.id
      JOIN rooms r ON b.room_id = r.id
      JOIN room_types rt ON r.room_type_id = rt.id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (status && status !== 'all') {
      queryText += ` AND b.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (search) {
      queryText += ` AND (
        b.booking_code ILIKE $${paramIndex} OR 
        c.full_name ILIKE $${paramIndex} OR 
        c.phone ILIKE $${paramIndex} OR 
        c.email ILIKE $${paramIndex} OR
        r.room_number ILIKE $${paramIndex}
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    queryText += ` ORDER BY b.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit, 10), (parseInt(page, 10) - 1) * parseInt(limit, 10));

    const result = await db.query(queryText, params);
    const countResult = await db.query('SELECT COUNT(*) FROM bookings');

    res.json({
      success: true,
      total: parseInt(countResult.rows[0].count, 10),
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

// 5. CẬP NHẬT TRẠNG THÁI ĐẶT PHÒNG (Admin & Staff - Ghi nhận lịch sử)
const updateBookingStatus = async (req, res, next) => {
  const client = await db.pool.connect();
  try {
    const { id } = req.params;
    const { status, payment_status, notes = '' } = req.body;

    const validStatuses = ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái đặt phòng không hợp lệ',
      });
    }

    await client.query('BEGIN');

    // Lấy trạng thái hiện tại
    const currentBooking = await client.query('SELECT * FROM bookings WHERE id = $1 FOR UPDATE', [id]);
    if (currentBooking.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn đặt phòng',
      });
    }

    const oldStatus = currentBooking.rows[0].status;

    // Cập nhật bản ghi booking
    const updateText = `
      UPDATE bookings
      SET 
        status = COALESCE($1, status),
        payment_status = COALESCE($2, payment_status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;
    const result = await client.query(updateText, [status, payment_status, id]);

    // Nếu trạng thái thay đổi, ghi vào booking_status_history
    if (status && status !== oldStatus) {
      const changedBy = req.user ? `${req.user.role} (${req.user.username})` : 'admin';
      await client.query(`
        INSERT INTO booking_status_history (booking_id, old_status, new_status, changed_by, notes)
        VALUES ($1, $2, $3, $4, $5)
      `, [id, oldStatus, status, changedBy, notes || `Cập nhật trạng thái sang ${status}`]);

      hotelBookingsTotal.inc({ status });
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Cập nhật trạng thái đơn đặt phòng thành công',
      data: result.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

// 6. LẤY LỊCH SỬ THAY ĐỔI TRẠNG THÁI (Audit Trail)
const getBookingHistory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const queryText = `
      SELECT * FROM booking_status_history
      WHERE booking_id = $1
      ORDER BY created_at ASC
    `;
    const result = await db.query(queryText, [id]);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  lookupBooking,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
  getBookingHistory,
};
