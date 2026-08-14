'use client';

import { Network, Server, Database, Bot, ArrowRight, ShieldCheck, Mail, Ticket, Layers, FileCode } from 'lucide-react';
import Link from 'next/link';

export default function ArchitecturePage() {
  const pipelineSteps = [
    {
      step: '1',
      title: 'Customer Web Application',
      subtitle: 'Next.js App Router Interface',
      desc: 'Customer submits a message via the chat drawer or /chat page with customer_id and conversation_id.',
      icon: Server,
      badge: 'Frontend',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    },
    {
      step: '2',
      title: 'Next.js API Bridge',
      subtitle: 'POST /api/chat Endpoint',
      desc: 'Validates inputs, hides all API keys & credentials server-side, and proxies payload to n8n Webhook.',
      icon: ShieldCheck,
      badge: 'API Gateway',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    },
    {
      step: '3',
      title: 'n8n Webhook Orchestration',
      subtitle: 'Support System - Main Agent.json',
      desc: 'n8n Webhook receives input, normalizes conversation_id, and logs inbound customer message.',
      icon: Network,
      badge: 'n8n Workflow',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    },
    {
      step: '4',
      title: 'LLM Agent & Memory',
      subtitle: 'GPT-5-mini + Postgres Memory',
      desc: 'Agent loads recent context from n8n_chat_histories and analyzes customer intent.',
      icon: Bot,
      badge: 'Reasoning Engine',
      badgeColor: 'bg-brand-500/10 text-brand-400 border-brand-500/30',
    },
    {
      step: '5',
      title: 'RAG & Database Tools',
      subtitle: 'pgvector + PostgreSQL Tools',
      desc: 'Calls knowledge_base pgvector tool or get_order_status / create_support_ticket SQL tools.',
      icon: Database,
      badge: 'Tool Execution',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    },
    {
      step: '6',
      title: 'Escalation & SMTP Email',
      subtitle: 'Human Support Trigger',
      desc: 'If escalate=true, creates ticket in support_tickets table and dispatches SMTP support notification.',
      icon: Mail,
      badge: 'Human Escalation',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/30 text-xs font-semibold mb-3">
          <Network className="w-3.5 h-3.5" />
          <span>n8n Workflow & System Architecture</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          End-to-End System Pipeline
        </h1>
        <p className="text-sm text-gray-400 mt-1 max-w-3xl leading-relaxed">
          The application follows a decoupled production architecture: frontend UI, server-side API bridge, n8n automation engine, PostgreSQL pgvector store, and SMTP notification layer.
        </p>
      </div>

      {/* Pipeline Diagram Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pipelineSteps.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.step} className="glass-panel p-6 rounded-2xl border border-gray-800 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-8 h-8 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center font-extrabold text-brand-400 text-sm">
                    {step.step}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${step.badgeColor}`}>
                    {step.badge}
                  </span>
                </div>

                <h3 className="font-bold text-white text-lg">{step.title}</h3>
                <p className="text-xs font-semibold text-brand-300 mt-0.5">{step.subtitle}</p>
                <p className="text-xs text-gray-400 mt-3 leading-relaxed">{step.desc}</p>
              </div>

              <div className="pt-3 border-t border-gray-800/80 flex items-center gap-2 text-xs text-gray-500">
                <Icon className="w-4 h-4 text-gray-400" />
                <span>Production Component</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* n8n Workflow JSON File Inspector */}
      <div className="glass-panel p-8 rounded-3xl border border-gray-800 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileCode className="w-5 h-5 text-brand-400" />
              <span>Importable n8n Workflows in Repository</span>
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Located in the <code className="text-brand-300">n8n/</code> directory of the codebase.
            </p>
          </div>

          <Link
            href="/chat"
            className="gradient-button text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-md"
          >
            Launch Interactive Chat
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 text-xs space-y-2">
            <p className="font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-400" />
              main-agent.json
            </p>
            <p className="text-gray-400 leading-relaxed">
              Main support agent workflow with webhook trigger, memory, RAG retrieval tool, 5 DB tools, and structured response parser.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 text-xs space-y-2">
            <p className="font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              rag-ingestion.json
            </p>
            <p className="text-gray-400 leading-relaxed">
              RAG pipeline that chunks documents (800/100), generates 768-dim embeddings via Google Gemini (text-embedding-004), and stores vectors in <code className="text-brand-300">knowledge_chunks</code>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 text-xs space-y-2">
            <p className="font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              db-schema-setup.json
            </p>
            <p className="text-gray-400 leading-relaxed">
              Idempotent SQL workflow that installs pgvector and provisions all tables (<code className="text-brand-300">customers</code>, <code className="text-brand-300">orders</code>, <code className="text-brand-300">knowledge_chunks</code>).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
