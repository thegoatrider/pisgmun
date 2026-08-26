import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Calendar, MapPin, Users, BookOpen, Globe2, Award, Users2, SearchCode, Milestone, ArrowRight } from 'lucide-react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { useAuth } from '../context/AuthContext';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { config } = useAuth();

  const isRegistrationClosed = () => {
    if (config?.registration_status === 'CLOSED') return true;
    if (config?.deadline) {
      const deadlineDate = new Date(config.deadline);
      const now = new Date();
      if (now > deadlineDate) return true;
    }
    return false;
  };

  const handleGateRedirect = (role: string) => {
    navigate(`/login?role=${role}`);
  };

  const stats = [
    {
      icon: <Calendar size={24} style={{ color: 'var(--color-secondary)' }} />,
      title: 'Dates',
      value: 'Coming Soon',
    },
    {
      icon: <MapPin size={24} style={{ color: 'var(--color-secondary)' }} />,
      title: 'Venue',
      value: 'PIS Godhani Campus',
    },
    {
      icon: <Users size={24} style={{ color: 'var(--color-secondary)' }} />,
      title: 'Grades',
      value: 'Grades 7 to 10',
    },
    {
      icon: <BookOpen size={24} style={{ color: 'var(--color-secondary)' }} />,
      title: 'Committees',
      value: '6 UN Councils',
    },
  ];

  const portals = [
    {
      id: 'delegate',
      title: 'Delegate Portal',
      description: 'Submit registrations, view assigned portfolios, read study materials, and access resources.',
      icon: <Users size={32} style={{ color: 'var(--color-secondary)' }} />,
      btnText: 'Enter as Delegate',
    },
    {
      id: 'in_charge',
      title: 'Teacher In-Charge',
      description: 'Secure dashboard for faculty coordinators to manage student delegations and rosters.',
      icon: <Users2 size={32} style={{ color: 'var(--color-secondary)' }} />,
      btnText: 'Faculty Login',
    },
    {
      id: 'coordinator',
      title: 'MUN Coordinator',
      description: 'Administrative panel for PMUN coordinators to allocate countries, track stats, and toggle system configs.',
      icon: <ShieldAlert size={32} style={{ color: 'var(--color-secondary)' }} />,
      btnText: 'Coordinator Portal',
    },
  ];

  const benefits = [
    {
      icon: <Globe2 size={32} style={{ color: 'var(--color-secondary)' }} />,
      title: 'Global Perspective',
      description: 'Analyze international disputes, build alliances, and understand global legislative mechanisms.',
    },
    {
      icon: <Award size={32} style={{ color: 'var(--color-secondary)' }} />,
      title: 'Voice & Leadership',
      description: 'Develop outstanding public speaking, logic, and resolution writing skills under pressure.',
    },
    {
      icon: <Users2 size={32} style={{ color: 'var(--color-secondary)' }} />,
      title: 'Diplomatic Collaboration',
      description: 'Negotiate, resolve conflicts, and draft solutions with other forward-thinking peers.',
    },
    {
      icon: <SearchCode size={32} style={{ color: 'var(--color-secondary)' }} />,
      title: 'Academic Rigor',
      description: 'Enhance critical research capability by exploring comprehensive backgrounds and country stances.',
    },
    {
      icon: <Milestone size={32} style={{ color: 'var(--color-secondary)' }} />,
      title: 'Real-World Simulation',
      description: 'Simulate true legislative bodies and draft resolutions directly targeting active world crises.',
    },
  ];

  return (
    <div className="fade-in">
      {/* 1. Hero Banner */}
      <section
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(210, 226, 248, 0.95) 35%, rgba(210, 226, 248, 0.2) 75%), url("/hero-banner-raw_v6.png")',
          backgroundColor: '#d2e2f8',
          backgroundSize: 'cover',
          backgroundPosition: 'right center',
          backgroundRepeat: 'no-repeat',
          padding: '5rem 2rem',
          display: 'flex',
          alignItems: 'center',
          minHeight: '420px',
        }}
        className="hero-section"
      >
        <div className="container" style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <div style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* School Crest Title Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <img
                src="/hero-logo-navy_v9.png"
                alt="Nagpur PMUN Logo"
                style={{
                  height: '75px',
                  width: '75px',
                  objectFit: 'contain',
                }}
              />
              <h1
                style={{
                  fontSize: '3.6rem',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 500,
                  margin: 0,
                  letterSpacing: '1px',
                  color: 'var(--color-primary)',
                  lineHeight: 0.9,
                }}
              >
                PMUN
              </h1>
            </div>

            {/* Separator line */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
              <div style={{ flex: 1, height: '1.5px', backgroundColor: 'var(--color-primary)', opacity: 0.3 }}></div>
              <span style={{ color: 'var(--color-primary)', fontSize: '0.65rem', opacity: 0.6 }}>◆</span>
              <div style={{ flex: 1, height: '1.5px', backgroundColor: 'var(--color-primary)', opacity: 0.3 }}></div>
            </div>

            {/* Two-tone sub-branding */}
            <div style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>PODAR</span>
              <span style={{ color: 'var(--color-primary)', marginLeft: '6px' }}>MODEL UNITED NATIONS</span>
            </div>

            <p style={{ fontSize: '1.05rem', color: '#334155', fontWeight: 500, margin: '0.5rem 0' }}>
              Empowering future leaders through rigorous debate, consensus building, and diplomatic excellence. Welcome to Podar Nagpur Model United Nations 2026.
            </p>

            <div>
              {isRegistrationClosed() ? (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: 'var(--color-error)',
                  padding: '0.75rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  border: '1px solid var(--color-error)'
                }}>
                  Registrations are Closed
                </div>
              ) : (
                <Button variant="primary" size="lg" onClick={() => navigate('/register')} style={{ boxShadow: 'var(--shadow-md)' }}>
                  Register for PMUN 2026
                  <ArrowRight size={16} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CSS overrides for Hero Section responsiveness */}
      <style>{`
        @media (max-width: 768px) {
          .hero-section {
            background-image: linear-gradient(to bottom, rgba(210, 226, 248, 0.98) 0%, rgba(210, 226, 248, 0.92) 100%), url("/hero-banner-raw_v6.png") !important;
            background-position: center bottom !important;
            padding: 3rem 1.5rem !important;
            text-align: center;
          }
          .hero-section .container {
            justify-content: center !important;
          }
          .hero-section h1 {
            font-size: 2.8rem !important;
          }
          .hero-section div {
            align-items: center !important;
            margin: 0 auto;
          }
        }
      `}</style>

      {/* 2. Stats Bar */}
      <section style={{ backgroundColor: 'var(--color-bg-surface)', borderBottom: '1px solid var(--color-border)', padding: '2rem 0' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1.5rem',
            }}
            className="stats-grid"
          >
            {stats.map((stat, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.4rem',
                  borderRight: idx < stats.length - 1 ? '1px solid var(--color-border)' : 'none',
                  padding: '0.5rem 1rem',
                  textAlign: 'center',
                }}
                className="stat-col"
              >
                {stat.icon}
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  {stat.title}
                </span>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 1.5rem !important;
          }
          .stat-col {
            border-right: none !important;
            border-bottom: 1px solid var(--color-border);
            padding-bottom: 1rem !important;
          }
          .stat-col:nth-last-child(-n+2) {
            border-bottom: none !important;
            padding-bottom: 0 !important;
          }
        }
      `}</style>

      {/* 3. Portals Gateways */}
      <section className="section" style={{ backgroundColor: 'var(--color-bg-main)' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: '3.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary)', fontWeight: 700 }}>
              Access the Portals
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', margin: '0.5rem 0 1.25rem 0' }}>
              <div style={{ height: '1.2px', width: '30px', backgroundColor: 'var(--color-border)' }}></div>
              <span style={{ color: 'var(--color-secondary)', fontSize: '0.55rem' }}>◆</span>
              <div style={{ height: '1.2px', width: '30px', backgroundColor: 'var(--color-border)' }}></div>
            </div>
            <p style={{ color: 'var(--color-text-muted)', maxWidth: '550px', margin: '0 auto' }}>
              Select your administrative role below to proceed to login and manage your PMUN Nagpur schedule.
            </p>
          </div>

          <div className="grid grid-cols-3">
            {portals.map((portal) => (
              <Card
                key={portal.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '340px',
                  alignItems: 'center',
                  textAlign: 'center',
                  padding: '2.5rem 1.75rem',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '100%' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {portal.icon}
                  </div>
                  <h3 style={{ fontSize: '1.3rem', margin: 0, fontFamily: 'var(--font-display)', color: 'var(--color-primary)' }}>
                    {portal.title}
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: 1.5, margin: 0 }}>
                    {portal.description}
                  </p>
                </div>
                <Button
                  variant="primary"
                  onClick={() => handleGateRedirect(portal.id)}
                  style={{ width: '100%', marginTop: '1.5rem', borderRadius: 'var(--radius-round)' }}
                >
                  {portal.btnText}
                  <ArrowRight size={14} />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Why PMUN Benefits */}
      <section className="section" style={{ backgroundColor: 'var(--color-bg-surface)', borderTop: '1px solid var(--color-border)' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: '4rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary)', fontWeight: 700 }}>
              The Educational Impact
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', margin: '0.5rem 0 1.25rem 0' }}>
              <div style={{ height: '1.2px', width: '30px', backgroundColor: 'var(--color-border)' }}></div>
              <span style={{ color: 'var(--color-secondary)', fontSize: '0.55rem' }}>◆</span>
              <div style={{ height: '1.2px', width: '30px', backgroundColor: 'var(--color-border)' }}></div>
            </div>
            <p style={{ color: 'var(--color-text-muted)', maxWidth: '550px', margin: '0 auto' }}>
              Participating in Nagpur PMUN challenges students, building academic competence and key core strengths.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '3rem 2rem',
            }}
          >
            {benefits.map((benefit, idx) => (
              <div
                key={idx}
                style={{
                  flex: '1',
                  minWidth: '220px',
                  maxWidth: '320px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '0.75rem',
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(12, 86, 179, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {benefit.icon}
                </div>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  {benefit.title}
                </span>
                <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: '1.45', margin: 0 }}>
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
