import React from 'react';
import { Crown, MapPin, Phone, Mail, Clock, ShieldCheck, Heart } from 'lucide-react';

export default function Footer({ onNavigate }) {
  return (
    <footer 
      style={{
        background: '#060a14',
        borderTop: '1px solid var(--border-glass)',
        padding: '70px 0 30px 0',
        color: 'var(--text-secondary)',
      }}
    >
      <div className="container">
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '3rem',
            marginBottom: '4rem',
          }}
        >
          {/* Brand Column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div 
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f6e6b4, #d4af37)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0a0f1d',
                }}
              >
                <Crown size={20} strokeWidth={2.5} />
              </div>
              <div>
                <span className="font-serif" style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', display: 'block', lineHeight: 1.1 }}>
                  AURORA <span className="gold-text">GRAND</span>
                </span>
                <span style={{ fontSize: '0.62rem', letterSpacing: '0.2em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Resort & Spa ★★★★★
                </span>
              </div>
            </div>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.7, color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Trải nghiệm kỳ nghỉ dưỡng thượng lưu bên bờ biển với tiêu chuẩn dịch vụ 5 sao quốc tế, sự riêng tư trọn vẹn và ẩm thực đỉnh cao.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span className="badge badge-gold">Forbes Travel Guide 5-Star</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '1.25rem' }}>Điều Hướng Nhanh</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <li>
                <a href="#home" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  Trang chủ
                </a>
              </li>
              <li>
                <a href="#rooms" onClick={(e) => { e.preventDefault(); onNavigate('rooms'); }} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  Danh sách hạng phòng
                </a>
              </li>
              <li>
                <a href="#about" onClick={(e) => { e.preventDefault(); onNavigate('about'); }} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  Về chúng tôi & Lịch sử
                </a>
              </li>
              <li>
                <a href="#amenities" onClick={(e) => { e.preventDefault(); onNavigate('amenities'); }} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  Dịch vụ & Tiện ích 5 sao
                </a>
              </li>
              <li>
                <a href="#lookup" onClick={(e) => { e.preventDefault(); onNavigate('lookup'); }} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  Tra cứu đơn đặt phòng
                </a>
              </li>
              <li>
                <a href="#admin" onClick={(e) => { e.preventDefault(); onNavigate('admin'); }} style={{ color: 'var(--primary-gold-light)', textDecoration: 'none' }}>
                  Trang Quản trị (Admin)
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '1.25rem' }}>Thông Tin Liên Hệ</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <MapPin size={18} color="var(--primary-gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Bãi Bắc, Bán đảo Sơn Trà, TP. Đà Nẵng, Việt Nam</span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Phone size={18} color="var(--primary-gold)" style={{ flexShrink: 0 }} />
                <span>Hotline: +84 (0) 236 3888 999</span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Mail size={18} color="var(--primary-gold)" style={{ flexShrink: 0 }} />
                <span>Email: reservations@auroragrand.vn</span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Clock size={18} color="var(--primary-gold)" style={{ flexShrink: 0 }} />
                <span>Bộ phận lễ tân: Phục vụ 24/7</span>
              </div>
            </div>
          </div>

          {/* Policies & Academic Note */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '1.25rem' }}>Chính Sách & Dự Án</h4>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Học phần: <strong>Triển khai và Quản trị Hệ thống Phần mềm</strong>
            </p>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Đề tài 6: <em>Hệ thống Đặt phòng Khách sạn bằng Docker Compose, Prometheus, Grafana, Loki & Nginx</em>.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--success)' }}>
              <ShieldCheck size={16} />
              <span>Bảo mật kết nối SSL & Hệ thống giám sát tự động</span>
            </div>
          </div>
        </div>

        {/* Copyright Bar */}
        <div 
          style={{
            paddingTop: '25px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
          }}
        >
          <div>
            © 2026 Aurora Grand Resort & Spa. Bản quyền thuộc về Đề án KTHP Triển khai và Quản trị Hệ thống.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            Thiết kế và xây dựng với sự tỉ mỉ <Heart size={14} color="#ef4444" fill="#ef4444" />
          </div>
        </div>
      </div>
    </footer>
  );
}
