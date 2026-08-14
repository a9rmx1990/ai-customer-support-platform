'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, User, Mail, Calendar, Stethoscope, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
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
            <span>{loading ? 'Creating Patient Account...' : 'Complete Patient Registration'}</span>
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
