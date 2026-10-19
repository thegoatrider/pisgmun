import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PREPARATORY_SESSIONS } from '../data/sessionGalleries';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Calendar, ArrowLeft, Camera, ChevronRight, ChevronLeft, Eye, X } from 'lucide-react';

export const SessionGallery: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Gentle scroll fade - stays crystal clear on initial view and fades with a subtle hint as you scroll down
  // Lessened by 25% so image stays vibrant and eases back to 1.0 when scrolling up
  const [scrollOpacity, setScrollOpacity] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      if (scrolled < 160) {
        setScrollOpacity(1);
      } else {
        // Lessened fade effect by 25% (minimum opacity increased to 0.91)
        const gentleFade = Math.max(0.91, 1 - ((scrolled - 160) / 1400) * 0.75);
        setScrollOpacity(gentleFade);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setCurrentPhotoIndex(0);
  }, [sessionId]);

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

      {/* Main Slideshow Showcase Section */}
      {(() => {
        const photos = session.photos && session.photos.length > 0 ? session.photos : [];
        const currentPhoto = photos[currentPhotoIndex] || photos[0];

        const handlePrev = (e?: React.MouseEvent) => {
          if (e) e.stopPropagation();
          if (photos.length > 1) {
            setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
          }
        };

        const handleNext = (e?: React.MouseEvent) => {
          if (e) e.stopPropagation();
          if (photos.length > 1) {
            setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
          }
        };

        if (!currentPhoto) return null;

        return (
          <section
            style={{
              width: '100%',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Top: Full-Width Image Slideshow Banner with Left & Right Centered Navigation Arrows */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                backgroundColor: '#111827',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'zoom-in',
                overflow: 'hidden',
                opacity: scrollOpacity,
                transition: 'opacity 0.25s ease-out',
                minHeight: '480px'
              }}
              onClick={() => setSelectedImage(currentPhoto.imageUrl)}
            >
              <img
                key={currentPhoto.id}
                src={currentPhoto.imageUrl}
                alt={currentPhoto.caption || session.title}
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '76vh',
                  objectFit: 'contain',
                  display: 'block'
                }}
              />

              {/* Left Most Middle Arrow Navigation */}
              {photos.length > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous Slide"
                  style={{
                    position: 'absolute',
                    left: '24px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(0, 0, 0, 0.68)',
                    color: '#ffffff',
                    border: '1.5px solid rgba(255, 255, 255, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 10,
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 32, 74, 0.95)';
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.68)';
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                  }}
                >
                  <ChevronLeft size={32} />
                </button>
              )}

              {/* Right Most Middle Arrow Navigation */}
              {photos.length > 1 && (
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next Slide"
                  style={{
                    position: 'absolute',
                    right: '24px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(0, 0, 0, 0.68)',
                    color: '#ffffff',
                    border: '1.5px solid rgba(255, 255, 255, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 10,
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 32, 74, 0.95)';
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.68)';
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                  }}
                >
                  <ChevronRight size={32} />
                </button>
              )}

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
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  zIndex: 4
                }}
              >
                {session.title} • {session.dateStr}
              </div>

              {/* Slide Counter & Dots indicator */}
              {photos.length > 1 && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: 'rgba(0, 0, 0, 0.72)',
                    padding: '6px 16px',
                    borderRadius: 'var(--radius-round)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    zIndex: 4,
                    boxShadow: '0 4px 14px rgba(0,0,0,0.3)'
                  }}
                >
                  {photos.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentPhotoIndex(idx);
                      }}
                      aria-label={`Slide ${idx + 1}`}
                      style={{
                        width: currentPhotoIndex === idx ? '22px' : '8px',
                        height: '8px',
                        borderRadius: '4px',
                        backgroundColor: currentPhotoIndex === idx ? '#c5a059' : 'rgba(255, 255, 255, 0.5)',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        transition: 'all 0.25s ease'
                      }}
                    />
                  ))}
                  <span style={{ fontSize: '0.78rem', color: '#ffffff', fontWeight: 700, marginLeft: '6px', letterSpacing: '0.5px' }}>
                    {currentPhotoIndex + 1} / {photos.length}
                  </span>
                </div>
              )}

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
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  zIndex: 4
                }}
              >
                <Eye size={14} /> Click to expand
              </div>
            </div>

            {/* Bottom: Information Container connected directly below image with NO fade overlay */}
            <div
              style={{
                width: '100%',
                backgroundColor: '#ffffff',
                padding: '2.5rem 1.5rem 6rem 1.5rem',
                display: 'flex',
                justifyContent: 'center',
                position: 'relative',
                zIndex: 1,
                borderTop: '1px solid var(--color-border)'
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
                  {currentPhoto.description.split('\n\n').map((paragraph, pIdx) => (
                    <p key={pIdx} style={{ margin: 0, textAlign: 'justify' }}>
                      {paragraph.trim()}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* Lightbox / Zoom Modal */}
      {selectedImage && (() => {
        const photos = session.photos && session.photos.length > 0 ? session.photos : [];
        const handleLightboxPrev = (e: React.MouseEvent) => {
          e.stopPropagation();
          const nextIdx = (currentPhotoIndex - 1 + photos.length) % photos.length;
          setCurrentPhotoIndex(nextIdx);
          setSelectedImage(photos[nextIdx].imageUrl);
        };
        const handleLightboxNext = (e: React.MouseEvent) => {
          e.stopPropagation();
          const nextIdx = (currentPhotoIndex + 1) % photos.length;
          setCurrentPhotoIndex(nextIdx);
          setSelectedImage(photos[nextIdx].imageUrl);
        };

        return (
          <div
            onClick={() => setSelectedImage(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0, 0, 0, 0.94)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem',
              cursor: 'zoom-out'
            }}
          >
            {photos.length > 1 && (
              <button
                type="button"
                onClick={handleLightboxPrev}
                aria-label="Previous Photo"
                style={{
                  position: 'fixed',
                  left: '24px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  color: '#ffffff',
                  border: '1.5px solid rgba(255, 255, 255, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 1010
                }}
              >
                <ChevronLeft size={34} />
              </button>
            )}

            {photos.length > 1 && (
              <button
                type="button"
                onClick={handleLightboxNext}
                aria-label="Next Photo"
                style={{
                  position: 'fixed',
                  right: '24px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  color: '#ffffff',
                  border: '1.5px solid rgba(255, 255, 255, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 1010
                }}
              >
                <ChevronRight size={34} />
              </button>
            )}

            <div
              style={{ position: 'relative', maxWidth: '94vw', maxHeight: '92vh', cursor: 'default' }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage}
                alt="Zoomed preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '88vh',
                  objectFit: 'contain',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
                  display: 'block'
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
        );
      })()}
    </div>
  );
};
