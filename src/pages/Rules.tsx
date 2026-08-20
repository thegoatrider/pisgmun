import React from 'react';
import { Scale, FileText, CheckCircle, Info, Download } from 'lucide-react';
import { Card } from '../components/UI/Card';

export const Rules: React.FC = () => {
  const conductRules = [
    {
      rule: 'Respect Everyone',
      guideline: 'Always be respectful to other delegates, the Chair, and organizers during debate and resolution writing. Speak politely and calmly. Never raise your voice.',
    },
    {
      rule: 'Address in Third Person',
      guideline: 'Always refer to yourself and other countries in the third person. For example, say "The delegate of India believes..." instead of "I think..." or "We believe...".',
    },
    {
      rule: 'Avoid Interruptions',
      guideline: 'Avoid interrupting another delegate when they have the floor. Always raise your country placard to speak and wait to be recognized by the Chairperson.',
    },
    {
      rule: 'Punctuality',
      guideline: 'Sessions start exactly on schedule, mirroring the discipline of the actual United Nations. Late arrivals disrupt formal debate and are noted by the Chairperson.',
    },
    {
      rule: 'Stay in Character',
      guideline: 'Your speeches and votes must reflect the national policies of your assigned country, not your personal opinions.',
    },
    {
      rule: 'Follow Dress Code',
      guideline: 'Adhere strictly to the formal dress code requirements during all sessions and social events.',
    },
  ];

  const dressCodeRules = [
    {
      category: 'Full School Uniform',
      girls: 'Properly ironed and tucked-in shirt with school skirt, tie, belt, and blazer.',
      boys: 'Properly ironed and tucked-in shirt with school trousers, tie, belt, and blazer.',
    },
    {
      category: 'Grooming',
      girls: 'Hair neatly combed and tied in a ponytail or braids. Simple accessories only.',
      boys: 'Hair combed, face clean-shaven or beard neatly trimmed.',
    },
    {
      category: 'Footwear',
      girls: 'Polished formal black school shoes with black socks.',
      boys: 'Polished formal black school shoes with black socks.',
    },
  ];

  return (
    <div className="container section fade-in">
      {/* Page Header */}
      <div className="text-center" style={{ marginBottom: '4rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary)', fontWeight: 700 }}>
          Rules & Guidelines
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', margin: '0.5rem 0 1.25rem 0' }}>
          <div style={{ height: '1.2px', width: '30px', backgroundColor: 'var(--color-border)' }}></div>
          <span style={{ color: 'var(--color-secondary)', fontSize: '0.55rem' }}>◆</span>
          <div style={{ height: '1.2px', width: '30px', backgroundColor: 'var(--color-border)' }}></div>
        </div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto' }}>
          Official rules of conduct, dress codes, and procedures for Podar Nagpur PMUN 2026.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2.5rem' }} className="rules-layout">
        {/* Left Side: Conduct Tables */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {/* Conduct Section */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
              <Scale size={22} style={{ color: 'var(--color-secondary)' }} />
              <h2 style={{ fontSize: '1.35rem', color: 'var(--color-primary)', margin: 0 }}>
                Conference Etiquette & Conduct
              </h2>
            </div>
            
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: '30%' }}>Rule</th>
                    <th style={{ width: '70%' }}>Guideline</th>
                  </tr>
                </thead>
                <tbody>
                  {conductRules.map((r, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 700, color: 'var(--color-secondary)' }}>{r.rule}</td>
                      <td>{r.guideline}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Dress Code Section */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
              <CheckCircle size={22} style={{ color: 'var(--color-secondary)' }} />
              <h2 style={{ fontSize: '1.35rem', color: 'var(--color-primary)', margin: 0 }}>
                Official Dress Code
              </h2>
            </div>

            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: '25%' }}>Category</th>
                    <th style={{ width: '37.5%' }}>Girls</th>
                    <th style={{ width: '37.5%' }}>Boys</th>
                  </tr>
                </thead>
                <tbody>
                  {dressCodeRules.map((d, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{d.category}</td>
                      <td>{d.girls}</td>
                      <td>{d.boys}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right Side: PDF Download & Carry items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* PDF Viewer card */}
          <Card elevation="md" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={20} style={{ color: 'var(--color-secondary)' }} />
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--color-primary)', fontFamily: 'var(--font-sans)' }}>
                Official RoP Manual
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: '1.5', margin: 0 }}>
              Download the complete UN Rules of Procedure (RoP) manual governing debate sessions, voting rules, and amendments.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <a
                href="/resources/rules_of_procedure.pdf"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: 'var(--color-secondary)',
                  color: '#ffffff',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <FileText size={16} /> Open Rules PDF
              </a>
              <a
                href="/resources/rules_of_procedure.pdf"
                download="PMUN_Nagpur_Rules_Of_Procedure.pdf"
                style={{
                  backgroundColor: 'var(--color-bg-main)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-primary)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Download size={16} /> Download Guide File
              </a>
            </div>
          </Card>

          {/* Essential Carry Items Card */}
          <Card elevation="sm" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Info size={18} style={{ color: 'var(--color-secondary)' }} />
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--color-primary)', fontFamily: 'var(--font-sans)' }}>
                Essential Carry Items
              </h3>
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
              <li>
                <strong>School ID Badge:</strong> Must be worn at all times outside committee rooms, especially in common areas or cafeterias.
              </li>
              <li>
                <strong>Research Binder:</strong> Bring your physical study guide notes, nation brief paper, opening speeches, and statistics.
              </li>
              <li>
                <strong>Research Devices:</strong> Students may carry tablets, smartphones, or laptops. Wi-Fi access codes will be provided at the desks.
              </li>
            </ul>
          </Card>
        </div>
      </div>

      {/* ROP PDF Embedded Reader below */}
      <section style={{ marginTop: '3.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
          <FileText size={22} style={{ color: 'var(--color-secondary)' }} />
          <h2 style={{ fontSize: '1.35rem', color: 'var(--color-primary)', margin: 0 }}>
            Inline PDF Viewer
          </h2>
        </div>
        <Card style={{ padding: '0.5rem', overflow: 'hidden' }}>
          <iframe
            src="/resources/rules_of_procedure.pdf"
            title="Rules of Procedure Document Viewer"
            style={{ width: '100%', height: '650px', border: 'none' }}
          />
        </Card>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .rules-layout {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
      `}</style>
    </div>
  );
};
