import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API, type Registration, type SystemConfig } from '../../services/api';
import { Card } from '../../components/UI/Card';
import { Input } from '../../components/UI/Input';
import { Button } from '../../components/UI/Button';
import { Badge } from '../../components/UI/Badge';
import { Modal } from '../../components/UI/Modal';
import { Loader2, Download, Search, Settings, BookOpen, KeyRound, Save, CheckCircle, XCircle, Trash2, Edit3, LogOut } from 'lucide-react';

export const CoordinatorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    registrations,
    committees,
    countries,
    config,
    logout,
    refreshData,
    isLoading: contextLoading
  } = useAuth();

  const [activeTab, setActiveTab] = useState('overview');

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('ALL');
  const [committeeFilter, setCommitteeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Selected Delegate for Modal
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);

  const [isActionLoading, setIsActionLoading] = useState(false);
  const [selectedRegIds, setSelectedRegIds] = useState<string[]>([]);

  // Configuration Form State
  const [configStatus, setConfigStatus] = useState<'OPEN' | 'CLOSED'>('OPEN');
  const [configDeadline, setConfigDeadline] = useState('');
  const [configSwitch, setConfigSwitch] = useState(false);
  const [isConfigSaving, setIsConfigSaving] = useState(false);

  // Passwords Form State
  const [passwords, setPasswords] = useState({
    coordinator: '',
    in_charge_7: '',
    in_charge_8: '',
    in_charge_9: '',
    in_charge_10: '',
  });
  const [isPasswordsSaving, setIsPasswordsSaving] = useState(false);

  // Committee Config State
  const [selectedCommId, setSelectedCommId] = useState('');
  const [commForm, setCommForm] = useState({
    name: '',
    agenda: '',
    description: '',
    eb_chair: '',
    eb_vice_chair: '',
    eb_rapporteur: '',
    capacity: 50,
    status: 'OPEN' as 'OPEN' | 'CLOSED',
  });
  const [isCommSaving, setIsCommSaving] = useState(false);

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

  // Sync config state
  useEffect(() => {
    if (config) {
      setConfigStatus(config.registration_status || 'OPEN');
      if (config.deadline) {
        // Format ISO string to datetime-local input format (YYYY-MM-DDThh:mm)
        const date = new Date(config.deadline);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const hh = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');
        setConfigDeadline(`${yyyy}-${mm}-${dd}T${hh}:${min}`);
      }
      setConfigSwitch(config.allow_switch_committee || false);
    }
  }, [config]);

  // Sync default committee select
  useEffect(() => {
    if (committees.length > 0 && !selectedCommId) {
      setSelectedCommId(committees[0].id);
    }
  }, [committees, selectedCommId]);

  // Reset selection when tab or filters change
  useEffect(() => {
    setSelectedRegIds([]);
  }, [activeTab, searchQuery, gradeFilter, committeeFilter, statusFilter]);

  // Sync committee editor form
  useEffect(() => {
    if (selectedCommId) {
      const comm = committees.find((c) => c.id === selectedCommId);
      if (comm) {
        setCommForm({
          name: comm.name,
          agenda: comm.agenda,
          description: comm.description,
          eb_chair: comm.eb_chair,
          eb_vice_chair: comm.eb_vice_chair,
          eb_rapporteur: comm.eb_rapporteur,
          capacity: comm.capacity,
          status: comm.status,
        });
      }
    }
  }, [selectedCommId, committees]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // 1. Save System Settings
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfigSaving(true);
    try {
      const payload: SystemConfig = {
        registration_status: configStatus,
        deadline: new Date(configDeadline).toISOString(),
        allow_switch_committee: configSwitch,
      };
      await API.updateConfig(payload);
      alert('System configurations updated successfully!');
      await refreshData();
    } catch (err: any) {
      alert(`Failed to save settings: ${err.message}`);
    } finally {
      setIsConfigSaving(false);
    }
  };

  // 2. Save Committee configurations
  const handleSaveCommittee = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCommSaving(true);
    try {
      await API.updateCommittee(selectedCommId, commForm);
      alert('Committee settings updated successfully!');
      await refreshData();
    } catch (err: any) {
      alert(`Failed to save committee configurations: ${err.message}`);
    } finally {
      setIsCommSaving(false);
    }
  };

  // 3. Save passwords
  const handleSavePasswords = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out blank passwords
    const activePayload: Record<string, string> = {};
    Object.entries(passwords).forEach(([key, val]) => {
      if (val.trim()) activePayload[key] = val.trim();
    });

    if (Object.keys(activePayload).length === 0) {
      alert('Please enter at least one password to update.');
      return;
    }

    setIsPasswordsSaving(true);
    try {
      await API.updatePasswords(activePayload);
      alert('Passwords updated successfully!');
      setPasswords({ coordinator: '', in_charge_7: '', in_charge_8: '', in_charge_9: '', in_charge_10: '' });
    } catch (err: any) {
      alert(`Failed to save passwords: ${err.message}`);
    } finally {
      setIsPasswordsSaving(false);
    }
  };

  // 4. Open allocation details modal
  const handleOpenAllocation = (reg: Registration) => {
    setSelectedReg(reg);
    setIsAllocationModalOpen(true);
  };

  // 5. Approve Delegate Registration
  const handleApproveRegistration = async (reg: Registration) => {
    if (!reg) return;
    const prefComm = reg.preferred_committee;
    const prefCountry = reg.country_preferences && reg.country_preferences[0];

    if (!prefComm || !prefCountry) {
      alert('Missing preferred committee or country for this candidate.');
      return;
    }

    // Check if the country is already taken by someone else
    const isTaken = countries.some(
      (c) =>
        c.committee_id.toLowerCase() === prefComm.toLowerCase() &&
        c.country_name.toLowerCase() === prefCountry.toLowerCase() &&
        c.assigned_to &&
        c.assigned_to !== reg.id
    );
    if (isTaken) {
      alert(`The preferred country '${prefCountry}' in '${prefComm.toUpperCase()}' is already taken by another approved delegate.`);
      return;
    }

    if (!window.confirm(`Are you sure you want to APPROVE ${reg.name}'s registration?`)) return;

    setIsActionLoading(true);
    try {
      // 1. Update Registration Table
      await API.updateRegistration(reg.id, {
        committee: prefComm,
        assigned_country: prefCountry,
        status: 'APPROVED',
      });

      // 2. Lock country in database
      const countryObj = countries.find(
        (c) =>
          c.committee_id.toLowerCase() === prefComm.toLowerCase() &&
          c.country_name.toLowerCase() === prefCountry.toLowerCase()
      );
      if (countryObj) {
        await API.updateCountry(countryObj.id, { assigned_to: reg.id, available: false });
      }

      alert('Registration approved successfully!');
      setIsAllocationModalOpen(false);
      setSelectedReg(null);
      await refreshData();
    } catch (err: any) {
      alert(`Approval failed: ${err.message}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  // 6. Reject Application
  const handleRejectRegistration = async (reg: Registration) => {
    if (!window.confirm(`Are you sure you want to REJECT ${reg.name}'s registration?`)) return;

    setIsActionLoading(true);
    try {
      await API.updateRegistration(reg.id, {
        status: 'REJECTED',
      });

      // Free up country if they were previously allocated
      if (reg.committee !== 'NOT ASSIGNED' && reg.assigned_country !== 'NOT ASSIGNED') {
        const country = countries.find(
          (c) =>
            c.committee_id.toLowerCase() === reg.committee.toLowerCase() &&
            c.country_name.toLowerCase() === reg.assigned_country.toLowerCase()
        );
        if (country && country.assigned_to === reg.id) {
          await API.updateCountry(country.id, { assigned_to: null, available: true });
        }
      }

      alert('Registration status set to REJECTED.');
      setIsAllocationModalOpen(false);
      setSelectedReg(null);
      await refreshData();
    } catch (err: any) {
      alert(`Failed to reject registration: ${err.message}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  // 7. Revoke Approved Allocation
  const handleRevokeAllocation = async (reg: Registration) => {
    if (!window.confirm(`Are you sure you want to REVOKE country assignments for ${reg.name}?`)) return;

    setIsActionLoading(true);
    try {
      // 1. Reset registration
      await API.updateRegistration(reg.id, {
        committee: 'NOT ASSIGNED',
        assigned_country: 'NOT ASSIGNED',
        status: 'PENDING',
      });

      // 2. Free up allocated country
      if (reg.committee !== 'NOT ASSIGNED' && reg.assigned_country !== 'NOT ASSIGNED') {
        const country = countries.find(
          (c) =>
            c.committee_id.toLowerCase() === reg.committee.toLowerCase() &&
            c.country_name.toLowerCase() === reg.assigned_country.toLowerCase()
        );
        if (country && country.assigned_to === reg.id) {
          await API.updateCountry(country.id, { assigned_to: null, available: true });
        }
      }

      alert('Allocation revoked successfully. Roster file reset to PENDING.');
      setIsAllocationModalOpen(false);
      setSelectedReg(null);
      await refreshData();
    } catch (err: any) {
      alert(`Failed to revoke allocation: ${err.message}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  // 8. Delete Registration (Soft clean)
  const handleDeleteRegistration = async (reg: Registration) => {
    if (!window.confirm(`WARNING: Are you sure you want to permanently DELETE ${reg.name}? This cannot be undone.`)) return;

    setIsActionLoading(true);
    try {
      // Free country first
      if (reg.committee !== 'NOT ASSIGNED' && reg.assigned_country !== 'NOT ASSIGNED') {
        const country = countries.find(
          (c) =>
            c.committee_id.toLowerCase() === reg.committee.toLowerCase() &&
            c.country_name.toLowerCase() === reg.assigned_country.toLowerCase()
        );
        if (country && country.assigned_to === reg.id) {
          await API.updateCountry(country.id, { assigned_to: null, available: true });
        }
      }

      await API.deleteRegistration(reg.id);
      alert('Registration deleted successfully.');
      setIsAllocationModalOpen(false);
      setSelectedReg(null);
      await refreshData();
    } catch (err: any) {
      alert(`Failed to delete registration: ${err.message}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  // CSV Exporter for all registrations
  const handleExportAllCSV = () => {
    if (registrations.length === 0) {
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
      ...registrations.map((r) =>
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
    link.setAttribute('download', 'PMUN_Nagpur_All_Registrations.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Roster filtering logic
  const filteredRegs = registrations.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.school.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGrade = gradeFilter === 'ALL' || r.grade.toString() === gradeFilter;

    const matchesComm = committeeFilter === 'ALL' || r.preferred_committee.toLowerCase() === committeeFilter.toLowerCase();

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'APPROVED' && r.status === 'APPROVED') ||
      (statusFilter === 'PENDING' && (r.status === 'PENDING' || r.status === 'NOT ASSIGNED')) ||
      (statusFilter === 'REJECTED' && r.status === 'REJECTED');

    return matchesSearch && matchesGrade && matchesComm && matchesStatus;
  });

  const isAllSelected = filteredRegs.length > 0 && filteredRegs.every(r => selectedRegIds.includes(r.id));
  const isSomeSelected = filteredRegs.length > 0 && filteredRegs.some(r => selectedRegIds.includes(r.id));

  const handleSelectAll = () => {
    if (isAllSelected) {
      const filteredIds = filteredRegs.map(r => r.id);
      setSelectedRegIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      const filteredIds = filteredRegs.map(r => r.id);
      setSelectedRegIds(prev => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedRegIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBatchApprove = async () => {
    const selectedRegs = registrations.filter(r => selectedRegIds.includes(r.id));
    if (selectedRegs.length === 0) return;

    const unapprovedRegs = selectedRegs.filter(r => r.status !== 'APPROVED');
    if (unapprovedRegs.length === 0) {
      alert('All selected registrations are already approved.');
      return;
    }

    const takenWarnings: string[] = [];
    const selectionConflicts = new Set<string>();
    const allocatedMap = new Map<string, string>();

    for (const reg of unapprovedRegs) {
      const prefComm = reg.preferred_committee;
      const prefCountry = reg.country_preferences && reg.country_preferences[0];
      if (!prefComm || !prefCountry) continue;

      const key = `${prefComm.toLowerCase()}_${prefCountry.toLowerCase()}`;
      
      const isTakenInDb = countries.some(
        (c) =>
          c.committee_id.toLowerCase() === prefComm.toLowerCase() &&
          c.country_name.toLowerCase() === prefCountry.toLowerCase() &&
          c.assigned_to &&
          c.assigned_to !== reg.id &&
          !selectedRegIds.includes(c.assigned_to)
      );

      if (isTakenInDb) {
        takenWarnings.push(`${reg.name} (${prefCountry} under ${prefComm.toUpperCase()})`);
      }

      if (allocatedMap.has(key)) {
        selectionConflicts.add(`${prefCountry} under ${prefComm.toUpperCase()}`);
      } else {
        allocatedMap.set(key, reg.id);
      }
    }

    if (takenWarnings.length > 0) {
      alert(`The following allocations are already taken by other approved delegates in the database. Please resolve them first:\n- ${takenWarnings.join('\n- ')}`);
      return;
    }

    if (selectionConflicts.size > 0) {
      alert(`Multiple selected delegates have requested the same country allocations. Please resolve these conflicts before batch approving:\n- ${Array.from(selectionConflicts).join('\n- ')}`);
      return;
    }

    if (!window.confirm(`Are you sure you want to batch APPROVE the ${unapprovedRegs.length} selected registration(s)?`)) return;

    setIsActionLoading(true);
    let successCount = 0;
    let failCount = 0;

    for (const reg of unapprovedRegs) {
      const prefComm = reg.preferred_committee;
      const prefCountry = reg.country_preferences && reg.country_preferences[0];
      if (!prefComm || !prefCountry) continue;

      try {
        await API.updateRegistration(reg.id, {
          committee: prefComm,
          assigned_country: prefCountry,
          status: 'APPROVED',
        });

        const countryObj = countries.find(
          (c) =>
            c.committee_id.toLowerCase() === prefComm.toLowerCase() &&
            c.country_name.toLowerCase() === prefCountry.toLowerCase()
        );
        if (countryObj) {
          await API.updateCountry(countryObj.id, { assigned_to: reg.id, available: false });
        }
        successCount++;
      } catch (err) {
        console.error(`Failed to approve registration ${reg.id}:`, err);
        failCount++;
      }
    }

    alert(`Batch approval completed! Approved: ${successCount}, Failed: ${failCount}`);
    setSelectedRegIds([]);
    await refreshData();
    setIsActionLoading(false);
  };

  const handleBatchReject = async () => {
    const selectedRegs = registrations.filter(r => selectedRegIds.includes(r.id));
    if (selectedRegs.length === 0) return;

    const unrejectedRegs = selectedRegs.filter(r => r.status !== 'REJECTED');
    if (unrejectedRegs.length === 0) {
      alert('All selected registrations are already rejected.');
      return;
    }

    if (!window.confirm(`Are you sure you want to batch REJECT the ${unrejectedRegs.length} selected registration(s)?`)) return;

    setIsActionLoading(true);
    let successCount = 0;
    let failCount = 0;

    for (const reg of unrejectedRegs) {
      try {
        await API.updateRegistration(reg.id, {
          status: 'REJECTED',
        });

        if (reg.committee !== 'NOT ASSIGNED' && reg.assigned_country !== 'NOT ASSIGNED') {
          const country = countries.find(
            (c) =>
              c.committee_id.toLowerCase() === reg.committee.toLowerCase() &&
              c.country_name.toLowerCase() === reg.assigned_country.toLowerCase()
          );
          if (country && country.assigned_to === reg.id) {
            await API.updateCountry(country.id, { assigned_to: null, available: true });
          }
        }
        successCount++;
      } catch (err) {
        console.error(`Failed to reject registration ${reg.id}:`, err);
        failCount++;
      }
    }

    alert(`Batch rejection completed! Rejected: ${successCount}, Failed: ${failCount}`);
    setSelectedRegIds([]);
    await refreshData();
    setIsActionLoading(false);
  };

  // Calculate overview counts
  const totalCount = registrations.length;
  const approvedCount = registrations.filter((r) => r.status === 'APPROVED').length;
  const pendingCount = registrations.filter((r) => r.status === 'PENDING' || r.status === 'NOT ASSIGNED').length;

  const grade7Count = registrations.filter((r) => r.grade === 7).length;
  const grade8Count = registrations.filter((r) => r.grade === 8).length;
  const grade9Count = registrations.filter((r) => r.grade === 9).length;
  const grade10Count = registrations.filter((r) => r.grade === 10).length;



  const tabsConfig = [
    { id: 'overview', label: 'Overview & Settings' },
    { id: 'roster', label: `Roster File (${filteredRegs.length})` },
    { id: 'committees', label: 'Committees Config' },
    { id: 'passwords', label: 'Portal Passwords' },
  ];

  if (contextLoading) {
    return (
      <div style={{ display: 'flex', width: '100%', height: '50vh', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="spin" size={32} style={{ color: 'var(--color-secondary)' }} />
      </div>
    );
  }

  return (
    <div className="section fade-in" style={{ width: '100%', maxWidth: '1440px', margin: '0 auto', paddingLeft: 'var(--space-lg)', paddingRight: 'var(--space-lg)' }}>
      {/* Welcome Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--color-border)', paddingBottom: '1.5rem', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }} className="welcome-header">
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '1px' }}>
            Director Panel
          </span>
          <h2 style={{ fontSize: '2rem', color: 'var(--color-primary)', margin: '0.25rem 0 0 0' }}>
            MUN Coordinator Console
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="outline" size="sm" onClick={handleExportAllCSV}>
            <Download size={14} /> Export All CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut size={14} /> Logout
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2.5rem' }} className="admin-grid">
        {/* Left Side: Sidebar Tabs Navigation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {tabsConfig.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.85rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                fontWeight: 700,
                fontSize: '0.82rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                textAlign: 'left',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTab === tab.id ? 'var(--color-secondary)' : 'transparent',
                color: activeTab === tab.id ? '#ffffff' : 'var(--color-text-muted)',
                transition: 'all var(--transition-fast)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right Side: Tab Panel Content */}
        <div className="fade-in">
          {/* TAB 1: OVERVIEW & SETTINGS */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              {/* Stats Counters */}
              <div className="grid grid-cols-4">
                <Card elevation="sm" style={{ padding: '1.25rem', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Total Candidates</span>
                  <strong style={{ fontSize: '1.7rem', color: 'var(--color-primary)', display: 'block', marginTop: '0.25rem' }}>{totalCount}</strong>
                </Card>
                <Card elevation="sm" style={{ padding: '1.25rem', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Approved Portfolio</span>
                  <strong style={{ fontSize: '1.7rem', color: 'var(--color-success)', display: 'block', marginTop: '0.25rem' }}>{approvedCount}</strong>
                </Card>
                <Card elevation="sm" style={{ padding: '1.25rem', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Pending Approvals</span>
                  <strong style={{ fontSize: '1.7rem', color: 'var(--color-warning)', display: 'block', marginTop: '0.25rem' }}>{pendingCount}</strong>
                </Card>
                <Card elevation="sm" style={{ padding: '1.25rem', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Grade Roster (7/8/9/10)</span>
                  <strong style={{ fontSize: '1.3rem', color: 'var(--color-primary)', display: 'block', marginTop: '0.4rem', fontFamily: 'monospace' }}>
                    {grade7Count} • {grade8Count} • {grade9Count} • {grade10Count}
                  </strong>
                </Card>
              </div>

              {/* System Config Settings */}
              <Card elevation="md" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
                  <Settings size={20} style={{ color: 'var(--color-secondary)' }} />
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-primary)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>
                    Global Registration Settings
                  </h3>
                </div>

                <form onSubmit={handleSaveConfig} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="grid-responsive">
                    <div className="form-group">
                      <label className="form-label">Registration Status</label>
                      <select
                        value={configStatus}
                        onChange={(e) => setConfigStatus(e.target.value as any)}
                        className="form-control"
                      >
                        <option value="OPEN">OPEN - Accepting delegate files</option>
                        <option value="CLOSED">CLOSED - Registration disabled</option>
                      </select>
                    </div>

                    <Input
                      label="Closing Deadline (Nagpur Time)"
                      type="datetime-local"
                      value={configDeadline}
                      onChange={(e) => setConfigDeadline(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '0.25rem' }}>
                    <input
                      type="checkbox"
                      id="allow-switch"
                      checked={configSwitch}
                      onChange={(e) => setConfigSwitch(e.target.checked)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <label htmlFor="allow-switch" style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-primary)', cursor: 'pointer' }}>
                      Allow approved delegates to edit preferred choices directly from dashboard
                    </label>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    loading={isConfigSaving}
                    style={{ width: 'fit-content', padding: '0.65rem 2rem', marginTop: '0.5rem' }}
                  >
                    <Save size={14} /> Save Configurations
                  </Button>
                </form>
              </Card>

              {/* Committee Allocations Capacities */}
              <Card elevation="md" style={{ padding: '2rem' }}>
                <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.2rem', color: 'var(--color-primary)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>
                  Active Committee Allocations
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }} className="grid-responsive">
                  {committees.map((comm) => {
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
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          )}

          {/* TAB 2: ROSTER FILE MANAGER */}
          {activeTab === 'roster' && (
            <div>
              {/* Roster Filters Grid */}
              <Card elevation="sm" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.2fr 0.8fr 1fr 1fr',
                    gap: '1rem',
                  }}
                  className="roster-filters"
                >
                  <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--color-text-muted)' }} />
                    <input
                      type="text"
                      placeholder="Search name, ID or school..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="form-control"
                      style={{ paddingLeft: '34px', width: '100%' }}
                    />
                  </div>

                  <select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)} className="form-control">
                    <option value="ALL">All Grades</option>
                    <option value="7">Grade 7</option>
                    <option value="8">Grade 8</option>
                    <option value="9">Grade 9</option>
                    <option value="10">Grade 10</option>
                  </select>

                  <select value={committeeFilter} onChange={(e) => setCommitteeFilter(e.target.value)} className="form-control">
                    <option value="ALL">All Preferred Committees</option>
                    {committees.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.id.toUpperCase()} Choices
                      </option>
                    ))}
                  </select>

                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="form-control">
                    <option value="ALL">All Statuses</option>
                    <option value="APPROVED">APPROVED Only</option>
                    <option value="PENDING">PENDING Only</option>
                    <option value="REJECTED">REJECTED Only</option>
                  </select>
                </div>
              </Card>

              {/* Batch Actions Bar */}
              {selectedRegIds.length > 0 && (
                <div
                  className="fade-in"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0, 32, 74, 0.05)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem 1.5rem',
                    marginBottom: '1.25rem',
                    gap: '1rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                    {selectedRegIds.length} candidate{selectedRegIds.length > 1 ? 's' : ''} selected
                  </span>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleBatchApprove}
                      loading={isActionLoading}
                    >
                      <CheckCircle size={14} /> Approve Selected
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBatchReject}
                      loading={isActionLoading}
                      style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
                    >
                      <XCircle size={14} /> Reject Selected
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRegIds([])}
                      disabled={isActionLoading}
                    >
                      Deselect All
                    </Button>
                  </div>
                </div>
              )}

              {/* Roster Table */}
              <div className="table-responsive">
                <table className="table table-compact">
                  <thead>
                    <tr>
                      <th style={{ width: '40px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          ref={(el) => {
                            if (el) {
                              el.indeterminate = isSomeSelected && !isAllSelected;
                            }
                          }}
                          onChange={handleSelectAll}
                          style={{ cursor: 'pointer', transform: 'scale(1.1)' }}
                        />
                      </th>
                      <th>ID</th>
                      <th>Candidate Info</th>
                      <th>Grade/Sec</th>
                      <th>School</th>
                      <th>Country Choice</th>
                      <th>Allocated Portfolio</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRegs.map((reg) => (
                      <tr key={reg.id}>
                        <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                          <input
                            type="checkbox"
                            checked={selectedRegIds.includes(reg.id)}
                            onChange={() => handleSelectOne(reg.id)}
                            style={{ cursor: 'pointer', transform: 'scale(1.1)' }}
                          />
                        </td>
                        <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{reg.id}</td>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{reg.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{reg.email}</div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                            Reg At: {formatIST(reg.created_at)}
                          </div>
                        </td>
                        <td>{reg.grade} - {reg.section}</td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={reg.school}>{reg.school}</td>
                        <td style={{ fontSize: '0.82rem' }}>
                          <span style={{ fontWeight: 600 }}>{reg.preferred_committee.toUpperCase()}</span>: {reg.country_preferences[0]}
                        </td>
                        <td style={{ fontSize: '0.82rem' }}>
                          {reg.committee !== 'NOT ASSIGNED' ? (
                            <div>
                              <strong>{reg.assigned_country}</strong> ({reg.committee.toUpperCase()})
                            </div>
                          ) : (
                            <span style={{ fontStyle: 'italic', color: 'var(--color-text-muted)' }}>Not Allocated</span>
                          )}
                        </td>
                        <td>
                          <Badge status={reg.status} />
                        </td>
                        <td>
                          <Button variant="outline" size="sm" onClick={() => handleOpenAllocation(reg)}>
                            <Edit3 size={12} /> Manage
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {filteredRegs.length === 0 && (
                      <tr>
                        <td colSpan={8} className="text-center" style={{ padding: '3rem', color: 'var(--color-text-muted)' }}>
                          No delegate files match the filter query settings.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: COMMITTEES CONFIG EDITOR */}
          {activeTab === 'committees' && (
            <Card elevation="md" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
                <BookOpen size={20} style={{ color: 'var(--color-secondary)' }} />
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-primary)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>
                  Manage Committee Metadata
                </h3>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Select Council Target</label>
                <select
                  value={selectedCommId}
                  onChange={(e) => setSelectedCommId(e.target.value)}
                  className="form-control"
                >
                  <option value="" disabled>Choose Committee</option>
                  {committees.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.id.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              {selectedCommId && (
                <form onSubmit={handleSaveCommittee} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <Input
                    label="Official Committee Name"
                    value={commForm.name}
                    onChange={(e) => setCommForm({ ...commForm, name: e.target.value })}
                    required
                  />

                  <Input
                    label="Active Debate Agenda"
                    value={commForm.agenda}
                    onChange={(e) => setCommForm({ ...commForm, agenda: e.target.value })}
                    required
                  />

                  <Input
                    label="Committee Description"
                    as="textarea"
                    rows={4}
                    value={commForm.description}
                    onChange={(e) => setCommForm({ ...commForm, description: e.target.value })}
                    required
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }} className="grid-responsive">
                    <Input
                      label="Chairperson Name"
                      value={commForm.eb_chair}
                      onChange={(e) => setCommForm({ ...commForm, eb_chair: e.target.value })}
                      required
                    />
                    <Input
                      label="Vice Chairperson Name"
                      value={commForm.eb_vice_chair}
                      onChange={(e) => setCommForm({ ...commForm, eb_vice_chair: e.target.value })}
                      required
                    />
                    <Input
                      label="In-Charge Name"
                      value={commForm.eb_rapporteur}
                      onChange={(e) => setCommForm({ ...commForm, eb_rapporteur: e.target.value })}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="grid-responsive">
                    <Input
                      label="Delegate Capacity"
                      type="number"
                      value={commForm.capacity}
                      onChange={(e) => setCommForm({ ...commForm, capacity: parseInt(e.target.value) || 0 })}
                      required
                    />

                    <div className="form-group">
                      <label className="form-label">Committee Status</label>
                      <select
                        value={commForm.status}
                        onChange={(e) => setCommForm({ ...commForm, status: e.target.value as any })}
                        className="form-control"
                      >
                        <option value="OPEN">OPEN - Accepting enrollments</option>
                        <option value="CLOSED">CLOSED - Capacity filled</option>
                      </select>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    loading={isCommSaving}
                    style={{ width: 'fit-content', padding: '0.65rem 2rem', marginTop: '0.5rem' }}
                  >
                    <Save size={14} /> Save Committee Configuration
                  </Button>
                </form>
              )}
            </Card>
          )}

          {/* TAB 4: PORTAL PASSWORDS */}
          {activeTab === 'passwords' && (
            <Card elevation="md" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
                <KeyRound size={20} style={{ color: 'var(--color-secondary)' }} />
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-primary)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>
                  Manage Portal Passcodes
                </h3>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                Update the access passcodes for coordinating staff. Leaving a field blank will preserve its current password hash in the database.
              </p>

              <form onSubmit={handleSavePasswords} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="grid-responsive">
                  <Input
                    label="Grade 7 In-Charge Passcode"
                    type="text"
                    placeholder="Leave blank to keep unchanged"
                    value={passwords.in_charge_7}
                    onChange={(e) => setPasswords({ ...passwords, in_charge_7: e.target.value })}
                  />
                  <Input
                    label="Grade 8 In-Charge Passcode"
                    type="text"
                    placeholder="Leave blank to keep unchanged"
                    value={passwords.in_charge_8}
                    onChange={(e) => setPasswords({ ...passwords, in_charge_8: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="grid-responsive">
                  <Input
                    label="Grade 9 In-Charge Passcode"
                    type="text"
                    placeholder="Leave blank to keep unchanged"
                    value={passwords.in_charge_9}
                    onChange={(e) => setPasswords({ ...passwords, in_charge_9: e.target.value })}
                  />
                  <Input
                    label="Grade 10 In-Charge Passcode"
                    type="text"
                    placeholder="Leave blank to keep unchanged"
                    value={passwords.in_charge_10}
                    onChange={(e) => setPasswords({ ...passwords, in_charge_10: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="grid-responsive">
                  <Input
                    label="MUN Coordinator Password"
                    type="text"
                    placeholder="Leave blank to keep unchanged"
                    value={passwords.coordinator}
                    onChange={(e) => setPasswords({ ...passwords, coordinator: e.target.value })}
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  loading={isPasswordsSaving}
                  style={{ width: 'fit-content', padding: '0.65rem 2rem', marginTop: '0.5rem' }}
                >
                  <Save size={14} /> Update Passcodes
                </Button>
              </form>
            </Card>
          )}
        </div>
      </div>

      {/* Roster Allocation details Modal */}
      {selectedReg && (
        <Modal
          isOpen={isAllocationModalOpen}
          onClose={() => {
            if (!isActionLoading) {
              setIsAllocationModalOpen(false);
              setSelectedReg(null);
            }
          }}
          title={`Manage Delegate: ${selectedReg.name}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Metadata Briefing */}
            <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem 1.25rem', fontSize: '0.88rem' }} className="grid-responsive">
                <div style={{ minWidth: 0, overflowWrap: 'break-word' }}><strong>Reg ID:</strong> {selectedReg.id}</div>
                <div style={{ minWidth: 0, overflowWrap: 'break-word' }}><strong>Grade & Sec:</strong> Grade {selectedReg.grade} - {selectedReg.section}</div>
                <div style={{ minWidth: 0, overflowWrap: 'break-word' }}><strong>School Campus:</strong> {selectedReg.school}</div>
                <div style={{ minWidth: 0, overflowWrap: 'break-word' }}><strong>Phone Number:</strong> {selectedReg.phone}</div>
                <div style={{ gridColumn: 'span 2', minWidth: 0, overflowWrap: 'break-word', wordBreak: 'break-all' }}><strong>Email:</strong> {selectedReg.email}</div>
                <div style={{ gridColumn: 'span 2', minWidth: 0, overflowWrap: 'break-word' }}><strong>Registration Time (IST):</strong> {formatIST(selectedReg.created_at)}</div>
                <div style={{ gridColumn: 'span 2', minWidth: 0, overflowWrap: 'break-word' }}><strong>Portfolio Pref:</strong> {(selectedReg.portfolio_preference || '').replace('_', ' ')}</div>
                <div style={{ gridColumn: 'span 2', minWidth: 0, overflowWrap: 'break-word' }}><strong>Preferred Committee:</strong> {(selectedReg.preferred_committee || '').toUpperCase()}</div>
                <div style={{ gridColumn: 'span 2', minWidth: 0, overflowWrap: 'break-word' }}>
                  <strong>Preferred Country Choices:</strong>{' '}
                  {selectedReg.country_preferences && selectedReg.country_preferences.length > 0
                    ? selectedReg.country_preferences.join(', ')
                    : 'None'}
                </div>
                <div style={{ gridColumn: 'span 2', minWidth: 0, overflowWrap: 'break-word', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}><strong>Previous Experience:</strong> {selectedReg.mun_experience || 'None'}</div>
                {selectedReg.additional_info && (
                  <div style={{ gridColumn: 'span 2', minWidth: 0, overflowWrap: 'break-word', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}><strong>Dietary / Add. Info:</strong> {selectedReg.additional_info}</div>
                )}
              </div>
            </div>

            {/* Current Status */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)' }}>Current Status:</span>
                <Badge status={selectedReg.status} />
              </div>
              
              {selectedReg.committee !== 'NOT ASSIGNED' && (
                <div style={{ backgroundColor: 'var(--color-bg-main)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', fontSize: '0.85rem', overflowWrap: 'break-word' }}>
                  Allocated: <strong>{selectedReg.assigned_country}</strong> under committee <strong>{(selectedReg.committee || '').toUpperCase()}</strong>
                </div>
              )}
            </div>

            {/* ALLOCATION ACTION BOARD */}
            <Card style={{ backgroundColor: 'var(--color-bg-main)', border: '1px solid var(--color-border)', padding: '1.25rem' }}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.92rem', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Registration Decision
              </h4>

              <p style={{ fontSize: '0.88rem', margin: '0 0 1.25rem 0', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                Approve or reject this registration. Approving will automatically assign their preferred committee (<strong>{(selectedReg.preferred_committee || '').toUpperCase()}</strong>) and country (<strong>{selectedReg.country_preferences && selectedReg.country_preferences[0]}</strong>).
              </p>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {selectedReg.status !== 'APPROVED' ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleApproveRegistration(selectedReg)}
                    loading={isActionLoading}
                    style={{ flex: 1 }}
                  >
                    <CheckCircle size={14} /> Approve Registration
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRevokeAllocation(selectedReg)}
                    loading={isActionLoading}
                    style={{ flex: 1, color: 'var(--color-warning)', borderColor: 'var(--color-warning)' }}
                  >
                    <XCircle size={14} /> Revoke Approval
                  </Button>
                )}
              </div>
            </Card>

            {/* Reject & Delete Danger Zones */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              {selectedReg.status !== 'REJECTED' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRejectRegistration(selectedReg)}
                  loading={isActionLoading}
                  style={{ flex: 1, color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
                >
                  <XCircle size={14} /> Reject Application
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteRegistration(selectedReg)}
                loading={isActionLoading}
                style={{ flex: 1, color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
              >
                <Trash2 size={14} /> Delete File
              </Button>
            </div>
          </div>
        </Modal>
      )}

      <style>{`
        @media (max-width: 850px) {
          .admin-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          .admin-grid > div:first-child {
            flex-direction: row !important;
            overflow-x: auto !important;
            padding-bottom: 0.5rem;
          }
          .admin-grid > div:first-child button {
            white-space: nowrap;
          }
          .welcome-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 1rem !important;
          }
          .roster-filters {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
          .grid-responsive {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
};
