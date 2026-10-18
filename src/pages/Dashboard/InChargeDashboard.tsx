import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/UI/Card';
import { Badge } from '../../components/UI/Badge';
import { Button } from '../../components/UI/Button';
import { 
  Loader2, 
  Download, 
  Search, 
  LogOut, 
  Calendar, 
  X, 
  CheckSquare, 
  Square, 
  UserCheck, 
  FileText, 
  Eye, 
  RefreshCw,
  Save,
  Check 
} from 'lucide-react';
import { API } from '../../services/api';

const CONFERENCE_DATES = [
  { id: '2026-10-15', label: '15 Oct (Session 1)' },
  { id: '2026-10-16', label: '16 Oct (Session 2)' },
  { id: '2026-10-17', label: '17 Oct (Session 3)' },
  { id: '2026-10-21', label: '21 Oct (Session 4)' },
  { id: '2026-10-28', label: '28 Oct (Session 5)' },
];

export const formatSection = (sec?: string): string => {
  if (!sec) return '';
  const trimmed = sec.trim();
  if (!trimmed) return '';
  const match = trimmed.match(/^[a-zA-Z]/);
  return match ? match[0].toUpperCase() : trimmed.charAt(0).toUpperCase();
};

const COMM_LABELS: Record<string, string> = {
  unep: 'UNEP',
  'un-women': 'UN-WOMEN',
  unhrc: 'UNHRC',
  unicef: 'UNICEF',
};

const COMM_FULL_NAMES: Record<string, string> = {
  unep: 'United Nations Environment Programme (UNEP)',
  'un-women': 'UN Women',
  unhrc: 'United Nations Human Rights Council (UNHRC)',
  unicef: "United Nations Children's Fund (UNICEF)",
};

const GRADE_TO_COMM: Record<number, string> = {
  7: 'unep',
  8: 'un-women',
  9: 'unhrc',
  10: 'unicef',
};

const COMM_TO_GRADE: Record<string, number> = {
  unep: 7,
  'un-women': 8,
  unhrc: 9,
  unicef: 10,
};

