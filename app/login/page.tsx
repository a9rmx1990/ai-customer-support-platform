'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, User, Stethoscope, CheckCircle2, Lock } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import GoogleSignInButton from '@/components/GoogleSignInButton';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
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
        {/* Google OAuth Live SDK Button */}
        <GoogleSignInButton />

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
