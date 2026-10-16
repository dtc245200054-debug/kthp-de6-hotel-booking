import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import RoomCard from './RoomCard';

export default function FeaturedRooms({ rooms = [], onSelectRoom, onBookRoom, onViewAll }) {
  // Lấy các phòng tiêu biểu
  const featured = rooms.slice(0, 3);

  return (
    <section style={{ padding: '80px 0', background: 'var(--bg-dark-900)' }}>
      <div className="container">
        {/* Section Header */}
        <div 
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '3rem',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <div>
            <div 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--primary-gold)',
                fontSize: '0.85rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '0.5rem',
              }}
            >
              <Sparkles size={16} />
              <span>Tuyển Chọn Nghỉ Dưỡng</span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', color: '#fff' }}>
              Không Gian Phòng <span className="gold-text">Nổi Bật Nhất</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.4rem' }}>
              Mỗi căn phòng là một kiệt tác kiến trúc sở hữu tầm nhìn không giới hạn ra đại dương
            </p>
          </div>

          <button 
            onClick={onViewAll} 
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <span>Xem tất cả phòng</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Featured Rooms Grid */}
        <div className="grid-rooms">
          {featured.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onSelectRoom={onSelectRoom}
              onBookRoom={onBookRoom}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
