'use client';

import { useState, useMemo } from 'react';
import { Database, Search, Sparkles, Filter, Stethoscope, ShoppingBag, Building2 } from 'lucide-react';
import { KNOWLEDGE_CHUNKS, KnowledgeChunk, AppDomain } from '@/lib/mock-data';

export default function KnowledgePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');

  const categories = useMemo(() => {
    const set = new Set(KNOWLEDGE_CHUNKS.map((c) => c.category));
    return ['all', ...Array.from(set)];
  }, []);

  const filteredChunks = useMemo(() => {
    return KNOWLEDGE_CHUNKS.filter((chunk) => {
      const matchesSearch =
        chunk.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chunk.chunk_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chunk.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || chunk.category === selectedCategory;
      const matchesDomain = selectedDomain === 'all' || chunk.domain === selectedDomain;

      return matchesSearch && matchesCategory && matchesDomain;
    });
  }, [searchQuery, selectedCategory, selectedDomain]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="surface-elevated p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-triage-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-base border border-triage-border-active flex items-center justify-center text-clinical-mint">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-white tracking-tight flex items-center gap-2">
              Multi-Domain RAG Vector Knowledge Store
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-clinical-mint/10 text-clinical-mint border border-clinical-mint/20">
                pgvector 1536-dim
              </span>
            </h1>
            <p className="text-xs text-gray-400 font-body">
              Inspect indexed vector knowledge chunks across Medical Clinic, Retail Logistics, and Enterprise SaaS domains.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-gray-400 bg-surface-base px-3 py-1.5 rounded-lg border border-triage-border">
          <Sparkles className="w-4 h-4 text-clinical-mint" />
          <span>Total Indexed Chunks: <strong className="text-white">{KNOWLEDGE_CHUNKS.length}</strong></span>
        </div>
      </div>

      {/* Domain Selection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 font-mono text-xs scrollbar-none">
        <button
          onClick={() => setSelectedDomain('all')}
          className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
            selectedDomain === 'all'
              ? 'bg-clinical-mint text-ink'
              : 'bg-surface-elevated text-gray-400 hover:text-white border border-triage-border'
          }`}
        >
          <span>All Domains ({KNOWLEDGE_CHUNKS.length})</span>
        </button>

        <button
          onClick={() => setSelectedDomain('medical')}
          className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
            selectedDomain === 'medical'
              ? 'bg-clinical-mint text-ink'
              : 'bg-surface-elevated text-gray-400 hover:text-clinical-mint border border-triage-border'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>Medical ({KNOWLEDGE_CHUNKS.filter((c) => c.domain === 'medical').length})</span>
        </button>

        <button
          onClick={() => setSelectedDomain('ecommerce')}
          className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
            selectedDomain === 'ecommerce'
              ? 'bg-signal-amber text-ink'
              : 'bg-surface-elevated text-gray-400 hover:text-signal-amber border border-triage-border'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Retail ({KNOWLEDGE_CHUNKS.filter((c) => c.domain === 'ecommerce').length})</span>
        </button>

        <button
          onClick={() => setSelectedDomain('saas')}
          className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
            selectedDomain === 'saas'
              ? 'bg-signal-violet text-white'
              : 'bg-surface-elevated text-gray-400 hover:text-signal-violet border border-triage-border'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>SaaS ({KNOWLEDGE_CHUNKS.filter((c) => c.domain === 'saas').length})</span>
        </button>
      </div>

      {/* Search & Category Controls */}
      <div className="surface-elevated p-3.5 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between border border-triage-border">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vector knowledge chunks or title..."
            className="w-full bg-surface-base text-gray-100 placeholder-gray-500 text-xs pl-9 pr-3.5 py-2.5 rounded-lg border border-triage-border focus:outline-none focus:border-triage-border-active font-body"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto font-mono text-xs">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-surface-base text-gray-200 text-xs px-3 py-2 rounded-lg border border-triage-border focus:outline-none capitalize font-mono"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                Category: {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Knowledge Chunks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredChunks.map((chunk) => (
          <div
            key={chunk.id}
            className="surface-elevated p-4 rounded-xl border border-triage-border flex flex-col justify-between space-y-3 hover:border-triage-border-active transition-colors"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border uppercase ${
                    chunk.domain === 'medical'
                      ? 'badge-mint'
                      : chunk.domain === 'ecommerce'
                      ? 'badge-amber'
                      : 'badge-violet'
                  }`}
                >
                  {chunk.domain} • {chunk.category}
                </span>
                <span className="text-[10px] text-gray-500 font-mono">#{chunk.id}</span>
              </div>

              <h3 className="font-display font-bold text-sm text-white line-clamp-1">{chunk.title}</h3>
              <p className="text-xs text-gray-300 font-body leading-relaxed line-clamp-4">{chunk.chunk_text}</p>
            </div>

            <div className="pt-2 border-t border-triage-border flex items-center justify-between text-[10px] font-mono text-gray-500">
              <span>Embedding: <code className="text-clinical-mint">text-embedding-004</code></span>
              <span>Doc #{chunk.document_id}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

