/* =========================================================================
   PMUN Nagpur Portal - API Integrations Service
   ========================================================================= */

export interface Committee {
  id: string;
  name: string;
  grade: number;
  description: string;
  agenda: string;
  eb_chair: string;
  eb_vice_chair: string;
  eb_rapporteur: string;
  rules: string;
  prepare_info: string;
  resources: { title: string; url: string }[];
  schedule: string;
  capacity: number;
  status: 'OPEN' | 'CLOSED';
}

export interface Country {
  id: number;
  committee_id: string;
  country_name: string;
  category: string;
  available: boolean;
  assigned_to: string | null;
  preference_count: number;
}

export interface Registration {
  id: string;
  name: string;
  grade: number;
  section: string;
  school: string;
  email: string;
  phone: string;
  portfolio_preference: 'delegate' | 'executive_committee' | 'vice_chair';
  mun_experience: string;
  additional_info: string;
  preferred_committee: string;
  country_preferences: string[];
  committee: string;
  assigned_country: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'NOT ASSIGNED';
  created_at?: string;
}

export interface SystemConfig {
  registration_status: 'OPEN' | 'CLOSED';
  deadline: string;
  allow_switch_committee: boolean;
}

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP error! status: ${res.status}`);
  }
  return res.json();
};

export const API = {
  // Session Check & Login
  async getSession(): Promise<{ role: string | null; registration_id: string | null }> {
    try {
      const res = await fetch('/api/auth/session');
      return await handleResponse(res);
    } catch (e) {
      console.warn('GetSession offline fallback:', e);
      return { role: null, registration_id: null };
    }
  },

  async verifyPassword(role: string, inputPassword: string): Promise<boolean> {
    const payload: Record<string, any> = { role };
    if (role === 'delegate') {
      payload.registration_id = inputPassword;
    } else {
      payload.password = inputPassword;
    }
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await handleResponse(res);
    return !!data.success;
  },

  async logout(): Promise<void> {
    const res = await fetch('/api/auth/logout', { method: 'POST' });
    await handleResponse(res);
  },

  async updatePasswords(newPasswords: Record<string, string>): Promise<boolean> {
    const res = await fetch('/api/auth/passwords/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPasswords)
    });
    const data = await handleResponse(res);
    return !!data.success;
  },

  // Configuration settings
  async getConfig(): Promise<SystemConfig> {
    const res = await fetch('/api/config');
    return await handleResponse(res);
  },

  async updateConfig(newConfig: SystemConfig): Promise<boolean> {
    const res = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newConfig)
    });
    const data = await handleResponse(res);
    return !!data.success;
  },

  // Committees
  async getCommittees(): Promise<Committee[]> {
    const res = await fetch('/api/committees');
    return await handleResponse(res);
  },

  async updateCommittee(commId: string, updateData: Partial<Committee>): Promise<boolean> {
    const res = await fetch(`/api/committees/${commId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    const data = await handleResponse(res);
    return !!data.success;
  },

  // Countries
  async getCountries(): Promise<Country[]> {
    const res = await fetch('/api/countries');
    return await handleResponse(res);
  },

  async updateCountry(countryId: number | string, updateData: Partial<Country>): Promise<boolean> {
    const res = await fetch(`/api/countries/${countryId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    const data = await handleResponse(res);
    return !!data.success;
  },

  // Registrations
  async getRegistrations(): Promise<Registration[]> {
    const res = await fetch('/api/registrations');
    return await handleResponse(res);
  },

  async submitRegistration(registrationData: Registration): Promise<Registration> {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registrationData)
    });
    return await handleResponse(res);
  },

  async updateRegistration(regId: string, updateData: Partial<Registration>): Promise<Registration> {
    const res = await fetch(`/api/registrations/${regId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    return await handleResponse(res);
  },

  async deleteRegistration(regId: string): Promise<boolean> {
    const res = await fetch(`/api/registrations/${regId}`, {
      method: 'DELETE'
    });
    const data = await handleResponse(res);
    return !!data.success;
  }
};
