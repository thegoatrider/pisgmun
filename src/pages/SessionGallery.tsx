import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PREPARATORY_SESSIONS } from '../data/sessionGalleries';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Calendar, ArrowLeft, Camera, ChevronRight, Eye, X } from 'lucide-react';

export const SessionGallery: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Subtle, gentle scroll fade - stays crystal clear on initial view and fades by just a tad as you scroll
  const [scrollOpacity, setScrollOpacity] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      // Stays at 1.0 for the first 120px so people can read the quote clearly
      // Then gently dims down to 0.78 over 800px of scrolling (just a subtle tad)
      if (scrolled < 120) {
        setScrollOpacity(1);
      } else {
        const gentleFade = Math.max(0.78, 1 - (scrolled - 120) / 900);
        setScrollOpacity(gentleFade);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const visiblePhotos = session.photos;

  return (
    <div className="fade-in" style={{ width: '100%', overflowX: 'hidden' }}>
      {/* Top Header / Breadcrumb & Controls */}
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '1rem' }}>
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
        <Card elevation="sm" style={{ padding: '1.5rem 2rem', marginBottom: '1.5rem', border: '1px solid var(--color-border)', backgroundColor: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(0, 32, 74, 0.06)', color: 'var(--color-primary)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-round)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                <Calendar size={13} />
                Session {session.sessionNumber} of 5
              </div>
              <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary)', margin: '0 0 0.25rem 0', fontSize: '1.75rem' }}>
                {session.title}
              </h1>
              <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--color-text-muted)' }}>
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
                return (
                  <button
                    key={s.id}
                    onClick={() => navigate(`/sessions/${s.id}`)}
                    style={{
                      padding: '0.45rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: isActive
                        ? '1.5px solid var(--color-primary)'
                        : '1px solid var(--color-border)',
                      backgroundColor: isActive
                        ? 'var(--color-primary)'
                        : 'var(--color-bg-main)',
                      color: isActive
                        ? '#ffffff'
                        : 'var(--color-primary)',
                      transition: 'all 0.15s ease'
                    }}
                    title={`Go to ${s.title}`}
                  >
                    S{s.sessionNumber}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* Main Showcase Section — REACHES SIDE TO SIDE FULL LENGTH & SEAMLESSLY BLENDED INTO TEXT BOX */}
      {visiblePhotos.map((photo) => (
        <section
          key={photo.id}
          style={{
            width: '100%',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Top: Seamless Full-Width Image Banner (Edge-to-edge side to side) */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              backgroundColor: '#141414',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'zoom-in',
              overflow: 'hidden',
              opacity: scrollOpacity,
              transition: 'opacity 0.25s ease-out'
            }}
            onClick={() => setSelectedImage(photo.imageUrl)}
          >
            <img
              src={photo.imageUrl}
              alt={photo.caption || session.title}
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '76vh',
                objectFit: 'contain',
                display: 'block'
              }}
            />

            {/* Top Badge Overlay */}
            <div
              style={{
                position: 'absolute',
                top: '20px',
                left: '24px',
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                color: '#ffffff',
                padding: '6px 16px',
                borderRadius: 'var(--radius-round)',
                fontSize: '0.8rem',
                fontWeight: 700,
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                letterSpacing: '0.5px',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}
            >
              {session.title} • {session.dateStr}
            </div>

            {/* Expand badge */}
            <div
              style={{
                position: 'absolute',
                top: '20px',
                right: '24px',
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                color: '#ffffff',
                padding: '6px 14px',
                borderRadius: 'var(--radius-round)',
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}
            >
              <Eye size={14} /> Click to expand
            </div>

            {/* Faded Seam Transition: Dissolves the bottom edge of the image directly into the text box */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '160px',
                background: 'linear-gradient(to bottom, rgba(20, 20, 20, 0) 0%, rgba(20, 20, 20, 0.25) 35%, rgba(255, 255, 255, 0.8) 80%, #ffffff 100%)',
                pointerEvents: 'none',
                zIndex: 2
              }}
            />
          </div>

          {/* Bottom: Seamless Information Container connected directly below the image with zero borders */}
          <div
            style={{
              width: '100%',
              backgroundColor: '#ffffff',
              padding: '2rem 1.5rem 6rem 1.5rem',
              display: 'flex',
              justifyContent: 'center',
              position: 'relative',
              zIndex: 1
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '860px',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.75rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '2px solid var(--color-border)', paddingBottom: '1rem' }}>
                <Camera size={24} style={{ color: 'var(--color-secondary)' }} />
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.45rem', color: 'var(--color-primary)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                    Session Dispatch & Analysis
                  </h2>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    Official briefing and observational notes for {session.title}
                  </span>
                </div>
              </div>

              {/* Narrative Paragraphs */}
              <div
                style={{
                  fontSize: '1.02rem',
                  color: 'var(--color-text-main)',
                  lineHeight: '1.9',
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
            </div>
          </div>
        </section>
      ))}

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
    </div>
  );
};
