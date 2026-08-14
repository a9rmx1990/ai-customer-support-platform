'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Search, Sparkles, Layers, Database, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import { KnowledgeChunk } from '@/lib/mock-data';

export default function KnowledgePage() {
  const [chunks, setChunks] = useState<KnowledgeChunk[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<KnowledgeChunk[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetch('/api/knowledge')
      .then((res) => res.json())
      .then((data) => {
        setChunks(data.chunks || []);
        setSearchResults(data.chunks || []);
      });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(chunks);
      return;
    }

    setSearching(true);
    const query = searchQuery.toLowerCase();
    setTimeout(() => {
      const filtered = chunks.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.category.toLowerCase().includes(query) ||
          c.chunk_text.toLowerCase().includes(query)
      );
      setSearchResults(filtered);
      setSearching(false);
    }, 200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/30 text-xs font-semibold mb-3">
          <Database className="w-3.5 h-3.5" />
          <span>PostgreSQL pgvector Store • Table: knowledge_chunks</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-brand-400" />
          RAG Knowledge Base Explorer
        </h1>
        <p className="text-sm text-gray-400 mt-1 max-w-3xl">
          Indexed documents chunked (Recursive 800/100) and embedded with OpenAI text-embedding-3-small (1536 dimensions) for semantic retrieval.
        </p>
      </div>

      {/* Vector Metadata Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Embedding Model</p>
          <p className="text-sm font-bold text-white mt-1">text-embedding-3-small</p>
        </div>
        <div className="glass-panel p-4 rounded-xl">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Vector Dimensions</p>
          <p className="text-sm font-bold text-brand-400 mt-1">1536 Dims</p>
        </div>
        <div className="glass-panel p-4 rounded-xl">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Document Chunks</p>
          <p className="text-sm font-bold text-emerald-400 mt-1">{chunks.length} Indexed Chunks</p>
        </div>
        <div className="glass-panel p-4 rounded-xl">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Distance Metric</p>
          <p className="text-sm font-bold text-purple-400 mt-1">Cosine Similarity (&lt;=&gt;)</p>
        </div>
      </div>

      {/* Semantic Search Simulator Box */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
        <h2 className="font-bold text-base text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-brand-400" />
          <span>Semantic Vector Search Simulator</span>
        </h2>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. Can I get a refund on digital purchases?"
              className="w-full bg-gray-950 text-gray-100 placeholder-gray-500 text-xs sm:text-sm pl-10 pr-4 py-3 rounded-xl border border-gray-800 focus:outline-none focus:border-brand-500"
            />
          </div>

          <button
            type="submit"
            className="gradient-button text-white font-semibold text-xs sm:text-sm px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-md shrink-0"
          >
            <span>Query Vector Index</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Chunks List */}
      <div className="space-y-4">
        <h3 className="font-bold text-sm text-gray-300 uppercase tracking-wider flex items-center justify-between">
          <span>Knowledge Chunks ({searchResults.length})</span>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchResults(chunks);
              }}
              className="text-xs text-brand-400 hover:underline"
            >
              Clear Search Filter
            </button>
          )}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {searchResults.map((chunk) => (
            <div key={chunk.id} className="glass-card p-5 rounded-2xl flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/30 text-[10px] font-bold uppercase tracking-wider">
                    {chunk.category}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">
                    Doc ID: {chunk.document_id} • Chunk #{chunk.id}
                  </span>
                </div>

                <h4 className="font-bold text-white text-base flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-400 shrink-0" />
                  {chunk.title}
                </h4>

                <p className="text-xs text-gray-300 mt-2.5 leading-relaxed bg-gray-950/70 p-3 rounded-xl border border-gray-800 font-sans">
                  {chunk.chunk_text}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-gray-500 font-mono border-t border-gray-800/60">
                <span>Vector: [0.0142, -0.0891, 0.0532, ...]</span>
                <span className="text-emerald-400">Similarity: 0.942</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
