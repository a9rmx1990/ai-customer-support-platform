'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, User, Mail, Calendar, UserCheck, Stethoscope, Lock, Shield } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import GoogleSignInButton from '@/components/GoogleSignInButton';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient' as 'patient' | 'doctor',
    dob: '',
    specialization: 'Cardiology',
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
      setError(result.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-10 h-10 rounded-xl bg-surface-base border border-triage-border-active flex items-center justify-center text-clinical-mint mx-auto">
          <Stethoscope className="w-5 h-5" />
        </div>
        <h1 className="text-xl font-display font-bold text-white tracking-tight">Create Clinical Account</h1>
        <p className="text-xs text-gray-400 font-body">
          Register as a Patient or Doctor to access clinical AI support and real-time medical consultations.
        </p>
      </div>

      <div className="surface-elevated p-6 rounded-2xl border border-triage-border space-y-5 shadow-2xl">
        {/* Live Google OAuth Sign-In */}
        <GoogleSignInButton />

        <div className="relative flex items-center justify-center font-mono">
          <hr className="w-full border-triage-border" />
          <span className="absolute bg-surface-elevated px-3 text-[10px] uppercase font-semibold text-gray-500">
            or register manually
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Account Role Dropdown */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono font-bold text-clinical-mint uppercase tracking-wider">Account Role</label>
            <div className="relative">
              <Shield className="w-4 h-4 absolute left-3 top-3 text-clinical-mint" />
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'patient' | 'doctor' })}
                className="w-full bg-surface-base text-white text-xs pl-9 pr-3.5 py-2.5 rounded-lg border border-clinical-mint/50 focus:outline-none focus:border-clinical-mint font-mono font-bold"
              >
                <option value="patient">Patient Account</option>
                <option value="doctor">Verified Doctor Account</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-mono font-medium text-gray-300">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={formData.role === 'doctor' ? 'e.g. Dr. Sarah Jenkins' : 'e.g. Eleanor Vance'}
                className="w-full bg-surface-base text-gray-100 placeholder-gray-500 text-xs pl-9 pr-3.5 py-2.5 rounded-lg border border-triage-border focus:outline-none focus:border-triage-border-active font-body"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-mono font-medium text-gray-300">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={formData.role === 'doctor' ? 'doctor@example.com' : 'patient@example.com'}
                className="w-full bg-surface-base text-gray-100 placeholder-gray-500 text-xs pl-9 pr-3.5 py-2.5 rounded-lg border border-triage-border focus:outline-none focus:border-triage-border-active font-body"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-mono font-medium text-gray-300">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••••••"
                className="w-full bg-surface-base text-gray-100 placeholder-gray-500 text-xs pl-9 pr-3.5 py-2.5 rounded-lg border border-triage-border focus:outline-none focus:border-triage-border-active font-body"
              />
            </div>
          </div>

          {formData.role === 'doctor' ? (
            <div className="space-y-1">
              <label className="text-[11px] font-mono font-medium text-gray-300">Medical Specialization</label>
              <div className="relative">
                <Stethoscope className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
                <select
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full bg-surface-base text-gray-100 text-xs pl-9 pr-3.5 py-2.5 rounded-lg border border-triage-border focus:outline-none focus:border-triage-border-active font-body"
                >
                  <option value="Cardiology">Cardiology</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Internal Medicine">Internal Medicine</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Pediatrics">Pediatrics</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <label className="text-[11px] font-mono font-medium text-gray-300">Date of Birth</label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full bg-surface-base text-gray-100 text-xs pl-9 pr-3.5 py-2.5 rounded-lg border border-triage-border focus:outline-none focus:border-triage-border-active font-body"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2 font-mono">
              <span className="font-medium">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-clinical-mint hover:bg-emerald-400 text-ink font-display font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-4"
          >
            <UserPlus className="w-4 h-4" />
            <span>{loading ? 'Creating Account...' : `Register as ${formData.role === 'doctor' ? 'Doctor' : 'Patient'}`}</span>
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-gray-400 font-body border-t border-triage-border">
          Already registered?{' '}
          <Link href="/login" className="text-clinical-mint font-semibold hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
