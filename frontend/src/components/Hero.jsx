import React from 'react';
import { Star, Shield, Award, Sparkles, MapPin } from 'lucide-react';
import SearchBar from './SearchBar';

export default function Hero({ onSearch, roomTypes, onExploreRooms }) {
  return (
    <section 
      style={{
        position: 'relative',
        minHeight: '92vh',
        paddingTop: '120px',
        paddingBottom: '80px',
        display: 'flex',
        alignItems: 'center',
        backgroundImage: `
          linear-gradient(180deg, rgba(10, 15, 29, 0.75) 0%, rgba(10, 15, 29, 0.95) 100%),
          url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=85')
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="container" style={{ position: 'relative', zIndex: 2, width: '100%' }}>
        <div style={{ maxWidth: '850px', margin: '0 auto', textAlign: 'center', marginBottom: '3rem' }}>
          {/* Badge 5-Star Luxury */}
          <div 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 1.25rem',
              background: 'rgba(212, 175, 55, 0.15)',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              borderRadius: '9999px',
              marginBottom: '1.5rem',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div style={{ display: 'flex', gap: '2px' }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill="#f6e6b4" color="#d4af37" />
              ))}
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-gold-light)', letterSpacing: '0.05em' }}>
              RESORT NGHỈ DƯỠNG 5 SAO QUỐC TẾ
            </span>
          </div>

          {/* Heading */}
          <h1 
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
              lineHeight: 1.15,
              marginBottom: '1.25rem',
              color: '#ffffff',
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.8)',
            }}
          >
            Thiên Đường Nghỉ Dưỡng <br />
            <span className="gold-text">Thượng Lưu Bên Vịnh Biển</span>
          </h1>

          {/* Subtitle */}
          <p 
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              maxWidth: '680px',
              margin: '0 auto 2rem auto',
            }}
          >
            Đắm mình trong không gian kiến trúc tân cổ điển hoàng gia, thưởng ngoạn hoàng hôn biển lộng lẫy và tận hưởng dịch vụ quản gia riêng tận tâm 24/7.
          </p>

          {/* Highlights Info */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2rem',
              flexWrap: 'wrap',
              fontSize: '0.9rem',
              color: 'var(--text-muted)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={16} color="var(--primary-gold)" />
              <span>Đại lộ Biển Bạc, Bán đảo Sơn Trà, Đà Nẵng</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Award size={16} color="var(--primary-gold)" />
              <span>Top 10 Resort Tốt Nhất Châu Á 2026</span>
            </div>
          </div>
        </div>

        {/* Search Bar Container */}
        <div style={{ maxWidth: '1050px', margin: '0 auto' }}>
          <SearchBar onSearch={onSearch} roomTypes={roomTypes} />
        </div>
      </div>
    </section>
  );
}