export const InChargeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { role, registrations, committees, logout, isLoading } = useAuth();

  const [inChargeComm, setInChargeComm] = useState<string>('');
  const [inChargeGrade, setInChargeGrade] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedAttendanceDate, setSelectedAttendanceDate] = useState<string>('2026-10-15');
  const [attendanceMap, setAttendanceMap] = useState<Record<string, boolean>>({});
  const [isSavingAttendance, setIsSavingAttendance] = useState<boolean>(false);
  const [attendanceSavedMessage, setAttendanceSavedMessage] = useState<string | null>(null);
  const [hasUnsavedAttendance, setHasUnsavedAttendance] = useState<boolean>(false);

  // Position papers state
  const [positionPapers, setPositionPapers] = useState<any[]>([]);
  const [isPPLoading, setIsPPLoading] = useState<boolean>(false);
  const [activePPPreview, setActivePPPreview] = useState<any>(null);
  const [ppSearchQuery, setPpSearchQuery] = useState<string>('');

  useEffect(() => {
    let comm = localStorage.getItem('pmun_session_incharge_committee') || sessionStorage.getItem('pmun_session_incharge_committee');
    const storedGrade = localStorage.getItem('pmun_session_incharge_grade') || sessionStorage.getItem('pmun_session_incharge_grade');
    
    if (storedGrade) {
      const gNum = parseInt(storedGrade);
      setInChargeGrade(gNum);
      if (!comm && GRADE_TO_COMM[gNum]) {
        comm = GRADE_TO_COMM[gNum];
      }
    }

    if (!comm && role && role.startsWith('in_charge_')) {
      const g = parseInt(role.replace('in_charge_', ''));
      if (g && GRADE_TO_COMM[g]) {
        comm = GRADE_TO_COMM[g];
        setInChargeGrade(g);
      }
    }

    if (comm) {
      setInChargeComm(comm.toLowerCase());
      if (!storedGrade && COMM_TO_GRADE[comm.toLowerCase()]) {
        setInChargeGrade(COMM_TO_GRADE[comm.toLowerCase()]);
      }
    } else {
      logout().then(() => navigate('/login'));
    }
  }, [logout, navigate, role]);

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

  // Sync recipient default once committee is loaded
  useEffect(() => {
    if (inChargeComm && !activeMsgRecipient) {
      const g = COMM_TO_GRADE[inChargeComm] || 10;
      setActiveMsgRecipient(`grade_${g}`);
    }
  }, [inChargeComm, activeMsgRecipient]);

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

  // Helper for Position Paper blob URL
  const getFileBlobUrl = (dataURI: string) => {
    try {
      const parts = dataURI.split(',');
      const byteString = atob(parts[1]);
      const mimeString = parts[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      return URL.createObjectURL(blob);
    } catch {
      return dataURI;
    }
  };

  // Position Paper Fetching for this committee
  const fetchPositionPapers = async () => {
    if (!inChargeComm) return;
    setIsPPLoading(true);
    try {
      const res = await fetch(`/api/in-charge/position-papers?committee=${encodeURIComponent(inChargeComm)}&_=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setPositionPapers(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsPPLoading(false);
    }
  };

  useEffect(() => {
    if (statusFilter === 'POSITION_PAPERS' && inChargeComm) {
      fetchPositionPapers();
    }
  }, [statusFilter, inChargeComm]);

  // Attendance synchronization (Local + Server)
  useEffect(() => {
    if (!inChargeComm || !selectedAttendanceDate) return;
    setHasUnsavedAttendance(false);
    setAttendanceSavedMessage(null);
    const g = COMM_TO_GRADE[inChargeComm] || inChargeComm;
    const localKey = `pmun_attendance_${inChargeComm}_${selectedAttendanceDate}`;
    const legacyKey = `pmun_attendance_${g}_${selectedAttendanceDate}`;

    const cached = localStorage.getItem(localKey) || localStorage.getItem(legacyKey);
    if (cached) {
      try {
        setAttendanceMap(JSON.parse(cached));
      } catch {}
    } else {
      setAttendanceMap({});
    }

    API.getAttendance(inChargeComm, selectedAttendanceDate).then((serverData) => {
      if (serverData && Object.keys(serverData).length > 0) {
        setAttendanceMap((prev) => {
          const merged = { ...serverData, ...prev };
          localStorage.setItem(localKey, JSON.stringify(merged));
          return merged;
        });
      } else if (typeof g === 'number') {
        API.getAttendance(g, selectedAttendanceDate).then((legacyData) => {
          if (legacyData && Object.keys(legacyData).length > 0) {
            setAttendanceMap((prev) => {
              const merged = { ...legacyData, ...prev };
              localStorage.setItem(localKey, JSON.stringify(merged));
              return merged;
            });
          }
        });
      }
    });
  }, [inChargeComm, selectedAttendanceDate]);

  // Executive Board name matching helper
  const checkNameMatch = (officialEbName?: string, regName?: string) => {
    if (!officialEbName || !regName) return false;
    const ebParts = officialEbName.toLowerCase().replace(/\([^\)]*\)/g, '').trim().split(/\s+/).filter(Boolean);
    const regParts = regName.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const ebClean = ebParts.join(' ');
    const regClean = regParts.join(' ');
    if (ebClean && (ebClean.includes(regClean) || regClean.includes(ebClean))) return true;
    if (ebParts.length > 0 && regParts.length > 0) {
      const firstEb = ebParts[0];
      const lastEb = ebParts[ebParts.length - 1];
      const firstReg = regParts[0];
      const lastReg = regParts[regParts.length - 1];
      if ((firstEb === firstReg && (lastEb === lastReg || ebParts.length === 1)) || (lastEb === lastReg && ebParts.length > 1 && regParts.length > 1)) {
        return true;
      }
    }
    return false;
  };

  const isEbOfOtherCommittee = (regName: string, currentCommId: string) => {
    return committees.some((c) => {
      if (c.id.toLowerCase() === currentCommId.toLowerCase()) return false;
      return checkNameMatch(c.eb_chair, regName) || checkNameMatch(c.eb_vice_chair, regName);
    });
  };

  const isEbOfThisCommittee = (regName: string, currentCommId: string) => {
    const commObj = committees.find((c) => c.id.toLowerCase() === currentCommId.toLowerCase());
    if (!commObj) return false;
    return checkNameMatch(commObj.eb_chair, regName) || checkNameMatch(commObj.eb_vice_chair, regName);
  };

  // Filter registrations strictly for this committee
  // Rule: Exclude EB of other committees, include EB of this committee, exclude Chahak Tahilyani
  const committeeRegistrations = registrations.filter((r) => {
    if (r.name.toLowerCase().includes('chahak')) return false;

    if (isEbOfOtherCommittee(r.name, inChargeComm)) {
      return false;
    }

    if (isEbOfThisCommittee(r.name, inChargeComm)) {
      return true;
    }

    if (r.committee && r.committee !== 'NOT ASSIGNED') {
      return r.committee.toLowerCase().trim() === inChargeComm;
    }

    return (r.preferred_committee || '').toLowerCase().trim() === inChargeComm;
  });

  // Attendance Roster: All approved delegates of this committee (which includes Chair & Vice-Chair of this committee, and nowhere else)
  const attendanceRoster = committeeRegistrations.filter((r) => r.status === 'APPROVED');

  const filteredAttendanceRoster = attendanceRoster.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return r.name.toLowerCase().includes(q) ||
           r.id.toLowerCase().includes(q) ||
           (r.assigned_country && r.assigned_country.toLowerCase().includes(q)) ||
           formatSection(r.section).toLowerCase().includes(q) ||
           r.school.toLowerCase().includes(q);
  });

  const handleToggleAttendance = (regId: string) => {
    setAttendanceMap((prev) => {
      const current = !!prev[regId];
      const updated = { ...prev, [regId]: !current };
      setHasUnsavedAttendance(true);
      setAttendanceSavedMessage(null);
      if (inChargeComm) {
        const localKey = `pmun_attendance_${inChargeComm}_${selectedAttendanceDate}`;
        localStorage.setItem(localKey, JSON.stringify(updated));
        API.saveAttendance(inChargeComm, selectedAttendanceDate, updated);
        const g = COMM_TO_GRADE[inChargeComm];
        if (g) API.saveAttendance(g, selectedAttendanceDate, updated);
      }
      return updated;
    });
  };

  const handleMarkAllAttendance = (status: boolean) => {
    const updated: Record<string, boolean> = {};
    attendanceRoster.forEach((r) => {
      updated[r.id] = status;
    });
    setAttendanceMap(updated);
    setHasUnsavedAttendance(true);
    setAttendanceSavedMessage(null);
    if (inChargeComm) {
      const localKey = `pmun_attendance_${inChargeComm}_${selectedAttendanceDate}`;
      localStorage.setItem(localKey, JSON.stringify(updated));
      API.saveAttendance(inChargeComm, selectedAttendanceDate, updated);
      const g = COMM_TO_GRADE[inChargeComm];
      if (g) API.saveAttendance(g, selectedAttendanceDate, updated);
    }
  };

  const handleSaveAttendance = async () => {
    if (!inChargeComm || !selectedAttendanceDate) return;
    setIsSavingAttendance(true);
    setAttendanceSavedMessage(null);
    try {
      const localKey = `pmun_attendance_${inChargeComm}_${selectedAttendanceDate}`;
      localStorage.setItem(localKey, JSON.stringify(attendanceMap));

      const success = await API.saveAttendance(inChargeComm, selectedAttendanceDate, attendanceMap);
      const g = COMM_TO_GRADE[inChargeComm];
      if (g) {
        await API.saveAttendance(g, selectedAttendanceDate, attendanceMap);
      }

      if (success) {
        setHasUnsavedAttendance(false);
        setAttendanceSavedMessage(`Attendance saved successfully! (${presentCount} Present, ${absentCount} Absent)`);
      } else {
        alert('Could not save attendance to the server. Please verify your connection.');
      }
    } catch (err) {
      alert('Error occurred while saving attendance.');
    } finally {
      setIsSavingAttendance(false);
    }
  };

  const presentCount = attendanceRoster.filter((r) => !!attendanceMap[r.id]).length;
  const absentCount = attendanceRoster.length - presentCount;
  const attendancePercent = attendanceRoster.length > 0 ? Math.round((presentCount / attendanceRoster.length) * 100) : 0;

  const handleExportAttendanceCSV = () => {
    if (attendanceRoster.length === 0) {
      alert('No delegates in attendance roster to export.');
      return;
    }

    const headers = [
      'Registration ID',
      'Delegate Name',
      'Grade',
      'Section',
      'School',
      'Assigned Committee',
      'Final Country / Portfolio',
      'Date',
      'Attendance Status'
    ];

    const csvContent = [
      headers.join(','),
      ...attendanceRoster.map((r) => [
        r.id,
        `"${r.name.replace(/"/g, '""')}"`,
        r.grade,
        formatSection(r.section),
        `"${r.school.replace(/"/g, '""')}"`,
        (r.committee || inChargeComm).toUpperCase(),
        `"${(r.assigned_country || '').replace(/"/g, '""')}"`,
        selectedAttendanceDate,
        attendanceMap[r.id] ? 'PRESENT' : 'ABSENT'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PMUN_${(COMM_LABELS[inChargeComm] || inChargeComm).toUpperCase()}_Attendance_${selectedAttendanceDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Stats calculation for this committee
  const totalCount = committeeRegistrations.length;
  const approvedCount = committeeRegistrations.filter((r) => r.status === 'APPROVED').length;
  const pendingCount = committeeRegistrations.filter((r) => r.status === 'PENDING' || r.status === 'NOT ASSIGNED').length;
  const rejectedCount = committeeRegistrations.filter((r) => r.status === 'REJECTED').length;

  // Filter by search query and status filter
  const filteredRegs = committeeRegistrations.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.school.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          formatSection(r.section).toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || 
                          (statusFilter === 'APPROVED' && r.status === 'APPROVED') ||
                          (statusFilter === 'PENDING' && (r.status === 'PENDING' || r.status === 'NOT ASSIGNED')) ||
                          (statusFilter === 'REJECTED' && r.status === 'REJECTED');

    return matchesSearch && matchesStatus;
  });

  // Direct CSV Exporter
  const handleExportCSV = () => {
    if (committeeRegistrations.length === 0) {
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
      ...committeeRegistrations.map((r) =>
        [
          r.id,
          `"${r.name.replace(/"/g, '""')}"`,
          r.grade,
          formatSection(r.section),
          `"${r.school.replace(/"/g, '""')}"`,
          r.email,
          r.phone,
          r.portfolio_preference,
          `"${(r.mun_experience || 'First time delegate').replace(/"/g, '""')}"`,
          r.preferred_committee,
          `"${(r.country_preferences || []).join('; ')}"`,
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
    link.setAttribute('download', `PMUN_${(COMM_LABELS[inChargeComm] || inChargeComm).toUpperCase()}_Roster.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading || !inChargeComm) {
    return (
      <div style={{ display: 'flex', width: '100%', height: '50vh', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="spin" size={32} style={{ color: 'var(--color-secondary)' }} />
      </div>
    );
  }

  const currentCommObj = committees.find((c) => c.id.toLowerCase() === inChargeComm.toLowerCase());
  const commCapacity = currentCommObj?.capacity || 50;
  const approvedInComm = registrations.filter((r) => r.committee === inChargeComm && r.status === 'APPROVED').length;
  const percentage = Math.min((approvedInComm / commCapacity) * 100, 100);

  return (
    <div className="section fade-in" style={{ width: '100%', maxWidth: '1440px', margin: '0 auto', paddingLeft: 'var(--space-lg)', paddingRight: 'var(--space-lg)' }}>
      {/* Welcome Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--color-border)', paddingBottom: '1.5rem', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }} className="welcome-header">
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '1px' }}>
            Staff Panel • Assigned Committee In-Charge
          </span>
          <h2 style={{ fontSize: '2rem', color: 'var(--color-primary)', margin: '0.25rem 0 0 0' }}>
            {COMM_LABELS[inChargeComm] || inChargeComm.toUpperCase()} In-Charge Portal
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
            Committee Delegates
          </span>
          <strong style={{ fontSize: '1.8rem', color: 'var(--color-primary)' }}>{totalCount}</strong>
        </Card>
        <Card elevation="sm" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1.5rem', textAlign: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Approved Allocations
          </span>
          <strong style={{ fontSize: '1.8rem', color: 'var(--color-success)' }}>{approvedCount}</strong>
        </Card>
        <Card elevation="sm" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1.5rem', textAlign: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Pending Review
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

      {/* Committee Overview Card */}
      <Card elevation="md" style={{ padding: '1.5rem 2rem', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-secondary)', letterSpacing: '0.5px' }}>
              Committee Overview & Capacities
            </span>
            <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.25rem', color: 'var(--color-primary)', fontWeight: 700 }}>
              {COMM_FULL_NAMES[inChargeComm] || inChargeComm.toUpperCase()}
            </h3>
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)' }}>
            <span>{approvedInComm} / {commCapacity} Seats Approved ({percentage.toFixed(0)}%)</span>
          </div>
        </div>

        {/* Capacity Bar */}
        <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--color-border)', borderRadius: 'var(--radius-round)', overflow: 'hidden', marginBottom: '1.25rem' }}>
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

        {/* Committee Agenda & EB Info */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', backgroundColor: 'var(--color-bg-main)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)' }}>
          <div>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block' }}>
              Committee Agenda
            </span>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary)' }}>
              {currentCommObj?.agenda || 'Standard Agenda'}
            </p>
          </div>
          <div>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block' }}>
              Executive Board (Chair & Vice-Chair)
            </span>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary)' }}>
              Chair: <strong>{currentCommObj?.eb_chair || 'TBD'}</strong> • Vice-Chair: <strong>{currentCommObj?.eb_vice_chair || 'TBD'}</strong>
            </p>
          </div>
          <div>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block' }}>
              Teacher In-Charge / Rapporteurs
            </span>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary)' }}>
              {currentCommObj?.eb_rapporteur || 'Assigned Staff'}
            </p>
          </div>
        </div>
      </Card>

      {/* Roster Filters Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }} className="filters-header">
        {/* Search or Dates Selector */}
        {statusFilter === 'ATTENDANCE' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary)' }}>
              <Calendar size={15} style={{ color: 'var(--color-secondary)' }} />
              <span>Session Date:</span>
            </div>
            <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--color-border)', padding: '3px', borderRadius: 'var(--radius-md)', flexWrap: 'wrap' }}>
              {CONFERENCE_DATES.map((cd) => (
                <button
                  key={cd.id}
                  type="button"
                  onClick={() => setSelectedAttendanceDate(cd.id)}
                  style={{
                    border: 'none',
                    background: selectedAttendanceDate === cd.id ? '#ffffff' : 'transparent',
                    color: selectedAttendanceDate === cd.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: selectedAttendanceDate === cd.id ? 'var(--shadow-sm)' : 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  {cd.label}
                </button>
              ))}
            </div>
            <input
              type="date"
              value={selectedAttendanceDate}
              onChange={(e) => setSelectedAttendanceDate(e.target.value)}
              className="form-control"
              style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem', width: 'auto', fontWeight: 600 }}
              title="Pick a custom session date"
            />
          </div>
        ) : statusFilter !== 'MESSAGES' && statusFilter !== 'POSITION_PAPERS' ? (
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
        <div style={{ display: 'flex', gap: '6px', backgroundColor: 'var(--color-border)', padding: '3px', borderRadius: 'var(--radius-md)', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: 'All' },
            { id: 'APPROVED', label: 'Approved' },
            { id: 'PENDING', label: 'Pending' },
            { id: 'REJECTED', label: 'Declined' },
            { id: 'ATTENDANCE', label: 'Attendance' },
            { id: 'POSITION_PAPERS', label: 'Position Papers' },
            { id: 'MESSAGES', label: 'Messages' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              style={{
                border: 'none',
                background: statusFilter === tab.id ? 'var(--color-bg-surface)' : 'transparent',
                color: statusFilter === tab.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
                padding: '0.45rem 1rem',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                borderRadius: 'var(--radius-sm)',
                boxShadow: statusFilter === tab.id ? 'var(--shadow-sm)' : 'none',
                transition: 'all var(--transition-fast)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Roster Table, Position Papers, or Messages Console */}
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
                onClick={() => setActiveMsgRecipient(`comm_${inChargeComm}`)}
                style={{
                  padding: '0.7rem 0.85rem',
                  textAlign: 'left',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid',
                  borderColor: (activeMsgRecipient === `comm_${inChargeComm}` || activeMsgRecipient === `grade_${inChargeGrade}`) ? 'var(--color-secondary)' : 'var(--color-border)',
                  backgroundColor: (activeMsgRecipient === `comm_${inChargeComm}` || activeMsgRecipient === `grade_${inChargeGrade}`) ? 'var(--color-secondary-bg)' : '#ffffff',
                  color: (activeMsgRecipient === `comm_${inChargeComm}` || activeMsgRecipient === `grade_${inChargeGrade}`) ? 'var(--color-secondary)' : 'var(--color-primary)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  marginBottom: '0.75rem'
                }}
              >
                📢 Broadcast: {COMM_LABELS[inChargeComm] || inChargeComm.toUpperCase()} Committee
              </button>

              <span style={{ fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.4rem', display: 'block' }}>
                {COMM_LABELS[inChargeComm] || inChargeComm.toUpperCase()} Delegates
              </span>
              {committeeRegistrations.length === 0 ? (
                <p style={{ fontSize: '0.75rem', fontStyle: 'italic', color: 'var(--color-text-muted)' }}>No delegates registered.</p>
              ) : (
                committeeRegistrations.map((reg) => (
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
                    <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>
                      Gr {reg.grade}-{formatSection(reg.section)} • {reg.assigned_country || 'Delegate'} • {reg.id}
                    </span>
                  </button>
                ))
              )}
            </div>

            {/* Right side: Chat list and message sender */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '480px' }}>
              <div style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border)', marginBottom: '1rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--color-primary)' }}>
                  Active Chat:{' '}
                  {activeMsgRecipient.startsWith('comm_') || activeMsgRecipient.startsWith('grade_')
                    ? `📢 ${COMM_LABELS[inChargeComm] || inChargeComm.toUpperCase()} Committee Broadcast`
                    : `👤 ${committeeRegistrations.find(r => r.id === activeMsgRecipient)?.name || activeMsgRecipient}`}
                </span>
              </div>

              {/* Chat messages list */}
              <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1rem', backgroundColor: 'var(--color-bg-main)', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                {messages.filter(msg => {
                  const roleStr = `in_charge_${inChargeGrade || COMM_TO_GRADE[inChargeComm] || 8}`;
                  const isBroadcast = activeMsgRecipient.startsWith('comm_') || activeMsgRecipient.startsWith('grade_');
                  if (isBroadcast) {
                    return (msg.recipient_id === activeMsgRecipient || msg.recipient_id === `comm_${inChargeComm}` || msg.recipient_id === `grade_${inChargeGrade}`) && msg.sender_role === roleStr;
                  }
                  return (msg.recipient_id === activeMsgRecipient && msg.sender_role === roleStr) ||
                         (msg.sender_id === activeMsgRecipient && msg.sender_role === 'delegate' && msg.recipient_id === roleStr);
                }).length === 0 ? (
                  <div style={{ margin: 'auto', color: 'var(--color-text-muted)', fontSize: '0.78rem', fontStyle: 'italic' }}>
                    No messages in this chat yet.
                  </div>
                ) : (
                  messages
                    .filter(msg => {
                      const roleStr = `in_charge_${inChargeGrade || COMM_TO_GRADE[inChargeComm] || 8}`;
                      const isBroadcast = activeMsgRecipient.startsWith('comm_') || activeMsgRecipient.startsWith('grade_');
                      if (isBroadcast) {
                        return (msg.recipient_id === activeMsgRecipient || msg.recipient_id === `comm_${inChargeComm}` || msg.recipient_id === `grade_${inChargeGrade}`) && msg.sender_role === roleStr;
                      }
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
                          {msg.sender_role.startsWith('in_charge_')
                            ? `You (${COMM_LABELS[inChargeComm] || inChargeComm.toUpperCase()} In-Charge)`
                            : `${committeeRegistrations.find(r => r.id === msg.sender_id)?.name || msg.sender_id} (Delegate)`}
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
                  placeholder="Type your committee announcement here..."
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
      ) : statusFilter === 'POSITION_PAPERS' ? (
        <Card elevation="md" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.5px', display: 'block' }}>
                Research & Policy Submissions
              </span>
              <h3 style={{ margin: '0.2rem 0 0 0', color: 'var(--color-primary)', fontSize: '1.25rem', fontWeight: 700 }}>
                {COMM_LABELS[inChargeComm] || inChargeComm.toUpperCase()} Position Papers ({positionPapers.length})
              </h3>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Button variant="outline" size="sm" onClick={fetchPositionPapers} loading={isPPLoading} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <RefreshCw size={14} /> Refresh
              </Button>
            </div>
          </div>

          {/* Active Preview Drawer/Box */}
          {activePPPreview && (
            <div style={{ border: '2px solid var(--color-secondary)', borderRadius: 'var(--radius-md)', padding: '1.25rem', backgroundColor: 'var(--color-bg-main)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-secondary)', letterSpacing: '0.5px' }}>
                    Document Preview
                  </span>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-primary)' }}>
                    {activePPPreview.delegate_name} ({activePPPreview.registration_id}) — {activePPPreview.filename}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <a
                    href={getFileBlobUrl(activePPPreview.file_data)}
                    download={activePPPreview.filename}
                    className="btn btn-sm btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', textDecoration: 'none' }}
                  >
                    <Download size={14} /> Download File
                  </a>
                  <Button variant="outline" size="sm" onClick={() => setActivePPPreview(null)}>
                    <X size={14} /> Close Preview
                  </Button>
                </div>
              </div>

              {activePPPreview.file_type === 'application/pdf' || activePPPreview.filename.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={getFileBlobUrl(activePPPreview.file_data)}
                  title={activePPPreview.filename}
                  width="100%"
                  height="540px"
                  style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', backgroundColor: '#ffffff' }}
                />
              ) : (
                <div style={{ padding: '3rem 2rem', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                  <FileText size={48} style={{ color: 'var(--color-secondary)', margin: '0 auto 1rem auto' }} />
                  <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-primary)' }}>Microsoft Word Document (.docx / .doc)</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', maxWidth: '420px', margin: '0 auto 1.25rem auto' }}>
                    In-browser preview is available for PDF files. You can download and open this paper directly in Microsoft Word or Google Docs.
                  </p>
                  <a
                    href={getFileBlobUrl(activePPPreview.file_data)}
                    download={activePPPreview.filename}
                    className="btn btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
                  >
                    <Download size={16} /> Download {activePPPreview.filename}
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Search and Note */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '320px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                placeholder="Search papers by delegate name..."
                value={ppSearchQuery}
                onChange={(e) => setPpSearchQuery(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '36px', width: '100%' }}
              />
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Showing only papers submitted for <strong>{COMM_LABELS[inChargeComm] || inChargeComm.toUpperCase()}</strong>
            </span>
          </div>

          {isPPLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
              <Loader2 className="spin" size={28} style={{ color: 'var(--color-secondary)' }} />
            </div>
          ) : positionPapers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--color-text-muted)' }}>
              <FileText size={42} style={{ opacity: 0.35, margin: '0 auto 1rem auto' }} />
              <p style={{ fontWeight: 600, fontSize: '0.95rem', margin: '0 0 0.35rem 0' }}>No Position Papers Submitted Yet</p>
              <span style={{ fontSize: '0.82rem' }}>
                When delegates allocated to {COMM_LABELS[inChargeComm] || inChargeComm.toUpperCase()} upload their research papers, they will appear here.
              </span>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-compact" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Delegate Name</th>
                    <th>Reg ID</th>
                    <th>Allocated Portfolio</th>
                    <th>Document</th>
                    <th>Uploaded Date</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {positionPapers
                    .filter((pp) => {
                      if (!ppSearchQuery) return true;
                      const q = ppSearchQuery.toLowerCase();
                      return (
                        (pp.delegate_name && pp.delegate_name.toLowerCase().includes(q)) ||
                        (pp.registration_id && pp.registration_id.toLowerCase().includes(q)) ||
                        (pp.filename && pp.filename.toLowerCase().includes(q))
                      );
                    })
                    .map((pp) => {
                      const reg = registrations.find((r) => r.id === pp.registration_id);
                      return (
                        <tr key={pp.id}>
                          <td>
                            <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{pp.delegate_name}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                              Grade {reg?.grade || 'N/A'} - {formatSection(reg?.section)} • {reg?.school || 'Podar International'}
                            </div>
                          </td>
                          <td style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.82rem' }}>{pp.registration_id}</td>
                          <td>
                            <strong style={{ color: 'var(--color-secondary)' }}>{reg?.assigned_country || 'Delegate'}</strong>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <FileText size={16} style={{ color: 'var(--color-secondary)', flexShrink: 0 }} />
                              <span style={{ fontSize: '0.82rem', fontWeight: 600, wordBreak: 'break-all' }}>{pp.filename}</span>
                            </div>
                          </td>
                          <td style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{formatIST(pp.uploaded_at)}</td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setActivePPPreview(pp)}
                                style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              >
                                <Eye size={13} /> View
                              </Button>
                              <a
                                href={getFileBlobUrl(pp.file_data)}
                                download={pp.filename}
                                className="btn btn-sm btn-outline"
                                style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                                title="Download"
                              >
                                <Download size={13} /> Download
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      ) : statusFilter === 'ATTENDANCE' ? (
        <Card elevation="md" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Header Controls & Summary Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.5px', display: 'block' }}>
                  Active Attendance Roster
                </span>
                <h3 style={{ margin: '0.2rem 0 0 0', color: 'var(--color-primary)', fontSize: '1.25rem', fontWeight: 700 }}>
                  {COMM_LABELS[inChargeComm] || inChargeComm.toUpperCase()} Committee • {CONFERENCE_DATES.find(cd => cd.id === selectedAttendanceDate)?.label || selectedAttendanceDate}
                </h3>
              </div>

              {/* Attendance Metrics */}
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', fontWeight: 700, color: '#059669' }}>
                  <UserCheck size={15} />
                  <span>Present: {presentCount} / {attendanceRoster.length} ({attendancePercent}%)</span>
                </div>
                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', fontWeight: 700, color: '#dc2626' }}>
                  <X size={15} />
                  <span>Absent: {absentCount}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveAttendance}
                loading={isSavingAttendance}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.4rem 0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  backgroundColor: '#059669',
                  borderColor: '#059669',
                  color: '#ffffff',
                  fontWeight: 700,
                  boxShadow: hasUnsavedAttendance ? '0 0 0 2px rgba(5, 150, 105, 0.45)' : 'none'
                }}
              >
                <Save size={14} />
                Save Attendance
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMarkAllAttendance(true)}
                style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <CheckSquare size={14} style={{ color: '#059669' }} />
                Mark All Present
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMarkAllAttendance(false)}
                style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Square size={14} style={{ color: '#dc2626' }} />
                Mark All Absent
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportAttendanceCSV}
                style={{ fontSize: '0.75rem', padding: '0.4rem 0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Download size={14} />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Save Status Notification */}
          {attendanceSavedMessage && (
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', border: '1px solid #10b981', color: '#065f46', padding: '0.65rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} style={{ color: '#059669' }} />
                <span>{attendanceSavedMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setAttendanceSavedMessage(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065f46' }}
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Attendance Table */}
          <div className="table-responsive">
            <table className="table table-compact" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: '130px', textAlign: 'center' }}>Attendance</th>
                  <th>ID</th>
                  <th>Delegate Name</th>
                  <th>Sec</th>
                  <th>School</th>
                  <th>Final Country / Portfolio</th>
                  <th>Assigned Committee</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendanceRoster.map((reg) => {
                  const isPresent = !!attendanceMap[reg.id];
                  const isEbRole = reg.assigned_country === 'Chair' || reg.assigned_country === 'Vice-Chair';
                  return (
                    <tr
                      key={reg.id}
                      onClick={() => handleToggleAttendance(reg.id)}
                      style={{
                        cursor: 'pointer',
                        backgroundColor: isPresent ? 'rgba(16, 185, 129, 0.04)' : '#ffffff',
                        transition: 'background-color 0.15s'
                      }}
                    >
                      {/* Checkbox & Status Indicator */}
                      <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', margin: 0 }}>
                          <input
                            type="checkbox"
                            checked={isPresent}
                            onChange={() => handleToggleAttendance(reg.id)}
                            style={{
                              width: '18px',
                              height: '18px',
                              cursor: 'pointer',
                              accentColor: '#059669'
                            }}
                          />
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              letterSpacing: '0.5px',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              backgroundColor: isPresent ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.12)',
                              color: isPresent ? '#059669' : '#dc2626'
                            }}
                          >
                            {isPresent ? 'PRESENT' : 'ABSENT'}
                          </span>
                        </label>
                      </td>

                      <td style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.82rem' }}>
                        {reg.id}
                      </td>

                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.88rem' }}>
                          {reg.name}
                        </div>
                        {isEbRole && (
                          <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-secondary)', letterSpacing: '0.5px' }}>
                            ★ Executive Board
                          </span>
                        )}
                      </td>

                      <td style={{ fontWeight: 600 }}>{formatSection(reg.section)}</td>

                      <td style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={reg.school}>
                        {reg.school}
                      </td>

                      <td>
                        <strong style={{ color: isEbRole ? 'var(--color-primary)' : 'var(--color-secondary)', fontSize: '0.88rem' }}>
                          {reg.assigned_country || 'Pending'}
                        </strong>
                      </td>

                      <td>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', backgroundColor: 'var(--color-bg-main)', border: '1px solid var(--color-border)', padding: '2px 8px', borderRadius: '4px' }}>
                          {(reg.committee || inChargeComm).toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {filteredAttendanceRoster.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center" style={{ padding: '3rem', color: 'var(--color-text-muted)' }}>
                      No approved delegates found for {COMM_LABELS[inChargeComm] || inChargeComm.toUpperCase()} attendance roster.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Bottom Save Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--color-border)', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Summary: <strong>{attendanceRoster.length}</strong> total delegates ({presentCount} Present, {absentCount} Absent)
            </span>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveAttendance}
              loading={isSavingAttendance}
              style={{
                fontSize: '0.8rem',
                padding: '0.5rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#059669',
                borderColor: '#059669',
                fontWeight: 700
              }}
            >
              <Save size={15} />
              Save Attendance ({presentCount} Present)
            </Button>
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
              {filteredRegs.map((reg) => {
                const isEbRole = reg.assigned_country === 'Chair' || reg.assigned_country === 'Vice-Chair';
                return (
                  <tr key={reg.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{reg.id}</td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{reg.name}</div>
                      {isEbRole && (
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-secondary)', letterSpacing: '0.5px' }}>
                          ★ Executive Board
                        </span>
                      )}
                      <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        Reg At: {formatIST(reg.created_at)}
                      </div>
                    </td>
                    <td>{formatSection(reg.section)}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={reg.school}>{reg.school}</td>
                    <td style={{ fontSize: '0.82rem' }}>
                      <div style={{ fontWeight: 600 }}>{(reg.preferred_committee || '').toUpperCase()}</div>
                      <div style={{ color: 'var(--color-text-muted)' }}>{(reg.country_preferences || [])[0] || 'N/A'}</div>
                    </td>
                    <td style={{ fontSize: '0.82rem' }}>
                      {reg.committee && reg.committee !== 'NOT ASSIGNED' ? (
                        <div>
                          <strong style={{ color: isEbRole ? 'var(--color-primary)' : 'var(--color-secondary)' }}>{reg.assigned_country}</strong>
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
                );
              })}
              {filteredRegs.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center" style={{ padding: '3rem', color: 'var(--color-text-muted)' }}>
                    No delegates found matching the active search / filters for {COMM_LABELS[inChargeComm] || inChargeComm.toUpperCase()}.
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
