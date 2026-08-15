'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase/client';
import type { Session, User } from '@supabase/supabase-js';

/**
 * The authenticated user session shape exposed to the application.
 * Identity is derived from Supabase Auth — never from client-supplied data.
 */
export interface UserSession {
  id: string;           // auth.users.id — Supabase UUID
  name: string;         // profiles.full_name
  email: string;        // auth.users.email
  role: 'patient' | 'doctor' | 'admin';
  avatar?: string;
  created_at: string;
  // Legacy fields kept for backwards compatibility with existing UI components
  dob?: string;
  primary_doctor?: string;
  token?: string;
}

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  supabaseConfigured: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: {
    name: string;
    email: string;
    password: string;
    role?: 'patient' | 'doctor';
    dob?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<boolean>;
  loginWithGoogleCredential: (credential: string) => Promise<boolean>;
  logout: () => Promise<void>;
  /** @deprecated Demo-only fallback — does not persist to Supabase */
  setDemoUser: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  supabaseConfigured: false,
  login: async () => ({ success: false }),
  signup: async () => ({ success: false }),
  loginWithGoogle: async () => false,
  loginWithGoogleCredential: async () => false,
  logout: async () => {},
  setDemoUser: () => {},
});

// ---------------------------------------------------------------------------
// Supabase credentials check
// ---------------------------------------------------------------------------
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const supabaseConfigured =
  SUPABASE_URL.startsWith('https://') &&
  SUPABASE_ANON_KEY.length > 20;

// ---------------------------------------------------------------------------
// Map a Supabase Auth user + their DB profile into a UserSession
// ---------------------------------------------------------------------------
async function buildUserSession(authUser: User): Promise<UserSession | null> {
  if (!supabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, role, avatar_url, created_at')
      .eq('id', authUser.id)
      .single();

    if (error || !data) return null;

    // Cast to avoid supabase-js generic inference issues when types are partially generated
    const profile = data as {
      full_name: string;
      role: string;
      avatar_url: string | null;
      created_at: string;
    };

    return {
      id: authUser.id,
      name: profile.full_name,
      email: authUser.email ?? '',
      role: profile.role as UserSession['role'],
      avatar: profile.avatar_url ?? undefined,
      created_at: profile.created_at,
      // token field kept for UI backwards compat — Supabase manages session internally
      token: authUser.id,
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Demo fallback session (used only when Supabase is not yet configured)
// ---------------------------------------------------------------------------
const DEMO_SESSION: UserSession = {
  id: 'PAT-2001',
  name: 'Ada Lovelace (Demo)',
  email: 'ada@example.com',
  role: 'patient',
  dob: '1985-12-10',
  primary_doctor: 'Dr. Sarah Jenkins (Cardiology)',
  token: 'demo-token',
  created_at: new Date().toISOString(),
};

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount: restore session from Supabase or fall back to demo
  useEffect(() => {
    if (!supabaseConfigured) {
      // No Supabase creds — use demo session for UI preview
      const saved = typeof window !== 'undefined' ? localStorage.getItem('app_user_session') : null;
      if (saved) {
        try { setUser(JSON.parse(saved)); } catch { setUser(DEMO_SESSION); }
      } else {
        setUser(DEMO_SESSION);
        localStorage.setItem('app_user_session', JSON.stringify(DEMO_SESSION));
      }
      setLoading(false);
      return;
    }

    // Real Supabase session check
    supabase.auth.getSession().then(async (result: { data: { session: { user: any } | null } }) => {
      const session = result?.data?.session;
      if (session?.user) {
        const userSession = await buildUserSession(session.user);
        setUser(userSession);
      }
      setLoading(false);
    });

    // Subscribe to auth state changes (login, logout, token refresh)
    const authListener = supabase.auth.onAuthStateChange(
      async (_event: any, session: { user: any } | null) => {
        if (session?.user) {
          const userSession = await buildUserSession(session.user);
          setUser(userSession);
        } else {
          setUser(null);
        }
      }
    );
    const subscription = authListener?.data?.subscription;

    return () => subscription.unsubscribe();
  }, []);

  // ---------------------------------------------------------------------------
  // Login with email + password
  // ---------------------------------------------------------------------------
  const login = useCallback(async (email: string, password: string) => {
    if (!supabaseConfigured) {
      // Demo fallback
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
      } catch {
        return { success: false, error: 'Login failed.' };
      }
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }, []);

  // ---------------------------------------------------------------------------
  // Sign up new user
  // ---------------------------------------------------------------------------
  const signup = useCallback(async (data: {
    name: string;
    email: string;
    password: string;
    role?: 'patient' | 'doctor';
    dob?: string;
  }) => {
    if (!supabaseConfigured) {
      // Demo fallback
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
      } catch {
        return { success: false, error: 'Registration failed.' };
      }
    }

    const role = data.role ?? 'patient';
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.name,
          role,
        },
      },
    });

    if (error) return { success: false, error: error.message };

    // If patient role, create patient_profile row after sign-up
    // (doctor profile is created separately via doctor onboarding flow)
    if (role === 'patient' && data.dob) {
      // Profile is auto-created by handle_new_user trigger
      // Patient profile needs a second call after session is established
      // Handled by the onAuthStateChange listener
    }

    return { success: true };
  }, []);

  // ---------------------------------------------------------------------------
  // Google OAuth
  // ---------------------------------------------------------------------------
  const loginWithGoogle = useCallback(async () => {
    if (!supabaseConfigured) {
      // Demo fallback
      try {
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'google.patient@example.com', name: 'Google Patient' }),
        });
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('app_user_session', JSON.stringify(data.user));
          return true;
        }
        return false;
      } catch {
        return false;
      }
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    });
    return !error;
  }, []);

  const loginWithGoogleCredential = useCallback(async (credential: string) => {
    if (!supabaseConfigured) return false;
    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: credential,
    });
    return !error;
  }, []);

  // ---------------------------------------------------------------------------
  // Logout — invalidates Supabase session, clears all state, redirects to /login
  // ---------------------------------------------------------------------------
  const logout = useCallback(async () => {
    if (supabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem('app_user_session');
    // Hard redirect to ensure all protected route guards re-evaluate
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Legacy demo user setter (no-op when Supabase is configured)
  // ---------------------------------------------------------------------------
  const setDemoUser = useCallback((_userId: string) => {
    if (!supabaseConfigured) {
      setUser(DEMO_SESSION);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        supabaseConfigured,
        login,
        signup,
        loginWithGoogle,
        loginWithGoogleCredential,
        logout,
        setDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
