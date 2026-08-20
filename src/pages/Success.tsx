import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { CheckCircle, ArrowRight, Copy } from 'lucide-react';

export const Success: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const regId = searchParams.get('id') || 'PIS-2026-MOCK';
  const name = searchParams.get('name') || 'Delegate';
  const grade = searchParams.get('grade') || '8';
  const committee = searchParams.get('committee') || 'Not Assigned';

  const handleCopyId = () => {
    navigator.clipboard.writeText(regId);
    alert('Registration ID copied to clipboard!');
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg-main)',
        padding: '4rem 1.5rem',
        minHeight: 'calc(100vh - 70px - 340px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ width: '100%', maxWidth: '580px' }} className="fade-in">
        <Card elevation="lg" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
          {/* Success Check badge */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-success-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--color-success)',
              }}
            >
              <CheckCircle size={38} style={{ color: 'var(--color-success)' }} />
            </div>
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary)', fontSize: '2rem', margin: '0 0 0.5rem 0' }}>
            Application Submitted!
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem', lineHeight: '1.5', margin: '0 0 2rem 0' }}>
            Congratulations, <strong>{name}</strong>. Your registration form for PMUN Nagpur 2026 has been submitted. Your application status is currently <strong>PENDING</strong> verification by the organizing committee.
          </p>

          {/* Registration Credentials Code Block */}
          <div
            style={{
              backgroundColor: 'var(--color-bg-main)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem 1.5rem',
              marginBottom: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.5px' }}>
              Your Custom Registration ID
            </div>
            
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                backgroundColor: '#ffffff',
                border: '1px solid var(--color-border)',
                padding: '0.85rem 1.5rem',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-inset)',
              }}
            >
              <span
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  fontFamily: 'monospace',
                  color: 'var(--color-primary)',
                  letterSpacing: '1px',
                }}
              >
                {regId}
              </span>
              <button
                type="button"
                onClick={handleCopyId}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'background-color var(--transition-fast)',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-main)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                title="Copy Registration ID"
              >
                <Copy size={16} />
              </button>
            </div>
            
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
              Save this ID. You will use it to log in to the delegate dashboard.
            </span>
          </div>

          {/* Registration Details Summary Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              fontSize: '0.88rem',
              textAlign: 'left',
              marginBottom: '2.5rem',
              borderBottom: '1px solid var(--color-border)',
              paddingBottom: '1.5rem',
            }}
            className="success-details"
          >
            <div>
              <strong style={{ color: 'var(--color-primary)', display: 'block' }}>Candidate:</strong>
              {name} (Grade {grade})
            </div>
            <div>
              <strong style={{ color: 'var(--color-primary)', display: 'block' }}>Preferred Committee:</strong>
              {committee}
            </div>
          </div>

          {/* Action Navigation Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate(`/login?role=delegate`)}
              style={{ width: '100%', boxShadow: 'var(--shadow-md)' }}
            >
              Go to Delegate Dashboard
              <ArrowRight size={16} />
            </Button>
            <Button variant="outline" size="md" onClick={() => navigate('/')} style={{ width: '100%' }}>
              Return to Homepage
            </Button>
          </div>
        </Card>
      </div>

      <style>{`
        @media (max-width: 500px) {
          .success-details {
            grid-template-columns: 1fr !important;
            gap: 0.75rem !important;
          }
        }
      `}</style>
    </div>
  );
};
