-- ==============================================================================
-- HỆ THỐNG ĐẶT PHÒNG KHÁCH SẠN (HOTEL BOOKING SYSTEM) - DATABASE INIT SCRIPT
-- PostgreSQL 16 (Chuẩn quan hệ 3NF, Khóa ngoại, Ràng buộc, Chỉ mục & Lịch sử)
-- Học phần: Triển khai và Quản trị Hệ thống Phần mềm (Đề tài 6)
-- ==============================================================================

-- Bật các extensions hỗ trợ
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- 1. BẢNG TÀI KHOẢN NGƯỜI DÙNG & QUẢN TRỊ VIÊN (users)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'staff', 'manager')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. BẢNG KHÁCH HÀNG (customers)
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    id_card VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_customer_email_phone UNIQUE (email, phone)
);

-- 3. BẢNG HẠNG / LOẠI PHÒNG (room_types)
CREATE TABLE IF NOT EXISTS room_types (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    base_price NUMERIC(12,2) NOT NULL CHECK (base_price > 0),
    max_guests INT NOT NULL DEFAULT 2 CHECK (max_guests > 0),
    bed_type VARCHAR(100) DEFAULT 'Giường Đôi King Size',
    room_size INT DEFAULT 45 CHECK (room_size > 0),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. BẢNG TIỆN NGHI (amenities)
CREATE TABLE IF NOT EXISTS amenities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) DEFAULT 'general',
    icon VARCHAR(50) DEFAULT 'check'
);

