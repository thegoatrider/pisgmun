import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, KeyRound } from 'lucide-react';
import { Button } from '../UI/Button';

export const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleBrandClick = () => {
    navigate('/');
    setMobileOpen(false);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About PMUN', path: '/about' },
    { name: 'Committees', path: '/committees' },
    { name: 'Rules & Guidelines', path: '/rules' },
    { name: 'Contact', path: '/contact' },
  ];

  // Check if we are inside dashboard routes
  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <header
      className="navbar-header"
      style={{
        backgroundColor: 'var(--color-primary)',
        padding: '0.75rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
        height: '70px',
      }}
    >
      {/* Brand Logo & Name */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
        onClick={handleBrandClick}
      >
        <img
          src="/resources/podar_tree_logo.png"
          loading="lazy"
          alt="Podar Logo"
          style={{
            height: '38px',
            width: '38px',
            objectFit: 'contain',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            padding: '2px',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            color: '#ffffff',
            borderLeft: '1px solid rgba(255,255,255,0.3)',
            paddingLeft: '0.75rem',
          }}
        >
          <span
            className="brand-title"
            style={{
              fontSize: '0.85rem',
              fontWeight: 800,
              letterSpacing: '1px',
              fontFamily: 'var(--font-display)',
              whiteSpace: 'nowrap',
              lineHeight: '1.2',
            }}
          >
            PODAR INTERNATIONAL SCHOOL
          </span>
          <span
            style={{
              fontSize: '0.62rem',
              fontWeight: 600,
              letterSpacing: '1px',
              color: 'rgba(255,255,255,0.75)',
              fontFamily: 'var(--font-sans)',
              textTransform: 'uppercase',
            }}
          >
            Nagpur, Godhani
          </span>
        </div>
      </div>

      {/* Desktop Links */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.75rem',
        }}
        className="desktop-nav"
      >
        {navLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            style={({ isActive }) => ({
              color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.8)',
              textDecoration: 'none',
              fontSize: '0.78rem',
              fontWeight: 700,
              letterSpacing: '1.2px',
              textTransform: 'uppercase',
              paddingBottom: '4px',
              borderBottom: `2px solid ${isActive ? '#ffffff' : 'transparent'}`,
              transition: 'all var(--transition-fast)',
            })}
          >
            {link.name}
          </NavLink>
        ))}

        {!isDashboard ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/login')}
            style={{
              boxShadow: '0 4px 6px rgba(12, 86, 179, 0.2)',
              backgroundColor: 'var(--color-secondary)',
              borderColor: 'var(--color-secondary)',
            }}
          >
            <KeyRound size={14} />
            Portal Access
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              localStorage.removeItem('pmun_session_role');
              localStorage.removeItem('pmun_session_incharge_grade');
              localStorage.removeItem('pmun_registration_id');
              navigate('/');
            }}
            style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.4)' }}
          >
            Logout
          </Button>
        )}
      </nav>

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{
          display: 'none',
          background: 'none',
          border: 'none',
          color: '#ffffff',
          cursor: 'pointer',
          padding: '4px',
        }}
        className="mobile-toggle"
      >
        {mobileOpen ? <X size={26} /> : <Menu size={26} />}
      </button>

      {/* CSS Override for Mobile Responsive Header Links */}
      <style>{`
        @media (max-width: 900px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-toggle {
            display: block !important;
          }
          .navbar-header {
            padding: 0.75rem 1rem !important;
          }
          .brand-title {
            font-size: 0.75rem !important;
          }
        }
        @media (max-width: 480px) {
          .navbar-header {
            padding: 0.75rem 0.5rem !important;
          }
          .brand-title {
            font-size: 0.65rem !important;
          }
        }
      `}</style>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div
          style={{
            position: 'absolute',
            top: '70px',
            left: 0,
            right: 0,
            backgroundColor: 'var(--color-primary)',
            padding: '1.5rem 2rem 2.5rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
            zIndex: 99,
          }}
          className="mobile-drawer"
        >
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              style={({ isActive }) => ({
                color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.8)',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: 700,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                borderLeft: `3px solid ${isActive ? '#ffffff' : 'transparent'}`,
                paddingLeft: '10px',
              })}
            >
              {link.name}
            </NavLink>
          ))}

          {!isDashboard ? (
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                setMobileOpen(false);
                navigate('/login');
              }}
              style={{
                marginTop: '0.5rem',
                width: '100%',
              }}
            >
              <KeyRound size={16} />
              Portal Access
            </Button>
          ) : (
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                setMobileOpen(false);
                localStorage.removeItem('pmun_session_role');
                localStorage.removeItem('pmun_session_incharge_grade');
                localStorage.removeItem('pmun_registration_id');
                navigate('/');
              }}
              style={{
                marginTop: '0.5rem',
                width: '100%',
                color: '#ffffff',
                borderColor: 'rgba(255,255,255,0.4)',
              }}
            >
              Logout
            </Button>
          )}
        </div>
      )}
    </header>
  );
};
