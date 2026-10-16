import React from 'react';
import { Waves, Utensils, Sparkles, Umbrella, Wine, Car, Award, ShieldCheck } from 'lucide-react';

export default function AboutSection() {
  const luxuryServices = [
    {
      icon: Waves,
      title: 'Hồ Bơi Chân Mây Vô Cực',
      desc: 'Hồ bơi nước mặn hướng biển dài 120m, nhiệt độ nước điều hòa 4 mùa tự nhiên.',
    },
    {
      icon: Utensils,
      title: 'Ẩm Thực Tinh Hoa Michelin',
      desc: '3 nhà hàng sang trọng phục vụ hải sản tươi sống và món ăn Á - Âu thượng hạng.',
    },
    {
      icon: Sparkles,
      title: 'Spa & Trị Liệu Thảo Mộc',
      desc: 'Liệu trình massage phục hồi năng lượng từ các chuyên gia trị liệu hàng đầu Bali.',
    },
    {
      icon: Umbrella,
      title: 'Bãi Biển Riêng Biệt 500m',
      desc: 'Bãi cát vàng mịn màng, ghế tắm nắng riêng tư cùng các môn thể thao dưới nước.',
    },
    {
      icon: Wine,
      title: 'Rooftop Sunset Lounge',
      desc: 'Quầy bar ngắm hoàng hôn đẹp nhất vịnh, thưởng thức cocktail sáng tạo và nhạc acoustic.',
    },
    {
      icon: Car,
      title: 'Đưa Đón VIP Limousine',
      desc: 'Xe đón tiễn sân bay sang trọng và tài xế riêng phục vụ chu đáo mọi hành trình.',
    },
  ];

  return (
    <section id="about" style={{ padding: '90px 0', background: 'var(--bg-dark-800)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="container">
        {/* Story Intro */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3.5rem', alignItems: 'center', marginBottom: '5rem' }}>
          <div>
            <span style={{ color: 'var(--primary-gold)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Kiệt Tác Nghỉ Dưỡng
            </span>
            <h2 style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.7rem)', color: '#fff', margin: '0.5rem 0 1.25rem 0' }}>
              Chào Mừng Đến Với <br />
              <span className="gold-text">Aurora Grand Resort & Spa</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>
              Tọa lạc tại vị trí đắc địa nhất của bán đảo Sơn Trà, Aurora Grand Resort & Spa hòa quyện tuyệt đối giữa nét đẹp hoang sơ của thiên nhiên nhiệt đới và phong cách kiến trúc hoàng gia châu Âu tinh tế.
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '2rem' }}>
              Chúng tôi cam kết mang đến cho mỗi thượng khách trải nghiệm riêng tư, thanh bình và những khoảnh khắc thăng hoa trong từng giác quan.
            </p>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <div>
                <span className="font-serif gold-text" style={{ fontSize: '2.5rem', fontWeight: 700, display: 'block', lineHeight: 1 }}>
                  150+
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Phòng nghỉ cao cấp & Villa</span>
              </div>
              <div style={{ width: '1px', background: 'var(--border-subtle)' }} />
              <div>
                <span className="font-serif gold-text" style={{ fontSize: '2.5rem', fontWeight: 700, display: 'block', lineHeight: 1 }}>
                  99.8%
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Khách hàng hài lòng</span>
              </div>
              <div style={{ width: '1px', background: 'var(--border-subtle)' }} />
              <div>
                <span className="font-serif gold-text" style={{ fontSize: '2.5rem', fontWeight: 700, display: 'block', lineHeight: 1 }}>
                  5 ★
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tiêu chuẩn quốc tế</span>
              </div>
            </div>
          </div>

          {/* Luxury Resort Collage Image */}
          <div style={{ position: 'relative' }}>
            <div 
              style={{
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-lg), 0 0 30px rgba(212, 175, 55, 0.2)',
                border: '1px solid var(--border-glass)',
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80"
                alt="Aurora Grand Resort Overview"
                style={{ width: '100%', height: '420px', objectFit: 'cover' }}
              />
            </div>
            {/* Float Card */}
            <div 
              className="glass-card"
              style={{
                position: 'absolute',
                bottom: '-25px',
                left: '-20px',
                padding: '1.25rem 1.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                border: '1px solid var(--border-glass)',
              }}
            >
              <div 
                style={{
                  width: '45px',
                  height: '45px',
                  borderRadius: '50%',
                  background: 'rgba(212, 175, 55, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary-gold)',
                }}
              >
                <Award size={24} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>World Luxury Hotel Awards</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Người chiến thắng năm 2025 & 2026</div>
              </div>
            </div>
          </div>
        </div>

        {/* 5-Star Amenities Grid */}
        <div id="amenities" style={{ paddingTop: '20px' }}>
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3.5rem auto' }}>
            <span style={{ color: 'var(--primary-gold)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Trải Nghiệm Đỉnh Cao
            </span>
            <h2 style={{ fontSize: '2.2rem', color: '#fff', marginTop: '0.4rem' }}>
              Tiện Ích 5 Sao <span className="gold-text">Đặc Quyền</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Mọi dịch vụ đều được chăm chút kỹ lưỡng để mang lại cho bạn kỳ nghỉ dưỡng trọn vẹn nhất
            </p>
          </div>

          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.75rem',
            }}
          >
            {luxuryServices.map((service, index) => {
              const IconComp = service.icon;
              return (
                <div
                  key={index}
                  className="glass-card"
                  style={{
                    padding: '2rem',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <div 
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.05))',
                      border: '1px solid var(--border-glass)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary-gold)',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <IconComp size={26} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.6rem' }}>
                    {service.title}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    {service.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
