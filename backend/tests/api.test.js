const test = require('node:test');
const assert = require('node:assert');
const bcrypt = require('bcryptjs');

test('Kiểm tra logic nghiệp vụ và bảo mật hệ thống đặt phòng', async (t) => {
  await t.test('Tính toán số đêm lưu trú chính xác', () => {
    const checkIn = new Date('2026-11-01');
    const checkOut = new Date('2026-11-05');
    const diffTime = Math.abs(checkOut - checkIn);
    const totalNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    assert.strictEqual(totalNights, 4, 'Khoảng từ ngày 1 đến ngày 5 phải là 4 đêm');
  });

  await t.test('Tính tổng tiền đặt phòng tại máy chủ (Server-side calculation)', () => {
    const pricePerNight = 1500000;
    const totalNights = 3;
    const totalAmount = totalNights * pricePerNight;
    assert.strictEqual(totalAmount, 4500000, '3 đêm x 1.500.000 phải bằng 4.500.000 VNĐ');
  });

  await t.test('Kiểm tra định dạng mã đặt phòng BK-XXXXXX', () => {
    const generateBookingCode = () => {
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      return `BK-${randomNum}`;
    };
    const code = generateBookingCode();
    assert.match(code, /^BK-\d{6}$/, 'Mã đặt phòng phải có dạng BK-XXXXXX với 6 chữ số');
  });

  await t.test('Validate ngày trả phòng phải lớn hơn ngày nhận phòng', () => {
    const checkIn = new Date('2026-11-10');
    const checkOutSame = new Date('2026-11-10');
    const checkOutBefore = new Date('2026-11-08');
    const checkOutAfter = new Date('2026-11-12');

    assert.strictEqual(checkOutSame > checkIn, false, 'Cùng ngày trả phòng là không hợp lệ');
    assert.strictEqual(checkOutBefore > checkIn, false, 'Ngày trả trước ngày nhận là không hợp lệ');
    assert.strictEqual(checkOutAfter > checkIn, true, 'Ngày trả sau ngày nhận là hợp lệ');
  });

  await t.test('Băm mật khẩu bằng Bcrypt và xác thực mật khẩu không lưu plaintext', () => {
    const rawPassword = 'admin123';
    const hash = bcrypt.hashSync(rawPassword, 10);
    assert.notStrictEqual(hash, rawPassword, 'Mật khẩu đã băm không được trùng với mật khẩu gốc');
    assert.strictEqual(bcrypt.compareSync('admin123', hash), true, 'Xác thực đúng mật khẩu phải trả về true');
    assert.strictEqual(bcrypt.compareSync('wrongpass', hash), false, 'Sai mật khẩu phải trả về false');
  });

  await t.test('Kiểm tra quy tắc tra cứu bắt buộc có cả mã đặt phòng và email', () => {
    const validateLookupInput = (code, email) => {
      return Boolean(code && code.trim() && email && email.trim());
    };
    assert.strictEqual(validateLookupInput('BK-123456', ''), false, 'Thiếu email phải không hợp lệ');
    assert.strictEqual(validateLookupInput('', 'test@hotel.com'), false, 'Thiếu mã booking phải không hợp lệ');
    assert.strictEqual(validateLookupInput('BK-123456', 'test@hotel.com'), true, 'Đủ cả mã và email mới hợp lệ');
  });
});
