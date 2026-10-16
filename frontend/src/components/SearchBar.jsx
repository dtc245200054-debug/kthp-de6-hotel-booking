import React, { useState } from 'react';
import { Calendar, Users, Home, Search, Sparkles } from 'lucide-react';

export default function SearchBar({ onSearch, roomTypes = [] }) {
  // Tính ngày mặc định: Hôm nay và 2 ngày sau
  const todayStr = new Date().toISOString().split('T')[0];
  const nextTwoDays = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(todayStr);
  const [checkOut, setCheckOut] = useState(nextTwoDays);
  const [guests, setGuests] = useState('2');
  const [roomType, setRoomType] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({
      check_in: checkIn,
      check_out: checkOut,
      capacity: guests,
      type: roomType,
    });
  };

  return (
    <div 
      className="glass-card"
      style={{
        padding: '1.75rem',
        background: 'rgba(18, 26, 46, 0.92)',
        border: '1px solid var(--border-glass)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 25px rgba(212, 175, 55, 0.2)',
      }}
    >
      <form onSubmit={handleSubmit}>
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '1.25rem',
            alignItems: 'end',
          }}
        >
          {/* Ngày nhận phòng */}
          <div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={16} color="var(--primary-gold)" />
              Ngày nhận phòng
            </label>
            <input
              type="date"
              className="form-control"
              value={checkIn}
              min={todayStr}
              onChange={(e) => {
                setCheckIn(e.target.value);
                if (e.target.value >= checkOut) {
                  const nextDay = new Date(new Date(e.target.value).getTime() + 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split('T')[0];
                  setCheckOut(nextDay);
                }
              }}
              required
            />
          </div>

          {/* Ngày trả phòng */}
          <div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={16} color="var(--primary-gold)" />
              Ngày trả phòng
            </label>
            <input
              type="date"
              className="form-control"
              value={checkOut}
              min={checkIn || todayStr}
              onChange={(e) => setCheckOut(e.target.value)}
              required
            />
          </div>

          {/* Số lượng khách */}
          <div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Users size={16} color="var(--primary-gold)" />
              Số lượng khách
            </label>
            <select
              className="form-control"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
            >
              <option value="1">1 Khách (Đi một mình)</option>
              <option value="2">2 Khách (Cặp đôi)</option>
              <option value="3">3 Khách (Nhóm nhỏ)</option>
              <option value="4">4 Khách (Gia đình)</option>
              <option value="5">5+ Khách (Đại gia đình / Villa)</option>
            </select>
          </div>

          {/* Hạng phòng */}
          <div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Home size={16} color="var(--primary-gold)" />
              Loại phòng mong muốn
            </label>
            <select
              className="form-control"
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
            >
              <option value="">Tất cả các hạng phòng</option>
              {roomTypes.map((t) => (
                <option key={t.id} value={t.code}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Nút Tìm kiếm */}
          <div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%',
                height: '46px',
                fontSize: '1rem',
                fontWeight: 700,
                letterSpacing: '0.02em',
              }}
            >
              <Search size={18} />
              Tìm Phòng Trống
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
