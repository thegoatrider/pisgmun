import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API, type Committee, type Country, type Registration, type SystemConfig } from '../services/api';

// Global fetch interceptor to prevent multi-tab session conflicts
const originalFetch = window.fetch;
window.fetch = async function (input, init) {
  const url = typeof input === 'string' ? input : (input as Request).url;
  
  if (url.includes('/api/')) {
    const getSessionValue = (key: string) => {
      let val = sessionStorage.getItem(key);
      if (!val) {
        val = localStorage.getItem(key);
        if (val) {
          sessionStorage.setItem(key, val);
        }
      }
      return val;
    };

    const role = getSessionValue('pmun_session_role');
    const regId = getSessionValue('pmun_registration_id');
    const grade = getSessionValue('pmun_session_incharge_grade');
    
    init = init || {};
    const headers = new Headers(init.headers || {});
    
    if (role) {
      if (role === 'in_charge' && grade) {
        headers.set('X-Session-Role', `in_charge_${grade}`);
      } else {
        headers.set('X-Session-Role', role);
      }
    }
    if (regId) {
      headers.set('X-Session-RegId', regId);
    }
    
    init.headers = headers;
  }
  
  return originalFetch.apply(this, [input, init]);
};

interface AuthContextType {
  role: string | null;
  registrationId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (role: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  
  // Dynamic Datasets (Shared Application State)
  committees: Committee[];
  countries: Country[];
  registrations: Registration[];
  config: SystemConfig | null;
  refreshData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<string | null>(null);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Dynamic state
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [config, setConfig] = useState<SystemConfig | null>(null);

  // Load all application data
  const refreshData = useCallback(async () => {
    try {
      const [comms, countrs, regs, cfg] = await Promise.all([
        API.getCommittees(),
        API.getCountries(),
        API.getRegistrations().catch(() => []), // Admin only, might fail for delegates
        API.getConfig().catch(() => null)
      ]);
      setCommittees(comms);
      setCountries(countrs);
      setRegistrations(regs);
      if (cfg) setConfig(cfg);
    } catch (err) {
      console.error('Failed to load application data:', err);
    }
  }, []);

  // Initialize session and pull datasets
  const initializeAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      let session = await API.getSession();
      
      // Automatic re-login fallback for delegates if session expired/cleared
      if (!session.role) {
        const storedRole = sessionStorage.getItem('pmun_session_role') || localStorage.getItem('pmun_session_role');
        const storedRegId = sessionStorage.getItem('pmun_registration_id') || localStorage.getItem('pmun_registration_id');
        if (storedRole === 'delegate' && storedRegId) {
          try {
            const success = await API.verifyPassword('delegate', storedRegId);
            if (success) {
              session = { role: 'delegate', registration_id: storedRegId };
            }
          } catch (err) {
            console.warn('Auto re-login failed:', err);
          }
        }
      }
      
      if (session.role) {
        setRole(session.role);
        sessionStorage.setItem('pmun_session_role', session.role);
        localStorage.setItem('pmun_session_role', session.role);
      } else {
        setRole(null);
        sessionStorage.removeItem('pmun_session_role');
        sessionStorage.removeItem('pmun_session_incharge_grade');
        localStorage.removeItem('pmun_session_role');
        localStorage.removeItem('pmun_session_incharge_grade');
      }

      if (session.registration_id) {
        setRegistrationId(session.registration_id);
        sessionStorage.setItem('pmun_registration_id', session.registration_id);
        localStorage.setItem('pmun_registration_id', session.registration_id);
      } else {
        setRegistrationId(null);
        sessionStorage.removeItem('pmun_registration_id');
        localStorage.removeItem('pmun_registration_id');
      }
      
      // Load initial datasets
      await refreshData();
    } catch (e) {
      console.error('Error initializing authentication:', e);
      setRole(null);
      setRegistrationId(null);
    } finally {
      setIsLoading(false);
    }
  }, [refreshData]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Login handler
  const login = async (inputRole: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const success = await API.verifyPassword(inputRole, password);
      if (success) {
        // Clear all session storage and stale local storage values on new login
        sessionStorage.clear();
        localStorage.removeItem('pmun_session_role');
        localStorage.removeItem('pmun_session_incharge_grade');
        localStorage.removeItem('pmun_registration_id');

        if (inputRole.startsWith('in_charge_')) {
          const gradeNum = inputRole.split('_')[2];
          sessionStorage.setItem('pmun_session_role', 'in_charge');
          sessionStorage.setItem('pmun_session_incharge_grade', gradeNum);
          localStorage.setItem('pmun_session_role', 'in_charge');
          localStorage.setItem('pmun_session_incharge_grade', gradeNum);
          setRole('in_charge');
        } else if (inputRole === 'delegate') {
          sessionStorage.setItem('pmun_session_role', 'delegate');
          sessionStorage.setItem('pmun_registration_id', password.trim());
          localStorage.setItem('pmun_session_role', 'delegate');
          localStorage.setItem('pmun_registration_id', password.trim());
          setRole('delegate');
          setRegistrationId(password.trim());
        } else {
          sessionStorage.setItem('pmun_session_role', inputRole);
          localStorage.setItem('pmun_session_role', inputRole);
          setRole(inputRole);
        }
        
        // Load the updated datasets
        await refreshData();
        return { success: true };
      }
      return { success: false, error: 'Invalid credentials.' };
    } catch (e: any) {
      console.error('Login error:', e);
      return { success: false, error: e.message || 'Login failed. Please try again.' };
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await API.logout();
    } catch (e) {
      console.warn('Backend logout warning:', e);
    } finally {
      sessionStorage.clear();
      localStorage.removeItem('pmun_session_role');
      localStorage.removeItem('pmun_session_incharge_grade');
      localStorage.removeItem('pmun_registration_id');
      setRole(null);
      setRegistrationId(null);
    }
  };

  const value: AuthContextType = {
    role,
    registrationId,
    isAuthenticated: !!role,
    isLoading,
    login,
    logout,
    committees,
    countries,
    registrations,
    config,
    refreshData
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
