import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { backgroundGuides } from '../data/backgroundGuides';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Accordion } from '../components/UI/Accordion';
import { FileText, Download, ArrowLeft, Loader2 } from 'lucide-react';

export const CommitteeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { committees, countries, registrations, config, isLoading } = useAuth();
  const [activeGuideChapter, setActiveGuideChapter] = useState<'issue' | 'importance' | 'stats' | 'frameworks' | 'positions' | 'cases'>('issue');

  const commId = id || '';
  const committee = committees.find((c) => c.id.toLowerCase() === commId.toLowerCase());
  
  // Back button routing: if logged in as delegate, go back to delegate dashboard. Otherwise public committees page.
  const sessionRole = localStorage.getItem('pmun_session_role');
  const handleBack = () => {
    if (sessionRole === 'delegate') {
      navigate('/dashboard/delegate');
    } else {
      navigate('/committees');
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', width: '100%', height: '50vh', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="spin" size={32} style={{ color: 'var(--color-secondary)' }} />
      </div>
    );
  }

  if (!committee) {
    return (
      <div className="container section text-center">
        <h2 className="text-error">Committee Not Found</h2>
        <p>We couldn't find a committee with ID "{commId}".</p>
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft size={16} /> Back
        </Button>
      </div>
    );
  }

  // Count active registrations in this grade
  const gradeRegs = registrations.filter((r) => r.grade === committee.grade && r.committee === committee.id);
  const isFull = gradeRegs.length >= committee.capacity;
  const isClosed = config?.registration_status === 'CLOSED' || committee.status === 'CLOSED';

  // PDF Guides mapping
  const pdfMapping: Record<string, string> = {
    unep: '/resources/unep_background_guide.pdf',
    unicef: '/resources/unicef_background_guide.pdf',
    fao: '/resources/fao_background_guide.pdf',
    unhrc: '/resources/unhrc_background_guide.pdf',
    'un-women': '/resources/un_women_background_guide.pdf',
    ecosoc: '/resources/fao_background_guide.pdf', // fallback
  };
  const pdfPath = pdfMapping[committee.id.toLowerCase()] || '/resources/rules_of_procedure.pdf';

  // Country Matrix (filter countries for this committee)
  const commCountries = countries.filter((c) => c.committee_id.toLowerCase() === committee.id.toLowerCase());

  // Guide chapters data (custom loaded chapters)
  const guideData = backgroundGuides[committee.id.toLowerCase()];

  // Format schedule text lines
  const scheduleItems = committee.schedule
    ? committee.schedule.split('|').map((item) => item.trim())
    : ['Opening debate & Speaker lists setup', 'Moderated & Unmoderated caucuses', 'Resolution drafting, lobbying & voting'];

  const guideChaptersList = [
    { id: 'issue', label: '1. Understanding Issue' },
    { id: 'importance', label: '2. Global Importance' },
    { id: 'stats', label: '3. Key Statistics' },
    { id: 'frameworks', label: '4. UN Frameworks' },
    { id: 'positions', label: '5. Country Positions' },
    { id: 'cases', label: '6. Case Studies & Agendas' },
  ] as const;

  // Build Accordion items
  const accordionItems = [
    {
      title: 'About the Committee',
      content: (
        <div>
          <h4 style={{ color: 'var(--color-secondary)', fontSize: '1.1rem', margin: '0 0 0.5rem 0' }}>
            {committee.name}
          </h4>
          <p style={{ margin: 0 }}>{committee.description}</p>
        </div>
      ),
    },
    {
      title: 'Committee Agenda',
      content: (
        <div style={{ borderLeft: '4px solid var(--color-secondary)', paddingLeft: '1rem', backgroundColor: 'var(--color-bg-main)', padding: '1rem 1.5rem', borderRadius: 'var(--radius-md)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
            Official Agenda Topic
          </span>
          <p style={{ fontSize: '1.15rem', fontFamily: 'var(--font-display)', color: 'var(--color-primary)', fontWeight: 700, margin: 0 }}>
            "{committee.agenda}"
          </p>
        </div>
      ),
    },
    {
      title: 'Executive Board (EB)',
      content: (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }} className="eb-grid">
          {[
            { role: 'Chairperson', name: committee.eb_chair },
            { role: 'Vice Chairperson', name: committee.eb_vice_chair },
            { role: 'In-Charge', name: committee.eb_rapporteur },
          ].map((member, i) => (
            <div key={i} style={{ backgroundColor: 'var(--color-bg-main)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
                {member.role}
              </span>
              <h4 style={{ color: 'var(--color-primary)', margin: '0.25rem 0 0 0', fontSize: '1.1rem' }}>
                {member.name}
              </h4>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'Rules of Procedure (RoP)',
      content: <p style={{ margin: 0 }}>{committee.rules}</p>,
    },
    {
      title: 'What to Prepare?',
      content: <p style={{ margin: 0 }}>{committee.prepare_info}</p>,
    },
    {
      title: 'Detailed Session Schedule',
      content: (
        <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', lineHeight: '1.8' }}>
          {scheduleItems.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ul>
      ),
    },
    {
      title: `Country Representation Matrix (${commCountries.length} States)`,
      content: (
        <div>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
            Below is the availability status of countries for this committee. During registration, you may list your preferences based on these options.
          </p>
          <div className="table-responsive" style={{ maxHeight: '350px', overflowY: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Country Name</th>
                  <th>Category / Bloc</th>
                  <th>Availability</th>
                </tr>
              </thead>
              <tbody>
                {commCountries.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{c.country_name}</td>
                    <td>{c.category}</td>
                    <td>
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: c.available ? 'var(--color-success-bg)' : 'var(--color-border)',
                          color: c.available ? 'var(--color-success)' : 'var(--color-text-muted)',
                          padding: '0.2rem 0.6rem',
                          borderRadius: 'var(--radius-round)',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                        }}
                      >
                        {c.available ? 'Available' : 'Assigned'}
                      </span>
                    </td>
                  </tr>
                ))}
                {commCountries.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center" style={{ padding: '2rem', color: 'var(--color-text-muted)' }}>
                      No countries populated for this committee.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="container section fade-in">
      {/* 1. Back button */}
      <button
        onClick={handleBack}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          border: 'none',
          background: 'none',
          color: 'var(--color-primary)',
          fontWeight: 700,
          cursor: 'pointer',
          marginBottom: '1.5rem',
          fontSize: '0.88rem',
          padding: 0,
        }}
      >
        <ArrowLeft size={16} /> Back to Committees
      </button>

      {/* 2. Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid var(--color-border)', paddingBottom: '1.5rem', marginBottom: '2.5rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '1px' }}>
            Model United Nations 2026 Nagpur
          </span>
          <h2 style={{ fontSize: '2.2rem', color: 'var(--color-primary)', margin: '0.25rem 0 0 0' }}>
            {committee.id.toUpperCase()} — {committee.name}
          </h2>
        </div>
        <img
          src="/resources/podar_tree_logo.png"
          alt="Podar Logo"
          style={{ width: '58px', height: '58px', objectFit: 'contain' }}
        />
      </div>

      {/* 3. Official Study Guide Viewer */}
      <Card style={{ padding: '1.5rem', marginBottom: '2.5rem' }} elevation="md">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--color-primary)' }}>
              📄 Official {committee.id.toUpperCase()} Background Guide
            </h3>
            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
              Read or download the official conference briefing book for your committee.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <a
              href={pdfPath}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: 'var(--color-secondary)',
                color: '#ffffff',
                padding: '0.6rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                fontWeight: 700,
                fontSize: '0.82rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <FileText size={16} /> Open Fullscreen PDF
            </a>
            <a
              href={pdfPath}
              download={`${committee.id}_background_guide.pdf`}
              style={{
                backgroundColor: 'var(--color-bg-main)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-primary)',
                padding: '0.6rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                fontWeight: 700,
                fontSize: '0.82rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Download size={16} /> Download PDF
            </a>
          </div>
        </div>

        {/* Dynamic Chapter Reader or Direct PDF embed */}
        {guideData ? (
          <div style={{ display: 'flex', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '520px' }} className="reader-wrapper">
            {/* Left Nav Tabs */}
            <div style={{ width: '28%', backgroundColor: 'var(--color-bg-main)', borderRight: '1px solid var(--color-border)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Guide Chapters
              </span>
              {guideChaptersList.map((chap) => (
                <button
                  key={chap.id}
                  onClick={() => setActiveGuideChapter(chap.id)}
                  style={{
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    textAlign: 'left',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    backgroundColor: activeGuideChapter === chap.id ? 'var(--color-secondary)' : 'transparent',
                    color: activeGuideChapter === chap.id ? '#ffffff' : 'var(--color-text-main)',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {chap.label}
                </button>
              ))}
            </div>

            {/* Right Content Frame */}
            <div
              style={{
                width: '72%',
                padding: '1.5rem 2rem',
                overflowY: 'auto',
                backgroundColor: 'var(--color-bg-surface)',
                lineHeight: '1.7',
              }}
              dangerouslySetInnerHTML={{
                __html: guideData[activeGuideChapter],
              }}
              className="reader-content"
            />
          </div>
        ) : (
          <div style={{ width: '100%', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <iframe
              src={pdfPath}
              title={`${committee.name} Background Guide`}
              style={{ width: '100%', height: '520px', border: 'none' }}
            />
          </div>
        )}
      </Card>

      {/* 4. CTA / Register Callout */}
      {!isClosed && sessionRole !== 'delegate' && (
        <Card style={{ backgroundColor: 'var(--color-bg-main)', border: '2px solid var(--color-border)', padding: '2.5rem 2rem', textAlign: 'center', marginBottom: '2.5rem' }} elevation="sm">
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
            <span
              className="status-badge"
              style={{
                backgroundColor: isClosed ? 'var(--color-error-bg)' : 'var(--color-success-bg)',
                color: isClosed ? 'var(--color-error)' : 'var(--color-success)',
                padding: '0.3rem 1rem',
                fontSize: '0.8rem',
              }}
            >
              {isClosed ? 'REGISTRATIONS CLOSED' : isFull ? 'COMMITTEE FULL' : 'REGISTRATIONS OPEN'}
            </span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--color-primary)', marginTop: '1rem', marginBottom: '0.5rem' }}>
            Ready to Represent a Nation?
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', marginBottom: '1.5rem' }}>
            Register as a delegate for {committee.id.toUpperCase()} committee and submit your country preferences.
          </p>
          <Button
            variant="secondary"
            size="lg"
            disabled={isClosed || isFull}
            onClick={() => navigate(`/register?committee=${committee.id}`)}
          >
            {isClosed ? 'Registrations Closed' : isFull ? 'Committee is Full' : 'Begin Registration →'}
          </Button>
        </Card>
      )}

      {/* 5. Detailed Accordions */}
      <div style={{ marginBottom: '3rem' }}>
        <Accordion items={accordionItems} />
      </div>

      <style>{`
        @media (max-width: 800px) {
          .reader-wrapper {
            flex-direction: column !important;
            height: auto !important;
          }
          .reader-wrapper > div:first-child {
            width: 100% !important;
            border-right: none !important;
            border-bottom: 1px solid var(--color-border);
          }
          .reader-content {
            width: 100% !important;
            height: 350px !important;
          }
          .eb-grid {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
};
