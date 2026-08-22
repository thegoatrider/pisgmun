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

  const formatIST = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return dateStr;
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // In-Charge Messaging state & handlers
  const [messages, setMessages] = useState<any[]>([]);
  const [activeMsgRecipient, setActiveMsgRecipient] = useState<string>('');
  const [newMsgContent, setNewMsgContent] = useState('');
  const [isMsgSending, setIsMsgSending] = useState(false);

  // Sync recipient default once grade is loaded
  useEffect(() => {
    if (inChargeGrade && !activeMsgRecipient) {
      setActiveMsgRecipient(`grade_${inChargeGrade}`);
    }
  }, [inChargeGrade, activeMsgRecipient]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages?_=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (statusFilter === 'MESSAGES') {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000); // Poll STAT every 5s
      return () => clearInterval(interval);
    }
  }, [statusFilter]);

  const handleSendInChargeMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsgContent.trim() || !activeMsgRecipient) return;
    setIsMsgSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipient_id: activeMsgRecipient,
          content: newMsgContent.trim()
        })
      });
      if (res.ok) {
        setNewMsgContent('');
        const refreshRes = await fetch('/api/messages');
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          setMessages(data);
        }
      } else {
        const err = await res.json().catch(() => ({ error: 'Failed to send message.' }));
        alert(err.error);
      }
    } catch (err) {
      alert('Network error.');
    } finally {
      setIsMsgSending(false);
    }
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
        {statusFilter !== 'MESSAGES' ? (
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
        ) : (
          <div />
        )}

        {/* Tab Filters */}
        <div style={{ display: 'flex', gap: '6px', backgroundColor: 'var(--color-border)', padding: '3px', borderRadius: 'var(--radius-md)' }}>
          {['ALL', 'APPROVED', 'PENDING', 'REJECTED', 'MESSAGES'].map((f) => (
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
              {f === 'MESSAGES' ? 'Messages' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Roster Table or Messages Console */}
      {statusFilter === 'MESSAGES' ? (
        <Card elevation="md" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', minHeight: '480px' }}>
          <div style={{ display: 'flex', gap: '2rem' }} className="grid-responsive">
            {/* Left side: list of students */}
            <div style={{ flex: '0 0 280px', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--color-border)', paddingRight: '1.5rem', maxHeight: '480px', overflowY: 'auto' }}>
              <span style={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.5rem', display: 'block' }}>
                Chat Recipient
              </span>
              
              {/* Broadcast */}
              <button
                type="button"
                onClick={() => setActiveMsgRecipient(`grade_${inChargeGrade}`)}
                style={{
                  padding: '0.7rem 0.85rem',
                  textAlign: 'left',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid',
                  borderColor: activeMsgRecipient === `grade_${inChargeGrade}` ? 'var(--color-secondary)' : 'var(--color-border)',
                  backgroundColor: activeMsgRecipient === `grade_${inChargeGrade}` ? 'var(--color-secondary-bg)' : '#ffffff',
                  color: activeMsgRecipient === `grade_${inChargeGrade}` ? 'var(--color-secondary)' : 'var(--color-primary)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  marginBottom: '0.75rem'
                }}
              >
                📢 Broadcast: Grade {inChargeGrade}
              </button>

              <span style={{ fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.4rem', display: 'block' }}>
                Grade {inChargeGrade} Students
              </span>
              {gradeRegistrations.length === 0 ? (
                <p style={{ fontSize: '0.75rem', fontStyle: 'italic', color: 'var(--color-text-muted)' }}>No students registered.</p>
              ) : (
                gradeRegistrations.map(reg => (
                  <button
                    key={reg.id}
                    type="button"
                    onClick={() => setActiveMsgRecipient(reg.id)}
                    style={{
                      padding: '0.55rem 0.75rem',
                      textAlign: 'left',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid',
                      borderColor: activeMsgRecipient === reg.id ? 'var(--color-primary)' : 'var(--color-border)',
                      backgroundColor: activeMsgRecipient === reg.id ? 'var(--color-bg-main)' : '#ffffff',
                      color: 'var(--color-primary)',
                      cursor: 'pointer',
                      width: '100%',
                      marginBottom: '0.4rem',
                      fontSize: '0.78rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px'
                    }}
                  >
                    <span style={{ fontWeight: 700 }}>{reg.name}</span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>Section {reg.section} • {reg.id}</span>
                  </button>
                ))
              )}
            </div>

            {/* Right side: Chat list and message sender */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '480px' }}>
              <div style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border)', marginBottom: '1rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--color-primary)' }}>
                  Active Chat:{' '}
                  {activeMsgRecipient === `grade_${inChargeGrade}`
                    ? `📢 Grade ${inChargeGrade} Broadcast`
                    : `👤 ${gradeRegistrations.find(r => r.id === activeMsgRecipient)?.name || activeMsgRecipient}`}
                </span>
              </div>

              {/* Chat messages list */}
              <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1rem', backgroundColor: 'var(--color-bg-main)', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                {messages.filter(msg => {
                  const roleStr = `in_charge_${inChargeGrade}`;
                  return (msg.recipient_id === activeMsgRecipient && msg.sender_role === roleStr) ||
                         (msg.sender_id === activeMsgRecipient && msg.sender_role === 'delegate' && msg.recipient_id === roleStr);
                }).length === 0 ? (
                  <div style={{ margin: 'auto', color: 'var(--color-text-muted)', fontSize: '0.78rem', fontStyle: 'italic' }}>
                    No messages in this chat yet.
                  </div>
                ) : (
                  messages
                    .filter(msg => {
                      const roleStr = `in_charge_${inChargeGrade}`;
                      return (msg.recipient_id === activeMsgRecipient && msg.sender_role === roleStr) ||
                             (msg.sender_id === activeMsgRecipient && msg.sender_role === 'delegate' && msg.recipient_id === roleStr);
                    })
                    .map(msg => (
                      <div
                        key={msg.id}
                        style={{
                          alignSelf: msg.sender_role.startsWith('in_charge_') ? 'flex-end' : 'flex-start',
                          backgroundColor: msg.sender_role.startsWith('in_charge_') ? 'var(--color-secondary-bg)' : '#ffffff',
                          border: msg.sender_role.startsWith('in_charge_') ? '1px solid var(--color-secondary)' : '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-md)',
                          padding: '0.6rem 0.85rem',
                          maxWidth: '80%',
                          fontSize: '0.8rem',
                          color: 'var(--color-primary)',
                          boxShadow: 'var(--shadow-sm)'
                        }}
                      >
                        <div style={{ fontWeight: 700, fontSize: '0.65rem', color: msg.sender_role.startsWith('in_charge_') ? 'var(--color-secondary)' : 'var(--color-primary)', marginBottom: '3px', textTransform: 'uppercase' }}>
                          {msg.sender_role.startsWith('in_charge_') ? `You (Grade ${inChargeGrade} In-Charge)` : `${gradeRegistrations.find(r => r.id === msg.sender_id)?.name || msg.sender_id} (Delegate)`}
                        </div>
                        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.content}</div>
                        <div style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', textAlign: 'right', marginTop: '4px' }}>
                          {formatIST(msg.sent_at)}
                        </div>
                      </div>
                    ))
                )}
              </div>

              {/* Chat sender input */}
              <form onSubmit={handleSendInChargeMessage} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Type your grade announcement here..."
                  value={newMsgContent}
                  onChange={(e) => setNewMsgContent(e.target.value)}
                  className="form-control"
                  style={{ flex: 1 }}
                  disabled={isMsgSending}
                />
                <Button type="submit" variant="primary" loading={isMsgSending} style={{ padding: '0.65rem 1.5rem' }}>
                  Send
                </Button>
              </form>
            </div>
          </div>
        </Card>
      ) : (
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
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{reg.name}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                      Reg At: {formatIST(reg.created_at)}
                    </div>
                  </td>
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
      )}

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
