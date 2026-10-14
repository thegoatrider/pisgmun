import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PREPARATORY_SESSIONS } from '../data/sessionGalleries';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Calendar, ArrowLeft, Camera, Clock, ChevronRight, Eye, X } from 'lucide-react';

export const SessionGallery: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { registrationId, role } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
    <div className="container section fade-in" style={{ paddingBottom: '5rem' }}>
      {/* Back button and breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
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

      {/* Session Header Card */}
      <Card elevation="sm" style={{ padding: '2rem', marginBottom: '2.5rem', border: '1px solid var(--color-border)', backgroundColor: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(0, 32, 74, 0.06)', color: 'var(--color-primary)', padding: '0.3rem 0.85rem', borderRadius: 'var(--radius-round)', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              <Calendar size={14} />
              Session {session.sessionNumber} of 5
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary)', margin: '0 0 0.5rem 0', fontSize: '1.9rem' }}>
              {session.title}
            </h1>
            <p style={{ margin: 0, fontSize: '1rem', color: 'var(--color-text-muted)' }}>
              <strong style={{ color: 'var(--color-primary)' }}>{session.dateStr}</strong> ({session.dayOfWeek}) • {session.summary}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {PREPARATORY_SESSIONS.map((s) => {
              const isActive = s.id === session.id;
              // Date unlock check
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
                    opacity: isUnlocked ? 1 : 0.5,
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

      {/* Main Gallery Display */}
      {visiblePhotos.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {visiblePhotos.map((photo) => (
            <Card
              key={photo.id}
              elevation="md"
              style={{
                padding: '2.5rem',
                border: '1px solid var(--color-border)',
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '2.5rem', alignItems: 'start' }} className="gallery-detail-grid">
                {/* Image showcase */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div
                    onClick={() => setSelectedImage(photo.imageUrl)}
                    style={{
                      position: 'relative',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      boxShadow: 'var(--shadow-md)',
                      border: '1px solid var(--color-border)',
                      cursor: 'zoom-in',
                      backgroundColor: '#000000',
                      transition: 'transform 0.2s ease',
                      aspectRatio: '16/10',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.01)')}
                    onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  >
                    <img
                      src={photo.imageUrl}
                      alt={photo.caption || session.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        display: 'block'
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '12px',
                        right: '12px',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        color: '#ffffff',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        backdropFilter: 'blur(4px)'
                      }}
                    >
                      <Eye size={12} /> Click to expand
                    </div>
                  </div>
                  {photo.caption && (
                    <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', fontStyle: 'italic', textAlign: 'center' }}>
                      {photo.caption}
                    </span>
                  )}
                </div>

                {/* Description Narrative */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                    <Camera size={20} style={{ color: 'var(--color-secondary)' }} />
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                      Session Dispatch & Analysis
                    </h3>
                  </div>

                  <div style={{ fontSize: '0.92rem', color: 'var(--color-text-main)', lineHeight: '1.75', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {photo.description.split('\n\n').map((paragraph, pIdx) => (
                      <p key={pIdx} style={{ margin: 0, textAlign: 'justify' }}>
                        {paragraph.trim()}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* Empty / Curation Pending State for other delegates */
        <Card
          elevation="sm"
          style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            border: '2px dashed var(--color-border)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-bg-surface)'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(0, 32, 74, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto'
            }}
          >
            <Camera size={30} style={{ color: 'var(--color-primary)', opacity: 0.8 }} />
          </div>
          <h3 style={{ color: 'var(--color-primary)', margin: '0 0 0.5rem 0', fontSize: '1.3rem' }}>
            Session Photographs Under Curation
          </h3>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '520px', margin: '0 auto 1.5rem auto', fontSize: '0.92rem', lineHeight: '1.6' }}>
            Photographs and proceedings from <strong>{session.title} ({session.dateStr})</strong> are being processed by the PMUN Media & Documentation Secretariat. They will be published here shortly.
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
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            cursor: 'zoom-out'
          }}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <img
              src={selectedImage}
              alt="Zoomed session preview"
              style={{
                maxWidth: '100%',
                maxHeight: '85vh',
                objectFit: 'contain',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
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
              <X size={20} /> Close
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 868px) {
          .gallery-detail-grid {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
};
