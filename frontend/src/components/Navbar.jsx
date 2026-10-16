import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  Menu, 
  X, 
  Search, 
  ShieldCheck, 
  PhoneCall, 
  Compass, 
  CalendarCheck,
  LayoutDashboard
} from 'lucide-react';

export default function Navbar({ currentView, setCurrentView, onOpenSearch }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'Trang chủ' },
    { id: 'rooms', label: 'Danh sách phòng' },
    { id: 'about', label: 'Về chúng tôi' },
    { id: 'amenities', label: 'Tiện ích 5 sao' },
    { id: 'lookup', label: 'Tra cứu đặt phòng', icon: Search },
    { id: 'admin', label: 'Quản trị (Admin)', icon: LayoutDashboard },
  ];

  const handleNavClick = (id) => {
    setCurrentView(id);
    setMobileMenuOpen(false);
    if (id === 'home' || id === 'rooms') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 900,
        transition: 'all 0.3s ease',
        background: isScrolled
          ? 'rgba(10, 15, 29, 0.95)'
          : 'linear-gradient(180deg, rgba(10, 15, 29, 0.9) 0%, rgba(10, 15, 29, 0) 100%)',
        backdropFilter: isScrolled ? 'blur(16px)' : 'none',
        borderBottom: isScrolled ? '1px solid rgba(212, 175, 55, 0.2)' : 'none',
        padding: isScrolled ? '0.75rem 0' : '1.25rem 0',
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Brand Logo */}
        <div 
          onClick={() => handleNavClick('home')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
        >
          <div 
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f6e6b4, #d4af37)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0a0f1d',
              boxShadow: '0 0 15px rgba(212, 175, 55, 0.4)',
            }}
          >
            <Crown size={22} strokeWidth={2.5} />
          </div>
          <div>
            <span 
              className="font-serif"
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: '#fff',
                display: 'block',
                lineHeight: 1.1,
              }}
            >
              AURORA <span className="gold-text">GRAND</span>
            </span>
            <span style={{ fontSize: '0.65rem', letterSpacing: '0.25em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Resort & Spa ★★★★★
            </span>
          </div>
        </div>

        {/* Desktop Menu */}
        <div style={{ display: 'none', alignItems: 'center', gap: '1.75rem' }} className="desktop-menu">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: currentView === item.id ? 'var(--primary-gold-light)' : 'var(--text-secondary)',
                fontWeight: currentView === item.id ? 600 : 400,
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0',
                position: 'relative',
                transition: 'color 0.2s',
              }}
            >
              {item.label}
              {currentView === item.id && (
                <span 
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: 'var(--primary-gold)',
                    borderRadius: '2px',
                  }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Action Button & Mobile Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => handleNavClick('rooms')}
            className="btn btn-primary"
            style={{ padding: '0.6rem 1.4rem', fontSize: '0.9rem' }}
          >
            <CalendarCheck size={18} />
            <span style={{ display: 'inline' }}>Đặt Phòng Ngay</span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid var(--border-subtle)',
              color: '#fff',
              padding: '0.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
            className="mobile-toggle"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div 
          style={{
            background: 'var(--bg-dark-800)',
            borderBottom: '1px solid var(--border-glass)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            animation: 'slideUp 0.2s ease',
          }}
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              style={{
                background: currentView === item.id ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                border: 'none',
                textAlign: 'left',
                color: currentView === item.id ? 'var(--primary-gold-light)' : 'var(--text-primary)',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      <style>{`
        @media (min-width: 992px) {
          .desktop-menu { display: flex !important; }
          .mobile-toggle { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
