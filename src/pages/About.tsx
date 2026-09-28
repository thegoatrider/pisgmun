import React from 'react';
import { Landmark, BookText, School, Star, Calendar, Clock, CheckCircle } from 'lucide-react';
import { Card } from '../components/UI/Card';

export const About: React.FC = () => {
  const organs = [
    {
      name: 'General Assembly (UNGA)',
      description: 'The main deliberative, policymaking, and representative organ of the UN. It houses all 193 member states to discuss global issues.',
    },
    {
      name: 'Security Council (UNSC)',
      description: 'Responsible for maintaining international peace and security. Consists of 15 members, including 5 permanent ones (P5) with veto power.',
    },
    {
      name: 'Economic & Social Council (ECOSOC)',
      description: 'Coordinates the economic, social, environmental, and related work of the UN, including regional commissions and specialized agencies.',
    },
    {
      name: 'Trusteeship Council',
      description: 'Established to supervise the administration of trust territories. Inactive since 1994, after all trust territories achieved self-government.',
    },
    {
      name: 'International Court of Justice (ICJ)',
      description: 'The principal judicial organ of the United Nations, based in The Hague, Netherlands. Resolves legal disputes between member states.',
    },
    {
      name: 'UN Secretariat',
      description: 'Carries out the day-to-day administrative operations of the UN under the leadership of the Secretary-General.',
    },
  ];

  const agendas = [
    { committee: 'UN Women', title: 'Addressing Challenges to Women’s Rights and Empowerment' },
    { committee: 'UNHRC', title: 'Protecting Digital Rights during Conflicts' },
    { committee: 'UNEP', title: 'Harnessing Solar Energy for Equitable Access and Clean Air' },
    { committee: 'UNICEF', title: 'Impact of Foreign Aid Reductions on Global Child Healthcare' },
  ];

  return (
    <div className="container section fade-in">
      {/* Page Header */}
      <div className="text-center" style={{ marginBottom: '4rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary)', fontWeight: 700 }}>
          About PMUN
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', margin: '0.5rem 0 1.25rem 0' }}>
          <div style={{ height: '1.2px', width: '30px', backgroundColor: 'var(--color-border)' }}></div>
          <span style={{ color: 'var(--color-secondary)', fontSize: '0.55rem' }}>◆</span>
          <div style={{ height: '1.2px', width: '30px', backgroundColor: 'var(--color-border)' }}></div>
        </div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto' }}>
          Official Delegate Handbook & Conference Guide — PMUN Nagpur 2026-27
        </p>
      </div>

      {/* Section A: About United Nations */}
      <section style={{ marginBottom: '5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '0.75rem', marginBottom: '1.75rem' }}>
          <Landmark size={28} style={{ color: 'var(--color-secondary)' }} />
          <h2 style={{ fontSize: '1.6rem', color: 'var(--color-primary)', margin: 0, fontWeight: 700 }}>
            A. The United Nations Organization
          </h2>
        </div>
        
        <p style={{ fontSize: '0.98rem', color: 'var(--color-text-main)', lineHeight: '1.8', marginBottom: '2rem' }}>
          The <strong>United Nations (UN)</strong> is an international organization founded in 1945 in the aftermath of World War II. It began with 51 countries collaborating to create a multilateral platform dedicated to maintaining global peace and stability. Over the years, more nations joined, and today the UN boasts <strong>193 member states</strong> working to maintain international security, protect human rights, and deliver humanitarian aid.
        </p>

        <h3 style={{ fontSize: '1.15rem', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1.25rem' }}>
          The Six Principal Organs:
        </h3>
        
        <div className="grid grid-cols-3">
          {organs.map((organ, idx) => (
            <Card key={idx} hoverable={true} elevation="sm" style={{ padding: '1.5rem' }}>
              <h4 style={{ color: 'var(--color-secondary)', fontSize: '1rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                {idx + 1}. {organ.name}
              </h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: '1.5', margin: 0 }}>
                {organ.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Section B: Topics for PMUN Nagpur */}
      <section style={{ marginBottom: '5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '0.75rem', marginBottom: '1.75rem' }}>
          <BookText size={28} style={{ color: 'var(--color-secondary)' }} />
          <h2 style={{ fontSize: '1.6rem', color: 'var(--color-primary)', margin: 0, fontWeight: 700 }}>
            B. Conference Agendas (PMUN 2026-27)
          </h2>
        </div>
        
        <p style={{ fontSize: '0.98rem', color: 'var(--color-text-main)', lineHeight: '1.8', marginBottom: '2rem' }}>
          For the <strong>Podar Nagpur Model United Nations 2026-27</strong>, our executive committee has defined four specialized agendas mapping to critical global issues:
        </p>

        <Card elevation="sm" style={{ padding: '2rem' }}>
          <ol style={{ margin: 0, paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {agendas.map((agenda, idx) => (
              <li key={idx} style={{ fontSize: '0.95rem', color: 'var(--color-text-main)', lineHeight: '1.5' }}>
                <strong style={{ color: 'var(--color-primary)', marginRight: '6px' }}>{agenda.committee}:</strong>
                {agenda.title}
              </li>
            ))}
          </ol>
        </Card>
      </section>

      {/* Section C: Model United Nations & Purpose */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '0.75rem', marginBottom: '1.75rem' }}>
          <Star size={28} style={{ color: 'var(--color-secondary)' }} />
          <h2 style={{ fontSize: '1.6rem', color: 'var(--color-primary)', margin: 0, fontWeight: 700 }}>
            C. Model United Nations (MUN) & Purpose
          </h2>
        </div>
        
        <p style={{ fontSize: '0.98rem', color: 'var(--color-text-main)', lineHeight: '1.8', marginBottom: '2.5rem' }}>
          <strong>Model United Nations (MUN)</strong> is an academic simulation that replicates the structural flow of a sovereign UN conference. Students assume the role of delegates representing specific nations and debate, write policies, and vote on international resolutions.
        </p>

        <div className="grid grid-cols-2">
          {/* Card 1: Offer */}
          <Card elevation="md" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Landmark size={20} style={{ color: 'var(--color-secondary)' }} />
              <h4 style={{ color: 'var(--color-primary)', fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                What does PMUN offer delegates?
              </h4>
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
              <li>
                <strong>Global Dialogue:</strong> Explore structural international tensions through deep policy research and consensus building.
              </li>
              <li>
                <strong>Oratory & Leadership:</strong> Express policies clearly before the assembly, drafting working papers and moderating debates.
              </li>
              <li>
                <strong>Consensus & Cooperation:</strong> Master political negotiations, compromise, and legislative resolution drafting.
              </li>
              <li>
                <strong>Analytical Skills:</strong> Learn to research, summarize, and defend national briefs on complex economic or social topics.
              </li>
            </ul>
          </Card>

          {/* Card 2: Why School */}
          <Card elevation="md" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <School size={20} style={{ color: 'var(--color-secondary)' }} />
              <h4 style={{ color: 'var(--color-primary)', fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                Why does Podar Nagpur conduct MUN?
              </h4>
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
              <li>
                <strong>Academic Integration:</strong> Promotes thought leadership and global education values inside and outside the classroom.
              </li>
              <li>
                <strong>Student Agencies:</strong> Develops student organizing capacity by trusting senior classes to chair and moderate committees.
              </li>
              <li>
                <strong>Community Branding:</strong> Collaborates with peer educational networks to demonstrate Nagpurs commitment to student leadership.
              </li>
            </ul>
          </Card>
        </div>
      </section>

      {/* Section D: PMUN Session Dates & Conference Timeline */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '0.75rem', marginBottom: '1.75rem' }}>
          <Calendar size={28} style={{ color: 'var(--color-secondary)' }} />
          <h2 style={{ fontSize: '1.6rem', color: 'var(--color-primary)', margin: 0, fontWeight: 700 }}>
            D. Important Dates & Conference Schedule
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.75rem' }} className="about-dates-grid">
          {/* Preparatory Training Sessions */}
          <Card elevation="sm" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--color-primary)', margin: '0 0 1rem 0', fontWeight: 700 }}>
              Preparatory Training Sessions
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: '1.6', marginBottom: '1.25rem' }}>
              Essential preparation sessions covering research, speech delivery, draft resolutions, and Rules of Procedure.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {[
                { date: '15th October 2026', day: 'Thursday' },
                { date: '16th October 2026', day: 'Friday' },
                { date: '17th October 2026', day: 'Saturday' },
                { date: '21st October 2026', day: 'Wednesday' },
                { date: '28th October 2026', day: 'Wednesday' },
              ].map((s, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.85rem', backgroundColor: 'var(--color-bg-main)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                  <strong style={{ color: 'var(--color-primary)', fontSize: '0.88rem' }}>{s.date}</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{s.day}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Simulation & Final Conference */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Card elevation="sm" style={{ padding: '1.75rem', backgroundColor: 'rgba(217, 119, 6, 0.05)', border: '1.5px solid rgba(217, 119, 6, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.35rem' }}>
                <Clock size={18} style={{ color: '#d97706' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#d97706' }}>
                  Mock Simulation
                </span>
              </div>
              <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.15rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                20th November 2026 (Friday)
              </h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Dry-run simulation for all delegates to rehearse speeches, point-of-orders, and caucus procedures.
              </p>
            </Card>

            <Card elevation="md" style={{ padding: '1.75rem', backgroundColor: 'rgba(13, 148, 136, 0.08)', border: '2px solid var(--color-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.35rem' }}>
                <CheckCircle size={18} style={{ color: 'var(--color-secondary)' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-secondary)' }}>
                  Final Session (1-Day Official Conference)
                </span>
              </div>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: 'var(--color-primary)', fontWeight: 800 }}>
                21st November 2026 (Saturday)
              </h4>
              <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', padding: '0.65rem 0.85rem', fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                • 8:30 AM - 10:30 AM: Opening Ceremony & GSL Setup<br />
                • 10:45 AM - 1:00 PM: Moderated Caucus & Debate<br />
                • 1:45 PM - 3:45 PM: Unmoderated Caucus & Resolution Drafting<br />
                • 4:00 PM - 5:30 PM: Voting Procedure & Closing Ceremony
              </div>
            </Card>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .about-dates-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
