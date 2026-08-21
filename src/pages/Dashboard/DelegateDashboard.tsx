import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/UI/Card';
import { Badge } from '../../components/UI/Badge';
import { Button } from '../../components/UI/Button';
import { Loader2, FileText, Download, Lock, CheckCircle, Clock, AlertTriangle, LogOut } from 'lucide-react';

export const DelegateDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { registrations, committees, registrationId, logout, isLoading } = useAuth();
  const [delegateReg, setDelegateReg] = useState<any>(null);

  useEffect(() => {
    if (registrationId && registrations.length > 0) {
      const reg = registrations.find((r) => r.id === registrationId);
      if (reg) {
        setDelegateReg(reg);
      }
    }
  }, [registrationId, registrations]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', width: '100%', height: '50vh', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="spin" size={32} style={{ color: 'var(--color-secondary)' }} />
      </div>
    );
  }

  // Fallback if registry not found
  if (!delegateReg) {
    // If we have registrationId, try to fetch it directly or show wait
    return (
      <div className="container section text-center">
        <h2>Loading Delegate Portfolio...</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
          Searching for Registration ID: <strong>{registrationId}</strong>
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </Button>
        </div>
      </div>
    );
  }

  const { name, id, grade, section, school, status, committee: assignedCommId, assigned_country: assignedCountry } = delegateReg;
  
  const isApproved = status === 'APPROVED';
  const isPending = status === 'PENDING' || status === 'NOT ASSIGNED';
  const isRejected = status === 'REJECTED';

  // Fallback to preferred committee if not yet approved/assigned by coordinator
  const targetCommId = isApproved ? assignedCommId : delegateReg.preferred_committee;
  const targetCountry = isApproved ? assignedCountry : 'Pending Allocation';

  // Find committee details
  const commObj = committees.find((c) => c.id?.toLowerCase() === targetCommId?.toLowerCase());

  // PDF Guides mapping
  const pdfMapping: Record<string, string> = {
    unep: '/resources/unep_background_guide.pdf',
    unicef: '/resources/unicef_background_guide.pdf',
    fao: '/resources/fao_background_guide.pdf',
    unhrc: '/resources/unhrc_background_guide.pdf',
    'un-women': '/resources/un_women_background_guide.pdf',
    ecosoc: '/resources/fao_background_guide.pdf',
  };

  const commPdfPath = pdfMapping[targetCommId?.toLowerCase()] || '#';

  return (
    <div className="container section fade-in">
      {/* Welcome Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--color-border)', paddingBottom: '1.5rem', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }} className="welcome-header">
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '1px' }}>
            Candidate Portal
          </span>
          <h2 style={{ fontSize: '2rem', color: 'var(--color-primary)', margin: '0.25rem 0 0 0' }}>
            Welcome, {name}
          </h2>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut size={14} />
          Logout
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '2.5rem' }} className="dashboard-grid">
        {/* Left Side: Verification Status & Portfolio Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Status Card */}
          <Card elevation="md" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-primary)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>
                Verification Status
              </h3>
              <Badge status={status} />
            </div>

            {isApproved && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', color: 'var(--color-success)', backgroundColor: 'var(--color-success-bg)', border: '1px solid var(--color-success)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', fontSize: '0.88rem' }}>
                <CheckCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Approved!</strong> Your PMUN enrollment is complete. Your country portfolio and committee have been allocated by the directors. Explore materials on the right to prepare.
                </div>
              </div>
            )}

            {isPending && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', color: 'var(--color-warning)', backgroundColor: 'var(--color-warning-bg)', border: '1px solid var(--color-warning)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', fontSize: '0.88rem' }}>
                <Clock size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Pending Verification:</strong> Your registration form is under review. Your assigned country and committee details are being processed. In the meantime, you can explore the details and background guide for your preferred committee below.
                </div>
              </div>
            )}

            {isRejected && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', color: 'var(--color-error)', backgroundColor: 'var(--color-error-bg)', border: '1px solid var(--color-error)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', fontSize: '0.88rem' }}>
                <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Application Rejected:</strong> Your registration was not approved. Please reach out to your grade teacher in-charge or PMUN coordinator for guidance.
                </div>
              </div>
            )}
          </Card>

          {/* Allocation Panel */}
          <Card elevation="md" style={{ padding: '2rem' }}>
            <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.2rem', color: 'var(--color-primary)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>
              Portfolio Details
            </h3>

            {targetCommId ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: 'var(--color-bg-main)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                      Allocated Country
                    </span>
                    <strong style={{ fontSize: '1.2rem', color: isApproved ? 'var(--color-secondary)' : 'var(--color-text-muted)' }}>
                      {targetCountry}
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                      {isApproved ? 'Allocated Committee' : 'Preferred Committee'}
                    </span>
                    <strong style={{ fontSize: '1.2rem', color: 'var(--color-primary)' }}>
                      {targetCommId.toUpperCase()}
                    </strong>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem' }}>
                  <div><strong>Council:</strong> {commObj?.name || 'Not Available'}</div>
                  <div><strong>Agenda:</strong> {commObj?.agenda || 'Not Available'}</div>
                  
                  {/* Executive Board (Election Board) */}
                  <div style={{ marginTop: '0.25rem', borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
                    <strong style={{ color: 'var(--color-primary)', display: 'block', marginBottom: '0.25rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Executive Board
                    </strong>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', backgroundColor: 'var(--color-bg-main)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: '0.82rem' }}>
                      <div>
                        <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', display: 'block' }}>Chairperson</span>
                        <strong>{commObj?.eb_chair || 'TBD'}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', display: 'block' }}>Vice Chair</span>
                        <strong>{commObj?.eb_vice_chair || 'TBD'}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', display: 'block' }}>Rapporteur</span>
                        <strong>{commObj?.eb_rapporteur || 'TBD'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Schedule Timings */}
                  <div style={{ marginTop: '0.25rem', borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
                    <strong style={{ color: 'var(--color-primary)', display: 'block', marginBottom: '0.25rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Session Schedule & Timings
                    </strong>
                    <div style={{ backgroundColor: 'var(--color-bg-main)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', lineHeight: '1.4', fontSize: '0.82rem' }}>
                      {commObj?.schedule ? (
                        commObj.schedule.split('|').map((session: string, idx: number) => (
                          <div key={idx} style={{ marginBottom: idx < commObj.schedule.split('|').length - 1 ? '4px' : '0' }}>
                            • {session.trim()}
                          </div>
                        ))
                      ) : (
                        'Schedule details to be released shortly.'
                      )}
                    </div>
                  </div>

                  {commObj && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/committees/${commObj.id}`)}
                      style={{ marginTop: '0.75rem', width: 'fit-content' }}
                    >
                      View Full Committee Details Page
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1.5rem', border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-md)', textAlign: 'center', gap: '0.75rem' }}>
                <Lock size={32} style={{ color: 'var(--color-text-muted)', opacity: 0.5 }} />
                <h4 style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '1rem' }}>
                  Portfolio Details Pending
                </h4>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
                  Your committee preferences are not registered. Please contact the MUN Coordinator.
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Right Side: Registration Info & Locked/Unlocked Guides */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Registration Info */}
          <Card elevation="sm" style={{ padding: '1.75rem 1.5rem' }}>
            <h4 style={{ margin: '0 0 1rem 0', color: 'var(--color-primary)', fontSize: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Registration Metadata
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.88rem' }}>
              <div><strong>Registration ID:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{id}</span></div>
              <div><strong>School:</strong> {school}</div>
              <div><strong>Grade & Section:</strong> Grade {grade} - {section}</div>
            </div>
          </Card>

          {/* Reference Materials */}
          <Card elevation="md" style={{ padding: '2rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', color: 'var(--color-primary)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>
              Study Guides & Reference Files
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: '1.5', marginBottom: '1.5rem' }}>
              Access the official reference manuals to prepare your speeches, country position briefs, and resolution drafts.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Rules of Procedure PDF */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-main)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FileText size={20} style={{ color: 'var(--color-secondary)', flexShrink: 0 }} />
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', display: 'block', color: 'var(--color-primary)' }}>Rules of Procedure</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Rules & debate protocols</span>
                  </div>
                </div>
                <a
                  href="/resources/rules_of_procedure.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: '#ffffff',
                    padding: '0.45rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Download size={12} /> Get
                </a>
              </div>

              {/* Committee-Specific Background Guide PDF */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: targetCommId ? 'var(--color-bg-main)' : 'rgba(226, 232, 240, 0.4)', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {targetCommId ? (
                    <FileText size={20} style={{ color: 'var(--color-secondary)', flexShrink: 0 }} />
                  ) : (
                    <Lock size={20} style={{ color: 'var(--color-text-muted)', flexShrink: 0, opacity: 0.5 }} />
                  )}
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', display: 'block', color: targetCommId ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                      Background Guide
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                      {targetCommId ? `${targetCommId.toUpperCase()} Briefing Manual` : 'No Committee Allocated'}
                    </span>
                  </div>
                </div>

                {targetCommId && commPdfPath !== '#' ? (
                  <a
                    href={commPdfPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      backgroundColor: 'var(--color-primary)',
                      color: '#ffffff',
                      padding: '0.45rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Download size={12} /> Get
                  </a>
                ) : (
                  <button
                    disabled
                    style={{
                      backgroundColor: 'var(--color-border)',
                      color: 'var(--color-text-muted)',
                      border: 'none',
                      padding: '0.45rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      cursor: 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Lock size={12} /> Locked
                  </button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      <style>{`
        @media (max-width: 800px) {
          .dashboard-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          .welcome-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
};