-- 5. BẢNG DANH SÁCH PHÒNG (rooms)
CREATE TABLE IF NOT EXISTS rooms (
    id SERIAL PRIMARY KEY,
    room_number VARCHAR(20) UNIQUE NOT NULL,
    room_type_id INT NOT NULL REFERENCES room_types(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    floor INT NOT NULL DEFAULT 1 CHECK (floor >= 1),
    price_per_night NUMERIC(12,2) NOT NULL CHECK (price_per_night > 0),
    max_guests INT NOT NULL DEFAULT 2 CHECK (max_guests > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance')),
    description TEXT,
    image_url TEXT,
    images TEXT[] DEFAULT '{}',
    amenities TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. BẢNG ĐƠN ĐẶT PHÒNG (bookings)
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    booking_code VARCHAR(32) UNIQUE NOT NULL,
    customer_id INT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    room_id INT NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    num_guests INT NOT NULL DEFAULT 1 CHECK (num_guests > 0),
    total_nights INT NOT NULL CHECK (total_nights > 0),
    room_price NUMERIC(12,2) NOT NULL CHECK (room_price > 0),
    total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount > 0),
    special_requests TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled')),
    payment_status VARCHAR(30) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_booking_dates CHECK (check_out_date > check_in_date)
);

-- 7. BẢNG LỊCH SỬ THAY ĐỔI TRẠNG THÁI ĐẶT PHÒNG (booking_status_history)
CREATE TABLE IF NOT EXISTS booking_status_history (
    id SERIAL PRIMARY KEY,
    booking_id INT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    old_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,
    changed_by VARCHAR(100) DEFAULT 'system',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- TẠO CHỈ MỤC (INDEXES) TỐI ƯU HÓA TRUY VẤN TRA CỨU & KHÓA DÒNG
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_type ON rooms(room_type_id);
CREATE INDEX IF NOT EXISTS idx_rooms_price ON rooms(price_per_night);
CREATE INDEX IF NOT EXISTS idx_rooms_guests ON rooms(max_guests);

CREATE INDEX IF NOT EXISTS idx_bookings_room_dates ON bookings(room_id, check_in_date, check_out_date, status);
CREATE INDEX IF NOT EXISTS idx_bookings_code ON bookings(booking_code);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

CREATE INDEX IF NOT EXISTS idx_history_booking ON booking_status_history(booking_id);

-- ==============================================================================
-- DỮ LIỆU KHỞI TẠO (SEED DATA)
-- ==============================================================================

-- 1. TÀI KHOẢN QUẢN TRỊ VIÊN & NHÂN VIÊN
-- Mật khẩu admin: admin123 (Bcrypt hash: $2a$10$NiRDCFqNZr5Z9K0JsDBqRebz.BOFp0WNpVO9WTtpQIewoK91Jz8Jm)
-- Mật khẩu staff: staff123 (Bcrypt hash: $2a$10$NiRDCFqNZr5Z9K0JsDBqRebz.BOFp0WNpVO9WTtpQIewoK91Jz8Jm)
INSERT INTO users (username, password_hash, full_name, email, role)
VALUES 
('admin', '$2a$10$NiRDCFqNZr5Z9K0JsDBqRebz.BOFp0WNpVO9WTtpQIewoK91Jz8Jm', 'Tổng Quản Trị Hệ Thống', 'admin@auroragrand.vn', 'admin'),
('staff', '$2a$10$NiRDCFqNZr5Z9K0JsDBqRebz.BOFp0WNpVO9WTtpQIewoK91Jz8Jm', 'Nhân Viên Lễ Tân', 'reception@auroragrand.vn', 'staff')
ON CONFLICT (username) DO NOTHING;

-- 2. HẠNG PHÒNG
INSERT INTO room_types (code, name, description, base_price, max_guests, bed_type, room_size, image_url)
VALUES
('DELUXE_OCEAN', 'Deluxe Hướng Biển (Ocean View)', 'Không gian nghỉ dưỡng thanh lịch nhìn trực diện biển, ban công lộng gió ngắm hoàng hôn rực rỡ.', 1500000, 2, '1 Giường King hoặc 2 Giường Đơn', 42, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'),
('PREMIER_SUITE', 'Premier Executive Suite', 'Căn phòng cao cấp với phòng khách riêng biệt, bồn tắm nằm view toàn cảnh thành phố và biển.', 2800000, 3, '1 Giường King Siêu Lớn', 65, 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80'),
('FAMILY_PARADISE', 'Family Connecting Suite', 'Thiết kế lý tưởng cho gia đình 4-5 người với 2 phòng ngủ liên thông, góc vui chơi trẻ em an toàn.', 3500000, 4, '1 Giường King & 2 Giường Đơn', 85, 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'),
('PRESIDENTIAL_SUITE', 'Presidential Suite Hoàng Gia', 'Tuyệt tác nghỉ dưỡng 5 sao bậc nhất, dịch vụ quản gia riêng 24/7, quầy bar cá nhân và bồn sục Jacuzzi.', 7500000, 4, '2 Giường King Siêu Lớn', 150, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80'),
('BEACH_VILLA', 'Biệt Thự Biển Có Hồ Bơi Riêng', 'Biệt thự độc bản sát biển với hồ bơi vô cực riêng tư, sân vườn nhiệt đới và lối đi riêng ra bãi cát.', 9800000, 6, '3 Giường King Luxury', 220, 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80')
ON CONFLICT (code) DO NOTHING;

-- 3. TIỆN NGHI 5 SAO
INSERT INTO amenities (name, category, icon) VALUES
('Wifi tốc độ cao 500Mbps', 'technology', 'wifi'),
('Hồ bơi vô cực view biển', 'wellness', 'waves'),
('Bữa sáng Buffet Á - Âu', 'dining', 'utensils'),
('Bồn tắm nằm phong cách Pháp', 'bathroom', 'bath'),
('Bồn sục Jacuzzi ngoài trời', 'wellness', 'sparkles'),
('Smart TV 65" 4K Netflix', 'technology', 'tv'),
('Mini-bar nhập khẩu miễn phí', 'dining', 'wine'),
('Máy pha cà phê Nespresso', 'dining', 'coffee'),
('Ban công riêng ngắm biển', 'view', 'sun'),
('Dịch vụ quản gia 24/7', 'service', 'bell'),
('Đưa đón sân bay VIP 2 chiều', 'transport', 'car'),
('Két an toàn điện tử', 'security', 'shield')
ON CONFLICT (name) DO NOTHING;

-- 4. DANH SÁCH PHÒNG CHI TIẾT
INSERT INTO rooms (room_number, room_type_id, title, floor, price_per_night, max_guests, status, description, image_url, images, amenities)
VALUES
(
    'R-101', 1, 'Phòng Deluxe Ocean R-101 (Tầng 1)', 1, 1500000, 2, 'available',
    'Phòng Deluxe tọa lạc tại tầng 1 với ban công hướng vườn và biển xanh dịu mát. Thiết kế tối giản tinh tế kết hợp gỗ tự nhiên ấm cúng.',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80'],
    ARRAY['Wifi tốc độ cao 500Mbps', 'Bữa sáng Buffet Á - Âu', 'Ban công riêng ngắm biển', 'Smart TV 65" 4K Netflix', 'Két an toàn điện tử']
),
(
    'R-102', 1, 'Phòng Deluxe Ocean R-102 (Tầng 1)', 1, 1550000, 2, 'available',
    'Phòng Deluxe góc đón ánh bình minh tuyệt đẹp, trang bị giường đôi êm ái cùng phòng tắm đứng vòi sen nhiệt đới hiện đại.',
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80'],
    ARRAY['Wifi tốc độ cao 500Mbps', 'Bữa sáng Buffet Á - Âu', 'Ban công riêng ngắm biển', 'Smart TV 65" 4K Netflix']
),
(
    'R-201', 1, 'Phòng Deluxe Ocean Panorama R-201 (Tầng 2)', 2, 1650000, 2, 'available',
    'Tầng 2 view thoáng đãng nhìn thẳng ra bờ biển cát trắng. Thích hợp cho các cặp đôi tận hưởng kỳ nghỉ lãng mạn.',
    'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80'],
    ARRAY['Wifi tốc độ cao 500Mbps', 'Bữa sáng Buffet Á - Âu', 'Ban công riêng ngắm biển', 'Bồn tắm nằm phong cách Pháp']
),
(
    'R-301', 2, 'Premier Executive Suite R-301', 3, 2800000, 3, 'available',
    'Phòng Suite thương gia sang trọng với salon tiếp khách riêng, bàn làm việc công thái học và view biển 180 độ kỳ vĩ.',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80'],
    ARRAY['Wifi tốc độ cao 500Mbps', 'Bữa sáng Buffet Á - Âu', 'Bồn tắm nằm phong cách Pháp', 'Máy pha cà phê Nespresso', 'Mini-bar nhập khẩu miễn phí']
),
(
    'R-302', 2, 'Premier Executive Suite R-302', 3, 2900000, 3, 'available',
    'Căn Suite phong cách Scandinavian tinh tế, nội thất da cao cấp và view ngắm thành phố biển lung linh về đêm.',
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80'],
    ARRAY['Wifi tốc độ cao 500Mbps', 'Bữa sáng Buffet Á - Âu', 'Bồn tắm nằm phong cách Pháp', 'Máy pha cà phê Nespresso', 'Ban công riêng ngắm biển']
),
(
    'R-401', 3, 'Family Paradise Suite R-401', 4, 3500000, 4, 'available',
    'Căn hộ nghỉ dưỡng gia đình hoàn hảo gồm 2 phòng ngủ độc lập, ban công dài rộng rãi và khu ăn uống ấm áp.',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'],
    ARRAY['Wifi tốc độ cao 500Mbps', 'Bữa sáng Buffet Á - Âu', 'Smart TV 65" 4K Netflix', 'Đưa đón sân bay VIP 2 chiều', 'Mini-bar nhập khẩu miễn phí']
),
(
    'R-402', 3, 'Family Paradise Suite R-402', 4, 3650000, 5, 'available',
    'Thiết kế thông minh dành cho đại gia đình hoặc nhóm bạn, tầm nhìn hướng biển và hồ bơi ngoài trời xanh ngắt.',
    'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=1200&q=80'],
    ARRAY['Wifi tốc độ cao 500Mbps', 'Bữa sáng Buffet Á - Âu', 'Smart TV 65" 4K Netflix', 'Ban công riêng ngắm biển']
),
(
    'R-501', 4, 'Presidential Suite Hoàng Gia R-501', 5, 7500000, 4, 'available',
    'Tầng cao nhất với view độc tôn toàn vịnh biển. Phòng có quầy bar riêng, bồn sục Jacuzzi kính nhìn mây trời.',
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80'],
    ARRAY['Wifi tốc độ cao 500Mbps', 'Bữa sáng Buffet Á - Âu', 'Bồn sục Jacuzzi ngoài trời', 'Dịch vụ quản gia 24/7', 'Đưa đón sân bay VIP 2 chiều', 'Mini-bar nhập khẩu miễn phí']
),
(
    'V-01', 5, 'Beachfront Pool Villa V-01', 1, 9800000, 6, 'available',
    'Biệt thự sát bờ biển sở hữu hồ bơi vô cực riêng biệt, sân tắm nắng riêng tư và tiếng sóng vỗ rì rào suốt ngày đêm.',
    'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80'],
    ARRAY['Hồ bơi vô cực view biển', 'Wifi tốc độ cao 500Mbps', 'Bữa sáng Buffet Á - Âu', 'Bồn sục Jacuzzi ngoài trời', 'Dịch vụ quản gia 24/7', 'Đưa đón sân bay VIP 2 chiều']
),
(
    'V-02', 5, 'Royal Sunset Pool Villa V-02', 1, 10500000, 6, 'available',
    'Biệt thự đắc địa nhất khu nghỉ dưỡng tại vị trí mũi ngắm hoàng hôn đỉnh cao, khuôn viên vườn nhiệt đới rộng 500m2.',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80'],
    ARRAY['Hồ bơi vô cực view biển', 'Wifi tốc độ cao 500Mbps', 'Bữa sáng Buffet Á - Âu', 'Bồn sục Jacuzzi ngoài trời', 'Dịch vụ quản gia 24/7', 'Đưa đón sân bay VIP 2 chiều']
)
ON CONFLICT (room_number) DO NOTHING;

-- 5. KHÁCH HÀNG MẪU (customers)
INSERT INTO customers (id, full_name, email, phone, id_card, address)
VALUES
(1, 'Nguyễn Văn An', 'an.nguyen@gmail.com', '0905123456', '048095001234', 'Hải Châu, Đà Nẵng'),
(2, 'Trần Thị Mai', 'mai.tran@outlook.com', '0912345678', '001198005678', 'Quận 1, TP. Hồ Chí Minh'),
(3, 'Phạm Hoàng Long', 'long.pham@techcorp.vn', '0988776655', '031092003344', 'Cầu Giấy, Hà Nội'),
(4, 'Lê Thị Thu Thảo', 'thao.le@gmail.com', '0933445566', '079199009988', 'Nha Trang, Khánh Hòa')
ON CONFLICT (id) DO NOTHING;

SELECT setval('customers_id_seq', (SELECT MAX(id) FROM customers));

-- 6. ĐƠN ĐẶT PHÒNG MẪU (bookings)
INSERT INTO bookings (id, booking_code, customer_id, room_id, check_in_date, check_out_date, num_guests, total_nights, room_price, total_amount, special_requests, status, payment_status)
VALUES
(1, 'BK-849102', 1, 1, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE - INTERVAL '2 days', 2, 3, 1500000, 4500000, 'Cần phòng yên tĩnh tầng cao', 'checked_out', 'paid'),
(2, 'BK-928311', 2, 4, CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '1 day', 2, 3, 2800000, 8400000, 'Trang trí phòng trăng mật kỷ niệm ngày cưới', 'checked_in', 'paid'),
(3, 'BK-371944', 3, 9, CURRENT_DATE + INTERVAL '2 days', CURRENT_DATE + INTERVAL '5 days', 4, 3, 9800000, 29400000, 'Đưa đón sân bay lúc 14h chiều xe 7 chỗ', 'confirmed', 'paid'),
(4, 'BK-651203', 4, 6, CURRENT_DATE + INTERVAL '7 days', CURRENT_DATE + INTERVAL '10 days', 4, 3, 3500000, 10500000, 'Chuẩn bị thêm nôi cho em bé 1 tuổi', 'confirmed', 'unpaid')
ON CONFLICT (booking_code) DO NOTHING;

SELECT setval('bookings_id_seq', (SELECT MAX(id) FROM bookings));

-- 7. LỊCH SỬ TRẠNG THÁI (booking_status_history)
INSERT INTO booking_status_history (booking_id, old_status, new_status, changed_by, notes)
VALUES
(1, NULL, 'confirmed', 'system', 'Khách tạo đơn đặt phòng trực tuyến'),
(1, 'confirmed', 'checked_in', 'staff', 'Lễ tân hoàn tất thủ tục nhận phòng'),
(1, 'checked_in', 'checked_out', 'staff', 'Khách thanh toán và trả phòng thành công'),
(2, NULL, 'confirmed', 'system', 'Khách tạo đơn đặt phòng trực tuyến'),
(2, 'confirmed', 'checked_in', 'staff', 'Lễ tân bàn giao chìa khóa phòng R-301'),
(3, NULL, 'confirmed', 'system', 'Đã xác nhận thanh toán trực tuyến qua thẻ tín dụng'),
(4, NULL, 'confirmed', 'system', 'Đơn đặt phòng chờ thanh toán tại quầy lễ tân')
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- 8. THIẾT LẬP TÀI KHOẢN ỨNG DỤNG THEO NGUYÊN TẮC QUYỀN TỐI THIỂU (LEAST PRIVILEGE)
-- Không chạy ứng dụng bằng quyền Superuser / Database Owner
-- ==============================================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'hotel_app_user') THEN
        CREATE USER hotel_app_user WITH PASSWORD 'AppSecurePassword2026!';
    END IF;
END
$$;

GRANT CONNECT ON DATABASE hotel_booking_db TO hotel_app_user;
GRANT USAGE ON SCHEMA public TO hotel_app_user;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO hotel_app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO hotel_app_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE ON TABLES TO hotel_app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO hotel_app_user;

