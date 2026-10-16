const db = require('../config/db');
const { hotelRoomsGauge } = require('../config/metrics');

// Cập nhật lại số lượng phòng theo trạng thái cho Prometheus metrics
const updateRoomGauges = async () => {
  try {
    const res = await db.query(`
      SELECT status, COUNT(*) as count 
      FROM rooms 
      GROUP BY status
    `);
    // Reset gauges
    hotelRoomsGauge.set({ status: 'available' }, 0);
    hotelRoomsGauge.set({ status: 'occupied' }, 0);
    hotelRoomsGauge.set({ status: 'maintenance' }, 0);

    res.rows.forEach(row => {
      hotelRoomsGauge.set({ status: row.status }, parseInt(row.count, 10));
    });
  } catch (err) {
    console.error('Lỗi cập nhật metrics room gauge:', err.message);
  }
};

// 1. LẤY DANH SÁCH PHÒNG (Kèm lọc đa tiêu chí & kiểm tra khả dụng theo ngày)
const getAllRooms = async (req, res, next) => {
  try {
    const { 
      type, 
      min_price, 
      max_price, 
      capacity, 
      check_in, 
      check_out, 
      status, 
      search 
    } = req.query;

    let queryText = `
      SELECT 
        r.id,
        r.room_number,
        r.room_type_id,
        rt.name AS room_type_name,
        rt.code AS room_type_code,
        rt.bed_type,
        rt.room_size,
        r.title,
        r.floor,
        r.price_per_night,
        r.max_guests,
        r.status,
        r.description,
        r.image_url,
        r.images,
        r.amenities,
        r.created_at,
        r.updated_at
      FROM rooms r
      JOIN room_types rt ON r.room_type_id = rt.id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    // Lọc theo loại phòng
    if (type) {
      if (isNaN(type)) {
        queryText += ` AND rt.code = $${paramIndex}`;
        params.push(type);
      } else {
        queryText += ` AND r.room_type_id = $${paramIndex}`;
        params.push(parseInt(type, 10));
      }
      paramIndex++;
    }

    // Lọc theo mức giá tối thiểu
    if (min_price) {
      queryText += ` AND r.price_per_night >= $${paramIndex}`;
      params.push(parseFloat(min_price));
      paramIndex++;
    }

    // Lọc theo mức giá tối đa
    if (max_price) {
      queryText += ` AND r.price_per_night <= $${paramIndex}`;
      params.push(parseFloat(max_price));
      paramIndex++;
    }

    // Lọc theo sức chứa tối thiểu
    if (capacity) {
      queryText += ` AND r.max_guests >= $${paramIndex}`;
      params.push(parseInt(capacity, 10));
      paramIndex++;
    }

    // Lọc theo trạng thái phòng (mặc định cho khách là chỉ hiện phòng không bị bảo trì)
    if (status) {
      queryText += ` AND r.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    } else {
      queryText += ` AND r.status != 'maintenance'`;
    }

    // Tìm kiếm theo từ khóa (tên hoặc số phòng)
    if (search) {
      queryText += ` AND (r.title ILIKE $${paramIndex} OR r.room_number ILIKE $${paramIndex} OR r.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Kiểm tra phòng còn trống trong khoảng ngày nhận/trả phòng
    if (check_in && check_out) {
      queryText += `
        AND r.id NOT IN (
          SELECT b.room_id 
          FROM bookings b
          WHERE b.status NOT IN ('cancelled')
            AND NOT (b.check_out_date <= $${paramIndex}::date OR b.check_in_date >= $${paramIndex + 1}::date)
        )
      `;
      params.push(check_in, check_out);
      paramIndex += 2;
    }

    queryText += ` ORDER BY r.price_per_night ASC, r.room_number ASC`;

    const result = await db.query(queryText, params);

    // Cập nhật metrics gauge ngầm
    updateRoomGauges();

    res.json({
      success: true,
      total: result.rowCount,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

// 2. LẤY CHI TIẾT PHÒNG THEO ID
const getRoomById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const queryText = `
      SELECT 
        r.id,
        r.room_number,
        r.room_type_id,
        rt.name AS room_type_name,
        rt.code AS room_type_code,
        rt.bed_type,
        rt.room_size,
        r.title,
        r.floor,
        r.price_per_night,
        r.max_guests,
        r.status,
        r.description,
        r.image_url,
        r.images,
        r.amenities,
        r.created_at,
        r.updated_at
      FROM rooms r
      JOIN room_types rt ON r.room_type_id = rt.id
      WHERE r.id = $1
    `;

    const result = await db.query(queryText, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng tương ứng với ID yêu cầu',
      });
    }

    // Lấy danh sách ngày đã có người đặt trong tương lai để khách tránh chọn trùng
    const bookedDatesQuery = `
      SELECT check_in_date, check_out_date, status
      FROM bookings
      WHERE room_id = $1 
        AND status NOT IN ('cancelled')
        AND check_out_date >= CURRENT_DATE
      ORDER BY check_in_date ASC
    `;
    const bookedDates = await db.query(bookedDatesQuery, [id]);

    res.json({
      success: true,
      data: {
        ...result.rows[0],
        booked_ranges: bookedDates.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 3. LẤY DANH SÁCH LOẠI PHÒNG
const getRoomTypes = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT 
        rt.*,
        COUNT(r.id) AS total_rooms,
        COUNT(CASE WHEN r.status = 'available' THEN 1 END) AS available_rooms
      FROM room_types rt
      LEFT JOIN rooms r ON rt.id = r.room_type_id
      GROUP BY rt.id
      ORDER BY rt.base_price ASC
    `);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

// 4. TẠO PHÒNG MỚI (Admin)
const createRoom = async (req, res, next) => {
  try {
    const {
      room_number,
      room_type_id,
      title,
      floor,
      price_per_night,
      max_guests,
      status = 'available',
      description,
      image_url,
      images = [],
      amenities = []
    } = req.body;

    if (!room_number || !room_type_id || !title || !price_per_night) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ: số phòng, loại phòng, tên phòng và giá',
      });
    }

    // Kiểm tra trùng số phòng
    const checkExist = await db.query('SELECT id FROM rooms WHERE room_number = $1', [room_number]);
    if (checkExist.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Số phòng ${room_number} đã tồn tại trong hệ thống`,
      });
    }

    const insertText = `
      INSERT INTO rooms (
        room_number, room_type_id, title, floor, price_per_night, 
        max_guests, status, description, image_url, images, amenities
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      room_number,
      room_type_id,
      title,
      floor || 1,
      price_per_night,
      max_guests || 2,
      status,
      description || '',
      image_url || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      images,
      amenities
    ];

    const result = await db.query(insertText, values);
    updateRoomGauges();

    res.status(201).json({
      success: true,
      message: 'Tạo phòng mới thành công',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// 5. CẬP NHẬT THÔNG TIN PHÒNG (Admin)
const updateRoom = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      room_type_id,
      floor,
      price_per_night,
      max_guests,
      status,
      description,
      image_url,
      images,
      amenities
    } = req.body;

    const queryText = `
      UPDATE rooms
      SET 
        title = COALESCE($1, title),
        room_type_id = COALESCE($2, room_type_id),
        floor = COALESCE($3, floor),
        price_per_night = COALESCE($4, price_per_night),
        max_guests = COALESCE($5, max_guests),
        status = COALESCE($6, status),
        description = COALESCE($7, description),
        image_url = COALESCE($8, image_url),
        images = COALESCE($9, images),
        amenities = COALESCE($10, amenities),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING *
    `;

    const values = [
      title, room_type_id, floor, price_per_night, 
      max_guests, status, description, image_url, images, amenities, id
    ];

    const result = await db.query(queryText, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng để cập nhật',
      });
    }

    updateRoomGauges();

    res.json({
      success: true,
      message: 'Cập nhật thông tin phòng thành công',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// 6. XÓA PHÒNG (Admin)
const deleteRoom = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Kiểm tra xem phòng có booking nào đang hoạt động không
    const checkBookings = await db.query(`
      SELECT id FROM bookings 
      WHERE room_id = $1 AND status IN ('confirmed', 'checked_in')
    `, [id]);

    if (checkBookings.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa phòng đang có lịch đặt phòng hoạt động. Vui lòng chuyển trạng thái sang Bảo trì.',
      });
    }

    const result = await db.query('DELETE FROM rooms WHERE id = $1 RETURNING id, room_number', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng để xóa',
      });
    }

    updateRoomGauges();

    res.json({
      success: true,
      message: `Đã xóa phòng ${result.rows[0].room_number} thành công`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRooms,
  getRoomById,
  getRoomTypes,
  createRoom,
  updateRoom,
  deleteRoom,
  updateRoomGauges,
};
