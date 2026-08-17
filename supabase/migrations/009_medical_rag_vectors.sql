-- Shared medical RAG storage for n8n and the application database.
CREATE EXTENSION IF NOT EXISTS vector;

-- Keep this migration safe when 007 was skipped or partially applied.
CREATE TABLE IF NOT EXISTS public.knowledge_documents (
  document_id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  source TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.knowledge_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS knowledge_documents_doctors ON public.knowledge_documents;
CREATE POLICY knowledge_documents_doctors ON public.knowledge_documents
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('doctor', 'admin'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('doctor', 'admin'))
  );

CREATE TABLE IF NOT EXISTS public.knowledge_chunks (
  id BIGSERIAL PRIMARY KEY,
  document_id BIGINT REFERENCES public.knowledge_documents(document_id) ON DELETE CASCADE,
  chunk_text TEXT NOT NULL,
  embedding vector(768) NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_document ON public.knowledge_chunks(document_id);
ALTER TABLE public.knowledge_chunks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS knowledge_chunks_doctors ON public.knowledge_chunks;
CREATE POLICY knowledge_chunks_doctors ON public.knowledge_chunks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('doctor', 'admin'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('doctor', 'admin'))
  );

CREATE OR REPLACE FUNCTION public.match_medical_knowledge(
  query_embedding vector(768),
  match_threshold FLOAT DEFAULT 0.35,
  match_count INTEGER DEFAULT 5
)
RETURNS TABLE (id BIGINT, document_id BIGINT, chunk_text TEXT, metadata JSONB, similarity FLOAT)
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT kc.id, kc.document_id, kc.chunk_text, kc.metadata,
         1 - (kc.embedding <=> query_embedding) AS similarity
  FROM public.knowledge_chunks kc
  WHERE 1 - (kc.embedding <=> query_embedding) >= match_threshold
  ORDER BY kc.embedding <=> query_embedding
  LIMIT LEAST(match_count, 20);
$$;
REVOKE ALL ON FUNCTION public.match_medical_knowledge(vector, FLOAT, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.match_medical_knowledge(vector, FLOAT, INTEGER) TO authenticated;
