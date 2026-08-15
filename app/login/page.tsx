'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { LogIn, User, Stethoscope, CheckCircle2, Lock } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import GoogleSignInButton from '@/components/GoogleSignInButton';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, setDemoUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectTo = searchParams.get('redirect') || '/chat?domain=medical';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Invalid email or password.');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      router.push(redirectTo);
    } else {
      setError(result.error || 'Invalid email or password.');
    }
  };

  const handleQuickLogin = (demoId: string) => {
    setDemoUser(demoId);
    router.push(redirectTo);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-14 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-surface-elevated border border-triage-border-active flex items-center justify-center text-clinical-mint mx-auto font-bold">
          <Stethoscope className="w-6 h-6 stroke-[2]" />
        </div>
        <h1 className="text-2xl font-display font-bold text-white tracking-tight">Clinical & Patient Portal</h1>
        <p className="text-xs text-gray-400 font-body">
          Access your clinical AI assistant, appointments, diagnostic lab reports, and medical records securely.
        </p>
      </div>

      <div className="surface-elevated p-6 rounded-2xl border border-triage-border space-y-5">
        {/* Google OAuth Live SDK Button */}
        <GoogleSignInButton />

        <div className="relative flex items-center justify-center">
          <hr className="w-full border-triage-border" />
          <span className="absolute bg-surface-base px-2.5 text-[10px] uppercase font-mono font-semibold text-gray-400">
            or sign in with email
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-300 font-mono">Email Address</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="patient@example.com"
                className="w-full bg-surface-base text-gray-100 text-xs pl-9 pr-3 py-2.5 rounded-lg border border-triage-border focus:outline-none focus:border-triage-border-active font-body"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-300 font-mono">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-surface-base text-gray-100 text-xs pl-9 pr-3 py-2.5 rounded-lg border border-triage-border focus:outline-none focus:border-triage-border-active font-body"
              />
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2 font-mono">
              <span className="font-medium">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-clinical-mint hover:bg-emerald-400 text-ink font-display font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Authenticating...' : 'Sign In with Email'}</span>
          </button>
        </form>

        <hr className="border-triage-border" />

        {/* Quick Demo Fill Buttons */}
        <div className="space-y-2">
          <p className="text-[10px] font-mono font-semibold text-gray-400 uppercase tracking-wider text-center">
            One-Click Test Accounts:
          </p>

          <button
            type="button"
            onClick={() => handleQuickLogin('PAT-2001')}
            className="w-full p-2.5 rounded-lg bg-surface-base hover:bg-surface-elevated border border-triage-border hover:border-triage-border-active text-left text-xs transition-colors flex items-center justify-between text-gray-200"
          >
            <div>
              <p className="font-bold text-clinical-mint font-display">Ada Lovelace (Patient)</p>
              <p className="text-[10px] font-mono text-gray-400">ada@example.com • Password: password123</p>
            </div>
            <CheckCircle2 className="w-3.5 h-3.5 text-clinical-mint" />
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('DOC-3001')}
            className="w-full p-2.5 rounded-lg bg-surface-base hover:bg-surface-elevated border border-triage-border hover:border-signal-violet/40 text-left text-xs transition-colors flex items-center justify-between text-gray-200"
          >
            <div>
              <p className="font-bold text-signal-violet font-display">Dr. Sarah Jenkins (Doctor)</p>
              <p className="text-[10px] font-mono text-gray-400">dr.jenkins@example.com • Password: password123</p>
            </div>
            <CheckCircle2 className="w-3.5 h-3.5 text-signal-violet" />
          </button>
        </div>

        <div className="pt-1 text-center text-xs text-gray-400 font-body">
          Don't have an account?{' '}
          <Link href="/signup" className="text-clinical-mint font-semibold hover:underline">
            Register Patient
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto px-4 py-14 text-center text-xs text-gray-400 font-mono">Loading portal...</div>}>
      <LoginForm />
    </Suspense>
  );
}
