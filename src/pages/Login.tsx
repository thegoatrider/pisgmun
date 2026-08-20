import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/UI/Card';
import { Input } from '../components/UI/Input';
import { Button } from '../components/UI/Button';
import { KeyRound, ShieldAlert, Users, Users2, ArrowLeft, LogIn } from 'lucide-react';

type RoleType = 'delegate' | 'in_charge_8' | 'in_charge_9' | 'in_charge_10' | 'coordinator';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, role: sessionRole, isLoading: authLoading } = useAuth();

  const [selectedRole, setSelectedRole] = useState<RoleType>('delegate');
  const [inChargeGrade, setInChargeGrade] = useState<'8' | '9' | '10'>('8');
  
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Parse URL role on mount
  useEffect(() => {
    const urlRole = searchParams.get('role');
    if (urlRole) {
      if (urlRole === 'in_charge') {
        setSelectedRole('in_charge_8');
      } else if (urlRole.startsWith('in_charge_') || urlRole === 'coordinator' || urlRole === 'delegate') {
        setSelectedRole(urlRole as RoleType);
      }
    }
  }, [searchParams]);

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (!authLoading && sessionRole) {
      if (sessionRole === 'delegate') navigate('/dashboard/delegate');
      else if (sessionRole === 'in_charge') navigate('/dashboard/in-charge');
      else if (sessionRole === 'coordinator') navigate('/dashboard/coordinator');
    }
  }, [sessionRole, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password.trim()) {
      setError(selectedRole === 'delegate' ? 'Registration ID is required.' : 'Password / Passcode is required.');
      return;
    }

    setIsSubmitting(true);
    
    // Determine the actual role string for backend verification
    const activeRole = selectedRole.startsWith('in_charge_') 
      ? `in_charge_${inChargeGrade}` 
      : selectedRole;

    const success = await login(activeRole, password.trim());
    setIsSubmitting(false);

    if (success) {
      if (activeRole.startsWith('in_charge_')) {
        navigate('/dashboard/in-charge');
      } else if (activeRole === 'delegate') {
        navigate('/dashboard/delegate');
      } else if (activeRole === 'coordinator') {
        navigate('/dashboard/coordinator');
      }
    } else {
      setError(
        selectedRole === 'delegate'
          ? 'Invalid Registration ID. Please check the ID and try again.'
          : 'Incorrect passcode/password. Please try again.'
      );
      setPassword('');
    }
  };

  const getRoleHeader = () => {
    if (selectedRole === 'delegate') {
      return {
        title: 'Delegate Portal Access',
        description: 'Enter your custom PIS Registration ID (e.g. PIS-2026-XXXX) to access your committee details.',
        icon: <Users size={28} style={{ color: 'var(--color-secondary)' }} />,
        label: 'Registration ID',
        placeholder: 'PIS-2026-XXXX',
      };
    }
    if (selectedRole.startsWith('in_charge_')) {
      return {
        title: 'Committee In-Charge Access',
        description: 'Select your grade assignment and enter your staff passcode to review registrations.',
        icon: <Users2 size={28} style={{ color: 'var(--color-secondary)' }} />,
        label: 'Staff Passcode',
        placeholder: '••••••••',
      };
    }
    return {
      title: 'MUN Coordinator Access',
      description: 'Enter the administrator password to manage allocations, settings, and database configurations.',
      icon: <ShieldAlert size={28} style={{ color: 'var(--color-secondary)' }} />,
      label: 'Admin Password',
      placeholder: '••••••••',
    };
  };

  const info = getRoleHeader();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 1.5rem',
        backgroundColor: 'var(--color-bg-main)',
        minHeight: 'calc(100vh - 70px - 340px)',
      }}
    >
      <div style={{ width: '100%', maxWidth: '480px' }} className="fade-in">
        {/* Back Link */}
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            border: 'none',
            background: 'none',
            color: 'var(--color-primary)',
            fontWeight: 700,
            cursor: 'pointer',
            marginBottom: '1.25rem',
            fontSize: '0.85rem',
            padding: 0,
          }}
        >
          <ArrowLeft size={16} /> Back to Homepage
        </button>

        <Card elevation="lg" style={{ padding: '2.5rem 2rem' }}>
          {/* Header Card branding */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '2rem', gap: '0.75rem' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {info.icon}
            </div>
            <h2 style={{ fontSize: '1.45rem', margin: 0, fontFamily: 'var(--font-display)', color: 'var(--color-primary)' }}>
              {info.title}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: '1.5', margin: 0 }}>
              {info.description}
            </p>
          </div>

          {/* Role selector tabs */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--color-bg-main)',
              borderRadius: 'var(--radius-md)',
              padding: '4px',
              marginBottom: '1.5rem',
            }}
          >
            {(['delegate', 'in_charge_8', 'coordinator'] as const).map((r) => {
              const label = r === 'delegate' ? 'Delegate' : r === 'coordinator' ? 'Coordinator' : 'In-Charge';
              const isActive = r === 'delegate' 
                ? selectedRole === 'delegate' 
                : r === 'coordinator' 
                ? selectedRole === 'coordinator' 
                : selectedRole.startsWith('in_charge_');

              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setSelectedRole(r);
                    setError(null);
                    setPassword('');
                  }}
                  style={{
                    flex: 1,
                    padding: '0.55rem 0.25rem',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    backgroundColor: isActive ? 'var(--color-bg-surface)' : 'transparent',
                    color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Conditional Grade Selector for In-Charge */}
            {selectedRole.startsWith('in_charge_') && (
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Assigned Grade</label>
                <select
                  value={inChargeGrade}
                  onChange={(e) => setInChargeGrade(e.target.value as '8' | '9' | '10')}
                  className="form-control"
                >
                  <option value="8">Grade 8 In-Charge</option>
                  <option value="9">Grade 9 In-Charge</option>
                  <option value="10">Grade 10 In-Charge</option>
                </select>
              </div>
            )}

            <Input
              label={info.label}
              type={selectedRole === 'delegate' ? 'text' : 'password'}
              placeholder={info.placeholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              required
            />

            {error && (
              <div
                style={{
                  backgroundColor: 'var(--color-error-bg)',
                  border: '1px solid var(--color-error)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 1rem',
                  color: 'var(--color-error)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '1.25rem',
                  lineHeight: '1.4',
                }}
              >
                <KeyRound size={14} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              Verify & Continue
              <LogIn size={14} />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
