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
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-lg">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              Multi-Domain RAG Vector Store
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                pgvector 1536-dim
              </span>
            </h1>
            <p className="text-xs text-gray-400">
              Inspect indexed vector knowledge chunks across Medical / Clinic, E-Commerce, and SaaS domains.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-900/80 px-3.5 py-2 rounded-xl border border-gray-800">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Total Indexed Chunks: <strong className="text-white">{KNOWLEDGE_CHUNKS.length}</strong></span>
        </div>
      </div>

      {/* Domain Selection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedDomain('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            selectedDomain === 'all'
              ? 'bg-gray-800 text-white border border-gray-700 shadow-sm'
              : 'bg-gray-900/60 text-gray-400 hover:text-white'
          }`}
        >
          <span>All Domains ({KNOWLEDGE_CHUNKS.length})</span>
        </button>

        <button
          onClick={() => setSelectedDomain('medical')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            selectedDomain === 'medical'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
              : 'bg-gray-900/60 text-gray-400 hover:text-emerald-300'
          }`}
        >
          <Stethoscope className="w-4 h-4 text-emerald-400" />
          <span>🩺 Medical / Clinic ({KNOWLEDGE_CHUNKS.filter((c) => c.domain === 'medical').length})</span>
        </button>

        <button
          onClick={() => setSelectedDomain('ecommerce')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            selectedDomain === 'ecommerce'
              ? 'bg-brand-600 text-white shadow-lg shadow-brand-950/50'
              : 'bg-gray-900/60 text-gray-400 hover:text-brand-300'
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-brand-400" />
          <span>🛍️ Shopping & Delivery ({KNOWLEDGE_CHUNKS.filter((c) => c.domain === 'ecommerce').length})</span>
        </button>

        <button
          onClick={() => setSelectedDomain('saas')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            selectedDomain === 'saas'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50'
              : 'bg-gray-900/60 text-gray-400 hover:text-purple-300'
          }`}
        >
          <Building2 className="w-4 h-4 text-purple-400" />
          <span>🏢 Enterprise SaaS ({KNOWLEDGE_CHUNKS.filter((c) => c.domain === 'saas').length})</span>
        </button>
      </div>

      {/* Search & Category Controls */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between border border-gray-800">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vector knowledge chunks..."
            className="w-full bg-gray-950 text-gray-100 text-xs pl-10 pr-4 py-2.5 rounded-xl border border-gray-800 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-gray-950 text-gray-200 text-xs px-3 py-2.5 rounded-xl border border-gray-800 focus:outline-none capitalize"
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredChunks.map((chunk) => (
          <div
            key={chunk.id}
            className="glass-panel p-5 rounded-2xl border border-gray-800 flex flex-col justify-between space-y-3 hover:border-gray-700 transition-all shadow-sm"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                    chunk.domain === 'medical'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : chunk.domain === 'ecommerce'
                      ? 'bg-brand-500/10 text-brand-400 border-brand-500/30'
                      : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                  }`}
                >
                  {chunk.domain} • {chunk.category}
                </span>
                <span className="text-[10px] text-gray-500 font-mono">ID: #{chunk.id}</span>
              </div>

              <h3 className="font-bold text-sm text-white line-clamp-1">{chunk.title}</h3>
              <p className="text-xs text-gray-300 leading-relaxed line-clamp-4">{chunk.chunk_text}</p>
            </div>

            <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between text-[10px] text-gray-500">
              <span>Embedding: <code className="text-emerald-400">text-embedding-3-small</code></span>
              <span>Doc #{chunk.document_id}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
