import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PREPARATORY_SESSIONS } from '../data/sessionGalleries';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Calendar, ArrowLeft, Camera, Clock, ChevronRight, Eye, X, ChevronDown } from 'lucide-react';

export const SessionGallery: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { registrationId, role } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Dynamic scroll fade calculation
  const [scrollOpacity, setScrollOpacity] = useState(1);
  const [scrollScale, setScrollScale] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      // Fade from 1 down to 0.20 as user scrolls the first 380px
      const fadeDistance = 420;
      const opacity = Math.max(0.2, 1 - scrolled / fadeDistance);
      const scale = Math.max(0.96, 1 - scrolled / (fadeDistance * 5));
      setScrollOpacity(opacity);
      setScrollScale(scale);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currentRegId = registrationId || localStorage.getItem('pmun_reg_id') || '';
  const isTestingUser = currentRegId === 'PIS-2026-8898';

  const session = PREPARATORY_SESSIONS.find((s) => s.id.toLowerCase() === (sessionId || '').toLowerCase());

  const handleBack = () => {
    if (role === 'delegate') {
      navigate('/dashboard/delegate');
    } else {
      navigate(-1);
    }
  };

  if (!session) {
    return (
      <div className="container section text-center" style={{ padding: '4rem 1rem' }}>
        <h2 style={{ color: 'var(--color-primary)' }}>Session Not Found</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
          We could not find the requested preparatory session.
        </p>
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Button>
      </div>
    );
  }

  // Filter photos strictly based on authorization
  const visiblePhotos = session.photos.filter(
    (photo) => !photo.restrictedToRegistrationId || photo.restrictedToRegistrationId === currentRegId
  );

  return (
    <div className="container section fade-in" style={{ paddingBottom: '6rem' }}>
      {/* Top Header / Breadcrumb & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <Button
          variant="outline"
          size="sm"
          onClick={handleBack}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <ArrowLeft size={16} /> Back to Delegate Portal
        </Button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          <span>PMUN 2026</span>
          <ChevronRight size={14} />
          <span>Sessions</span>
          <ChevronRight size={14} />
          <strong style={{ color: 'var(--color-primary)' }}>{session.title}</strong>
        </div>
      </div>

      {/* Session Title & Switcher Card */}
      <Card elevation="sm" style={{ padding: '1.75rem 2rem', marginBottom: '2.5rem', border: '1px solid var(--color-border)', backgroundColor: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(0, 32, 74, 0.06)', color: 'var(--color-primary)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-round)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              <Calendar size={13} />
              Session {session.sessionNumber} of 5
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary)', margin: '0 0 0.25rem 0', fontSize: '1.85rem' }}>
              {session.title}
            </h1>
            <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>
              <strong style={{ color: 'var(--color-primary)' }}>{session.dateStr}</strong> ({session.dayOfWeek}) • {session.summary}
            </p>
          </div>

          {/* Quick switcher buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginRight: '4px' }}>
              Jump To:
            </span>
            {PREPARATORY_SESSIONS.map((s) => {
              const isActive = s.id === session.id;
              const now = new Date();
              const localYear = now.getFullYear();
              const localMonth = String(now.getMonth() + 1).padStart(2, '0');
              const localDay = String(now.getDate()).padStart(2, '0');
              const localTodayIso = `${localYear}-${localMonth}-${localDay}`;
              const isUnlocked = isTestingUser || localTodayIso >= s.isoDate;

              return (
                <button
                  key={s.id}
                  onClick={() => isUnlocked && navigate(`/sessions/${s.id}`)}
                  disabled={!isUnlocked}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: isUnlocked ? 'pointer' : 'not-allowed',
                    border: isActive
                      ? '1.5px solid var(--color-primary)'
                      : '1px solid var(--color-border)',
                    backgroundColor: isActive
                      ? 'var(--color-primary)'
                      : isUnlocked
                      ? 'var(--color-bg-main)'
                      : 'rgba(0,0,0,0.03)',
                    color: isActive
                      ? '#ffffff'
                      : isUnlocked
                      ? 'var(--color-primary)'
                      : 'var(--color-text-muted)',
                    opacity: isUnlocked ? 1 : 0.45,
                    transition: 'all 0.15s ease'
                  }}
                  title={!isUnlocked ? `Unlocks on ${s.dateStr}` : `Go to ${s.title}`}
                >
                  S{s.sessionNumber}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Main Content Area */}
      {visiblePhotos.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {visiblePhotos.map((photo) => (
            <div key={photo.id} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* 1. Full-Width Side-to-Side Image with Scroll Fade Effect */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  borderRadius: 'var(--radius-lg, 16px)',
                  overflow: 'hidden',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
                  backgroundColor: '#0a0a0a',
                  border: '1px solid #1e293b',
                  transform: `scale(${scrollScale})`,
                  opacity: scrollOpacity,
                  transition: 'opacity 0.15s ease-out, transform 0.15s ease-out',
                  willChange: 'opacity, transform'
                }}
              >
                {/* Image element expanding from side to side */}
                <div
                  onClick={() => setSelectedImage(photo.imageUrl)}
                  style={{
                    width: '100%',
                    minHeight: '360px',
                    maxHeight: '75vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'zoom-in',
                    position: 'relative'
                  }}
                >
                  <img
                    src={photo.imageUrl}
                    alt={photo.caption || session.title}
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '75vh',
                      objectFit: 'contain',
                      display: 'block'
                    }}
                  />

                  {/* Top Badge Overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '16px',
                      left: '16px',
                      backgroundColor: 'rgba(0, 0, 0, 0.75)',
                      color: '#ffffff',
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-round)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      backdropFilter: 'blur(6px)',
                      letterSpacing: '0.5px',
                      border: '1px solid rgba(255, 255, 255, 0.15)'
                    }}
                  >
                    {session.title} • {session.dateStr}
                  </div>

                  {/* Expand badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      backgroundColor: 'rgba(0, 0, 0, 0.75)',
                      color: '#ffffff',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-round)',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      backdropFilter: 'blur(6px)',
                      border: '1px solid rgba(255, 255, 255, 0.15)'
                    }}
                  >
                    <Eye size={13} /> Click to expand
                  </div>

                  {/* Smooth Gradient Fade at the bottom leading to the text */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '140px',
                      background: 'linear-gradient(to bottom, rgba(10, 10, 10, 0) 0%, rgba(10, 10, 10, 0.6) 60%, rgba(10, 10, 10, 0.95) 100%)',
                      pointerEvents: 'none'
                    }}
                  />

                  {/* Scroll Down Hint over the fade */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '16px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      color: 'rgba(255, 255, 255, 0.85)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                      opacity: Math.max(0, scrollOpacity * 1.5 - 0.5),
                      transition: 'opacity 0.15s ease-out'
                    }}
                  >
                    <span>Scroll down for session dispatch</span>
                    <ChevronDown size={14} className="bounce-subtle" />
                  </div>
                </div>
              </div>

              {/* 2. Full-Width Information Container Below the Image */}
              <Card
                elevation="md"
                style={{
                  padding: '3rem',
                  border: '1px solid var(--color-border)',
                  backgroundColor: '#ffffff',
                  borderRadius: 'var(--radius-lg, 16px)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '2px solid var(--color-border)', paddingBottom: '1rem', marginBottom: '1.75rem' }}>
                  <Camera size={24} style={{ color: 'var(--color-secondary)' }} />
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--color-primary)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                      Session Dispatch & Analysis
                    </h2>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      Official briefing and observational notes for {session.title}
                    </span>
                  </div>
                </div>

                {/* Narrative Paragraphs */}
                <div
                  style={{
                    fontSize: '1rem',
                    color: 'var(--color-text-main)',
                    lineHeight: '1.85',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.35rem',
                    maxWidth: '100%'
                  }}
                >
                  {photo.description.split('\n\n').map((paragraph, pIdx) => (
                    <p key={pIdx} style={{ margin: 0, textAlign: 'justify' }}>
                      {paragraph.trim()}
                    </p>
                  ))}
                </div>
              </Card>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State for other delegates */
        <Card
          elevation="sm"
          style={{
            padding: '4.5rem 2rem',
            textAlign: 'center',
            border: '2px dashed var(--color-border)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-bg-surface)'
          }}
        >
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              backgroundColor: 'rgba(0, 32, 74, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto'
            }}
          >
            <Camera size={32} style={{ color: 'var(--color-primary)', opacity: 0.8 }} />
          </div>
          <h3 style={{ color: 'var(--color-primary)', margin: '0 0 0.5rem 0', fontSize: '1.35rem' }}>
            Session Photographs Under Curation
          </h3>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '520px', margin: '0 auto 1.5rem auto', fontSize: '0.95rem', lineHeight: '1.6' }}>
            Photographs and proceedings from <strong>{session.title} ({session.dateStr})</strong> are currently being curated by the PMUN Secretariat following the session and will be published here.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
            <Clock size={16} /> Awaiting Secretariat Review
          </div>
        </Card>
      )}

      {/* Lightbox / Zoom Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.92)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            cursor: 'zoom-out'
          }}
        >
          <div style={{ position: 'relative', maxWidth: '94vw', maxHeight: '92vh' }}>
            <img
              src={selectedImage}
              alt="Zoomed preview"
              style={{
                maxWidth: '100%',
                maxHeight: '88vh',
                objectFit: 'contain',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 25px 60px rgba(0,0,0,0.7)'
              }}
            />
            <button
              onClick={() => setSelectedImage(null)}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0',
                background: 'none',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.9rem'
              }}
            >
              <X size={20} /> Close Preview
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounceSubtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(4px); }
        }
        .bounce-subtle {
          animation: bounceSubtle 1.8s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};
