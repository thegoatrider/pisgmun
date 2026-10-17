import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Calendar, MapPin, Users, BookOpen, Globe2, Award, Users2, SearchCode, Milestone, ArrowRight, Clock, CheckCircle, Quote } from 'lucide-react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { useAuth } from '../context/AuthContext';
import coordinatorImg from '../assets/coordinator_suman_sinha.jpg';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { config } = useAuth();

  // Apple-style scroll fade for hero banner
  const [heroOpacity, setHeroOpacity] = useState(1);
  const [heroTranslateY, setHeroTranslateY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY < 550) {
        setHeroOpacity(Math.max(0.18, 1 - scrollY / 520));
        setHeroTranslateY(scrollY * 0.16);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Apple-style scroll reveal observer for each section and card
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('apple-visible');
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.08,
      }
    );

    const elements = document.querySelectorAll('.apple-scroll-reveal');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, []);

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
      value: '21st Nov 2026',
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
      value: '4 UN Councils',
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
        <div
          className="container"
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            opacity: heroOpacity,
            transform: `translateY(${heroTranslateY}px)`,
            transition: 'opacity 0.12s ease-out, transform 0.12s ease-out',
          }}
        >
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
        <div className="container apple-scroll-reveal">
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
                className={`stat-col apple-scroll-reveal apple-stagger-${idx + 1}`}
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

      {/* 2.5 PMUN 2026 Session Dates & Schedule */}
      <section className="section" style={{ backgroundColor: '#ffffff', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          <div className="text-center apple-scroll-reveal" style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary)', fontWeight: 700 }}>
              PMUN 2026 Session Dates & Schedule
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', margin: '0.5rem 0 1.25rem 0' }}>
              <div style={{ height: '1.2px', width: '30px', backgroundColor: 'var(--color-border)' }}></div>
              <span style={{ color: 'var(--color-secondary)', fontSize: '0.55rem' }}>◆</span>
              <div style={{ height: '1.2px', width: '30px', backgroundColor: 'var(--color-border)' }}></div>
            </div>
            <p style={{ color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto' }}>
              Comprehensive timeline for training workshops, simulation mock sessions, and the official 1-day Model United Nations conference.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '2rem' }} className="timeline-grid">
            {/* Preparatory Training Sessions */}
            <Card elevation="sm" className="apple-scroll-reveal apple-stagger-1" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                  <Calendar size={22} style={{ color: 'var(--color-secondary)' }} />
                  <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                    Preparatory Training Sessions
                  </h3>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
                  Intensive workshops on Rules of Procedure (RoP), position paper drafting, lobbying strategies, and public speaking.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {[
                    { date: '15th October 2026', day: 'Thursday', tag: 'Session 1', id: 'session-1' },
                    { date: '16th October 2026', day: 'Friday', tag: 'Session 2', id: 'session-2' },
                    { date: '17th October 2026', day: 'Saturday', tag: 'Session 3', id: 'session-3' },
                    { date: '21st October 2026', day: 'Wednesday', tag: 'Session 4', id: 'session-4' },
                    { date: '28th October 2026', day: 'Wednesday', tag: 'Session 5', id: 'session-5' },
                  ].map((s, idx) => (
                    <div
                      key={idx}
                      onClick={() => navigate(`/sessions/${s.id}`)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: 'var(--color-bg-main)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.65rem 1rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-secondary)';
                        e.currentTarget.style.backgroundColor = 'rgba(12, 86, 179, 0.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-border)';
                        e.currentTarget.style.backgroundColor = 'var(--color-bg-main)';
                      }}
                      title={`View ${s.tag} details`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-secondary)', textTransform: 'uppercase', backgroundColor: '#ffffff', padding: '2px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                          {s.tag}
                        </span>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--color-primary)' }}>{s.date}</strong>
                      </div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>{s.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Mock & Final Conference Card */}
            <div className="apple-scroll-reveal apple-stagger-2" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Mock Session Card */}
              <Card elevation="sm" style={{ padding: '1.75rem', backgroundColor: 'rgba(217, 119, 6, 0.05)', border: '1.5px solid rgba(217, 119, 6, 0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                  <Clock size={20} style={{ color: '#d97706' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#d97706', letterSpacing: '0.5px' }}>
                    Simulation Rehearsal
                  </span>
                </div>
                <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                  Mock Session
                </h3>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#d97706', marginBottom: '0.5rem' }}>
                  20th November 2026 (Friday)
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                  Full procedural dry-run to test roll call, moderated caucuses, resolution submissions, and podium decorum under simulated conditions.
                </p>
              </Card>

              {/* Final Session Card */}
              <Card elevation="md" style={{ padding: '1.75rem', backgroundColor: 'rgba(13, 148, 136, 0.08)', border: '2px solid var(--color-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                  <CheckCircle size={20} style={{ color: 'var(--color-secondary)' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-secondary)', letterSpacing: '0.5px' }}>
                    Official Conference Day
                  </span>
                </div>
                <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                  Final Session (PMUN Conference)
                </h3>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '0.75rem' }}>
                  21st November 2026 (Saturday)
                </div>
                <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', padding: '0.75rem 1rem', fontSize: '0.82rem', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
                  <strong style={{ color: 'var(--color-primary)', display: 'block', marginBottom: '4px' }}>Single-Day MUN Schedule:</strong>
                  • 8:30 AM - 10:30 AM: Opening Ceremony & GSL Setup<br />
                  • 10:45 AM - 1:00 PM: Moderated Caucus & Debate<br />
                  • 1:45 PM - 3:45 PM: Unmoderated Caucus & Resolution Drafting<br />
                  • 4:00 PM - 5:30 PM: Voting Procedure & Closing Ceremony
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .timeline-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* 3. Portals Gateways */}
      <section className="section" style={{ backgroundColor: 'var(--color-bg-main)' }}>
        <div className="container">
          <div className="text-center apple-scroll-reveal" style={{ marginBottom: '3.5rem' }}>
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
            {portals.map((portal, idx) => (
              <Card
                key={portal.id}
                className={`apple-scroll-reveal apple-stagger-${idx + 1}`}
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

      {/* 3.5 Message from the MUN Coordinator */}
      <section className="section" style={{ backgroundColor: '#ffffff', borderTop: '1px solid var(--color-border)' }}>
        <div className="container">
          <div className="text-center apple-scroll-reveal" style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary)', fontWeight: 700 }}>
              Message from the MUN Coordinator
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', margin: '0.5rem 0 1.25rem 0' }}>
              <div style={{ height: '1.2px', width: '30px', backgroundColor: 'var(--color-border)' }}></div>
              <span style={{ color: 'var(--color-secondary)', fontSize: '0.55rem' }}>◆</span>
              <div style={{ height: '1.2px', width: '30px', backgroundColor: 'var(--color-border)' }}></div>
            </div>
            <p style={{ color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto' }}>
              Official welcome address to delegates of the 2nd Edition of PISGMUN Nagpur 2026.
            </p>
          </div>

          <Card
            elevation="md"
            className="apple-scroll-reveal"
            style={{
              maxWidth: '920px',
              margin: '0 auto',
              padding: '3rem',
              backgroundColor: '#ffffff',
              border: '1.5px solid var(--color-border)',
              borderRadius: 'var(--radius-xl, 18px)',
              boxShadow: '0 12px 35px -8px rgba(0, 32, 74, 0.08)'
            }}
          >
            {/* Header: Coordinator Portrait & Name */}
            <div
              className="coordinator-header"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2rem',
                marginBottom: '2.25rem',
                paddingBottom: '2rem',
                borderBottom: '1px solid var(--color-border)'
              }}
            >
              <img
                src={coordinatorImg}
                alt="Ms. Suman Sinha - MUN Coordinator"
                style={{
                  width: '145px',
                  height: '175px',
                  objectFit: 'cover',
                  objectPosition: 'center 15%',
                  borderRadius: '16px',
                  border: '2px solid rgba(0, 32, 74, 0.1)',
                  boxShadow: '0 8px 20px rgba(0, 32, 74, 0.12)',
                  flexShrink: 0
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(12, 86, 179, 0.08)', color: 'var(--color-secondary)', padding: '0.25rem 0.85rem', borderRadius: 'var(--radius-round)', fontSize: '0.78rem', fontWeight: 700, width: 'fit-content' }}>
                  <Quote size={13} /> Welcome Address
                </div>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '2.2rem',
                    color: 'var(--color-primary)',
                    margin: '0.2rem 0',
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    lineHeight: 1.15
                  }}
                >
                  Ms. Suman Sinha
                </h3>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-secondary)' }}>
                  MUN Coordinator
                </div>
                <div style={{ fontSize: '0.92rem', color: 'var(--color-text-muted)' }}>
                  Podar International School, Godhani • Nagpur
                </div>
              </div>
            </div>

            {/* Letter Body */}
            <div
              style={{
                fontSize: '1.02rem',
                color: 'var(--color-text-main)',
                lineHeight: '1.9',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.35rem'
              }}
            >
              <p style={{ margin: 0, fontWeight: 700, fontSize: '1.15rem', color: 'var(--color-primary)' }}>
                Dear Delegates,
              </p>

              <p style={{ margin: 0, textAlign: 'justify' }}>
                It is my immense pleasure to welcome you to the <strong style={{ color: 'var(--color-primary)' }}>2nd Edition of PISGMUN, Nagpur</strong> — a platform where curiosity meets conviction, diplomacy meets determination, and young minds discover the power of their voices.
              </p>

              <p style={{ margin: 0, textAlign: 'justify' }}>
                Model United Nations is far more than a simulation of international diplomacy. It is an exercise in critical thinking, intellectual humility, and constructive debate. Leadership is not merely about having the strongest argument, but about possessing the wisdom to listen, the ability to reason, and the integrity to seek solutions beyond personal interests.
              </p>

              <p style={{ margin: 0, textAlign: 'justify' }}>
                As you step into your committees, look beyond the pursuit of awards. A remarkable delegate is not necessarily the one who speaks the most, but the one whose contributions move the committee forward. Research diligently, articulate your ideas with clarity, and defend your positions with evidence.
              </p>

              {/* Callout Quote */}
              <div
                style={{
                  borderLeft: '4px solid var(--color-secondary)',
                  backgroundColor: 'rgba(12, 86, 179, 0.05)',
                  padding: '1.25rem 1.6rem',
                  borderRadius: '0 10px 10px 0',
                  margin: '0.5rem 0',
                  color: 'var(--color-primary)',
                  fontWeight: 600,
                  fontSize: '1.05rem',
                  lineHeight: '1.75'
                }}
              >
                The true measure of your participation will not lie solely in the recognition you receive, but in the perspective you gain, the confidence you develop, and the difference you make to the discussions around you.
              </div>

              <p style={{ margin: 0, textAlign: 'justify' }}>
                I look forward to witnessing thoughtful deliberations, meaningful alliances, and the emergence of young leaders who understand that the future is not simply something to inherit, but something to shape.
              </p>

              <p style={{ margin: 0 }}>
                Wishing all delegates an enriching, intellectually stimulating, and memorable experience.
              </p>

              {/* Sign-off */}
              <div
                style={{
                  marginTop: '1.5rem',
                  paddingTop: '1.5rem',
                  borderTop: '1px solid var(--color-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem'
                }}
              >
                <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '1.08rem', letterSpacing: '0.3px', marginBottom: '0.75rem' }}>
                  Give your best. Think beyond the obvious. Lead with purpose.
                </div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem' }}>
                  Warm regards,
                </div>
                <div style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '1.05rem' }}>
                  MUN Coordinator
                </div>
                <div style={{ fontStyle: 'italic', color: 'var(--color-text-muted)', fontSize: '0.92rem' }}>
                  Podar International School, Godhani
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <style>{`
        @media (max-width: 640px) {
          .coordinator-header {
            flex-direction: column !important;
            text-align: center !important;
            align-items: center !important;
          }
        }
      `}</style>

      {/* 4. Why PMUN Benefits */}
      <section className="section" style={{ backgroundColor: 'var(--color-bg-surface)', borderTop: '1px solid var(--color-border)' }}>
        <div className="container">
          <div className="text-center apple-scroll-reveal" style={{ marginBottom: '4rem' }}>
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
                className={`apple-scroll-reveal apple-stagger-${(idx % 5) + 1}`}
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
