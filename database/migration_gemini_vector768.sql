-- ============================================================================
-- MIGRATION SCRIPT: OpenAI (1536 dims) -> Google Gemini (768 dims)
-- Model: Google Gemini text-embedding-004 (768 dimensions)
-- ============================================================================

-- 1. Drop existing vector index on knowledge_chunks
DROP INDEX IF EXISTS idx_chunks_embedding;

-- 2. Drop OpenAI 1536-dimensional vector column and add Gemini 768-dimensional column
ALTER TABLE knowledge_chunks DROP COLUMN IF EXISTS embedding;
ALTER TABLE knowledge_chunks ADD COLUMN embedding vector(768);

-- 3. Re-create ivfflat vector index for 768-dimensional Gemini embeddings
CREATE INDEX idx_chunks_embedding ON knowledge_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ============================================================================
-- IMPORTANT NOTICE:
-- Existing 1536-dim OpenAI vector embeddings cannot be converted directly to 768-dim.
-- After running this migration script in PostgreSQL, execute the "Support System - RAG Ingestion" 
-- workflow in n8n once to generate fresh 768-dimensional Gemini embeddings for your documents.
-- ============================================================================
