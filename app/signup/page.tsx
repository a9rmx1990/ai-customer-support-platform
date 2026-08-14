'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, User, Mail, Calendar, UserCheck, Stethoscope, Lock } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import GoogleSignInButton from '@/components/GoogleSignInButton';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    dob: '',
    primary_doctor: 'Dr. Sarah Jenkins (Cardiology)',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('Name, email, and password are required.');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await signup(formData);
    setLoading(false);

    if (result.success) {
      router.push('/chat?domain=medical');
    } else {
      setError(result.error || 'Registration failed. Please try again or sign in with Google.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-950/40 border border-emerald-400/40">
          <Stethoscope className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Register New Patient Account</h1>
        <p className="text-xs text-gray-400">
          Create your clinical profile for 24/7 AI health support, telehealth appointment booking, and diagnostic lab access.
        </p>
      </div>

      <div className="glass-panel p-8 rounded-2xl border border-gray-800 space-y-6 shadow-xl">
        {/* Live Google OAuth Sign-In */}
        <GoogleSignInButton />

        <div className="relative flex items-center justify-center">
          <hr className="w-full border-gray-800" />
          <span className="absolute bg-gray-900 px-3 text-[10px] uppercase font-bold text-gray-500">
            or register manually
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Full Legal Name</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-500" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Eleanor Vance"
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
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="eleanor@example.com"
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
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="w-full bg-gray-950 text-gray-100 text-xs pl-10 pr-4 py-3 rounded-xl border border-gray-800 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Primary Care Physician</label>
            <div className="relative">
              <UserCheck className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-500" />
              <select
                value={formData.primary_doctor}
                onChange={(e) => setFormData({ ...formData, primary_doctor: e.target.value })}
                className="w-full bg-gray-950 text-gray-100 text-xs pl-10 pr-4 py-3 rounded-xl border border-gray-800 focus:outline-none focus:border-emerald-500"
              >
                <option value="Dr. Sarah Jenkins (Cardiology)">Dr. Sarah Jenkins (Cardiology)</option>
                <option value="Dr. Marcus Vance (Neurology)">Dr. Marcus Vance (Neurology)</option>
                <option value="Dr. Emily Chen (Internal Medicine)">Dr. Emily Chen (Internal Medicine)</option>
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
            <UserPlus className="w-4 h-4" />
            <span>{loading ? 'Registering Account...' : 'Complete Patient Registration'}</span>
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-gray-400">
          Already registered?{' '}
          <Link href="/login" className="text-emerald-400 font-semibold hover:underline">
            Sign In to Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
