import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeaturedRooms from './components/FeaturedRooms';
import AboutSection from './components/AboutSection';
import RoomCard from './components/RoomCard';
import RoomDetailModal from './components/RoomDetailModal';
import BookingModal from './components/BookingModal';
import BookingLookup from './components/BookingLookup';
import AdminDashboard from './components/AdminDashboard';
import Footer from './components/Footer';
import { api } from './services/api';
import { 
  Filter, 
  Search, 
  RotateCcw, 
  SlidersHorizontal, 
  Sparkles, 
  Calendar,
  Users,
  AlertCircle
} from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'rooms' | 'about' | 'amenities' | 'lookup' | 'admin'
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter State
  const [filters, setFilters] = useState({
    type: '',
    min_price: '',
    max_price: '',
    capacity: '',
    check_in: '',
    check_out: '',
    search: '',
    sort: 'price_asc',
  });

  // Modal States
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingRoom, setBookingRoom] = useState(null);

  // Tải dữ liệu ban đầu
  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [roomsRes, typesRes] = await Promise.all([
        api.getRooms(),
        api.getRoomTypes(),
      ]);
      setRooms(roomsRes.data || []);
      setRoomTypes(typesRes.data || []);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu phòng:', err);
      setError('Không thể kết nối đến máy chủ backend. Vui lòng kiểm tra container dịch vụ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (['home', 'rooms', 'about', 'amenities', 'lookup', 'admin'].includes(hash)) {
        setCurrentView(hash);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Thực thi tìm kiếm/lọc phòng
  const handleApplyFilter = async (customFilters = {}) => {
    setLoading(true);
    const merged = { ...filters, ...customFilters };
    setFilters(merged);
    try {
      const response = await api.getRooms(merged);
      let list = response.data || [];
      if (merged.sort === 'price_desc') {
        list.sort((a, b) => b.price_per_night - a.price_per_night);
      } else {
        list.sort((a, b) => a.price_per_night - b.price_per_night);
      }
      setRooms(list);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleHeroSearch = (searchParams) => {
    setCurrentView('rooms');
    handleApplyFilter(searchParams);
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      type: '',
      min_price: '',
      max_price: '',
      capacity: '',
      check_in: '',
      check_out: '',
      search: '',
      sort: 'price_asc',
    };
    setFilters(defaultFilters);
    handleApplyFilter(defaultFilters);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 1. Header / Navbar */}
      <Navbar 
        currentView={currentView} 
        setCurrentView={setCurrentView}
        onOpenSearch={() => {
          setCurrentView('rooms');
          window.scrollTo({ top: 300, behavior: 'smooth' });
        }}
      />

      {/* 2. Main Content Routing */}
      <main style={{ flex: 1 }}>
        {/* VIEW: TRANG CHỦ */}
        {currentView === 'home' && (
          <div>
            <Hero 
              onSearch={handleHeroSearch} 
              roomTypes={roomTypes} 
              onExploreRooms={() => {
                setCurrentView('rooms');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            <FeaturedRooms 
              rooms={rooms}
              onSelectRoom={(room) => setSelectedRoom(room)}
              onBookRoom={(room) => setBookingRoom(room)}
              onViewAll={() => {
                setCurrentView('rooms');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            <AboutSection />
          </div>
        )}

        {/* VIEW: DANH SÁCH PHÒNG & TÌM KIẾM CHI TIẾT */}
        {currentView === 'rooms' && (
          <section style={{ paddingTop: '110px', paddingBottom: '80px', background: 'var(--bg-dark-900)' }}>
            <div className="container">
              {/* Header Page */}
              <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <span style={{ color: 'var(--primary-gold)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Không Gian Lưu Trú
                </span>
                <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', color: '#fff', marginTop: '0.4rem' }}>
                  Danh Sách Phòng <span className="gold-text">Aurora Grand Resort</span>
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                  Lọc phòng theo tiêu chí ngày lưu trú, số khách và hạng phòng mong muốn
                </p>
              </div>

              {/* BỘ LỌC ĐA TIÊU CHÍ */}
              <div 
                className="glass-card" 
                style={{ padding: '1.75rem', marginBottom: '2.5rem', background: 'var(--surface-card)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-gold-light)', fontWeight: 600 }}>
                    <SlidersHorizontal size={18} />
                    <span>Bộ Lọc Tìm Kiếm Nâng Cao</span>
                  </div>
                  <button 
                    onClick={handleResetFilters} 
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.82rem' }}
                  >
                    <RotateCcw size={14} />
                    Đặt lại bộ lọc
                  </button>
                </div>

                <div 
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '1rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  {/* Hạng phòng */}
                  <div>
                    <label className="form-label">Loại phòng</label>
                    <select
                      className="form-control"
                      value={filters.type}
                      onChange={(e) => handleApplyFilter({ type: e.target.value })}
                    >
                      <option value="">Tất cả hạng phòng</option>
                      {roomTypes.map((t) => (
                        <option key={t.id} value={t.code}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sức chứa */}
                  <div>
                    <label className="form-label">Sức chứa</label>
                    <select
                      className="form-control"
                      value={filters.capacity}
                      onChange={(e) => handleApplyFilter({ capacity: e.target.value })}
                    >
                      <option value="">Tất cả sức chứa</option>
                      <option value="2">Từ 2 người trở lên</option>
                      <option value="4">Từ 4 người trở lên</option>
                      <option value="6">Từ 6 người (Biệt thự)</option>
                    </select>
                  </div>

                  {/* Mức giá */}
                  <div>
                    <label className="form-label">Khoảng giá</label>
                    <select
                      className="form-control"
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'low') handleApplyFilter({ min_price: '', max_price: 2000000 });
                        else if (val === 'mid') handleApplyFilter({ min_price: 2000000, max_price: 5000000 });
                        else if (val === 'high') handleApplyFilter({ min_price: 5000000, max_price: '' });
                        else handleApplyFilter({ min_price: '', max_price: '' });
                      }}
                    >
                      <option value="">Tất cả mức giá</option>
                      <option value="low">Dưới 2.000.000 đ/đêm</option>
                      <option value="mid">2.000.000 - 5.000.000 đ/đêm</option>
                      <option value="high">Trên 5.000.000 đ/đêm</option>
                    </select>
                  </div>

                  {/* Sắp xếp */}
                  <div>
                    <label className="form-label">Sắp xếp theo</label>
                    <select
                      className="form-control"
                      value={filters.sort}
                      onChange={(e) => handleApplyFilter({ sort: e.target.value })}
                    >
                      <option value="price_asc">Giá tăng dần</option>
                      <option value="price_desc">Giá giảm dần</option>
                    </select>
                  </div>
                </div>

                {/* Dòng 2: Lọc ngày nhận / trả phòng và tìm kiếm từ khóa */}
                <div 
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--border-subtle)',
                  }}
                >
                  <div>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={14} color="var(--primary-gold)" />
                      Ngày nhận phòng
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      value={filters.check_in}
                      onChange={(e) => handleApplyFilter({ check_in: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={14} color="var(--primary-gold)" />
                      Ngày trả phòng
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      value={filters.check_out}
                      onChange={(e) => handleApplyFilter({ check_out: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Search size={14} color="var(--primary-gold)" />
                      Tìm số phòng / từ khóa
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="VD: R-101, Deluxe, Villa..."
                      value={filters.search}
                      onChange={(e) => handleApplyFilter({ search: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* THÔNG BÁO LỖI HOẶC KẾT QUẢ RỖNG */}
              {error && (
                <div 
                  style={{
                    padding: '1.25rem',
                    background: 'var(--danger-bg)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    borderRadius: 'var(--radius-md)',
                    color: '#fca5a5',
                    marginBottom: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
              )}

              {/* Số lượng phòng tìm thấy */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                  Tìm thấy <strong style={{ color: 'var(--primary-gold-light)' }}>{rooms.length}</strong> phòng phù hợp
                </div>
              </div>

              {/* GRID DANH SÁCH PHÒNG */}
              {rooms.length === 0 && !loading ? (
                <div className="glass-card" style={{ padding: '3.5rem', textAlign: 'center' }}>
                  <AlertCircle size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
                  <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>Không tìm thấy phòng nào phù hợp</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                    Không có phòng trống nào thỏa mãn các tiêu chí lọc hoặc khoảng ngày bạn đã chọn.
                  </p>
                  <button onClick={handleResetFilters} className="btn btn-primary">
                    Xem tất cả các phòng
                  </button>
                </div>
              ) : (
                <div className="grid-rooms">
                  {rooms.map((room) => (
                    <RoomCard
                      key={room.id}
                      room={room}
                      onSelectRoom={(r) => setSelectedRoom(r)}
                      onBookRoom={(r) => setBookingRoom(r)}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* VIEW: VỀ CHÚNG TÔI */}
        {currentView === 'about' && (
          <div style={{ paddingTop: '80px' }}>
            <AboutSection />
          </div>
        )}

        {/* VIEW: TIỆN ÍCH 5 SAO */}
        {currentView === 'amenities' && (
          <div style={{ paddingTop: '80px' }}>
            <AboutSection />
          </div>
        )}

        {/* VIEW: TRA CỨU ĐẶT PHÒNG */}
        {currentView === 'lookup' && (
          <BookingLookup />
        )}

        {/* VIEW: QUẢN TRỊ ADMIN DASHBOARD */}
        {currentView === 'admin' && (
          <AdminDashboard 
            roomTypes={roomTypes} 
            onRefreshRooms={fetchInitialData}
          />
        )}
      </main>

      {/* 3. Modal Chi Tiết Phòng */}
      {selectedRoom && (
        <RoomDetailModal
          room={selectedRoom}
          onClose={() => setSelectedRoom(null)}
          onBookRoom={(room) => {
            setSelectedRoom(null);
            setBookingRoom(room);
          }}
        />
      )}

      {/* 4. Modal Đặt Phòng */}
      {bookingRoom && (
        <BookingModal
          room={bookingRoom}
          initialCheckIn={filters.check_in}
          initialCheckOut={filters.check_out}
          initialGuests={filters.capacity}
          onClose={() => setBookingRoom(null)}
          onSuccess={() => {
            fetchInitialData();
          }}
        />
      )}

      {/* 5. Footer */}
      <Footer onNavigate={(view) => setCurrentView(view)} />
    </div>
  );
}
