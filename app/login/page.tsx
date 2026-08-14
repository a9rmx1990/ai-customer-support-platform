'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, User, Stethoscope, CheckCircle2, Lock } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);

    const success = await login(email);
    setLoading(false);

    if (success) {
      router.push('/chat?domain=medical');
    } else {
      setError('Account not found. Try Google Sign-In or one of the quick test accounts below.');
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    const success = await loginWithGoogle();
    setLoading(false);
    if (success) {
      router.push('/chat?domain=medical');
    }
  };

  const handleQuickLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setLoading(true);
    setError(null);

    const success = await login(demoEmail);
    setLoading(false);
    if (success) {
      router.push('/chat?domain=medical');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-950/40 border border-emerald-400/40">
          <Stethoscope className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Patient & Healthcare Login</h1>
        <p className="text-xs text-gray-400">
          Access your clinical AI assistant, appointments, diagnostic lab reports, and medical records securely.
        </p>
      </div>

      <div className="glass-panel p-8 rounded-2xl border border-gray-800 space-y-6 shadow-xl">
        {/* Official Google Sign-In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-white hover:bg-gray-100 text-gray-900 font-bold text-xs flex items-center justify-center gap-3 shadow-md transition-all border border-gray-300 disabled:opacity-60"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Sign in with Google Account</span>
        </button>

        <div className="relative flex items-center justify-center">
          <hr className="w-full border-gray-800" />
          <span className="absolute bg-gray-900 px-3 text-[10px] uppercase font-bold text-gray-500">
            or sign in with email
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Email Address</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="patient@example.com"
                className="w-full bg-gray-950 text-gray-100 text-xs pl-10 pr-4 py-3 rounded-xl border border-gray-800 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-gray-950 text-gray-100 text-xs pl-10 pr-4 py-3 rounded-xl border border-gray-800 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Authenticating...' : 'Sign In with Email'}</span>
          </button>
        </form>

        <hr className="border-gray-800" />

        {/* Quick Demo Fill Buttons */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">
            One-Click Test Accounts:
          </p>

          <button
            onClick={() => handleQuickLogin('ada@example.com')}
            className="w-full p-2.5 rounded-xl bg-gray-900/90 hover:bg-emerald-950/60 border border-gray-800 hover:border-emerald-500/40 text-left text-xs transition-all flex items-center justify-between text-gray-200"
          >
            <div>
              <p className="font-semibold text-emerald-300">Ada Lovelace (Patient)</p>
              <p className="text-[10px] text-gray-500">ada@example.com • PAT-2001</p>
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </button>

          <button
            onClick={() => handleQuickLogin('dr.jenkins@example.com')}
            className="w-full p-2.5 rounded-xl bg-gray-900/90 hover:bg-purple-950/60 border border-gray-800 hover:border-purple-500/40 text-left text-xs transition-all flex items-center justify-between text-gray-200"
          >
            <div>
              <p className="font-semibold text-purple-300">Dr. Sarah Jenkins (Doctor)</p>
              <p className="text-[10px] text-gray-500">dr.jenkins@example.com • DOC-3001</p>
            </div>
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
          </button>
        </div>

        <div className="pt-2 text-center text-xs text-gray-400">
          Don't have an account?{' '}
          <Link href="/signup" className="text-emerald-400 font-semibold hover:underline">
            Register New Patient
          </Link>
        </div>
      </div>
    </div>
  );
}
