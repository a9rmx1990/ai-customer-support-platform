'use client';

import { useState, useMemo } from 'react';
import { Database, Search, Sparkles, Filter, Stethoscope, ShoppingBag, Building2, Plus, X, CheckCircle2, FileText } from 'lucide-react';
import { KNOWLEDGE_CHUNKS, KnowledgeChunk, AppDomain } from '@/lib/mock-data';

export default function KnowledgePage() {
  const [chunksList, setChunksList] = useState<KnowledgeChunk[]>(KNOWLEDGE_CHUNKS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');

  // Add Document Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDomain, setNewDomain] = useState<AppDomain>('medical');
  const [newCategory, setNewCategory] = useState('policy');
  const [newContent, setNewContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const categories = useMemo(() => {
    const set = new Set(chunksList.map((c) => c.category));
    return ['all', ...Array.from(set)];
  }, [chunksList]);

  const filteredChunks = useMemo(() => {
    return chunksList.filter((chunk) => {
      const matchesSearch =
        chunk.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chunk.chunk_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chunk.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || chunk.category === selectedCategory;
      const matchesDomain = selectedDomain === 'all' || chunk.domain === selectedDomain;

      return matchesSearch && matchesCategory && matchesDomain;
    });
  }, [chunksList, searchQuery, selectedCategory, selectedDomain]);

  const handleAddKnowledgeDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          domain: newDomain,
          category: newCategory,
          chunk_text: newContent,
        }),
      });

      const data = await res.json();

      if (res.ok && data.chunk) {
        setChunksList((prev) => [data.chunk, ...prev]);
        setNewTitle('');
        setNewContent('');
        setShowAddModal(false);
        setSuccessToast(`Document #${data.chunk.id} successfully indexed into ${newDomain.toUpperCase()} vector store!`);
        setTimeout(() => setSuccessToast(null), 4000);
      }
    } catch (err) {
      console.error('Ingestion failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-3.5 rounded-xl bg-clinical-mint/10 border border-clinical-mint/30 text-clinical-mint text-xs font-mono flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="p-1 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

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

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-gray-400 bg-surface-base px-3 py-1.5 rounded-lg border border-triage-border">
            <Sparkles className="w-4 h-4 text-clinical-mint" />
            <span>Indexed Chunks: <strong className="text-white">{chunksList.length}</strong></span>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-lg bg-clinical-mint hover:bg-emerald-400 text-ink font-display font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Document</span>
          </button>
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
          <span>All Domains ({chunksList.length})</span>
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
          <span>Medical ({chunksList.filter((c) => c.domain === 'medical').length})</span>
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
          <span>Retail ({chunksList.filter((c) => c.domain === 'ecommerce').length})</span>
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
          <span>SaaS ({chunksList.filter((c) => c.domain === 'saas').length})</span>
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

      {/* ADD DOCUMENT / INGESTION MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="surface-overlay w-full max-w-lg p-6 rounded-2xl border border-triage-border shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-triage-border">
              <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-clinical-mint" />
                <span>Ingest New Knowledge Document</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-gray-400 hover:text-white hover:bg-surface-base rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddKnowledgeDoc} className="space-y-3.5 text-xs font-body">
              <div className="space-y-1">
                <label className="block text-gray-300 font-medium font-mono text-[11px]">Document Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Clinic Appointment Cancellation & Telehealth Policy"
                  className="w-full bg-surface-base text-gray-100 text-xs px-3 py-2 rounded-lg border border-triage-border focus:outline-none focus:border-triage-border-active font-body"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-gray-300 font-medium font-mono text-[11px]">Target Domain</label>
                  <select
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value as AppDomain)}
                    className="w-full bg-surface-base text-gray-100 text-xs px-3 py-2 rounded-lg border border-triage-border focus:outline-none focus:border-triage-border-active font-mono"
                  >
                    <option value="medical">Medical / Clinical</option>
                    <option value="ecommerce">Retail & Logistics</option>
                    <option value="saas">Enterprise SaaS</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-gray-300 font-medium font-mono text-[11px]">Knowledge Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-surface-base text-gray-100 text-xs px-3 py-2 rounded-lg border border-triage-border focus:outline-none focus:border-triage-border-active font-mono capitalize"
                  >
                    <option value="policy">Policy / Terms</option>
                    <option value="clinical_faq">Clinical FAQ</option>
                    <option value="appointments">Doctor Appointments</option>
                    <option value="lab_results">Diagnostic Labs</option>
                    <option value="shipping">Shipping & Returns</option>
                    <option value="billing">Pricing & Invoicing</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-gray-300 font-medium font-mono text-[11px]">Document Text / Policy Content</label>
                <textarea
                  rows={5}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Paste clinic guidelines, refund policies, or product specs here. The AI will vector index this content automatically..."
                  className="w-full bg-surface-base text-gray-100 text-xs p-3 rounded-lg border border-triage-border focus:outline-none focus:border-triage-border-active font-body leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 rounded-lg bg-surface-base text-gray-400 hover:text-white border border-triage-border text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-clinical-mint hover:bg-emerald-400 text-ink font-display font-bold text-xs transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Indexing Vectors...' : 'Index Document Chunk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


