import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Bed, 
  CalendarCheck, 
  DollarSign, 
  Plus, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Activity, 
  RefreshCw, 
  Check, 
  Clock, 
  ShieldCheck,
  Server,
  Layers,
  Database,
  Users,
  Lock,
  LogOut,
  UserCheck,
  History,
  X,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

export default function AdminDashboard({ roomTypes = [], onRefreshRooms }) {
  const [currentUser, setCurrentUser] = useState(api.getCurrentUser());
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'rooms' | 'bookings' | 'customers' | 'monitoring'
  
  // Login Form State
  const [loginUsername, setLoginUsername] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [loginError, setLoginError] = useState(null);
  const [loggingIn, setLoggingIn] = useState(false);

  // Data States
  const [stats, setStats] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Modal xem lịch sử thay đổi trạng thái (Audit Trail)
  const [selectedBookingHistory, setSelectedBookingHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Form thêm phòng mới
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [newRoom, setNewRoom] = useState({
    room_number: '',
    room_type_id: roomTypes[0]?.id || 1,
    title: '',
    floor: 1,
    price_per_night: 1500000,
    max_guests: 2,
    status: 'available',
    description: '',
    image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    amenities: ['Wifi tốc độ cao 500Mbps', 'Bữa sáng Buffet Á - Âu', 'Ban công riêng ngắm biển']
  });

  const loadAllData = async () => {
    if (!api.getCurrentUser()) return;
    setLoading(true);
    try {
      const [statsRes, roomsRes, bookingsRes, customersRes, healthRes] = await Promise.all([
        api.getDashboardStats().catch(() => ({ data: null })),
        api.getRooms({ status: 'all' }),
        api.getAllBookings().catch(() => ({ data: [] })),
        api.getCustomers().catch(() => ({ data: [] })),
        api.getHealth().catch(() => null),
      ]);
      setStats(statsRes.data);
      setRooms(roomsRes.data || []);
      setBookings(bookingsRes.data || []);
      setCustomers(customersRes.data || []);
      setHealthData(healthRes);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadAllData();
    }
  }, [currentUser]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError(null);
    try {
      const res = await api.login(loginUsername, loginPassword);
      setCurrentUser(res.data.user);
    } catch (err) {
      setLoginError(err.message || 'Đăng nhập không thành công');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price || 0);
  };

  // Cập nhật trạng thái phòng
  const handleUpdateRoomStatus = async (roomId, newStatus) => {
    try {
      await api.updateRoom(roomId, { status: newStatus });
      setActionSuccess('Cập nhật trạng thái phòng thành công!');
      loadAllData();
      if (onRefreshRooms) onRefreshRooms();
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      alert(err.message || 'Lỗi cập nhật');
    }
  };

  // Xóa phòng
  const handleDeleteRoom = async (roomId, roomNumber) => {
    if (!window.confirm(`Bạn có chắc muốn xóa phòng ${roomNumber}? Thao tác này sẽ bị chặn nếu phòng có booking hoạt động.`)) return;
    try {
      await api.deleteRoom(roomId);
      setActionSuccess(`Đã xóa phòng ${roomNumber} thành công!`);
      loadAllData();
      if (onRefreshRooms) onRefreshRooms();
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      alert(err.message || 'Lỗi xóa phòng');
    }
  };

  // Thêm phòng mới
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      await api.createRoom(newRoom);
      setActionSuccess('Đã thêm phòng mới thành công!');
      setShowAddRoom(false);
      loadAllData();
      if (onRefreshRooms) onRefreshRooms();
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      alert(err.message || 'Lỗi tạo phòng mới');
    }
  };

  // Cập nhật trạng thái booking
  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    const notes = prompt(`Nhập ghi chú cho thay đổi trạng thái sang [${newStatus}]:`, `Cập nhật bởi ${currentUser?.username}`);
    if (notes === null) return; // user cancelled prompt

    try {
      await api.updateBookingStatus(bookingId, { status: newStatus, notes });
      setActionSuccess(`Cập nhật đơn đặt phòng sang trạng thái [${newStatus}] thành công!`);
      loadAllData();
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      alert(err.message || 'Lỗi cập nhật booking');
    }
  };

  // Xem lịch sử trạng thái
  const handleViewHistory = async (booking) => {
    setHistoryLoading(true);
    setSelectedBookingHistory({ booking, logs: [] });
    try {
      const res = await api.getBookingHistory(booking.id);
      setSelectedBookingHistory({ booking, logs: res.data || [] });
    } catch (err) {
      alert('Không thể tải lịch sử đơn đặt phòng');
    } finally {
      setHistoryLoading(false);
    }
  };

  // NẾU CHƯA ĐĂNG NHẬP: HIỂN THỊ MÀN HÌNH ĐĂNG NHẬP QUẢN TRỊ
  if (!currentUser) {
    return (
      <section style={{ padding: '140px 0 100px 0', minHeight: '85vh', background: 'var(--bg-dark-900)' }}>
        <div className="container" style={{ maxWidth: '480px' }}>
          <div className="glass-card" style={{ padding: '2.5rem', border: '1px solid var(--border-glass)' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div 
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(212, 175, 55, 0.15)',
                  color: 'var(--primary-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto',
                  border: '1px solid var(--border-glass)',
                }}
              >
                <Lock size={26} />
              </div>
              <h2 style={{ fontSize: '1.75rem', color: '#fff', marginBottom: '0.4rem' }}>
                Đăng Nhập <span className="gold-text">Quản Trị Viên</span>
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Hệ Thống Đặt Phòng Khách Sạn - Phân quyền Admin & Staff
              </p>
            </div>

            {/* Ghi chú tài khoản demo */}
            <div 
              style={{
                padding: '0.85rem 1rem',
                background: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: 'var(--radius-md)',
                color: '#7dd3fc',
                fontSize: '0.84rem',
                marginBottom: '1.5rem',
                lineHeight: 1.5,
              }}
            >
              <strong>Thông tin demo học phần:</strong><br />
              • Tài khoản: <code>admin</code> | Mật khẩu: <code>admin123</code> (Vai trò: Admin)<br />
              • Tài khoản: <code>staff</code> | Mật khẩu: <code>staff123</code> (Vai trò: Staff)
            </div>

            {loginError && (
              <div 
                style={{
                  padding: '0.75rem 1rem',
                  background: 'var(--danger-bg)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  color: '#fca5a5',
                  fontSize: '0.88rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <AlertCircle size={16} />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Tên đăng nhập</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nhập username..."
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                <label className="form-label">Mật khẩu</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Nhập password..."
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem' }}
                disabled={loggingIn}
              >
                {loggingIn ? 'Đang xác thực bảo mật...' : 'Đăng Nhập Quản Trị'}
              </button>
            </form>
          </div>
        </div>
      </section>
    );
  }

  // GIAO DIỆN QUẢN TRỊ KHI ĐÃ ĐĂNG NHẬP
  return (
    <section style={{ padding: '120px 0 80px 0', minHeight: '90vh', background: 'var(--bg-dark-900)' }}>
      <div className="container">
        {/* Header Admin Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-gold">Quản Trị Viên: {currentUser.full_name}</span>
              <span className="badge badge-success">Vai trò: {currentUser.role.toUpperCase()}</span>
            </div>
            <h2 style={{ fontSize: '2.2rem', color: '#fff', marginTop: '0.4rem' }}>
              Bảng Điều Khiển <span className="gold-text">Quản Trị Khách Sạn</span>
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button onClick={loadAllData} className="btn btn-secondary btn-sm" title="Tải lại dữ liệu">
              <RefreshCw size={15} />
              Làm mới
            </button>
            <button onClick={handleLogout} className="btn btn-danger btn-sm" title="Đăng xuất">
              <LogOut size={15} />
              Đăng xuất
            </button>
          </div>
        </div>

        {/* Thông báo thành công */}
        {actionSuccess && (
          <div 
            style={{
              padding: '0.85rem 1.25rem',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: '#6ee7b7',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Check size={18} />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div 
          style={{
            display: 'flex',
            gap: '0.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            marginBottom: '2rem',
            overflowX: 'auto',
            paddingBottom: '2px',
          }}
        >
          <button
            onClick={() => setActiveTab('overview')}
            className="btn"
            style={{
              background: activeTab === 'overview' ? 'var(--primary-gold)' : 'transparent',
              color: activeTab === 'overview' ? '#0a0f1d' : 'var(--text-secondary)',
              borderRadius: '8px 8px 0 0',
              padding: '0.75rem 1.25rem',
              fontSize: '0.9rem',
            }}
          >
            <BarChart3 size={17} />
            Tổng quan & Doanh thu
          </button>
          <button
            onClick={() => setActiveTab('rooms')}
            className="btn"
            style={{
              background: activeTab === 'rooms' ? 'var(--primary-gold)' : 'transparent',
              color: activeTab === 'rooms' ? '#0a0f1d' : 'var(--text-secondary)',
              borderRadius: '8px 8px 0 0',
              padding: '0.75rem 1.25rem',
              fontSize: '0.9rem',
            }}
          >
            <Bed size={17} />
            Phòng & Giá ({rooms.length})
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className="btn"
            style={{
              background: activeTab === 'bookings' ? 'var(--primary-gold)' : 'transparent',
              color: activeTab === 'bookings' ? '#0a0f1d' : 'var(--text-secondary)',
              borderRadius: '8px 8px 0 0',
              padding: '0.75rem 1.25rem',
              fontSize: '0.9rem',
            }}
          >
            <CalendarCheck size={17} />
            Đơn đặt phòng ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className="btn"
            style={{
              background: activeTab === 'customers' ? 'var(--primary-gold)' : 'transparent',
              color: activeTab === 'customers' ? '#0a0f1d' : 'var(--text-secondary)',
              borderRadius: '8px 8px 0 0',
              padding: '0.75rem 1.25rem',
              fontSize: '0.9rem',
            }}
          >
            <Users size={17} />
            Khách hàng ({customers.length})
          </button>
          <button
            onClick={() => setActiveTab('monitoring')}
            className="btn"
            style={{
              background: activeTab === 'monitoring' ? 'var(--primary-gold)' : 'transparent',
              color: activeTab === 'monitoring' ? '#0a0f1d' : 'var(--text-secondary)',
              borderRadius: '8px 8px 0 0',
              padding: '0.75rem 1.25rem',
              fontSize: '0.9rem',
            }}
          >
            <Activity size={17} />
            Sức khỏe & Giám sát Hệ thống
          </button>
        </div>

        {/* TAB 1: TỔNG QUAN & DOANH THU */}
        {activeTab === 'overview' && stats && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tổng số phòng</span>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', margin: '4px 0' }}>
                  {stats.rooms.total}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--success)' }}>
                  {stats.rooms.available} phòng đang sẵn sàng đón khách
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tổng lượt đặt phòng</span>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-gold-light)', margin: '4px 0' }}>
                  {stats.bookings.total}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {stats.bookings.confirmed} đã xác nhận • {stats.bookings.checked_in} đang ở
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tổng doanh thu ước tính</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#6ee7b7', margin: '4px 0' }}>
                  {formatPrice(stats.bookings.total_revenue)}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Đã thực thu: {formatPrice(stats.bookings.paid_revenue)}
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tỷ lệ lấp đầy phòng</span>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#38bdf8', margin: '4px 0' }}>
                  {stats.rooms.total > 0 
                    ? Math.round(((stats.rooms.total - stats.rooms.available) / stats.rooms.total) * 100) 
                    : 0}%
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {stats.rooms.maintenance} phòng bảo trì
                </div>
              </div>
            </div>

            {/* Doanh thu theo loại phòng */}
            <div className="glass-card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '1.25rem' }}>
                Doanh Thu Phân Bổ Theo Hạng Phòng
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                {stats.revenue_by_type.map((item, idx) => (
                  <div 
                    key={idx}
                    style={{
                      padding: '1rem',
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ fontSize: '0.85rem', color: 'var(--primary-gold)' }}>{item.room_type_name}</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', margin: '4px 0' }}>
                      {formatPrice(item.revenue)}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {item.booking_count} lượt đặt phòng
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: QUẢN LÝ PHÒNG & HẠNG PHÒNG */}
        {activeTab === 'rooms' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.4rem', color: '#fff' }}>Quản Lý Phòng, Loại Phòng & Giá</h3>
              {currentUser.role === 'admin' && (
                <button onClick={() => setShowAddRoom(true)} className="btn btn-primary btn-sm">
                  <Plus size={16} />
                  Thêm Phòng Mới
                </button>
              )}
            </div>

            {/* Modal Thêm Phòng */}
            {showAddRoom && (
              <div className="modal-overlay" onClick={() => setShowAddRoom(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '2rem' }}>
                  <h3 style={{ color: '#fff', marginBottom: '1.5rem' }}>Thêm Phòng Mới</h3>
                  <form onSubmit={handleCreateRoom}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <label className="form-label">Số phòng *</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Ví dụ: R-601"
                          value={newRoom.room_number}
                          onChange={(e) => setNewRoom({ ...newRoom, room_number: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="form-label">Hạng phòng *</label>
                        <select
                          className="form-control"
                          value={newRoom.room_type_id}
                          onChange={(e) => setNewRoom({ ...newRoom, room_type_id: parseInt(e.target.value, 10) })}
                        >
                          {roomTypes.map((t) => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label className="form-label">Tên phòng *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ví dụ: Phòng Deluxe Sunset Panorama R-601"
                        value={newRoom.title}
                        onChange={(e) => setNewRoom({ ...newRoom, title: e.target.value })}
                        required
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <label className="form-label">Tầng</label>
                        <input
                          type="number"
                          className="form-control"
                          value={newRoom.floor}
                          onChange={(e) => setNewRoom({ ...newRoom, floor: parseInt(e.target.value, 10) })}
                        />
                      </div>
                      <div>
                        <label className="form-label">Giá mỗi đêm (VNĐ) *</label>
                        <input
                          type="number"
                          className="form-control"
                          value={newRoom.price_per_night}
                          onChange={(e) => setNewRoom({ ...newRoom, price_per_night: parseFloat(e.target.value) })}
                          required
                        />
                      </div>
                      <div>
                        <label className="form-label">Sức chứa</label>
                        <input
                          type="number"
                          className="form-control"
                          value={newRoom.max_guests}
                          onChange={(e) => setNewRoom({ ...newRoom, max_guests: parseInt(e.target.value, 10) })}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label className="form-label">URL Ảnh phòng</label>
                      <input
                        type="url"
                        className="form-control"
                        value={newRoom.image_url}
                        onChange={(e) => setNewRoom({ ...newRoom, image_url: e.target.value })}
                      />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                      <label className="form-label">Mô tả phòng</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={newRoom.description}
                        onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                      <button type="button" onClick={() => setShowAddRoom(false)} className="btn btn-secondary">
                        Hủy
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Lưu Phòng Mới
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Bảng Danh sách phòng */}
            <div className="glass-card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '10px' }}>Số Phòng</th>
                    <th style={{ padding: '10px' }}>Tên Phòng & Hạng</th>
                    <th style={{ padding: '10px' }}>Tầng</th>
                    <th style={{ padding: '10px' }}>Sức Chứa</th>
                    <th style={{ padding: '10px' }}>Giá / Đêm</th>
                    <th style={{ padding: '10px' }}>Trạng Thái</th>
                    {currentUser.role === 'admin' && <th style={{ padding: '10px', textAlign: 'right' }}>Thao Tác</th>}
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((r) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '12px 10px', fontWeight: 700, color: 'var(--primary-gold-light)' }}>
                        {r.room_number}
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        <div style={{ fontWeight: 600, color: '#fff' }}>{r.title}</div>
                        <small style={{ color: 'var(--primary-gold)' }}>{r.room_type_name}</small>
                      </td>
                      <td style={{ padding: '12px 10px' }}>Tầng {r.floor}</td>
                      <td style={{ padding: '12px 10px' }}>{r.max_guests} khách</td>
                      <td style={{ padding: '12px 10px', fontWeight: 600, color: '#fff' }}>
                        {formatPrice(r.price_per_night)}
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        <select
                          className="form-control"
                          style={{ padding: '4px 8px', fontSize: '0.85rem', width: 'auto' }}
                          value={r.status}
                          disabled={currentUser.role !== 'admin'}
                          onChange={(e) => handleUpdateRoomStatus(r.id, e.target.value)}
                        >
                          <option value="available">Còn trống</option>
                          <option value="occupied">Đang có khách</option>
                          <option value="maintenance">Bảo trì</option>
                        </select>
                      </td>
                      {currentUser.role === 'admin' && (
                        <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                          <button
                            onClick={() => handleDeleteRoom(r.id, r.room_number)}
                            className="btn btn-danger btn-sm"
                            title="Xóa phòng"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: QUẢN LÝ ĐƠN ĐẶT PHÒNG */}
        {activeTab === 'bookings' && (
          <div>
            <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '1.5rem' }}>
              Quản Lý Đơn Đặt Phòng & Lịch Sử Thay Đổi Trạng Thái
            </h3>
            <div className="glass-card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '10px' }}>Mã Đơn</th>
                    <th style={{ padding: '10px' }}>Khách Hàng</th>
                    <th style={{ padding: '10px' }}>Phòng</th>
                    <th style={{ padding: '10px' }}>Lịch Trình</th>
                    <th style={{ padding: '10px' }}>Tổng Tiền</th>
                    <th style={{ padding: '10px' }}>Trạng Thái</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '12px 10px', fontWeight: 700, color: 'var(--primary-gold-light)' }}>
                        {b.booking_code}
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        <div style={{ color: '#fff', fontWeight: 600 }}>{b.customer_name}</div>
                        <small style={{ color: 'var(--text-muted)' }}>{b.customer_phone}</small>
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        <div>{b.room_number}</div>
                        <small style={{ color: 'var(--text-muted)' }}>{b.room_type_name}</small>
                      </td>
                      <td style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>
                        {b.check_in_date} ➔ {b.check_out_date} <br />
                        <small style={{ color: 'var(--primary-gold)' }}>({b.total_nights} đêm)</small>
                      </td>
                      <td style={{ padding: '12px 10px', fontWeight: 600, color: '#6ee7b7' }}>
                        {formatPrice(b.total_amount)}
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        <span className={`badge ${b.status === 'confirmed' ? 'badge-success' : b.status === 'checked_in' ? 'badge-gold' : b.status === 'cancelled' ? 'badge-danger' : 'badge-warning'}`}>
                          {b.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleViewHistory(b)}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                            title="Xem nhật ký lịch sử"
                          >
                            <History size={13} />
                          </button>
                          {b.status === 'confirmed' && (
                            <button
                              onClick={() => handleUpdateBookingStatus(b.id, 'checked_in')}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                            >
                              Check-in
                            </button>
                          )}
                          {b.status === 'checked_in' && (
                            <button
                              onClick={() => handleUpdateBookingStatus(b.id, 'checked_out')}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                            >
                              Check-out
                            </button>
                          )}
                          {b.status !== 'cancelled' && b.status !== 'checked_out' && (
                            <button
                              onClick={() => handleUpdateBookingStatus(b.id, 'cancelled')}
                              className="btn btn-danger btn-sm"
                              style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                            >
                              Hủy
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal Xem Lịch Sử Thay Đổi Trạng Thái (Audit Trail) */}
            {selectedBookingHistory && (
              <div className="modal-overlay" onClick={() => setSelectedBookingHistory(null)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <History size={20} color="var(--primary-gold)" />
                      <h3 style={{ color: '#fff', margin: 0 }}>
                        Lịch Sử Trạng Thái [{selectedBookingHistory.booking.booking_code}]
                      </h3>
                    </div>
                    <button onClick={() => setSelectedBookingHistory(null)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
                      <X size={20} />
                    </button>
                  </div>

                  {historyLoading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Đang tải lịch sử...</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {selectedBookingHistory.logs.map((log, idx) => (
                        <div 
                          key={idx}
                          style={{
                            padding: '1rem',
                            background: 'rgba(255, 255, 255, 0.03)',
                            borderRadius: '8px',
                            borderLeft: '3px solid var(--primary-gold)',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                            <span style={{ fontWeight: 600, color: '#fff' }}>
                              {log.old_status ? `${log.old_status} ➔ ${log.new_status}` : `Khởi tạo: ${log.new_status}`}
                            </span>
                            <span style={{ color: 'var(--text-muted)' }}>{new Date(log.created_at).toLocaleString('vi-VN')}</span>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--primary-gold-light)' }}>
                            Thực hiện bởi: {log.changed_by}
                          </div>
                          {log.notes && (
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                              Ghi chú: {log.notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: QUẢN LÝ DANH SÁCH KHÁCH HÀNG */}
        {activeTab === 'customers' && (
          <div>
            <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '1.5rem' }}>
              Danh Sách Khách Hàng Trong Hệ Thống (Bảng `customers`)
            </h3>
            <div className="glass-card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '10px' }}>Họ Và Tên</th>
                    <th style={{ padding: '10px' }}>Email</th>
                    <th style={{ padding: '10px' }}>Số Điện Thoại</th>
                    <th style={{ padding: '10px' }}>Số CCCD / Hộ Chiếu</th>
                    <th style={{ padding: '10px' }}>Địa Chỉ</th>
                    <th style={{ padding: '10px' }}>Tổng Lượt Đặt</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Tổng Chi Tiêu</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '12px 10px', fontWeight: 600, color: '#fff' }}>
                        {c.full_name}
                      </td>
                      <td style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>
                        {c.email}
                      </td>
                      <td style={{ padding: '12px 10px', color: 'var(--primary-gold-light)' }}>
                        {c.phone}
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        {c.id_card || <span style={{ color: 'var(--text-muted)' }}>Chưa cập nhật</span>}
                      </td>
                      <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>
                        {c.address || '—'}
                      </td>
                      <td style={{ padding: '12px 10px', fontWeight: 600 }}>
                        {c.total_bookings} đơn
                      </td>
                      <td style={{ padding: '12px 10px', fontWeight: 700, color: '#6ee7b7', textAlign: 'right' }}>
                        {formatPrice(c.total_spent)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: SỨC KHỎE & GIÁM SÁT HẠ TẦNG */}
        {activeTab === 'monitoring' && (
          <div>
            {/* Live Health Check Box */}
            {healthData && (
              <div 
                className="glass-card" 
                style={{
                  padding: '1.75rem',
                  marginBottom: '2rem',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  background: 'rgba(16, 185, 129, 0.05)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
                    <h3 style={{ color: '#fff', fontSize: '1.25rem', margin: 0 }}>
                      Trạng Thái Hoạt Động Hệ Thống (Health Check LIVE)
                    </h3>
                  </div>
                  <span className="badge badge-success" style={{ fontSize: '0.85rem' }}>
                    STATUS: {healthData.status}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.88rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Cơ sở dữ liệu PostgreSQL:</span>
                    <div style={{ fontWeight: 600, color: '#10b981', marginTop: '2px' }}>
                      {healthData.database?.status} ({healthData.database?.latency_ms} ms)
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Thời gian hoạt động (Uptime):</span>
                    <div style={{ fontWeight: 600, color: '#fff', marginTop: '2px' }}>
                      {Math.floor(healthData.uptime_seconds / 60)} phút ({healthData.uptime_seconds}s)
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Bộ nhớ Backend (RSS):</span>
                    <div style={{ fontWeight: 600, color: '#38bdf8', marginTop: '2px' }}>
                      {healthData.system?.memory_usage_mb} MB (Heap: {healthData.system?.heap_used_mb} MB)
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Môi trường Runtime:</span>
                    <div style={{ fontWeight: 600, color: 'var(--primary-gold)', marginTop: '2px' }}>
                      Node.js {healthData.system?.node_version} (Alpine Container)
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Links Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
              {/* Grafana */}
              <div className="glass-card" style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                      <BarChart3 size={22} />
                    </div>
                    <div>
                      <h4 style={{ color: '#fff', fontSize: '1.1rem' }}>Grafana Dashboard</h4>
                      <small style={{ color: 'var(--text-muted)' }}>Cổng :3001</small>
                    </div>
                  </div>
                  <span className="badge badge-success">Sẵn sàng</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                  Trực quan hóa số liệu tài nguyên, lưu lượng truy cập HTTP, tỷ lệ lỗi, tình trạng DB và log tập trung.
                </p>
                <a href="http://localhost:3001" target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                  <span>Mở Grafana</span>
                  <ExternalLink size={14} />
                </a>
              </div>

              {/* Prometheus */}
              <div className="glass-card" style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                      <Activity size={22} />
                    </div>
                    <div>
                      <h4 style={{ color: '#fff', fontSize: '1.1rem' }}>Prometheus Server</h4>
                      <small style={{ color: 'var(--text-muted)' }}>Cổng :9090</small>
                    </div>
                  </div>
                  <span className="badge badge-success">Sẵn sàng</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                  Thu thập và lưu trữ time-series metrics từ Node.js, PostgreSQL, Nginx, cAdvisor và Node Exporter.
                </p>
                <a href="http://localhost:9090/targets" target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                  <span>Xem Scrape Targets</span>
                  <ExternalLink size={14} />
                </a>
              </div>

              {/* pgAdmin 4 */}
              <div className="glass-card" style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
                      <Database size={22} />
                    </div>
                    <div>
                      <h4 style={{ color: '#fff', fontSize: '1.1rem' }}>pgAdmin 4</h4>
                      <small style={{ color: 'var(--text-muted)' }}>Cổng :8082</small>
                    </div>
                  </div>
                  <span className="badge badge-success">Sẵn sàng</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                  Giao diện đồ họa quản trị cơ sở dữ liệu PostgreSQL, chạy query SQL và kiểm tra bảng dữ liệu.
                </p>
                <a href="http://localhost:8082" target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                  <span>Mở pgAdmin 4</span>
                  <ExternalLink size={14} />
                </a>
              </div>

              {/* cAdvisor */}
              <div className="glass-card" style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                      <Layers size={22} />
                    </div>
                    <div>
                      <h4 style={{ color: '#fff', fontSize: '1.1rem' }}>cAdvisor Containers</h4>
                      <small style={{ color: 'var(--text-muted)' }}>Cổng :8085</small>
                    </div>
                  </div>
                  <span className="badge badge-success">Sẵn sàng</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                  Giám sát CPU, bộ nhớ RAM, IO và băng thông mạng từng Docker container theo thời gian thực.
                </p>
                <a href="http://localhost:8085" target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                  <span>Mở cAdvisor</span>
                  <ExternalLink size={14} />
                </a>
              </div>

              {/* Node Exporter */}
              <div className="glass-card" style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7' }}>
                      <Server size={22} />
                    </div>
                    <div>
                      <h4 style={{ color: '#fff', fontSize: '1.1rem' }}>Node Exporter</h4>
                      <small style={{ color: 'var(--text-muted)' }}>Cổng :9100</small>
                    </div>
                  </div>
                  <span className="badge badge-success">Sẵn sàng</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                  Thu thập chỉ số hệ điều hành máy chủ (Linux Kernel metrics: CPU, RAM, Disk, Load Average).
                </p>
                <a href="http://localhost:9100/metrics" target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                  <span>Xem Host Metrics</span>
                  <ExternalLink size={14} />
                </a>
              </div>

              {/* Backend Metrics & Health */}
              <div className="glass-card" style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(212, 175, 55, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-gold)' }}>
                      <ShieldCheck size={22} />
                    </div>
                    <div>
                      <h4 style={{ color: '#fff', fontSize: '1.1rem' }}>API Health & Metrics</h4>
                      <small style={{ color: 'var(--text-muted)' }}>Endpoint /metrics</small>
                    </div>
                  </div>
                  <span className="badge badge-success">OK</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                  Endpoint xuất số liệu chuẩn Prometheus prom-client tích hợp sẵn trong mã nguồn Express.
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <a href="/metrics" target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                    <span>/metrics</span>
                    <ExternalLink size={12} />
                  </a>
                  <a href="/health" target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                    <span>/health</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
