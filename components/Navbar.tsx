'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, MessageSquare, Ticket, Database, Layers, Stethoscope, LogIn, LogOut, Activity, Menu, X, Users } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home', icon: Bot },
    { href: '/chat?domain=medical', label: 'Support Chat', icon: MessageSquare },
    { href: '/doctors', label: 'Doctors', icon: Users },
    { href: '/tickets', label: 'Tickets', icon: Ticket },
    ...(user?.role === 'doctor' || user?.role === 'admin' ? [{ href: '/knowledge', label: 'Knowledge', icon: Database }] : []),
    { href: '/architecture', label: 'Architecture', icon: Layers },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="sticky top-0 z-50 surface-overlay border-b border-triage-border backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-surface-elevated border border-triage-border-active flex items-center justify-center text-clinical-mint font-bold transition-colors">
            <Stethoscope className="w-4 h-4 stroke-[2]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-sm text-white tracking-tight leading-none group-hover:text-clinical-mint transition-colors">
                AutoSupport AI
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold badge-mint">
                v2.4 Live
              </span>
            </div>
            <span className="text-[10px] text-gray-400 font-mono tracking-wider uppercase flex items-center gap-1 mt-0.5">
              <Activity className="w-2.5 h-2.5 text-clinical-mint inline" />
              <span>Multi-Domain AI Engine</span>
            </span>
          </div>
        </Link>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 bg-surface-base p-1 rounded-xl border border-triage-border">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href.startsWith('/chat') && pathname === '/chat');

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  isActive
                    ? 'bg-surface-elevated text-clinical-mint border border-triage-border-active font-semibold'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-surface-elevated/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Auth Profile / Actions & Mobile Hamburger */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-surface-base px-3 py-1.5 rounded-xl border border-triage-border">
                <div className="w-6 h-6 rounded bg-surface-overlay border border-triage-border text-clinical-mint text-xs font-mono font-bold flex items-center justify-center">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-xs font-semibold text-white line-clamp-1">{user.name}</span>
                  <span className="text-[9px] font-mono text-clinical-mint uppercase tracking-wider font-semibold">
                    {user.role}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-1.5 rounded-lg bg-surface-base hover:bg-rose-950/40 text-gray-400 hover:text-rose-300 border border-triage-border hover:border-rose-500/30 transition-colors text-xs flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline font-medium">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-surface-elevated transition-colors flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5 text-clinical-mint" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/signup"
                className="px-3.5 py-1.5 rounded-lg bg-clinical-mint hover:bg-emerald-400 text-ink font-semibold text-xs transition-colors"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-surface-base text-gray-400 hover:text-white border border-triage-border transition-colors ml-1"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-triage-border bg-surface-elevated p-3 space-y-1 font-body animate-in slide-in-from-top-2 duration-200">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href.startsWith('/chat') && pathname === '/chat');

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`w-full px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2.5 transition-colors ${
                  isActive
                    ? 'bg-surface-base text-clinical-mint border border-triage-border-active font-semibold'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-surface-base'
                }`}
              >
                <Icon className="w-4 h-4 text-clinical-mint" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}


