import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Users, 
  CreditCard, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Check, 
  Printer,
  Sparkles,
  Phone,
  Mail,
  User,
  FileText
} from 'lucide-react';
import { api } from '../services/api';

export default function BookingModal({ room, initialCheckIn, initialCheckOut, initialGuests, onClose, onSuccess }) {
  if (!room) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const defaultCheckOut = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [checkInDate, setCheckInDate] = useState(initialCheckIn || todayStr);
  const [checkOutDate, setCheckOutDate] = useState(initialCheckOut || defaultCheckOut);
  const [numGuests, setNumGuests] = useState(initialGuests || '2');
  const [specialRequests, setSpecialRequests] = useState('');

  const [totalNights, setTotalNights] = useState(1);
  const [totalAmount, setTotalAmount] = useState(room.price_per_night);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // Tự động tính số đêm và tổng tiền mỗi khi ngày thay đổi
  useEffect(() => {
    if (checkInDate && checkOutDate) {
      const start = new Date(checkInDate);
      const end = new Date(checkOutDate);
      if (end > start) {
        const diffTime = Math.abs(end - start);
        const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setTotalNights(nights);
        setTotalAmount(nights * parseFloat(room.price_per_night));
      } else {
        setTotalNights(0);
        setTotalAmount(0);
      }
    }
  }, [checkInDate, checkOutDate, room.price_per_night]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate phía client trước
    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      setError('Ngày trả phòng phải sau ngày nhận phòng ít nhất 1 đêm');
      return;
    }

    if (parseInt(numGuests, 10) > room.max_guests) {
      setError(`Số lượng khách không được vượt quá ${room.max_guests} người`);
      return;
    }

    setLoading(true);
    try {
      const response = await api.createBooking({
        room_id: room.id,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        num_guests: parseInt(numGuests, 10),
        special_requests: specialRequests,
      });

      setBookingSuccess(response.data);
      if (onSuccess) onSuccess(response.data);
    } catch (err) {
      setError(err.message || 'Không thể tạo đơn đặt phòng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px' }}
      >
        {/* Header Modal */}
        <div 
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(10, 15, 29, 0.6)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Sparkles size={18} color="var(--primary-gold)" />
            <h3 style={{ fontSize: '1.2rem', color: '#fff', margin: 0 }}>
              {bookingSuccess ? 'Đặt Phòng Thành Công' : 'Xác Nhận Đặt Phòng'}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* THÀNH CÔNG: MÀN HÌNH BIÊN LAI */}
        {bookingSuccess ? (
          <div style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
            <div 
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto',
                boxShadow: '0 0 25px rgba(16, 185, 129, 0.25)',
              }}
            >
              <CheckCircle size={36} />
            </div>

            <h2 style={{ fontSize: '1.6rem', color: '#fff', marginBottom: '0.5rem' }}>
              Đặt Phòng Thành Công!
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.75rem' }}>
              Cảm ơn quý khách <strong>{bookingSuccess.customer_name}</strong>. Chúng tôi đã gửi email xác nhận đến <strong>{bookingSuccess.customer_email}</strong>.
            </p>

            {/* Chi tiết biên lai */}
            <div 
              style={{
                background: 'rgba(10, 15, 29, 0.75)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                textAlign: 'left',
                marginBottom: '1.75rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Mã đặt phòng:</span>
                <span className="font-serif gold-text" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                  {bookingSuccess.booking_code}
                </span>
              </div>

              <div style={{ padding: '0.75rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Phòng:</span>
                  <span style={{ color: '#fff', fontWeight: 600 }}>{room.room_number} - {room.title}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Thời gian lưu trú:</span>
                  <span style={{ color: '#fff' }}>{bookingSuccess.check_in_date} ➔ {bookingSuccess.check_out_date} ({bookingSuccess.total_nights} đêm)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Số khách:</span>
                  <span style={{ color: '#fff' }}>{bookingSuccess.num_guests} khách</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Số điện thoại:</span>
                  <span style={{ color: '#fff' }}>{bookingSuccess.customer_phone}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Tổng thanh toán:</span>
                <span style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--primary-gold-light)' }}>
                  {formatPrice(bookingSuccess.total_amount)}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                onClick={() => window.print()} 
                className="btn btn-secondary"
              >
                <Printer size={16} />
                In Biên Lai
              </button>
              <button onClick={onClose} className="btn btn-primary">
                Hoàn Tất
              </button>
            </div>
          </div>
        ) : (
          /* FORM ĐẶT PHÒNG */
          <form onSubmit={handleBookingSubmit} style={{ padding: '1.5rem' }}>
            {/* Tóm tắt phòng */}
            <div 
              style={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'center',
                padding: '0.75rem 1rem',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                marginBottom: '1.5rem',
              }}
            >
              <img
                src={room.image_url}
                alt={room.title}
                style={{ width: '80px', height: '60px', borderRadius: '6px', objectFit: 'cover' }}
              />
              <div style={{ flex: 1 }}>
                <span className="badge badge-gold" style={{ fontSize: '0.75rem', marginBottom: '2px' }}>
                  {room.room_number} • {room.room_type_name}
                </span>
                <h4 style={{ fontSize: '1rem', color: '#fff' }}>{room.title}</h4>
                <span style={{ fontSize: '0.85rem', color: 'var(--primary-gold)' }}>
                  {formatPrice(room.price_per_night)} / đêm
                </span>
              </div>
            </div>

            {/* Error Message Banner */}
            {error && (
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  background: 'var(--danger-bg)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: 'var(--radius-md)',
                  color: '#fca5a5',
                  fontSize: '0.9rem',
                  marginBottom: '1.25rem',
                }}
              >
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {/* Khung nhập thông tin khách hàng */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <User size={15} color="var(--primary-gold)" />
                  Họ và tên quý khách *
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Phone size={15} color="var(--primary-gold)" />
                  Số điện thoại liên hệ *
                </label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="Ví dụ: 0905123456"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Mail size={15} color="var(--primary-gold)" />
                Địa chỉ Email nhận xác nhận *
              </label>
              <input
                type="email"
                className="form-control"
                placeholder="Ví dụ: an.nguyen@gmail.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                required
              />
            </div>

            {/* Chọn ngày và số khách */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={15} color="var(--primary-gold)" />
                  Ngày nhận phòng *
                </label>
                <input
                  type="date"
                  className="form-control"
                  min={todayStr}
                  value={checkInDate}
                  onChange={(e) => {
                    setCheckInDate(e.target.value);
                    if (e.target.value >= checkOutDate) {
                      const nextDay = new Date(new Date(e.target.value).getTime() + 24 * 60 * 60 * 1000)
                        .toISOString()
                        .split('T')[0];
                      setCheckOutDate(nextDay);
                    }
                  }}
                  required
                />
              </div>

              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={15} color="var(--primary-gold)" />
                  Ngày trả phòng *
                </label>
                <input
                  type="date"
                  className="form-control"
                  min={checkInDate}
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Users size={15} color="var(--primary-gold)" />
                  Số khách (Tối đa {room.max_guests})
                </label>
                <select
                  className="form-control"
                  value={numGuests}
                  onChange={(e) => setNumGuests(e.target.value)}
                >
                  {[...Array(room.max_guests)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} Khách
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Yêu cầu đặc biệt */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FileText size={15} color="var(--primary-gold)" />
                Yêu cầu đặc biệt (Không bắt buộc)
              </label>
              <textarea
                className="form-control"
                rows="2"
                placeholder="Ví dụ: Cần phòng tầng cao, đón sân bay, nôi em bé, trang trí trăng mật..."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
              />
            </div>

            {/* Tự động tính toán tổng tiền */}
            <div 
              style={{
                background: 'rgba(10, 15, 29, 0.85)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <span>Giá phòng mỗi đêm:</span>
                <span>{formatPrice(room.price_per_night)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <span>Số đêm lưu trú:</span>
                <span style={{ fontWeight: 600, color: '#fff' }}>{totalNights} đêm</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <span>Thuế VAT & Phí dịch vụ 5 sao:</span>
                <span style={{ color: 'var(--success)' }}>Đã bao gồm</span>
              </div>
              <div 
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                <span style={{ fontWeight: 600, color: '#fff', fontSize: '1rem' }}>Tổng cộng thanh toán:</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary-gold-light)' }}>
                  {formatPrice(totalAmount)}
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Hủy bỏ
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading || totalNights <= 0}
              >
                {loading ? 'Đang kiểm tra & xử lý...' : 'Xác Nhận & Tạo Đặt Phòng'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
