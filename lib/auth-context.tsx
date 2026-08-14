'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSession } from './auth-service';

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  login: (email: string) => Promise<boolean>;
  signup: (data: { name: string; email: string; dob?: string; primary_doctor?: string }) => Promise<boolean>;
  logout: () => void;
  setDemoUser: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => false,
  signup: async () => false,
  logout: () => {},
  setDemoUser: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check saved session in localStorage / cookies
    const savedUser = localStorage.getItem('app_user_session');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('app_user_session');
      }
    } else {
      // Default to Ada Lovelace (PAT-2001) for seamless initial experience
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

  const login = async (email: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        localStorage.setItem('app_user_session', JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  const signup = async (data: { name: string; email: string; dob?: string; primary_doctor?: string }): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (resData.user) {
        setUser(resData.user);
        localStorage.setItem('app_user_session', JSON.stringify(resData.user));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Signup error:', err);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('app_user_session');
  };

  const setDemoUser = (userId: string) => {
    if (userId.startsWith('PAT-2001')) {
      login('ada@example.com');
    } else if (userId.startsWith('PAT-2002')) {
      login('alan@example.com');
    } else if (userId.startsWith('DOC-3001')) {
      login('dr.jenkins@example.com');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, setDemoUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
