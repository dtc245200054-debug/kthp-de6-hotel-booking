import React from 'react';
import { Users, Maximize2, Bed, CheckCircle2, ArrowRight, Eye } from 'lucide-react';

export default function RoomCard({ room, onSelectRoom, onBookRoom }) {
  // Định dạng tiền tệ Việt Nam Đồng (VNĐ)
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const isAvailable = room.status === 'available';

  return (
    <div 
      className="glass-card" 
      style={{
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
      }}
    >
      {/* Thumbnail Image Container */}
      <div style={{ position: 'relative', height: '230px', overflow: 'hidden' }}>
        <img
          src={room.image_url || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'}
          alt={room.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        />

        {/* Room Code & Type Badges */}
        <div 
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <span className="badge badge-gold font-serif">
            {room.room_number}
          </span>
          <span 
            className="badge" 
            style={{ 
              background: 'rgba(10, 15, 29, 0.85)', 
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
              backdropFilter: 'blur(6px)',
            }}
          >
            Tầng {room.floor}
          </span>
        </div>

        {/* Status Indicator */}
        <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
          {isAvailable ? (
            <span className="badge badge-success">● Còn trống</span>
          ) : room.status === 'occupied' ? (
            <span className="badge badge-warning">● Đang có khách</span>
          ) : (
            <span className="badge badge-danger">● Bảo trì</span>
          )}
        </div>

        {/* Price Tag Overlay */}
        <div 
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '1.25rem 1rem 0.6rem 1rem',
            background: 'linear-gradient(180deg, rgba(10, 15, 29, 0) 0%, rgba(10, 15, 29, 0.95) 100%)',
            display: 'flex',
            alignItems: 'baseline',
            gap: '4px',
          }}
        >
          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-gold-light)' }}>
            {formatPrice(room.price_per_night)}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ đêm</span>
        </div>
      </div>

      {/* Card Content Body */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--primary-gold)', letterSpacing: '0.05em' }}>
            {room.room_type_name}
          </span>
          <h3 
            style={{ 
              fontSize: '1.15rem', 
              color: '#fff', 
              margin: '0.2rem 0 0.5rem 0',
              fontWeight: 600,
              lineHeight: 1.3,
            }}
          >
            {room.title}
          </h3>
          <p 
            style={{ 
              fontSize: '0.85rem', 
              color: 'var(--text-secondary)', 
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              marginBottom: '1rem',
            }}
          >
            {room.description}
          </p>
        </div>

        {/* Quick Specs */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.5rem',
            padding: '0.75rem 0',
            borderTop: '1px solid var(--border-subtle)',
            borderBottom: '1px solid var(--border-subtle)',
            marginBottom: '1rem',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Users size={14} color="var(--primary-gold)" />
            <span>Tối đa {room.max_guests} người</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Maximize2 size={14} color="var(--primary-gold)" />
            <span>{room.room_size || 45} m²</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Bed size={14} color="var(--primary-gold)" />
            <span>King Size</span>
          </div>
        </div>

        {/* Amenities Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1.25rem' }}>
          {(room.amenities || []).slice(0, 3).map((amenity, idx) => (
            <span 
              key={idx} 
              style={{
                fontSize: '0.75rem',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text-secondary)',
                padding: '3px 8px',
                borderRadius: '4px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {amenity}
            </span>
          ))}
          {(room.amenities || []).length > 3 && (
            <span style={{ fontSize: '0.75rem', color: 'var(--primary-gold)', alignSelf: 'center' }}>
              +{room.amenities.length - 3} tiện ích
            </span>
          )}
        </div>

        {/* Card Actions */}
        <div style={{ marginTop: 'auto', display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => onSelectRoom(room)}
            className="btn btn-secondary btn-sm"
            style={{ flex: 1 }}
          >
            <Eye size={15} />
            Chi tiết
          </button>
          <button
            onClick={() => onBookRoom(room)}
            className="btn btn-primary btn-sm"
            style={{ flex: 1.3 }}
            disabled={!isAvailable}
          >
            {isAvailable ? 'Đặt ngay' : 'Hết phòng'}
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
