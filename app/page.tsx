'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Bot, Stethoscope, ShoppingBag, Building2, Sparkles, ArrowRight, 
  ShieldCheck, Zap, Database, Ticket, CheckCircle2, Activity,
  Cpu, Layers, AlertTriangle, ArrowUpRight, Command
} from 'lucide-react';

export default function HomePage() {
  const [activeDomain, setActiveDomain] = useState<'medical' | 'ecommerce' | 'saas'>('medical');

  const domainThemes = {
    medical: {
      title: '🩺 Medical & Clinical Service',
      badge: 'HIPAA Compliant • 911 Safeguard Active',
      accentColor: 'text-clinical-mint',
      badgeClass: 'badge-mint',
      vectorTag: 'DOMAIN_VECTOR_SCOPE: MEDICAL_CLINIC_V2',
      sampleQuery: 'Book an appointment with Dr. Sarah Jenkins for cardiology consultation',
      capabilities: [
        'Doctor appointment scheduling & confirmations',
        'Metabolic & imaging lab test result lookup',
        'Prescription refill request processing',
        'Emergency 911 symptom triage guardrail',
      ],
      chatHref: '/chat?domain=medical',
    },
    ecommerce: {
      title: '🛍️ Shopping & Delivery Logistics',
      badge: 'Order Tracking • Destructive Cancellation Safeguard',
      accentColor: 'text-signal-amber',
      badgeClass: 'badge-amber',
      vectorTag: 'DOMAIN_VECTOR_SCOPE: ECOMMERCE_FULFILLMENT_V1',
      sampleQuery: 'Where is order #ORD-5001 and when will it arrive?',
      capabilities: [
        'Real-time order status (#ORD-5001) & courier tracking',
        'Physical order cancellation before shipment',
        '30-day return eligibility & refund calculator',
        'Express shipping rate calculation & warehouse lookups',
      ],
      chatHref: '/chat?domain=ecommerce',
    },
    saas: {
      title: '🏢 Enterprise SaaS Platform',
      badge: 'API & Webhook Docs • Team Seats & Tickets',
      accentColor: 'text-signal-violet',
      badgeClass: 'badge-violet',
      vectorTag: 'DOMAIN_VECTOR_SCOPE: SAAS_REST_API_DOCS_V3',
      sampleQuery: 'How do I authenticate n8n webhooks and increase rate limits?',
      capabilities: [
        'REST API & webhook payload documentation search',
        'Subscription tier billing upgrades & seat allocation',
        'Human escalation ticket queue integration',
        'Rate limit rules & SLA availability search',
      ],
      chatHref: '/chat?domain=saas',
    },
  };

  const current = domainThemes[activeDomain];

  return (
    <div className="space-y-12 pb-16 pt-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* SIGNATURE ELEMENT: LIVE VECTOR SCOPE & TRIAGE COMMAND BAR */}
      <section className="surface-elevated p-6 sm:p-10 rounded-2xl space-y-8 relative overflow-hidden">
        {/* Top Telemetry Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-triage-border pb-5">
          <div className="flex items-center gap-2 px-3 py-1 rounded bg-surface-base border border-triage-border text-xs font-mono text-gray-300">
            <Cpu className="w-3.5 h-3.5 text-clinical-mint" />
            <span className="text-gray-400">VECTOR SCOPE:</span>
            <span className="font-bold text-white uppercase">{activeDomain}</span>
          </div>

          {/* Domain Switcher */}
          <div className="flex items-center gap-1 bg-surface-base p-1 rounded-xl border border-triage-border">
            {(['medical', 'ecommerce', 'saas'] as const).map((dom) => (
              <button
                key={dom}
                onClick={() => setActiveDomain(dom)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors capitalize ${
                  activeDomain === dom
                    ? 'bg-surface-elevated text-clinical-mint border border-triage-border-active font-bold'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <span>{dom === 'medical' ? '🩺 Medical' : dom === 'ecommerce' ? '🛍️ Retail' : '🏢 Enterprise'}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Hero Copy */}
        <div className="space-y-5 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded text-[11px] font-mono font-semibold badge-mint">
            <Sparkles className="w-3 h-3 text-clinical-mint" />
            <span>{current.badge}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-display font-bold text-white tracking-tight leading-snug">
            Multi-Domain Support Engine with <br className="hidden sm:inline" />
            <span className="text-clinical-mint">Isolated Vector RAG & Tool Execution</span>
          </h1>

          <p className="text-gray-300 text-sm sm:text-base leading-relaxed font-body">
            Autonomous support engine backed by PostgreSQL <code className="font-mono text-clinical-mint bg-surface-base px-1.5 py-0.5 rounded border border-triage-border">pgvector</code> RAG filtering, live clinic tool execution, order cancellations, and n8n escalation workflows.
          </p>

          {/* Capabilities Grid */}
          <div className="bg-surface-base p-5 rounded-xl border border-triage-border space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-gray-400">
              <span className="flex items-center gap-2">
                <Command className="w-3.5 h-3.5 text-clinical-mint" />
                <span>DOMAIN CAPABILITIES</span>
              </span>
              <span className="text-[10px] text-gray-500 font-mono hidden sm:inline">{current.vectorTag}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-gray-200">
              {current.capabilities.map((cap, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-surface-elevated p-2 rounded-lg border border-triage-border">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${current.accentColor} shrink-0`} />
                  <span className="font-medium">{cap}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Launchers */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Link
              href={current.chatHref}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-clinical-mint hover:bg-emerald-400 text-ink font-display font-bold flex items-center justify-center gap-2 text-xs transition-colors"
            >
              <span>Launch {activeDomain.toUpperCase()} Chat</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href={`/chat?domain=${activeDomain}&q=${encodeURIComponent(current.sampleQuery)}`}
              className="w-full sm:w-auto px-5 py-3 rounded-lg bg-surface-base hover:bg-surface-elevated text-gray-200 font-medium border border-triage-border flex items-center justify-center gap-2 text-xs transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-signal-amber" />
              <span>Test Prompt Scenario</span>
            </Link>
          </div>
        </div>
      </section>

      {/* THREE DOMAIN SHOWCASE CARDS */}
      <section className="space-y-6">
        <div className="border-b border-triage-border pb-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-clinical-mint">
            ISOLATED BOUNDARIES
          </span>
          <h2 className="text-2xl font-display font-bold text-white">
            Supported Operational Domains
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* MEDICAL CARD */}
          <div className="surface-elevated p-5 rounded-xl border border-triage-border flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-surface-base border border-triage-border flex items-center justify-center text-clinical-mint">
                <Stethoscope className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-clinical-mint uppercase font-semibold">DOMAIN 01</span>
                <h3 className="text-lg font-display font-bold text-white">🩺 Medical & Clinical</h3>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed font-body">
                Automates doctor appointment booking, metabolic lab test report lookups, prescription refills, and 911 emergency guardrails.
              </p>

              <ul className="space-y-1.5 text-xs text-gray-400 font-mono">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-clinical-mint shrink-0" />
                  <span>Doctor visits & rescheduling</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-clinical-mint shrink-0" />
                  <span>Lab reports (`PAT-2001`)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-clinical-mint shrink-0" />
                  <span>HIPAA & 911 guardrail rules</span>
                </li>
              </ul>
            </div>

            <Link
              href="/chat?domain=medical"
              className="w-full py-2.5 rounded-lg bg-surface-base hover:bg-surface-elevated text-clinical-mint border border-triage-border hover:border-triage-border-active font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <span>Clinical Mode</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* SHOPPING CARD */}
          <div className="surface-elevated p-5 rounded-xl border border-triage-border flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-surface-base border border-triage-border flex items-center justify-center text-signal-amber">
                <ShoppingBag className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-signal-amber uppercase font-semibold">DOMAIN 02</span>
                <h3 className="text-lg font-display font-bold text-white">🛍️ Retail & Delivery</h3>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed font-body">
                Resolves order tracking inquiries (`#ORD-5001`), return eligibility checks, physical order cancellations before shipment.
              </p>

              <ul className="space-y-1.5 text-xs text-gray-400 font-mono">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-signal-amber shrink-0" />
                  <span>Real-time order status tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-signal-amber shrink-0" />
                  <span>Cancel processing orders</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-signal-amber shrink-0" />
                  <span>30-Day refund eligibility check</span>
                </li>
              </ul>
            </div>

            <Link
              href="/chat?domain=ecommerce"
              className="w-full py-2.5 rounded-lg bg-surface-base hover:bg-surface-elevated text-signal-amber border border-triage-border hover:border-signal-amber/40 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <span>Shopping Mode</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* SAAS CARD */}
          <div className="surface-elevated p-5 rounded-xl border border-triage-border flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-surface-base border border-triage-border flex items-center justify-center text-signal-violet">
                <Building2 className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-signal-violet uppercase font-semibold">DOMAIN 03</span>
                <h3 className="text-lg font-display font-bold text-white">🏢 Enterprise SaaS</h3>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed font-body">
                Answers REST API documentation questions, subscription tier upgrades, team seat management, and human escalation tickets.
              </p>

              <ul className="space-y-1.5 text-xs text-gray-400 font-mono">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-signal-violet shrink-0" />
                  <span>REST API & webhook docs RAG</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-signal-violet shrink-0" />
                  <span>Billing tiers & team seat rules</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-signal-violet shrink-0" />
                  <span>Human escalation ticket queue</span>
                </li>
              </ul>
            </div>

            <Link
              href="/chat?domain=saas"
              className="w-full py-2.5 rounded-lg bg-surface-base hover:bg-surface-elevated text-signal-violet border border-triage-border hover:border-signal-violet/40 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <span>SaaS Mode</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* QUICK SCENARIO TESTER */}
      <section className="surface-base p-6 sm:p-8 rounded-xl border border-triage-border space-y-5">
        <div className="flex items-center justify-between border-b border-triage-border pb-4">
          <div>
            <span className="text-[10px] font-mono font-semibold text-clinical-mint uppercase">TRIAGE PROMPTS</span>
            <h3 className="text-xl font-display font-bold text-white">Scenario Sandbox</h3>
          </div>
          <span className="text-xs font-mono text-gray-400">Live Agent Webhooks</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/chat?domain=medical&q=Book%20an%20appointment%20with%20Dr.%20Sarah%20Jenkins"
            className="p-4 rounded-lg bg-surface-elevated border border-triage-border hover:border-triage-border-active transition-colors space-y-1 block group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-clinical-mint font-semibold uppercase">🩺 Medical Clinic</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-clinical-mint transition-colors" />
            </div>
            <h4 className="font-display font-bold text-sm text-white group-hover:text-clinical-mint transition-colors">Book Doctor Visit</h4>
            <p className="text-xs text-gray-400 line-clamp-2 font-body font-normal">"Book an appointment with Dr. Sarah Jenkins for Cardiology consultation"</p>
          </Link>

          <Link
            href="/chat?domain=medical&q=Show%20my%20lab%20test%20results"
            className="p-4 rounded-lg bg-surface-elevated border border-triage-border hover:border-triage-border-active transition-colors space-y-1 block group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-clinical-cyan font-semibold uppercase">🩺 Clinical Data</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-clinical-cyan transition-colors" />
            </div>
            <h4 className="font-display font-bold text-sm text-white group-hover:text-clinical-cyan transition-colors">Check Lab Results</h4>
            <p className="text-xs text-gray-400 line-clamp-2 font-body font-normal">"Show my metabolic blood panel and imaging lab results for PAT-2001"</p>
          </Link>

          <Link
            href="/chat?domain=ecommerce&q=Where%20is%20order%20%23ORD-5001%3F"
            className="p-4 rounded-lg bg-surface-elevated border border-triage-border hover:border-signal-amber/40 transition-colors space-y-1 block group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-signal-amber font-semibold uppercase">🛍️ Retail & Delivery</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-signal-amber transition-colors" />
            </div>
            <h4 className="font-display font-bold text-sm text-white group-hover:text-signal-amber transition-colors">Order Tracking</h4>
            <p className="text-xs text-gray-400 line-clamp-2 font-body font-normal">"Where is order #ORD-5001?" &rarr; Courier tracking &amp; delivery dates</p>
          </Link>
        </div>
      </section>
    </div>
  );
}


