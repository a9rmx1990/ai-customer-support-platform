-- n8n integration objects. These live in the same Supabase database as the app.
-- No customer/order/SaaS tables are created.
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

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

-- n8n support conversations are intentionally separate from the realtime
-- doctor-patient conversations created by migration 004.
CREATE TABLE IF NOT EXISTS public.support_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.support_messages (
  id BIGSERIAL PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.support_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  message TEXT NOT NULL CHECK (length(message) BETWEEN 1 AND 10000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_messages_conversation
  ON public.support_messages(conversation_id, created_at);
ALTER TABLE public.support_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS support_conversations_owner ON public.support_conversations;
CREATE POLICY support_conversations_owner ON public.support_conversations
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS support_messages_owner ON public.support_messages;
CREATE POLICY support_messages_owner ON public.support_messages
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.support_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_id TEXT,
  conversation_id TEXT,
  intent TEXT,
  retrieved_docs JSONB,
  tools_used JSONB,
  response TEXT,
  escalated BOOLEAN NOT NULL DEFAULT false,
  ticket_id BIGINT,
  errors TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_n8n_logs_user ON public.support_logs(user_id, created_at);
ALTER TABLE public.support_logs ADD COLUMN IF NOT EXISTS customer_id TEXT;
ALTER TABLE public.support_logs ADD COLUMN IF NOT EXISTS retrieved_docs JSONB;
ALTER TABLE public.support_logs ADD COLUMN IF NOT EXISTS tools_used JSONB;

ALTER TABLE public.support_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS logs_owner ON public.support_logs;
CREATE POLICY logs_owner ON public.support_logs FOR SELECT USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.lab_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_name TEXT NOT NULL,
  result_value TEXT NOT NULL,
  reference_range TEXT,
  status TEXT NOT NULL DEFAULT 'final',
  collected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lab_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS lab_results_patient_read ON public.lab_results;
CREATE POLICY lab_results_patient_read ON public.lab_results FOR SELECT USING (auth.uid() = patient_id);
