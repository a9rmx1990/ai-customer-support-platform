'use client';

import { Network, Server, Database, Bot, ArrowRight, ShieldCheck, Mail, Ticket, Layers, FileCode, CheckCircle2, Cpu } from 'lucide-react';
import Link from 'next/link';

export default function ArchitecturePage() {
  const pipelineSteps = [
    {
      step: '01',
      title: 'Customer Web Application',
      subtitle: 'Next.js 14 App Router UI',
      desc: 'Customer submits a query via the chat drawer or workspace with customer_id, patient_id, and domain context.',
      icon: Server,
      badge: 'Frontend',
      badgeClass: 'badge-mint',
    },
    {
      step: '02',
      title: 'Next.js API Gateway',
      subtitle: 'POST /api/clinical-chat Gateway',
      desc: 'Validates payload, enforces domain context, hides API credentials server-side, and proxies payload to n8n Webhook.',
      icon: ShieldCheck,
      badge: 'API Gateway',
      badgeClass: 'badge-amber',
    },
    {
      step: '03',
      title: 'n8n Webhook Orchestration',
      subtitle: 'main-agent.json Workflow',
      desc: 'n8n Webhook receives input, normalizes conversation_id, and initiates the multi-agent AI execution pipeline.',
      icon: Network,
      badge: 'n8n Orchestrator',
      badgeClass: 'badge-violet',
    },
    {
      step: '04',
      title: 'LLM Reasoning Engine',
      subtitle: 'Gemini 1.5 Pro / GPT-4o',
      desc: 'Agent loads recent conversation history from n8n_chat_histories and determines tool execution intent.',
      icon: Bot,
      badge: 'Reasoning Engine',
      badgeClass: 'badge-mint',
    },
    {
      step: '05',
      title: 'RAG & SQL Database Tools',
      subtitle: 'pgvector + Tool Executors',
      desc: 'Executes pgvector similarity retrieval or queries get_order_status, get_patient_records, or create_ticket tools.',
      icon: Database,
      badge: 'Tool Execution',
      badgeClass: 'badge-amber',
    },
    {
      step: '06',
      title: 'Escalation & SMTP Alert',
      subtitle: 'Human Support Fallback',
      desc: 'If triage detects high-urgency or negative sentiment, creates ticket in support_tickets table and dispatches SMTP alert.',
      icon: Mail,
      badge: 'Human Escalation',
      badgeClass: 'bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono text-[10px]',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="surface-elevated p-6 rounded-2xl border border-triage-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-clinical-mint/10 text-clinical-mint border border-clinical-mint/20 text-[10px] font-mono font-semibold">
            <Cpu className="w-3.5 h-3.5" />
            <span>Decoupled Multi-Agent Enterprise Architecture</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-white tracking-tight flex items-center gap-2">
            End-to-End System Pipeline & Tool Execution Flow
          </h1>
          <p className="text-xs text-gray-400 max-w-3xl leading-relaxed font-body">
            Production architecture overview showing how customer requests flow from the Next.js UI through server-side proxies into n8n Webhook orchestrators, PostgreSQL pgvector RAG stores, and human support queues.
          </p>
        </div>

        <Link
          href="/chat"
          className="px-4 py-2 rounded-lg bg-clinical-mint hover:bg-emerald-400 text-ink font-display font-bold text-xs transition-colors shrink-0 flex items-center gap-1.5"
        >
          <span>Launch AI Workspace</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Connected Flow Sequence Bar */}
      <div className="surface-elevated p-4 rounded-xl border border-triage-border hidden lg:flex items-center justify-between font-mono text-xs text-gray-400 overflow-x-auto">
        <div className="flex items-center gap-2 text-white font-semibold">
          <span className="w-5 h-5 rounded-full bg-clinical-mint text-ink font-bold flex items-center justify-center text-[10px]">1</span>
          <span>Web UI</span>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-600" />
        <div className="flex items-center gap-2 text-white font-semibold">
          <span className="w-5 h-5 rounded-full bg-surface-base border border-triage-border text-gray-300 font-bold flex items-center justify-center text-[10px]">2</span>
          <span>API Proxy</span>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-600" />
        <div className="flex items-center gap-2 text-white font-semibold">
          <span className="w-5 h-5 rounded-full bg-surface-base border border-triage-border text-gray-300 font-bold flex items-center justify-center text-[10px]">3</span>
          <span>n8n Webhook</span>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-600" />
        <div className="flex items-center gap-2 text-white font-semibold">
          <span className="w-5 h-5 rounded-full bg-surface-base border border-triage-border text-gray-300 font-bold flex items-center justify-center text-[10px]">4</span>
          <span>LLM Reasoning</span>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-600" />
        <div className="flex items-center gap-2 text-white font-semibold">
          <span className="w-5 h-5 rounded-full bg-surface-base border border-triage-border text-gray-300 font-bold flex items-center justify-center text-[10px]">5</span>
          <span>pgvector RAG</span>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-600" />
        <div className="flex items-center gap-2 text-white font-semibold">
          <span className="w-5 h-5 rounded-full bg-surface-base border border-triage-border text-gray-300 font-bold flex items-center justify-center text-[10px]">6</span>
          <span>Human Escalation</span>
        </div>
      </div>

      {/* Pipeline Step Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pipelineSteps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.step}
              className="surface-elevated p-5 rounded-xl border border-triage-border flex flex-col justify-between space-y-4 hover:border-triage-border-active transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-7 h-7 rounded-lg bg-surface-base border border-triage-border flex items-center justify-center font-mono font-bold text-clinical-mint text-xs">
                    {step.step}
                  </span>
                  <span className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase ${step.badgeClass}`}>
                    {step.badge}
                  </span>
                </div>

                <div>
                  <h3 className="font-display font-bold text-white text-base">{step.title}</h3>
                  <p className="text-xs font-mono text-clinical-mint mt-0.5">{step.subtitle}</p>
                </div>

                <p className="text-xs text-gray-300 font-body leading-relaxed">{step.desc}</p>
              </div>

              <div className="pt-3 border-t border-triage-border flex items-center justify-between text-[10px] font-mono text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-gray-400" />
                  <span>Production Node</span>
                </div>
                <span className="text-clinical-mint font-semibold">Verified Active</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* n8n Workflow JSON File Inspector */}
      <div className="surface-elevated p-6 rounded-2xl border border-triage-border space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-4 pb-3 border-b border-triage-border">
          <div>
            <h2 className="text-base font-display font-bold text-white flex items-center gap-2">
              <FileCode className="w-4 h-4 text-clinical-mint" />
              <span>Production n8n Workflow Templates in Repository</span>
            </h2>
            <p className="text-xs text-gray-400 font-body mt-0.5">
              Available as production-ready JSON files in the <code className="text-clinical-mint font-mono">n8n/</code> workspace directory.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-gray-400 bg-surface-base px-3 py-1.5 rounded-lg border border-triage-border">
            <CheckCircle2 className="w-3.5 h-3.5 text-clinical-mint" />
            <span>n8n v1.40+ Compatible</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="surface-base p-4 rounded-xl border border-triage-border space-y-2 text-xs font-body">
            <div className="flex items-center justify-between">
              <p className="font-mono font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-clinical-mint" />
                <span>main-agent.json</span>
              </p>
              <span className="badge-mint font-mono text-[9px]">Main Agent</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Main support agent workflow with webhook trigger, memory, RAG retrieval tool, 5 DB tools, and structured response parser.
            </p>
          </div>

          <div className="surface-base p-4 rounded-xl border border-triage-border space-y-2 text-xs font-body">
            <div className="flex items-center justify-between">
              <p className="font-mono font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-signal-amber" />
                <span>rag-ingestion.json</span>
              </p>
              <span className="badge-amber font-mono text-[9px]">RAG Ingestion</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              RAG pipeline that chunks documents (800/100), generates 768-dim embeddings via Google Gemini (text-embedding-004), and stores vectors in <code className="text-clinical-mint font-mono">knowledge_chunks</code>.
            </p>
          </div>

          <div className="surface-base p-4 rounded-xl border border-triage-border space-y-2 text-xs font-body">
            <div className="flex items-center justify-between">
              <p className="font-mono font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-signal-violet" />
                <span>db-schema-setup.json</span>
              </p>
              <span className="badge-violet font-mono text-[9px]">DB Schema</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Idempotent SQL workflow that installs pgvector and provisions all tables (<code className="text-clinical-mint font-mono">customers</code>, <code className="text-clinical-mint font-mono">orders</code>, <code className="text-clinical-mint font-mono">knowledge_chunks</code>).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
