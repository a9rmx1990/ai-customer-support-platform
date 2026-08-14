'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, MessageSquare, Ticket, Database, Layers, Stethoscope, LogIn, LogOut, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navLinks = [
    { href: '/', label: 'Home', icon: Bot },
    { href: '/chat?domain=medical', label: 'Support Chat', icon: MessageSquare },
    { href: '/tickets', label: 'Tickets Dashboard', icon: Ticket },
    { href: '/knowledge', label: 'Vector Store', icon: Database },
    { href: '/architecture', label: 'System Architecture', icon: Layers },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-gray-800/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-950/40 group-hover:scale-105 transition-transform">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-sm text-white tracking-tight leading-none group-hover:text-emerald-400 transition-colors">
              AutoSupport AI
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">
              Clinical & E-Commerce
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href.startsWith('/chat') && pathname === '/chat');

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Auth Profile / Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-gray-900/90 px-3 py-1.5 rounded-xl border border-gray-800">
                <div className="w-6 h-6 rounded-lg bg-emerald-950 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-xs font-bold text-white line-clamp-1">{user.name}</span>
                  <span className="text-[9px] text-emerald-400 uppercase font-semibold">
                    {user.role} ({user.id})
                  </span>
                </div>
              </div>

              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 rounded-xl bg-gray-900 hover:bg-rose-950/60 text-gray-400 hover:text-rose-300 border border-gray-800 hover:border-rose-500/40 transition-all text-xs flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-300 hover:text-white hover:bg-gray-800 transition-all flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/signup"
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-950/40 transition-all"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
