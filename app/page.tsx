'use client';

import Link from 'next/link';
import { Bot, Stethoscope, ShoppingBag, Building2, Sparkles, ArrowRight, ShieldCheck, Zap, Database, Ticket, CheckCircle2 } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-16 pb-16">
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider shadow-sm">
          <Sparkles className="w-4 h-4" />
          <span>Multi-Domain AI Platform: Medical / Clinic & E-Commerce & SaaS</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
          AI Customer & Healthcare Support <br className="hidden sm:inline" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-brand-400">
            Automation Platform
          </span>
        </h1>

        <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Autonomous AI support engine with domain-isolated RAG vector search, live database tool execution, medical clinic appointment scheduling, order cancellations, and human escalation workflows.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href="/chat?domain=medical"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all text-sm"
          >
            <Stethoscope className="w-5 h-5" />
            <span>Launch Medical Clinic AI</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/chat?domain=ecommerce"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-950/50 transition-all text-sm"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Launch E-Commerce AI</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Badges */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>HIPAA & Security Compliance</span>
          </div>
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-brand-400" />
            <span>PostgreSQL pgvector Store</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>n8n Webhook & Live Engine</span>
          </div>
        </div>
      </section>

      {/* THREE DOMAIN SHOWCASE CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-6 text-center">
          Supported Business & Clinical Domains
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* MEDICAL CARD */}
          <div className="glass-panel p-6 rounded-2xl border border-emerald-500/30 flex flex-col justify-between space-y-4 hover:border-emerald-500/60 transition-all">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">🩺 Medical & Clinical Service</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Automates doctor appointment booking, diagnostic lab test report lookups, prescription refills, clinic hours, insurance co-pays, and emergency 911 safeguards.
              </p>

              <ul className="space-y-2 text-xs text-gray-400 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Book & reschedule doctor appointments</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Fetch metabolic & imaging lab reports</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>HIPAA medical privacy & 911 rules</span>
                </li>
              </ul>
            </div>

            <Link
              href="/chat?domain=medical"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md"
            >
              <span>Try Clinical Mode</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* SHOPPING CARD */}
          <div className="glass-panel p-6 rounded-2xl border border-brand-500/30 flex flex-col justify-between space-y-4 hover:border-brand-500/60 transition-all">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-brand-600/20 border border-brand-500/40 flex items-center justify-center text-brand-400">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">🛍️ Shopping & Delivery</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Resolves order tracking inquiries (`#ORD-5001`), return eligibility checks, physical order cancellations before shipment, and express shipping rates.
              </p>

              <ul className="space-y-2 text-xs text-gray-400 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>Real-time order status & tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>Cancel processing orders in database</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>Multi-source 30-day refund calculator</span>
                </li>
              </ul>
            </div>

            <Link
              href="/chat?domain=ecommerce"
              className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md"
            >
              <span>Try Shopping Mode</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* SAAS CARD */}
          <div className="glass-panel p-6 rounded-2xl border border-purple-500/30 flex flex-col justify-between space-y-4 hover:border-purple-500/60 transition-all">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">🏢 Enterprise SaaS</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Answers technical API documentation questions, subscription tier upgrades, team seat management, rate limits, and SLA guarantees.
              </p>

              <ul className="space-y-2 text-xs text-gray-400 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>REST API & webhook docs search</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Subscription billing & team seats</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Human escalation ticket queue</span>
                </li>
              </ul>
            </div>

            <Link
              href="/chat?domain=saas"
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md"
            >
              <span>Try SaaS Mode</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* QUICK SCENARIO TESTER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-8 rounded-2xl border border-gray-800 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white">Interactive Scenario Sandbox</h2>
            <p className="text-xs text-gray-400">Click any scenario below to launch the support chat directly with live data</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/chat?domain=medical&q=Book%20an%20appointment%20with%20Dr.%20Sarah%20Jenkins"
              className="p-4 rounded-xl bg-gray-900/90 border border-emerald-500/40 hover:border-emerald-400 text-left transition-all space-y-1 block group"
            >
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">🩺 Medical Clinic</span>
              <h4 className="font-bold text-sm text-white group-hover:text-emerald-300">Book Doctor Visit</h4>
              <p className="text-xs text-gray-400 line-clamp-2">"Book an appointment with Dr. Sarah Jenkins for Cardiology consultation"</p>
            </Link>

            <Link
              href="/chat?domain=medical&q=Show%20my%20lab%20test%20results"
              className="p-4 rounded-xl bg-gray-900/90 border border-teal-500/40 hover:border-teal-400 text-left transition-all space-y-1 block group"
            >
              <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider">🩺 Medical Clinic</span>
              <h4 className="font-bold text-sm text-white group-hover:text-teal-300">Check Lab Results</h4>
              <p className="text-xs text-gray-400 line-clamp-2">"Show my metabolic blood panel and imaging lab results"</p>
            </Link>

            <Link
              href="/chat?domain=ecommerce&q=Where%20is%20order%20%23ORD-5001%3F"
              className="p-4 rounded-xl bg-gray-900/90 border border-brand-500/40 hover:border-brand-400 text-left transition-all space-y-1 block group"
            >
              <span className="text-[10px] text-brand-400 font-bold uppercase tracking-wider">🛍️ Shopping & Delivery</span>
              <h4 className="font-bold text-sm text-white group-hover:text-brand-300">Order Tracking</h4>
              <p className="text-xs text-gray-400 line-clamp-2">&quot;Where is order #ORD-5001?&quot; &rarr; Live tracking &amp; delivery dates</p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
