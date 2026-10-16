import React, { useState } from 'react';
import { 
  X, 
  Users, 
  Maximize2, 
  Bed, 
  Check, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  CreditCard,
  Sparkles
} from 'lucide-react';

export default function RoomDetailModal({ room, onClose, onBookRoom }) {
  if (!room) return null;

  const [activeImage, setActiveImage] = useState(room.image_url);

  const images = room.images && room.images.length > 0 
    ? [room.image_url, ...room.images.filter(img => img !== room.image_url)]
    : [room.image_url];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '800px', maxHeight: '92vh' }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(10, 15, 29, 0.75)',
            border: '1px solid var(--border-subtle)',
            color: '#fff',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            backdropFilter: 'blur(6px)',
          }}
        >
          <X size={20} />
        </button>

        {/* Main Gallery Image */}
        <div style={{ height: '340px', position: 'relative', overflow: 'hidden' }}>
          <img
            src={activeImage}
            alt={room.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div 
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              display: 'flex',
              gap: '8px',
            }}
          >
            <span className="badge badge-gold font-serif">{room.room_number}</span>
            <span className="badge badge-success">Tầng {room.floor}</span>
          </div>
        </div>

        {/* Thumbnail Carousel if multiple images */}
        {images.length > 1 && (
          <div 
            style={{
              display: 'flex',
              gap: '10px',
              padding: '12px 20px',
              background: 'rgba(10, 15, 29, 0.95)',
              overflowX: 'auto',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            {images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Thumbnail ${idx}`}
                onClick={() => setActiveImage(img)}
                style={{
                  width: '80px',
                  height: '55px',
                  borderRadius: '6px',
                  objectFit: 'cover',
                  cursor: 'pointer',
                  border: activeImage === img ? '2px solid var(--primary-gold)' : '1px solid var(--border-subtle)',
                  opacity: activeImage === img ? 1 : 0.6,
                  transition: 'all 0.2s',
                }}
              />
            ))}
          </div>
        )}

        {/* Modal Body */}
        <div style={{ padding: '24px' }}>
          {/* Header & Price */}
          <div 
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '1.25rem',
            }}
          >
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--primary-gold)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {room.room_type_name}
              </span>
              <h2 style={{ fontSize: '1.6rem', color: '#fff', marginTop: '4px' }}>
                {room.title}
              </h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--primary-gold-light)' }}>
                {formatPrice(room.price_per_night)}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>mỗi đêm (đã gồm VAT)</span>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '1rem',
              padding: '1rem',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '1.5rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-gold)', fontSize: '0.85rem' }}>
                <Users size={16} />
                <span>Sức chứa</span>
              </div>
              <div style={{ fontWeight: 600, marginTop: '4px' }}>Tối đa {room.max_guests} người</div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-gold)', fontSize: '0.85rem' }}>
                <Maximize2 size={16} />
                <span>Diện tích</span>
              </div>
              <div style={{ fontWeight: 600, marginTop: '4px' }}>{room.room_size || 45} m²</div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-gold)', fontSize: '0.85rem' }}>
                <Bed size={16} />
                <span>Loại giường</span>
              </div>
              <div style={{ fontWeight: 600, marginTop: '4px' }}>{room.bed_type || 'King Size'}</div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-gold)', fontSize: '0.85rem' }}>
                <Clock size={16} />
                <span>Nhận/Trả</span>
              </div>
              <div style={{ fontWeight: 600, marginTop: '4px' }}>14:00 / 12:00</div>
            </div>
          </div>

          {/* Detailed Description */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '0.5rem' }}>Mô Tả Không Gian</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7 }}>
              {room.description}
            </p>
          </div>

          {/* Full Amenities */}
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '0.75rem' }}>Tiện Nghi Phòng Cao Cấp</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
              {(room.amenities || []).map((amenity, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  <div 
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: 'rgba(16, 185, 129, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--success)',
                    }}
                  >
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Policies & Action */}
          <div 
            style={{
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              <ShieldCheck size={16} color="var(--primary-gold)" />
              <span>Miễn phí hủy phòng trước 48 giờ. Thanh toán an toàn tại khách sạn.</span>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={onClose} className="btn btn-secondary">
                Đóng
              </button>
              <button 
                onClick={() => {
                  onClose();
                  onBookRoom(room);
                }} 
                className="btn btn-primary"
                disabled={room.status !== 'available'}
              >
                <Calendar size={18} />
                Đặt Phòng Này Ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
