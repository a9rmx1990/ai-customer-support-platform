-- Existing Supabase knowledge chunks use 3072-dimensional Gemini embeddings.
-- Recreate the RPC with the same dimension used by n8n.
DROP FUNCTION IF EXISTS public.match_medical_knowledge(vector, double precision, integer);

CREATE OR REPLACE FUNCTION public.match_medical_knowledge(
  query_embedding vector(3072),
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
