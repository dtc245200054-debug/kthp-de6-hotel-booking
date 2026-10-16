import React, { useState } from 'react';
import { 
  Search, 
  Calendar, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  Printer,
  Ban,
  ShieldCheck,
  Building,
  User,
  Clock,
  Info
} from 'lucide-react';
import { api } from '../services/api';

export default function BookingLookup() {
  const [bookingCode, setBookingCode] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [booking, setBooking] = useState(null);
  const [cancelMessage, setCancelMessage] = useState(null);

  // Form hủy đặt phòng
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Khách bận việc đột xuất');
  const [cancelling, setCancelling] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price || 0);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!bookingCode.trim() || !customerEmail.trim()) {
      setError('Vui lòng nhập đầy đủ cả Mã đặt phòng và Email để bảo vệ quyền riêng tư.');
      return;
    }

    setLoading(true);
    setError(null);
    setCancelMessage(null);
    setBooking(null);

    try {
      const response = await api.lookupBooking(bookingCode.trim(), customerEmail.trim());
      setBooking(response.data);
    } catch (err) {
      setError(err.message || 'Không tìm thấy đơn đặt phòng phù hợp.');
      setBooking(null);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCancel = async (e) => {
    e.preventDefault();
    if (!booking) return;

    setCancelling(true);
    try {
      await api.cancelBooking(booking.booking_code, customerEmail.trim(), cancelReason);
      setCancelMessage(`Đã hủy thành công đơn đặt phòng [${booking.booking_code}].`);
      setShowCancelModal(false);
      // Tải lại thông tin mới
      const updated = await api.lookupBooking(booking.booking_code, customerEmail.trim());
      setBooking(updated.data);
    } catch (err) {
      alert(err.message || 'Lỗi khi hủy đặt phòng');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <span className="badge badge-success">✓ Đã xác nhận</span>;
      case 'checked_in':
        return <span className="badge badge-gold">● Đang lưu trú (Checked-in)</span>;
      case 'checked_out':
        return <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: '#cbd5e1' }}>● Đã trả phòng</span>;
      case 'cancelled':
        return <span className="badge badge-danger">✕ Đã hủy</span>;
      default:
        return <span className="badge badge-warning">● Đang xử lý</span>;
    }
  };

  return (
    <section style={{ padding: '120px 0 80px 0', minHeight: '85vh', background: 'var(--bg-dark-900)' }}>
      <div className="container" style={{ maxWidth: '850px' }}>
        {/* Tiêu đề & Thông báo bảo mật */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 14px',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '9999px',
              color: 'var(--success)',
              fontSize: '0.8rem',
              fontWeight: 600,
              marginBottom: '1rem',
            }}
          >
            <ShieldCheck size={16} />
            <span>Xác Thực Hai Yếu Tố (Mã Đặt Phòng + Email)</span>
          </div>
          <h1 style={{ fontSize: '2.4rem', color: '#fff', marginTop: '0.2rem' }}>
            Tra Cứu <span className="gold-text">Đơn Đặt Phòng</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Để bảo vệ thông tin cá nhân và tránh việc truy cập trái phép, vui lòng cung cấp đúng Mã đặt phòng và Email.
          </p>
        </div>

        {/* Biểu mẫu tra cứu */}
        <div 
          className="glass-card" 
          style={{ padding: '2rem', marginBottom: '2.5rem', background: 'var(--surface-card)' }}
        >
          <form onSubmit={handleSearch}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div>
                <label className="form-label">Mã đặt phòng * (VD: BK-928311)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nhập mã đặt phòng..."
                  value={bookingCode}
                  onChange={(e) => setBookingCode(e.target.value.toUpperCase())}
                  required
                />
              </div>
              <div>
                <label className="form-label">Địa chỉ Email đăng ký khi đặt *</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Nhập email..."
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
              disabled={loading}
            >
              <Search size={18} />
              {loading ? 'Đang xác thực thông tin...' : 'Tra Cứu Thông Tin Đặt Phòng'}
            </button>
          </form>
        </div>

        {/* Thông báo hủy thành công */}
        {cancelMessage && (
          <div 
            style={{
              padding: '1rem',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: '#6ee7b7',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <CheckCircle2 size={18} />
            <span>{cancelMessage}</span>
          </div>
        )}

        {/* Thông báo lỗi */}
        {error && (
          <div 
            style={{
              padding: '1rem',
              background: 'var(--danger-bg)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: '#fca5a5',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Kết quả chi tiết đơn đặt phòng */}
        {booking && (
          <div 
            className="glass-card" 
            style={{
              padding: '2rem',
              border: '1px solid var(--border-glass)',
            }}
          >
            {/* Header đơn */}
            <div 
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                paddingBottom: '1.25rem',
                borderBottom: '1px solid var(--border-subtle)',
                marginBottom: '1.5rem',
              }}
            >
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Mã đặt phòng xác thực:</span>
                <span className="font-serif gold-text" style={{ fontSize: '1.4rem', fontWeight: 700, marginLeft: '8px' }}>
                  {booking.booking_code}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {getStatusBadge(booking.status)}
                {booking.payment_status === 'paid' ? (
                  <span className="badge badge-success">Đã thanh toán</span>
                ) : (
                  <span className="badge badge-warning">Chưa thanh toán</span>
                )}
              </div>
            </div>

            {/* Chi tiết nội dung */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '0.4rem' }}>
                  {booking.room_title}
                </h3>
                <div style={{ fontSize: '0.9rem', color: 'var(--primary-gold-light)', marginBottom: '0.75rem' }}>
                  Phòng: <strong>{booking.room_number}</strong> • Hạng: {booking.room_type_name}
                </div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                  Họ tên khách: <strong style={{ color: '#fff' }}>{booking.customer_name}</strong>
                </div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  Email: {booking.customer_email} | SĐT: {booking.customer_phone}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  <Calendar size={16} color="var(--primary-gold)" />
                  <span>Ngày nhận phòng: <strong>{booking.check_in_date}</strong> (từ 14:00)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  <Calendar size={16} color="var(--primary-gold)" />
                  <span>Ngày trả phòng: <strong>{booking.check_out_date}</strong> (trước 12:00)</span>
                </div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  Thời gian lưu trú: <strong>{booking.total_nights} đêm</strong> • {booking.num_guests} khách
                </div>
              </div>
            </div>

            {/* Khung thanh toán */}
            <div 
              style={{
                background: 'rgba(10, 15, 29, 0.75)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <span>Đơn giá phòng:</span>
                <span>{formatPrice(booking.room_price)} / đêm</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <span>Thời gian:</span>
                <span>{booking.total_nights} đêm</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                <span style={{ fontWeight: 600, color: '#fff' }}>Tổng thanh toán:</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary-gold-light)' }}>
                  {formatPrice(booking.total_amount)}
                </span>
              </div>
            </div>

            {booking.special_requests && (
              <div 
                style={{
                  padding: '0.75rem 1rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)',
                  marginBottom: '1.5rem',
                }}
              >
                Yêu cầu đặc biệt: <em>"{booking.special_requests}"</em>
              </div>
            )}

            {/* Các hành động */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Miễn phí hủy trước ngày nhận phòng ít nhất 24 giờ.
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => window.print()} className="btn btn-secondary btn-sm">
                  <Printer size={15} />
                  In Phiếu Xác Nhận
                </button>
                {booking.status === 'confirmed' && (
                  <button 
                    onClick={() => setShowCancelModal(true)} 
                    className="btn btn-danger btn-sm"
                  >
                    <Ban size={15} />
                    Hủy Đơn Đặt Phòng
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal Xác Nhận Hủy Đặt Phòng */}
        {showCancelModal && (
          <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '2rem' }}>
              <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Xác Nhận Hủy Đơn Đặt Phòng</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                Quý khách có chắc chắn muốn hủy đơn <strong>{booking.booking_code}</strong>? Sau khi hủy, phòng sẽ được mở lại cho khách khác đặt và thao tác này không thể hoàn tác trực tiếp trên web.
              </p>

              <form onSubmit={handleConfirmCancel}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Lý do hủy phòng *</label>
                  <select
                    className="form-control"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  >
                    <option value="Thay đổi lịch trình công tác / du lịch">Thay đổi lịch trình công tác / du lịch</option>
                    <option value="Bận việc gia đình đột xuất">Bận việc gia đình đột xuất</option>
                    <option value="Muốn chuyển sang loại phòng khác">Muốn chuyển sang loại phòng khác</option>
                    <option value="Tìm được khách sạn khác phù hợp hơn">Tìm được khách sạn khác phù hợp hơn</option>
                    <option value="Lý do khác">Lý do khác</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowCancelModal(false)} className="btn btn-secondary">
                    Giữ lại đơn
                  </button>
                  <button type="submit" className="btn btn-danger" disabled={cancelling}>
                    {cancelling ? 'Đang hủy...' : 'Xác Nhận Hủy Phòng'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
