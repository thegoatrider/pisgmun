import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        backgroundColor: 'var(--color-primary)',
        color: '#ffffff',
        padding: '3.5rem 2rem 1.5rem 2rem',
        borderTop: '4px solid var(--color-accent-gold)',
        fontSize: '0.88rem',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 0.8fr 1fr',
            gap: '3rem',
            marginBottom: '3rem',
          }}
          className="footer-grid"
        >
          {/* Section 1: Logo & Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <img
                src="/resources/podar_tree_logo.png"
                alt="Podar Tree Logo"
                style={{
                  height: '42px',
                  width: '42px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  padding: '3px',
                }}
              />
              <span
                style={{
                  fontSize: '1.1rem',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  letterSpacing: '1px',
                  lineHeight: '1.2',
                }}
              >
                PODAR INTERNATIONAL SCHOOL Nagpur
              </span>
            </div>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem', lineHeight: '1.6' }}>
              Model United Nations (PMUN) 2026 Nagpur provides students with an academic platform for dynamic debates on geopolitics, public relations, and multilateral diplomacy.
            </p>
          </div>

          {/* Section 2: Quick Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4
              style={{
                color: 'var(--color-accent-gold)',
                fontSize: '0.9rem',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                margin: 0,
              }}
            >
              Quick Links
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <li>
                <Link to="/" style={{ color: 'rgba(255, 255, 255, 0.8)', transition: 'color var(--transition-fast)' }} onMouseOver={(e) => e.currentTarget.style.color = '#ffffff'} onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" style={{ color: 'rgba(255, 255, 255, 0.8)' }} onMouseOver={(e) => e.currentTarget.style.color = '#ffffff'} onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'}>
                  About PMUN
                </Link>
              </li>
              <li>
                <Link to="/committees" style={{ color: 'rgba(255, 255, 255, 0.8)' }} onMouseOver={(e) => e.currentTarget.style.color = '#ffffff'} onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'}>
                  Committees list
                </Link>
              </li>
              <li>
                <Link to="/rules" style={{ color: 'rgba(255, 255, 255, 0.8)' }} onMouseOver={(e) => e.currentTarget.style.color = '#ffffff'} onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'}>
                  Rules of Procedure
                </Link>
              </li>
              <li>
                <Link to="/contact" style={{ color: 'rgba(255, 255, 255, 0.8)' }} onMouseOver={(e) => e.currentTarget.style.color = '#ffffff'} onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'}>
                  Contact Nagpur
                </Link>
              </li>
            </ul>
          </div>

          {/* Section 3: Contact & Address */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4
              style={{
                color: 'var(--color-accent-gold)',
                fontSize: '0.9rem',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                margin: 0,
              }}
            >
              School Campus
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'rgba(255, 255, 255, 0.8)' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <MapPin size={16} style={{ marginTop: '3px', color: 'var(--color-accent-gold)', flexShrink: 0 }} />
                <span>Podar International School, Bokhara Road, Near Godhani Railway Station, Nagpur, Maharashtra, India</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Phone size={16} style={{ color: 'var(--color-accent-gold)', flexShrink: 0 }} />
                <span>+91 9373959534</span>
              </div>

            </div>
          </div>
        </div>

        {/* CSS Override for Responsive Footer */}
        <style>{`
          @media (max-width: 850px) {
            .footer-grid {
              grid-template-columns: 1fr !important;
              gap: 2rem !important;
            }
          }
        `}</style>

        {/* Footer Bottom copyright bar */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.8rem',
          }}
        >
          <span>
            &copy; {currentYear} Podar International School, Nagpur. All rights reserved.
          </span>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <a
              href="https://www.podareducation.org"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'rgba(255,255,255,0.6)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'color var(--transition-fast)',
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#ffffff'}
              onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
            >
              Podar Education Network
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
