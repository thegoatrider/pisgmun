import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { Users, ChevronRight, Loader2 } from 'lucide-react';

export const Committees: React.FC = () => {
  const { committees, isLoading } = useAuth();
  const navigate = useNavigate();

  const getCommitteeGrades = (commId: string) => {
    // ECOSOC, UNICEF, UNHRC -> Grades 9-10. Others (UNEP, UN Women, FAO) -> Grades 7-8
    const id = commId.toLowerCase();
    if (id === 'ecosoc' || id === 'unicef' || id === 'unhrc') {
      return 'Grades 9 • 10';
    }
    return 'Grades 7 • 8';
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', width: '100%', height: '50vh', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="spin" size={32} style={{ color: 'var(--color-secondary)' }} />
      </div>
    );
  }

  return (
    <div className="container section fade-in">
      {/* Page Header */}
      <div className="text-center" style={{ marginBottom: '3.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary)', fontWeight: 700 }}>
          PMUN Nagpur Committees
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', margin: '0.5rem 0 1.25rem 0' }}>
          <div style={{ height: '1.2px', width: '30px', backgroundColor: 'var(--color-border)' }}></div>
          <span style={{ color: 'var(--color-secondary)', fontSize: '0.55rem' }}>◆</span>
          <div style={{ height: '1.2px', width: '30px', backgroundColor: 'var(--color-border)' }}></div>
        </div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>
          Explore our list of simulated committees, agendas, eligibility criteria, and preparation resources.
        </p>
      </div>

      {/* Grid mapping over committees */}
      <div className="grid grid-cols-3">
        {committees.map((comm) => (
          <Card
            key={comm.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '350px',
              padding: '2rem 1.75rem',
            }}
          >
            {/* Header info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <Badge status={comm.status} />
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: 'var(--color-accent-gold)',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                  }}
                >
                  {comm.id.toUpperCase()}
                </span>
              </div>

              <h3
                style={{
                  fontSize: '1.2rem',
                  fontFamily: 'var(--font-display)',
                  color: 'var(--color-primary)',
                  margin: 0,
                  lineHeight: '1.3',
                }}
              >
                {comm.name}
              </h3>

              {/* Spacing dividers */}
              <div style={{ height: '1px', backgroundColor: 'var(--color-border)' }} />

              {/* Eligibility */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                <Users size={14} style={{ color: 'var(--color-secondary)' }} />
                <span>Eligibility: {getCommitteeGrades(comm.id)}</span>
              </div>

              {/* Agenda */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  Agenda
                </span>
                <p
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--color-text-main)',
                    fontWeight: 600,
                    lineHeight: '1.4',
                    margin: 0,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {comm.agenda}
                </p>
              </div>
            </div>

            {/* CTA action */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/committees/${comm.id}`)}
              style={{ width: '100%', marginTop: '1.5rem' }}
            >
              View Details
              <ChevronRight size={14} />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};
