import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API, type Committee, type Country, type Registration, type SystemConfig } from '../services/api';

interface AuthContextType {
  role: string | null;
  registrationId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (role: string, password: string) => Promise<boolean>;
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
      const session = await API.getSession();
      
      // Fallback local storage checks (similar to supabase-client.js fallback)
      const storedRole = localStorage.getItem('pmun_session_role');
      const storedRegId = localStorage.getItem('pmun_registration_id');

      if (session.role) {
        setRole(session.role);
        localStorage.setItem('pmun_session_role', session.role);
        if (session.registration_id) {
          setRegistrationId(session.registration_id);
          localStorage.setItem('pmun_registration_id', session.registration_id);
        }
      } else if (storedRole) {
        setRole(storedRole);
        if (storedRegId) {
          setRegistrationId(storedRegId);
        }
      }
      
      // Load initial datasets
      await refreshData();
    } catch (e) {
      console.error('Error initializing authentication:', e);
    } finally {
      setIsLoading(false);
    }
  }, [refreshData]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Login handler
  const login = async (inputRole: string, password: string): Promise<boolean> => {
    try {
      const success = await API.verifyPassword(inputRole, password);
      if (success) {
        if (inputRole.startsWith('in_charge_')) {
          const gradeNum = inputRole.split('_')[2];
          localStorage.setItem('pmun_session_incharge_grade', gradeNum);
          localStorage.setItem('pmun_session_role', 'in_charge');
          setRole('in_charge');
        } else if (inputRole === 'delegate') {
          localStorage.setItem('pmun_registration_id', password.trim());
          localStorage.setItem('pmun_session_role', 'delegate');
          setRole('delegate');
          setRegistrationId(password.trim());
        } else {
          localStorage.setItem('pmun_session_role', inputRole);
          setRole(inputRole);
        }
        
        // Load the updated datasets
        await refreshData();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Login error:', e);
      return false;
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await API.logout();
    } catch (e) {
      console.warn('Backend logout warning:', e);
    } finally {
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
