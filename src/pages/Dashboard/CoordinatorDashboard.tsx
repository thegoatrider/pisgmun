import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API, type Registration, type SystemConfig } from '../../services/api';
import { Card } from '../../components/UI/Card';
import { Input } from '../../components/UI/Input';
import { Button } from '../../components/UI/Button';
import { Badge } from '../../components/UI/Badge';
import { Modal } from '../../components/UI/Modal';
import { Loader2, Download, Search, Settings, BookOpen, KeyRound, Save, CheckCircle, XCircle, Trash2, Edit3, LogOut, FileText, Mail } from 'lucide-react';

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
  const [emailSendingMap, setEmailSendingMap] = useState<Record<string, boolean>>({});

  const handleSendConfirmationEmail = async (regId: string) => {
    setEmailSendingMap((prev) => ({ ...prev, [regId]: true }));
    try {
      const res = await fetch(`/api/coordinator/registrations/${regId}/send-confirmation`, {
        method: 'POST',
      });
      if (res.ok) {
        alert('Confirmation email sent successfully!');
        await refreshData();
      } else {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        alert(`Failed to send confirmation email: ${err.error}`);
      }
    } catch (err) {
      alert('Network error. Failed to send confirmation email.');
    } finally {
      setEmailSendingMap((prev) => ({ ...prev, [regId]: false }));
    }
  };

  const [emailBroadcastSubject, setEmailBroadcastSubject] = useState('');
  const [emailBroadcastContent, setEmailBroadcastContent] = useState('');
  const [emailRecipientType, setEmailRecipientType] = useState<'approved' | 'selected'>('approved');
  const [emailSelectedIds, setEmailSelectedIds] = useState<string[]>([]);
  const [emailSearchQuery, setEmailSearchQuery] = useState('');
  const [isEmailBroadcastSending, setIsEmailBroadcastSending] = useState(false);

  const handleSendEmailBroadcast = async () => {
    if (!emailBroadcastSubject.trim()) {
      alert('Please enter an email subject.');
      return;
    }
    if (!emailBroadcastContent.trim()) {
      alert('Please enter the email body message.');
      return;
    }

    let targetCount = 0;
    if (emailRecipientType === 'approved') {
      targetCount = registrations.filter(r => r.status === 'APPROVED').length;
      if (targetCount === 0) {
        alert('There are no approved delegates to email.');
        return;
      }
    } else {
      targetCount = emailSelectedIds.length;
      if (targetCount === 0) {
        alert('Please select at least one delegate in the list below.');
        return;
      }
    }

    const confirmMsg = emailRecipientType === 'approved'
      ? `Are you sure you want to broadcast this email to all ${targetCount} approved delegate(s)?`
      : `Are you sure you want to send this email to the ${targetCount} selected delegate(s)?`;

    if (!window.confirm(confirmMsg)) {
      return;
    }

    setIsEmailBroadcastSending(true);
    try {
      const res = await fetch('/api/coordinator/email-broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject: emailBroadcastSubject.trim(),
          content: emailBroadcastContent.trim(),
          recipientType: emailRecipientType,
          registrationIds: emailRecipientType === 'selected' ? emailSelectedIds : []
        })
      });
      if (res.ok) {
        const data = await res.json();
        alert(`Email broadcast complete! Successfully sent to ${data.sent_count} delegates.`);
        setEmailBroadcastSubject('');
        setEmailBroadcastContent('');
        setEmailSelectedIds([]);
      } else {
        const err = await res.json().catch(() => ({ error: 'Broadcast failed.' }));
        alert(`Failed to send email broadcast: ${err.error}`);
      }
    } catch (err) {
      alert('Network error. Failed to send email broadcast.');
    } finally {
      setIsEmailBroadcastSending(false);
    }
  };

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

  // Position Papers states & API functions
  const [positionPapers, setPositionPapers] = useState<any[]>([]);
  const [isPPLoading, setIsPPLoading] = useState(false);
  const [activePPPreview, setActivePPPreview] = useState<any>(null);

  const fetchPositionPapers = async () => {
    setIsPPLoading(true);
    try {
      const res = await fetch('/api/coordinator/position-papers');
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

  const handleCoordinatorDeletePP = async (ppId: string) => {
    if (!window.confirm('Are you sure you want to delete this position paper from the system?')) return;
    try {
      const res = await fetch(`/api/coordinator/position-paper/${ppId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        alert('Position paper deleted successfully!');
        if (activePPPreview?.id === ppId) setActivePPPreview(null);
        fetchPositionPapers();
      } else {
        alert('Failed to delete position paper.');
      }
    } catch (e) {
      alert('Delete failed.');
    }
  };

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
    } catch (e) {
      console.error(e);
      return '#';
    }
  };

  useEffect(() => {
    if (activeTab === 'position_papers') {
      fetchPositionPapers();
    }
  }, [activeTab]);

  // Coordinator Messages states & API functions
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const [activeMsgRecipient, setActiveMsgRecipient] = useState<string>('all');
  const [newMsgContent, setNewMsgContent] = useState('');
  const [isMsgSending, setIsMsgSending] = useState(false);

  const fetchAllMessages = async () => {
    try {
      const res = await fetch(`/api/messages?_=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setAllMessages(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendCoordinatorMessage = async (e: React.FormEvent) => {
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
        const fetchRes = await fetch('/api/messages');
        if (fetchRes.ok) {
          const data = await fetchRes.json();
          setAllMessages(data);
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

  // Chat filter, unread counters, and recent sorting logic
  const [delegateGradeFilter, setDelegateGradeFilter] = useState<'all' | 7 | 8 | 9 | 10>('all');

  useEffect(() => {
    if (activeTab === 'messages' && activeMsgRecipient && activeMsgRecipient !== 'all' && !activeMsgRecipient.startsWith('grade_')) {
      localStorage.setItem(`pmun_read_msg_${activeMsgRecipient}`, new Date().toISOString());
    }
  }, [activeMsgRecipient, allMessages, activeTab]);

  const getUnreadCount = (regId: string) => {
    const lastReadStr = localStorage.getItem(`pmun_read_msg_${regId}`);
    const lastReadTime = lastReadStr ? new Date(lastReadStr).getTime() : 0;
    
    const incomingMsgs = allMessages.filter(msg => 
      msg.sender_role === 'delegate' && 
      msg.sender_id === regId && 
      msg.recipient_id === 'coordinator' &&
      (msg.type || 'message') === 'message'
    );
    
    return incomingMsgs.filter(msg => new Date(msg.sent_at).getTime() > lastReadTime).length;
  };

  const getSortedDelegates = () => {
    const filtered = registrations.filter(reg => 
      delegateGradeFilter === 'all' || reg.grade === delegateGradeFilter
    );
    
    const getLatestTime = (regId: string) => {
      const msgs = allMessages.filter(msg => 
        (msg.recipient_id === regId || msg.sender_id === regId) &&
        (msg.type || 'message') === 'message'
      );
      if (msgs.length === 0) return 0;
      return Math.max(...msgs.map(m => new Date(m.sent_at).getTime()));
    };
    
    return [...filtered].sort((a, b) => {
      const timeA = getLatestTime(a.id);
      const timeB = getLatestTime(b.id);
      if (timeA !== timeB) {
        return timeB - timeA;
      }
      return a.name.localeCompare(b.name);
    });
  };

  // Coordinator Announcements states & API functions
  const [activeAnnounceRecipient, setActiveAnnounceRecipient] = useState<string>('all');
  const [newAnnounceContent, setNewAnnounceContent] = useState('');
  const [isAnnounceSending, setIsAnnounceSending] = useState(false);

  const handleSendCoordinatorAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnounceContent.trim() || !activeAnnounceRecipient) return;
    setIsAnnounceSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipient_id: activeAnnounceRecipient,
          content: newAnnounceContent.trim(),
          type: 'announcement'
        })
      });
      if (res.ok) {
        setNewAnnounceContent('');
        const fetchRes = await fetch('/api/messages');
        if (fetchRes.ok) {
          const data = await fetchRes.json();
          setAllMessages(data);
        }
      } else {
        const err = await res.json().catch(() => ({ error: 'Failed to post announcement.' }));
        alert(err.error);
      }
    } catch (err) {
      alert('Network error.');
    } finally {
      setIsAnnounceSending(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'announcements') {
      fetchAllMessages();
      const interval = setInterval(fetchAllMessages, 5000); // Polling every 5s STAT
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'messages') {
      fetchAllMessages();
      const interval = setInterval(fetchAllMessages, 5000); // Polling every 5s STAT
      return () => clearInterval(interval);
    }
  }, [activeTab]);

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

  // Change allocated committee and adjust country portfolio
  const handleUpdateCommittee = async (reg: Registration, newComm: string) => {
    if (!reg || !newComm) return;
    if (reg.committee === newComm) return;

    if (!window.confirm(`Are you sure you want to change ${reg.name}'s committee from ${reg.committee.toUpperCase()} to ${newComm.toUpperCase()}? This will release their currently assigned country portfolio.`)) {
      return;
    }

    setIsActionLoading(true);
    try {
      // 1. Release old country allocation if allocated
      if (reg.committee !== 'NOT ASSIGNED' && reg.assigned_country !== 'NOT ASSIGNED') {
        const oldCountryObj = countries.find(
          (c) =>
            c.committee_id.toLowerCase() === reg.committee.toLowerCase() &&
            c.country_name.toLowerCase() === reg.assigned_country.toLowerCase()
        );
        if (oldCountryObj) {
          await API.updateCountry(oldCountryObj.id, { assigned_to: null, available: true });
        }
      }

      // 2. Find first available country in the new committee
      const newCountryObj = countries.find(
        (c) =>
          c.committee_id.toLowerCase() === newComm.toLowerCase() &&
          (!c.assigned_to || c.assigned_to === '') &&
          c.available !== false
      );

      const newCountry = newCountryObj ? newCountryObj.country_name : 'NOT ASSIGNED';

      // 3. Update the Registration table
      await API.updateRegistration(reg.id, {
        committee: newComm,
        assigned_country: newCountry,
      });

      // 4. Lock new country in database if assigned
      if (newCountryObj) {
        await API.updateCountry(newCountryObj.id, { assigned_to: reg.id, available: false });
      }

      alert(`Committee changed successfully! Assigned country: ${newCountry}`);
      setIsAllocationModalOpen(false);
      setSelectedReg(null);
      await refreshData();
    } catch (err: any) {
      alert(`Failed to change committee: ${err.message}`);
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

  // CSV Exporter for approved registrations only
  const handleExportApprovedCSV = () => {
    const approvedRegs = registrations.filter((r) => r.status === 'APPROVED');
    if (approvedRegs.length === 0) {
      alert('No approved registrations available to export.');
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
      ...approvedRegs.map((r) =>
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
    link.setAttribute('download', 'PISGMUN_Approved_Delegates.csv');
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

  const [isBatchEmailSending, setIsBatchEmailSending] = useState(false);

  const handleBatchSendEmail = async () => {
    const selectedRegs = registrations.filter(r => selectedRegIds.includes(r.id));
    if (selectedRegs.length === 0) return;

    if (!window.confirm(`Are you sure you want to send/resend the confirmation email to the ${selectedRegs.length} selected registration(s)?`)) return;

    setIsBatchEmailSending(true);
    let successCount = 0;
    let failCount = 0;

    for (const reg of selectedRegs) {
      try {
        const res = await fetch(`/api/coordinator/registrations/${reg.id}/send-confirmation`, {
          method: 'POST',
        });
        if (res.ok) {
          successCount++;
        } else {
          console.error(`Failed to send email to ${reg.id}`);
          failCount++;
        }
      } catch (err) {
        console.error(`Network error sending email to ${reg.id}:`, err);
        failCount++;
      }
    }

    alert(`Batch email dispatch completed! Sent successfully: ${successCount}, Failed: ${failCount}`);
    setSelectedRegIds([]);
    await refreshData();
    setIsBatchEmailSending(false);
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

  const grade7Count = registrations.filter((r) => r.grade === 7 && r.status === 'APPROVED').length;
  const grade8Count = registrations.filter((r) => r.grade === 8 && r.status === 'APPROVED').length;
  const grade9Count = registrations.filter((r) => r.grade === 9 && r.status === 'APPROVED').length;
  const grade10Count = registrations.filter((r) => r.grade === 10 && r.status === 'APPROVED').length;



  const tabsConfig = [
    { id: 'overview', label: 'Overview & Settings' },
    { id: 'roster', label: `Roster File (${filteredRegs.length})` },
    { id: 'committees', label: 'Committees Config' },
    { id: 'passwords', label: 'Portal Passwords' },
    { id: 'position_papers', label: 'Position Papers' },
    { id: 'messages', label: 'Messages' },
    { id: 'announcements', label: 'Announcements' },
    { id: 'write_email', label: 'Write Email' },
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
            Coordinator Panel
          </span>
          <h2 style={{ fontSize: '2rem', color: 'var(--color-primary)', margin: '0.25rem 0 0 0' }}>
            MUN Coordinator Console
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="outline" size="sm" onClick={handleExportAllCSV}>
            <Download size={14} /> Export All CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportApprovedCSV}>
            <Download size={14} /> Export Approved Only
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
                      variant="primary"
                      size="sm"
                      onClick={handleBatchSendEmail}
                      loading={isBatchEmailSending}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Mail size={14} /> Send Email Selected
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
                          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <Button variant="outline" size="sm" onClick={() => handleOpenAllocation(reg)}>
                              <Edit3 size={12} /> Manage
                            </Button>
                            <Button
                              variant={reg.confirmation_email_sent ? "outline" : "primary"}
                              size="sm"
                              loading={emailSendingMap[reg.id] || false}
                              onClick={() => handleSendConfirmationEmail(reg.id)}
                              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                              title={reg.confirmation_email_sent ? `Sent at: ${formatIST(reg.confirmation_email_sent_at)}${reg.confirmation_email_error ? ' | Error: ' + reg.confirmation_email_error : ''}` : "Send confirmation email"}
                            >
                              <Mail size={12} />
                              {reg.confirmation_email_sent ? "Resend" : "Send Email"}
                            </Button>
                          </div>
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

          {/* TAB 5: POSITION PAPERS */}
          {activeTab === 'position_papers' && (
            <Card elevation="md" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
                <BookOpen size={20} style={{ color: 'var(--color-secondary)' }} />
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-primary)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>
                  Submitted Position Papers
                </h3>
              </div>

              {isPPLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                  <Loader2 className="spin" size={28} style={{ color: 'var(--color-secondary)' }} />
                </div>
              ) : positionPapers.length === 0 ? (
                <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', fontStyle: 'italic', textAlign: 'center', margin: '2rem 0' }}>
                  No position papers have been uploaded by delegates yet.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* Preview pane if one is selected */}
                  {activePPPreview && (
                    <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1rem', backgroundColor: 'var(--color-bg-main)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-primary)' }}>
                          Viewing: {activePPPreview.delegate_name} ({activePPPreview.committee.toUpperCase()}) - {activePPPreview.filename}
                        </span>
                        <Button variant="outline" size="sm" onClick={() => setActivePPPreview(null)}>Close Preview</Button>
                      </div>
                      {activePPPreview.file_type === 'application/pdf' ? (
                        <iframe
                          src={getFileBlobUrl(activePPPreview.file_data)}
                          width="100%"
                          height="450px"
                          style={{ border: 'none', borderRadius: 'var(--radius-sm)' }}
                        />
                      ) : (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>
                          <FileText size={40} style={{ color: 'var(--color-secondary)', margin: '0 auto 1rem auto' }} />
                          <p style={{ fontSize: '0.88rem', fontWeight: 600 }}>Word Document Viewer is not natively supported in browser.</p>
                          <a
                            href={getFileBlobUrl(activePPPreview.file_data)}
                            download={activePPPreview.filename}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              backgroundColor: 'var(--color-primary)',
                              color: '#ffffff',
                              padding: '0.5rem 1rem',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              textDecoration: 'none',
                              marginTop: '1rem'
                            }}
                          >
                            <Download size={14} /> Download Word Document
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* List of submissions */}
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left', color: 'var(--color-text-muted)', fontWeight: 800 }}>
                          <th style={{ padding: '0.75rem 1rem' }}>Delegate Name</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Committee</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Filename</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Uploaded At</th>
                          <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {positionPapers.map((pp) => (
                          <tr
                            key={pp.id}
                            style={{
                              borderBottom: '1px solid var(--color-border)',
                              backgroundColor: pp.deleted_by_delegate ? 'rgba(239, 68, 68, 0.04)' : 'transparent'
                            }}
                          >
                            <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                              {pp.delegate_name}
                              {pp.deleted_by_delegate && (
                                <span style={{ fontSize: '0.68rem', color: '#c62828', marginLeft: '6px', backgroundColor: 'rgba(198, 40, 40, 0.08)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                                  DELETED BY DELEGATE
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--color-secondary)' }}>
                              {pp.committee.toUpperCase()}
                            </td>
                            <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)' }}>
                              {pp.filename}
                            </td>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              {formatIST(pp.uploaded_at)}
                            </td>
                            <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                                <Button variant="outline" size="sm" onClick={() => setActivePPPreview(pp)}>
                                  View
                                </Button>
                                <button
                                  onClick={() => handleCoordinatorDeletePP(pp.id)}
                                  style={{
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    color: '#c62828',
                                    cursor: 'pointer',
                                    padding: '6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 'var(--radius-sm)',
                                    transition: 'background-color 0.2s',
                                  }}
                                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(198, 40, 40, 0.1)'}
                                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* TAB 6: MESSAGES */}
          {activeTab === 'messages' && (
            <Card elevation="md" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', minHeight: '550px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
                <BookOpen size={20} style={{ color: 'var(--color-secondary)' }} />
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-primary)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>
                  Staff Communication Portal
                </h3>
              </div>

              <div style={{ display: 'flex', gap: '2rem', flex: 1 }} className="grid-responsive">
                {/* Left side: Delegate list & search */}
                <div style={{ flex: '0 0 320px', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--color-border)', paddingRight: '1.5rem', maxHeight: '550px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.5rem', display: 'block' }}>
                    Select Chat Recipient
                  </span>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto', flex: 1 }}>
                    {/* Broadcast choices */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveMsgRecipient('all');
                        setDelegateGradeFilter('all');
                      }}
                      style={{
                        padding: '0.75rem 1rem',
                        textAlign: 'left',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid',
                        borderColor: activeMsgRecipient === 'all' ? 'var(--color-secondary)' : 'var(--color-border)',
                        backgroundColor: activeMsgRecipient === 'all' ? 'var(--color-secondary-bg)' : '#ffffff',
                        color: activeMsgRecipient === 'all' ? 'var(--color-secondary)' : 'var(--color-primary)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '0.82rem'
                      }}
                    >
                      📢 Broadcast: All Delegates
                    </button>

                    {['7', '8', '9', '10'].map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => {
                          setActiveMsgRecipient(`grade_${g}`);
                          setDelegateGradeFilter(parseInt(g) as 7 | 8 | 9 | 10);
                        }}
                        style={{
                          padding: '0.65rem 1rem',
                          textAlign: 'left',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid',
                          borderColor: activeMsgRecipient === `grade_${g}` ? 'var(--color-secondary)' : 'var(--color-border)',
                          backgroundColor: activeMsgRecipient === `grade_${g}` ? 'var(--color-secondary-bg)' : '#ffffff',
                          color: activeMsgRecipient === `grade_${g}` ? 'var(--color-secondary)' : 'var(--color-primary)',
                          fontWeight: 700,
                          cursor: 'pointer',
                          fontSize: '0.82rem'
                        }}
                      >
                        🎓 Broadcast: Grade {g}
                      </button>
                    ))}

                    <div style={{ borderTop: '1px solid var(--color-border)', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.5rem', display: 'block' }}>
                        {delegateGradeFilter === 'all' ? 'All Individual Delegates' : `Grade ${delegateGradeFilter} Delegates`}
                      </span>
                      {getSortedDelegates().length === 0 ? (
                        <p style={{ fontSize: '0.75rem', fontStyle: 'italic', color: 'var(--color-text-muted)' }}>No delegates found.</p>
                      ) : (
                        getSortedDelegates().map(reg => {
                          const unreadCount = getUnreadCount(reg.id);
                          return (
                            <button
                              key={reg.id}
                              type="button"
                              onClick={() => setActiveMsgRecipient(reg.id)}
                              style={{
                                padding: '0.6rem 0.85rem',
                                textAlign: 'left',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid',
                                borderColor: activeMsgRecipient === reg.id ? 'var(--color-primary)' : 'var(--color-border)',
                                backgroundColor: activeMsgRecipient === reg.id ? 'var(--color-bg-main)' : '#ffffff',
                                color: 'var(--color-primary)',
                                cursor: 'pointer',
                                width: '100%',
                                marginBottom: '0.4rem',
                                fontSize: '0.8rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '8px'
                              }}
                            >
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
                                <span style={{ fontWeight: 700 }}>{reg.name}</span>
                                <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>Grade {reg.grade}-{reg.section} • {reg.id}</span>
                              </div>
                              {unreadCount > 0 && (
                                <span style={{
                                  backgroundColor: '#c62828',
                                  color: '#ffffff',
                                  borderRadius: '99px',
                                  padding: '2px 7px',
                                  fontSize: '0.68rem',
                                  fontWeight: 800,
                                  minWidth: '18px',
                                  textAlign: 'center',
                                  boxShadow: '0 2px 4px rgba(198, 40, 40, 0.2)'
                                }}>
                                  {unreadCount}
                                </span>
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side: Chat logs and input */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '550px' }}>
                  {/* Chat recipient header */}
                  <div style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-border)', marginBottom: '1rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-primary)' }}>
                      Conversation with:{' '}
                      {activeMsgRecipient === 'all'
                        ? '📢 All Delegates (Global Broadcast)'
                        : activeMsgRecipient.startsWith('grade_')
                        ? `🎓 Grade ${activeMsgRecipient.split('_')[1]} (Grade Broadcast)`
                        : `👤 ${registrations.find(r => r.id === activeMsgRecipient)?.name || activeMsgRecipient}`}
                    </span>
                  </div>

                  {/* Message feed */}
                  <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1rem', backgroundColor: 'var(--color-bg-main)', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                    {allMessages.filter(msg => {
                      const isPrivate = (msg.type || 'message') === 'message';
                      if (!isPrivate) return false;
                      if (activeMsgRecipient === 'all') {
                        return msg.recipient_id === 'all' && msg.sender_role === 'coordinator';
                      } else if (activeMsgRecipient.startsWith('grade_')) {
                        return msg.recipient_id === activeMsgRecipient && msg.sender_role === 'coordinator';
                      } else {
                        return (msg.recipient_id === activeMsgRecipient && msg.sender_role === 'coordinator') ||
                               (msg.sender_id === activeMsgRecipient && msg.sender_role === 'delegate' && msg.recipient_id === 'coordinator');
                      }
                    }).length === 0 ? (
                      <div style={{ margin: 'auto', color: 'var(--color-text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                        No messages sent in this channel yet.
                      </div>
                    ) : (
                      allMessages
                        .filter(msg => {
                          const isPrivate = (msg.type || 'message') === 'message';
                          if (!isPrivate) return false;
                          if (activeMsgRecipient === 'all') {
                            return msg.recipient_id === 'all' && msg.sender_role === 'coordinator';
                          } else if (activeMsgRecipient.startsWith('grade_')) {
                            return msg.recipient_id === activeMsgRecipient && msg.sender_role === 'coordinator';
                          } else {
                            return (msg.recipient_id === activeMsgRecipient && msg.sender_role === 'coordinator') ||
                                   (msg.sender_id === activeMsgRecipient && msg.sender_role === 'delegate' && msg.recipient_id === 'coordinator');
                          }
                        })
                        .map(msg => (
                          <div
                            key={msg.id}
                            style={{
                              alignSelf: msg.sender_role === 'coordinator' ? 'flex-end' : 'flex-start',
                              backgroundColor: msg.sender_role === 'coordinator' ? 'var(--color-secondary-bg)' : '#ffffff',
                              border: msg.sender_role === 'coordinator' ? '1px solid var(--color-secondary)' : '1px solid var(--color-border)',
                              borderRadius: 'var(--radius-md)',
                              padding: '0.65rem 0.9rem',
                              maxWidth: '80%',
                              fontSize: '0.82rem',
                              color: 'var(--color-primary)',
                              boxShadow: 'var(--shadow-sm)'
                            }}
                          >
                            <div style={{ fontWeight: 700, fontSize: '0.65rem', color: msg.sender_role === 'coordinator' ? 'var(--color-secondary)' : 'var(--color-primary)', marginBottom: '3px', textTransform: 'uppercase' }}>
                              {msg.sender_role === 'coordinator' ? 'You (MUN Coordinator)' : `${registrations.find(r => r.id === msg.sender_id)?.name || msg.sender_id} (Delegate)`}
                            </div>
                            <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.content}</div>
                            <div style={{ fontSize: '0.62rem', color: 'var(--color-text-muted)', textAlign: 'right', marginTop: '4px' }}>
                              {formatIST(msg.sent_at)}
                            </div>
                          </div>
                        ))
                    )}
                  </div>

                  {/* Message compose form */}
                  <form onSubmit={handleSendCoordinatorMessage} style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      placeholder="Type your official announcement or message here..."
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
          )}

          {/* TAB 7: ANNOUNCEMENTS */}
          {activeTab === 'announcements' && (
            <Card elevation="md" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', minHeight: '550px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
                <BookOpen size={20} style={{ color: 'var(--color-secondary)' }} />
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-primary)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>
                  Official Announcement Board
                </h3>
              </div>

              <div style={{ display: 'flex', gap: '2rem', flex: 1 }} className="grid-responsive">
                {/* Left side: Announcement scope targets */}
                <div style={{ flex: '0 0 300px', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--color-border)', paddingRight: '1.5rem', maxHeight: '550px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.75rem', display: 'block' }}>
                    Select Announcement Target
                  </span>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setActiveAnnounceRecipient('all')}
                      style={{
                        padding: '0.85rem 1rem',
                        textAlign: 'left',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid',
                        borderColor: activeAnnounceRecipient === 'all' ? 'var(--color-secondary)' : 'var(--color-border)',
                        backgroundColor: activeAnnounceRecipient === 'all' ? 'var(--color-secondary-bg)' : '#ffffff',
                        color: activeAnnounceRecipient === 'all' ? 'var(--color-secondary)' : 'var(--color-primary)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      📢 Broadcast: All Delegates
                    </button>

                    {['7', '8', '9', '10'].map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setActiveAnnounceRecipient(`grade_${g}`)}
                        style={{
                          padding: '0.75rem 1rem',
                          textAlign: 'left',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid',
                          borderColor: activeAnnounceRecipient === `grade_${g}` ? 'var(--color-secondary)' : 'var(--color-border)',
                          backgroundColor: activeAnnounceRecipient === `grade_${g}` ? 'var(--color-secondary-bg)' : '#ffffff',
                          color: activeAnnounceRecipient === `grade_${g}` ? 'var(--color-secondary)' : 'var(--color-primary)',
                          fontWeight: 700,
                          cursor: 'pointer',
                          fontSize: '0.85rem'
                        }}
                      >
                        🎓 Broadcast: Grade {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right side: Announcement feed and post box */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '550px' }}>
                  <div style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-border)', marginBottom: '1rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-primary)' }}>
                      Announcements sent to:{' '}
                      {activeAnnounceRecipient === 'all'
                        ? '📢 All Delegates'
                        : `🎓 Grade ${activeAnnounceRecipient.split('_')[1]}`}
                    </span>
                  </div>

                  {/* Announcement feed */}
                  <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1rem', backgroundColor: 'var(--color-bg-main)', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                    {allMessages.filter(msg => {
                      return msg.type === 'announcement' && msg.recipient_id === activeAnnounceRecipient;
                    }).length === 0 ? (
                      <div style={{ margin: 'auto', color: 'var(--color-text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                        No announcements posted in this channel yet.
                      </div>
                    ) : (
                      allMessages
                        .filter(msg => msg.type === 'announcement' && msg.recipient_id === activeAnnounceRecipient)
                        .map(msg => (
                          <div
                            key={msg.id}
                            style={{
                              alignSelf: 'stretch',
                              backgroundColor: '#ffffff',
                              border: '1px solid var(--color-border)',
                              borderRadius: 'var(--radius-md)',
                              padding: '0.75rem 1rem',
                              fontSize: '0.82rem',
                              color: 'var(--color-primary)',
                              boxShadow: 'var(--shadow-sm)'
                            }}
                          >
                            <div style={{ fontWeight: 700, fontSize: '0.65rem', color: 'var(--color-secondary)', marginBottom: '3px', textTransform: 'uppercase' }}>
                              You (MUN Coordinator)
                            </div>
                            <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontWeight: 500 }}>{msg.content}</div>
                            <div style={{ fontSize: '0.62rem', color: 'var(--color-text-muted)', textAlign: 'right', marginTop: '4px' }}>
                              {formatIST(msg.sent_at)}
                            </div>
                          </div>
                        ))
                    )}
                  </div>

                  {/* Compose Announcement form */}
                  <form onSubmit={handleSendCoordinatorAnnouncement} style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      placeholder="Type your official announcement here..."
                      value={newAnnounceContent}
                      onChange={(e) => setNewAnnounceContent(e.target.value)}
                      className="form-control"
                      style={{ flex: 1 }}
                      disabled={isAnnounceSending}
                    />
                    <Button type="submit" variant="primary" loading={isAnnounceSending} style={{ padding: '0.65rem 1.5rem' }}>
                      Publish
                    </Button>
                  </form>
                </div>
              </div>
            </Card>
          )}

          {/* TAB 8: WRITE EMAIL */}
          {activeTab === 'write_email' && (
            <Card elevation="md" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', minHeight: '500px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
                <Mail size={20} style={{ color: 'var(--color-secondary)' }} />
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-primary)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>
                  Broadcast Email to Approved Delegates
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '800px' }}>
                <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  This will send a professional HTML email to the selected group of delegates. The email will automatically use the official visual identity of PISGMUN. You can personalize the message by writing <strong>{"{{NAME}}"}</strong> which will be replaced with each delegate's name.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-primary)' }}>
                    Recipient Group
                  </label>
                  <div style={{ display: 'flex', gap: '1.5rem', marginTop: '4px', flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', cursor: 'pointer', color: 'var(--color-text)' }}>
                      <input
                        type="radio"
                        name="emailRecipientGroup"
                        checked={emailRecipientType === 'approved'}
                        onChange={() => setEmailRecipientType('approved')}
                        disabled={isEmailBroadcastSending}
                      />
                      All Approved Delegates ({registrations.filter(r => r.status === 'APPROVED').length})
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', cursor: 'pointer', color: 'var(--color-text)' }}>
                      <input
                        type="radio"
                        name="emailRecipientGroup"
                        checked={emailRecipientType === 'selected'}
                        onChange={() => setEmailRecipientType('selected')}
                        disabled={isEmailBroadcastSending}
                      />
                      Selected Delegates ({emailSelectedIds.length})
                    </label>
                  </div>
                </div>

                {emailRecipientType === 'selected' && (
                  <div style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    backgroundColor: 'rgba(0, 32, 74, 0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <input
                        type="text"
                        placeholder="Search delegates by name, email, or grade..."
                        value={emailSearchQuery}
                        onChange={(e) => setEmailSearchQuery(e.target.value)}
                        className="form-control"
                        style={{ flex: 1, minWidth: '200px', fontSize: '0.85rem', padding: '0.4rem 0.75rem' }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const filtered = registrations.filter(r => 
                            r.name.toLowerCase().includes(emailSearchQuery.toLowerCase()) ||
                            r.email.toLowerCase().includes(emailSearchQuery.toLowerCase()) ||
                            String(r.grade).includes(emailSearchQuery) ||
                            r.section.toLowerCase().includes(emailSearchQuery.toLowerCase())
                          );
                          const allFilteredIds = filtered.map(r => r.id);
                          setEmailSelectedIds(prev => Array.from(new Set([...prev, ...allFilteredIds])));
                        }}
                        style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                      >
                        Select All Matches
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setEmailSelectedIds([])}
                        style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                      >
                        Clear All
                      </Button>
                    </div>

                    <div style={{
                      maxHeight: '220px',
                      overflowY: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem',
                      paddingRight: '0.25rem',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.5rem',
                      backgroundColor: '#ffffff'
                    }}>
                      {registrations
                        .filter(r => {
                          const term = emailSearchQuery.toLowerCase();
                          return r.name.toLowerCase().includes(term) ||
                                 r.email.toLowerCase().includes(term) ||
                                 String(r.grade).includes(term) ||
                                 r.section.toLowerCase().includes(term);
                        })
                        .map(reg => {
                          const isChecked = emailSelectedIds.includes(reg.id);
                          return (
                            <label
                              key={reg.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '0.85rem',
                                padding: '0.4rem 0.5rem',
                                borderRadius: '4px',
                                border: '1px solid var(--color-border)',
                                backgroundColor: isChecked ? 'rgba(0, 123, 255, 0.05)' : '#ffffff',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  setEmailSelectedIds(prev =>
                                    prev.includes(reg.id)
                                      ? prev.filter(id => id !== reg.id)
                                      : [...prev, reg.id]
                                  );
                                }}
                              />
                              <div style={{ flex: 1 }}>
                                <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{reg.name}</span>
                                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginLeft: '6px' }}>
                                  ({reg.email})
                                </span>
                              </div>
                              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginRight: '6px' }}>
                                Gr {reg.grade}-{reg.section}
                              </span>
                              <span style={{
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                padding: '2px 6px',
                                borderRadius: '4px',
                                backgroundColor: reg.status === 'APPROVED' ? '#d4edda' : '#f8d7da',
                                color: reg.status === 'APPROVED' ? '#155724' : '#721c24'
                              }}>
                                {reg.status}
                              </span>
                            </label>
                          );
                        })}
                      {registrations.filter(r => {
                        const term = emailSearchQuery.toLowerCase();
                        return r.name.toLowerCase().includes(term) ||
                               r.email.toLowerCase().includes(term) ||
                               String(r.grade).includes(term) ||
                               r.section.toLowerCase().includes(term);
                      }).length === 0 && (
                        <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                          No matching delegates found.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-primary)' }}>
                    Email Subject
                  </label>
                  <input
                    type="text"
                    placeholder="Enter email subject (e.g. PISGMUN 2026 | Important Notice regarding Committee Guidelines)"
                    value={emailBroadcastSubject}
                    onChange={(e) => setEmailBroadcastSubject(e.target.value)}
                    className="form-control"
                    disabled={isEmailBroadcastSending}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-primary)' }}>
                    Email Body Message
                  </label>
                  <textarea
                    rows={8}
                    placeholder="Write your email body message here... You can use {{NAME}} to dynamically display the candidate's name."
                    value={emailBroadcastContent}
                    onChange={(e) => setEmailBroadcastContent(e.target.value)}
                    className="form-control"
                    style={{ resize: 'vertical', fontFamily: 'inherit', fontSize: '0.9rem' }}
                    disabled={isEmailBroadcastSending}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <Button
                    variant="primary"
                    loading={isEmailBroadcastSending}
                    onClick={handleSendEmailBroadcast}
                    style={{ padding: '0.75rem 2rem' }}
                  >
                    Send Email to Approved Delegates
                  </Button>
                </div>
              </div>
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

            {/* REALLOCATE COMMITTEE (ONLY IF APPROVED) */}
            {selectedReg.status === 'APPROVED' && (
              <Card style={{ backgroundColor: 'var(--color-bg-main)', border: '1px solid var(--color-border)', padding: '1.25rem' }}>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.92rem', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Reallocate Committee
                </h4>
                <p style={{ fontSize: '0.88rem', margin: '0 0 1rem 0', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                  Select a new committee to assign. This will release their currently assigned country and assign a new available country in the chosen committee.
                </p>
                <select
                  value={selectedReg.committee}
                  onChange={(e) => handleUpdateCommittee(selectedReg, e.target.value)}
                  disabled={isActionLoading}
                  className="form-control"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-surface)', color: 'var(--color-text)' }}
                >
                  {committees.map((comm) => (
                    <option key={comm.id} value={comm.id}>
                      {comm.name} ({comm.id.toUpperCase()})
                    </option>
                  ))}
                </select>
              </Card>
            )}

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
