import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/UI/Card';
import { Badge } from '../../components/UI/Badge';
import { Button } from '../../components/UI/Button';
import { Loader2, Download, Search, LogOut } from 'lucide-react';

export const InChargeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { registrations, committees, logout, isLoading } = useAuth();

  const [inChargeGrade, setInChargeGrade] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    const storedGrade = localStorage.getItem('pmun_session_incharge_grade');
    if (storedGrade) {
      setInChargeGrade(parseInt(storedGrade));
    } else {
      // If no grade found, force log out
      logout().then(() => navigate('/login'));
    }
  }, [logout, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Filter registrations for this grade
  const gradeRegistrations = registrations.filter((r) => r.grade === inChargeGrade);

  // Stats calculation
  const totalCount = gradeRegistrations.length;
  const approvedCount = gradeRegistrations.filter((r) => r.status === 'APPROVED').length;
  const pendingCount = gradeRegistrations.filter((r) => r.status === 'PENDING' || r.status === 'NOT ASSIGNED').length;
  const rejectedCount = gradeRegistrations.filter((r) => r.status === 'REJECTED').length;

  // Filter by search query and status filter
  const filteredRegs = gradeRegistrations.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.school.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || 
                          (statusFilter === 'APPROVED' && r.status === 'APPROVED') ||
                          (statusFilter === 'PENDING' && (r.status === 'PENDING' || r.status === 'NOT ASSIGNED')) ||
                          (statusFilter === 'REJECTED' && r.status === 'REJECTED');

    return matchesSearch && matchesStatus;
  });

  // Direct CSV Exporter
  const handleExportCSV = () => {
    if (gradeRegistrations.length === 0) {
      alert('No registrations available to export.');
      return;
    }

    const headers = [
      'Registration ID',
      'Full Name',
      'Grade',
      'Section',
      'School',
      'Email',
      'Phone',
      'Portfolio Preference',
      'MUN Experience',
      'Preferred Committee',
      'Country Preference',
      'Assigned Committee',
      'Assigned Country',
      'Status'
    ];

    const csvContent = [
      headers.join(','),
      ...gradeRegistrations.map((r) =>
        [
          r.id,
          `"${r.name.replace(/"/g, '""')}"`,
          r.grade,
          r.section,
          `"${r.school.replace(/"/g, '""')}"`,
          r.email,
          r.phone,
          r.portfolio_preference,
          `"${(r.mun_experience || 'First time delegate').replace(/"/g, '""')}"`,
          r.preferred_committee,
          `"${r.country_preferences.join('; ')}"`,
          r.committee,
          r.assigned_country,
          r.status
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `PMUN_Grade_${inChargeGrade}_Roster.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading || inChargeGrade === null) {
    return (
      <div style={{ display: 'flex', width: '100%', height: '50vh', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="spin" size={32} style={{ color: 'var(--color-secondary)' }} />
      </div>
    );
  }

  // Get committees of this grade
  const gradeCommittees = committees.filter((c) => {
    // ECOSOC, UNICEF, UNHRC -> Grades 9-10. UNEP, UN Women, FAO -> Grades 7-8
    const id = c.id.toLowerCase();
    if (inChargeGrade === 8 || inChargeGrade === 7) {
      return ['unep', 'un-women', 'fao'].includes(id);
    } else {
      return ['unhrc', 'unicef', 'ecosoc'].includes(id);
    }
  });

  return (
    <div className="section fade-in" style={{ width: '100%', maxWidth: '1440px', margin: '0 auto', paddingLeft: 'var(--space-lg)', paddingRight: 'var(--space-lg)' }}>
      {/* Welcome Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--color-border)', paddingBottom: '1.5rem', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }} className="welcome-header">
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '1px' }}>
            Staff Panel
          </span>
          <h2 style={{ fontSize: '2rem', color: 'var(--color-primary)', margin: '0.25rem 0 0 0' }}>
            Grade {inChargeGrade} In-Charge Portal
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download size={14} /> Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut size={14} /> Logout
          </Button>
        </div>
      </div>

      {/* Roster Statistics Cards */}
      <div className="grid grid-cols-4" style={{ marginBottom: '2.5rem' }}>
        <Card elevation="sm" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1.5rem', textAlign: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Total Registrations
          </span>
          <strong style={{ fontSize: '1.8rem', color: 'var(--color-primary)' }}>{totalCount}</strong>
        </Card>
        <Card elevation="sm" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1.5rem', textAlign: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Approved Files
          </span>
          <strong style={{ fontSize: '1.8rem', color: 'var(--color-success)' }}>{approvedCount}</strong>
        </Card>
        <Card elevation="sm" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1.5rem', textAlign: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Pending Files
          </span>
          <strong style={{ fontSize: '1.8rem', color: 'var(--color-warning)' }}>{pendingCount}</strong>
        </Card>
        <Card elevation="sm" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1.5rem', textAlign: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Declined Files
          </span>
          <strong style={{ fontSize: '1.8rem', color: 'var(--color-error)' }}>{rejectedCount}</strong>
        </Card>
      </div>

      {/* Committee Capacities Overlay */}
      <Card elevation="md" style={{ padding: '1.5rem 2rem', marginBottom: '2.5rem' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.15rem', color: 'var(--color-primary)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>
          Assigned Grade Committees Allocation
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }} className="grid-responsive">
          {gradeCommittees.map((comm) => {
            const count = registrations.filter((r) => r.committee === comm.id && r.status === 'APPROVED').length;
            const percentage = Math.min((count / comm.capacity) * 100, 100);

            return (
              <div key={comm.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                  <span>{comm.id.toUpperCase()}</span>
                  <span>{count} / {comm.capacity} Approved</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--color-border)', borderRadius: 'var(--radius-round)', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${percentage}%`,
                      height: '100%',
                      backgroundColor: percentage >= 90 ? 'var(--color-error)' : 'var(--color-secondary)',
                      borderRadius: 'var(--radius-round)',
                      transition: 'width var(--transition-normal)',
                    }}
                  />
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontStyle: 'italic', display: 'block' }}>
                  {comm.name}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Roster Filters Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }} className="filters-header">
        {/* Search */}
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder="Search roster..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-control"
            style={{ paddingLeft: '38px', width: '100%' }}
          />
        </div>

        {/* Tab Filters */}
        <div style={{ display: 'flex', gap: '6px', backgroundColor: 'var(--color-border)', padding: '3px', borderRadius: 'var(--radius-md)' }}>
          {['ALL', 'APPROVED', 'PENDING', 'REJECTED'].map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              style={{
                border: 'none',
                background: statusFilter === f ? 'var(--color-bg-surface)' : 'transparent',
                color: statusFilter === f ? 'var(--color-primary)' : 'var(--color-text-muted)',
                padding: '0.45rem 1rem',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                borderRadius: 'var(--radius-sm)',
                boxShadow: statusFilter === f ? 'var(--shadow-sm)' : 'none',
                transition: 'all var(--transition-fast)',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Roster Table */}
      <div className="table-responsive">
        <table className="table table-compact">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Sec</th>
              <th>School</th>
              <th>Choice (Comm/Country)</th>
              <th>Allocated Portfolio</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredRegs.map((reg) => (
              <tr key={reg.id}>
                <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{reg.id}</td>
                <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{reg.name}</td>
                <td>{reg.section}</td>
                <td style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={reg.school}>{reg.school}</td>
                <td style={{ fontSize: '0.82rem' }}>
                  <div style={{ fontWeight: 600 }}>{reg.preferred_committee.toUpperCase()}</div>
                  <div style={{ color: 'var(--color-text-muted)' }}>{reg.country_preferences[0]}</div>
                </td>
                <td style={{ fontSize: '0.82rem' }}>
                  {reg.committee !== 'NOT ASSIGNED' ? (
                    <div>
                      <strong style={{ color: 'var(--color-secondary)' }}>{reg.assigned_country}</strong>
                      <span style={{ color: 'var(--color-text-muted)', marginLeft: '4px' }}>({reg.committee.toUpperCase()})</span>
                    </div>
                  ) : (
                    <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Pending Allocation</span>
                  )}
                </td>
                <td>
                  <Badge status={reg.status} />
                </td>
              </tr>
            ))}
            {filteredRegs.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center" style={{ padding: '3rem', color: 'var(--color-text-muted)' }}>
                  No delegates found matching the active search / filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        @media (max-width: 800px) {
          .filters-header {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .filters-header > div {
            width: 100% !important;
          }
          .filters-header select {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};
