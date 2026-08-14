'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, MessageSquare, Ticket, BookOpen, Network, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Home', href: '/', icon: Bot },
    { name: 'Support Chat', href: '/chat', icon: MessageSquare },
    { name: 'Tickets', href: '/tickets', icon: Ticket },
    { name: 'RAG Knowledge', href: '/knowledge', icon: BookOpen },
    { name: 'Architecture', href: '/architecture', icon: Network },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-gray-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight">AutoSupport</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400 font-semibold border border-brand-500/30">
                AI Platform
              </span>
            </div>
            <p className="text-[11px] text-gray-400">n8n + RAG + Supabase</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30 shadow-sm'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Mode Indicator & Action CTA */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Standalone Demo Mode</span>
          </div>

          <Link
            href="/chat"
            className="gradient-button text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-2 shadow-md"
          >
            <Sparkles className="w-4 h-4" />
            <span>Start Chat</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
