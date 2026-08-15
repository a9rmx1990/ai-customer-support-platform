-- =============================================================================
-- Migration 004: Real-Time Doctor <-> Patient Chat Schema & RLS Policies
-- Project: AI Medical Customer Support Platform
-- =============================================================================

-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- CONVERSATIONS TABLE
-- Represents a active communication channel between a patient and a doctor.
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.conversations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  doctor_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT  unique_patient_doctor_pair UNIQUE (patient_id, doctor_id)
);

-- Indexes for fast conversation lookups
CREATE INDEX IF NOT EXISTS idx_conversations_patient ON public.conversations(patient_id);
CREATE INDEX IF NOT EXISTS idx_conversations_doctor  ON public.conversations(doctor_id);

-- =============================================================================
-- MESSAGES TABLE
-- Individual chat messages belonging to a conversation.
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for retrieving message history ordered by time
CREATE INDEX IF NOT EXISTS idx_messages_conversation_time
  ON public.messages(conversation_id, created_at ASC);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict data isolation: users can ONLY access conversations & messages they own.
-- =============================================================================

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- Conversations Policies
-- -----------------------------------------------------------------------------

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations they belong to" ON public.conversations;

CREATE POLICY "Users can view their own conversations"
  ON public.conversations FOR SELECT
  USING (
    auth.uid() = patient_id OR
    auth.uid() = doctor_id OR
    EXISTS (
      SELECT 1 FROM public.doctor_profiles dp
      WHERE dp.id = doctor_id AND dp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create conversations they belong to"
  ON public.conversations FOR INSERT
  WITH CHECK (
    auth.uid() = patient_id OR
    auth.uid() = doctor_id OR
    EXISTS (
      SELECT 1 FROM public.doctor_profiles dp
      WHERE dp.id = doctor_id AND dp.user_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- Messages Policies
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages to their conversations" ON public.messages;

CREATE POLICY "Users can view messages in their conversations"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
      AND (
        c.patient_id = auth.uid() OR
        c.doctor_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.doctor_profiles dp
          WHERE dp.id = c.doctor_id AND dp.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can send messages to their conversations"
  ON public.messages FOR INSERT
  WITH CHECK (
    -- Impersonation check: sender_id MUST equal the authenticated user's ID
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
      AND (
        c.patient_id = auth.uid() OR
        c.doctor_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.doctor_profiles dp
          WHERE dp.id = c.doctor_id AND dp.user_id = auth.uid()
        )
      )
    )
  );

-- =============================================================================
-- SUPABASE REALTIME CONFIGURATION
-- Enables WebSocket broadcasts when new messages are inserted.
-- =============================================================================

-- Set replica identity to full so filters work on realtime payload
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;

-- Add tables to the supabase_realtime publication
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
