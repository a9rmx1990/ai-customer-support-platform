'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSession } from './auth-service';

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: { name: string; email: string; password?: string; dob?: string; primary_doctor?: string }) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (customEmail?: string, customName?: string) => Promise<boolean>;
  loginWithGoogleCredential: (credential: string) => Promise<boolean>;
  logout: () => void;
  setDemoUser: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ success: false }),
  signup: async () => ({ success: false }),
  loginWithGoogle: async () => false,
  loginWithGoogleCredential: async () => false,
  logout: () => {},
  setDemoUser: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('app_user_session');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('app_user_session');
      }
    } else {
      const defaultAda: UserSession = {
        id: 'PAT-2001',
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        role: 'patient',
        dob: '1985-12-10',
        primary_doctor: 'Dr. Sarah Jenkins (Cardiology)',
        token: 'jwt-token-pat-2001-ada',
        created_at: new Date().toISOString(),
      };
      setUser(defaultAda);
      localStorage.setItem('app_user_session', JSON.stringify(defaultAda));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        localStorage.setItem('app_user_session', JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, error: data.error || 'Invalid email or password.' };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: 'Invalid email or password.' };
    }
  };

  const loginDemoUser = async (email: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, is_demo_click: true }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        localStorage.setItem('app_user_session', JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Demo Login error:', err);
      return false;
    }
  };

  const signup = async (data: {
    name: string;
    email: string;
    password?: string;
    dob?: string;
    primary_doctor?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (res.ok && resData.user) {
        setUser(resData.user);
        localStorage.setItem('app_user_session', JSON.stringify(resData.user));
        return { success: true };
      }
      return { success: false, error: resData.error || 'Registration failed.' };
    } catch (err) {
      console.error('Signup error:', err);
      return { success: false, error: 'Registration failed.' };
    }
  };

  const loginWithGoogle = async (customEmail?: string, customName?: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: customEmail || 'google.patient@example.com',
          name: customName || 'Google Verified Patient',
        }),
      });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        localStorage.setItem('app_user_session', JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Google Auth error:', err);
      return false;
    }
  };

  const loginWithGoogleCredential = async (credential: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        localStorage.setItem('app_user_session', JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Google Credential Auth error:', err);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('app_user_session');
  };

  const setDemoUser = (userId: string) => {
    if (userId.startsWith('PAT-2001')) {
      loginDemoUser('ada@example.com');
    } else if (userId.startsWith('PAT-2002')) {
      loginDemoUser('alan@example.com');
    } else if (userId.startsWith('DOC-3001')) {
      loginDemoUser('dr.jenkins@example.com');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, loginWithGoogle, loginWithGoogleCredential, logout, setDemoUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
