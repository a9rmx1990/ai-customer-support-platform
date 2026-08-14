'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, User, Mail, Calendar, Stethoscope, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function SignupPage() {
  const router = useRouter();
  const { signup, loginWithGoogle } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState('1990-05-15');
  const [primaryDoctor, setPrimaryDoctor] = useState('Dr. Sarah Jenkins (Cardiology)');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setLoading(true);
    setError(null);

    const success = await signup({
      name,
      email,
      dob,
      primary_doctor: primaryDoctor,
    });

    setLoading(false);

    if (success) {
      router.push('/chat?domain=medical');
    } else {
      setError('Registration failed. Please try again.');
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError(null);
    const success = await loginWithGoogle();
    setLoading(false);
    if (success) {
      router.push('/chat?domain=medical');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-950/40 border border-emerald-400/40">
          <UserPlus className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Patient Account Registration</h1>
        <p className="text-xs text-gray-400">
          Create a new patient account to access telehealth, doctor scheduling, and lab reports.
        </p>
      </div>

      <div className="glass-panel p-8 rounded-2xl border border-gray-800 space-y-6 shadow-xl">
        {/* Google SSO Button */}
        <button
          onClick={handleGoogleSignUp}
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
          <span>Sign up with Google Account</span>
        </button>

        <div className="relative flex items-center justify-center">
          <hr className="w-full border-gray-800" />
          <span className="absolute bg-gray-900 px-3 text-[10px] uppercase font-bold text-gray-500">
            or register with email
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarah Connor"
                className="w-full bg-gray-950 text-gray-100 text-xs pl-10 pr-4 py-3 rounded-xl border border-gray-800 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah@example.com"
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

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Date of Birth</label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-500" />
              <input
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full bg-gray-950 text-gray-100 text-xs pl-10 pr-4 py-3 rounded-xl border border-gray-800 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Select Primary Doctor</label>
            <div className="relative">
              <Stethoscope className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-500" />
              <select
                value={primaryDoctor}
                onChange={(e) => setPrimaryDoctor(e.target.value)}
                className="w-full bg-gray-950 text-gray-100 text-xs pl-10 pr-4 py-3 rounded-xl border border-gray-800 focus:outline-none focus:border-emerald-500"
              >
                <option value="Dr. Sarah Jenkins (Cardiology)">Dr. Sarah Jenkins (Cardiology)</option>
                <option value="Dr. Marcus Vance (Neurology)">Dr. Marcus Vance (Neurology)</option>
                <option value="Dr. Emily Chen (Internal Medicine)">Dr. Emily Chen (Internal Medicine)</option>
                <option value="Dr. Robert Ross (Dermatology)">Dr. Robert Ross (Dermatology)</option>
              </select>
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
            <span>{loading ? 'Creating Patient Account...' : 'Complete Registration'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-gray-400">
          Already registered?{' '}
          <Link href="/login" className="text-emerald-400 font-semibold hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
