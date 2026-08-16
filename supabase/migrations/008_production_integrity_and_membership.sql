-- Production integrity and explicit doctor/patient conversation membership.
-- This migration is additive and safe to rerun.

-- Appointment and availability validation.
ALTER TABLE public.appointments
  DROP CONSTRAINT IF EXISTS appointments_valid_time;
ALTER TABLE public.appointments
  ADD CONSTRAINT appointments_valid_time
  CHECK (scheduled_end > scheduled_start) NOT VALID;

ALTER TABLE public.doctor_availability
  DROP CONSTRAINT IF EXISTS doctor_availability_doctor_id_day_of_week_key;
ALTER TABLE public.doctor_availability
  DROP CONSTRAINT IF EXISTS doctor_availability_valid_time;
ALTER TABLE public.doctor_availability
  ADD CONSTRAINT doctor_availability_valid_time
  CHECK (end_time > start_time) NOT VALID;

ALTER TABLE public.doctor_schedule_exceptions
  DROP CONSTRAINT IF EXISTS doctor_schedule_exceptions_valid_time;
ALTER TABLE public.doctor_schedule_exceptions
  ADD CONSTRAINT doctor_schedule_exceptions_valid_time
  CHECK (
    (start_time IS NULL AND end_time IS NULL)
    OR (start_time IS NOT NULL AND end_time IS NOT NULL AND end_time > start_time)
  ) NOT VALID;

CREATE OR REPLACE FUNCTION public.prevent_availability_overlap()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.doctor_availability da
    WHERE da.doctor_id = NEW.doctor_id
      AND da.day_of_week = NEW.day_of_week
      AND da.id <> NEW.id
      AND da.start_time < NEW.end_time
      AND NEW.start_time < da.end_time
  ) THEN
    RAISE EXCEPTION 'Doctor availability periods overlap';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_availability_overlap ON public.doctor_availability;
CREATE TRIGGER trg_prevent_availability_overlap
  BEFORE INSERT OR UPDATE ON public.doctor_availability
  FOR EACH ROW EXECUTE FUNCTION public.prevent_availability_overlap();

CREATE OR REPLACE FUNCTION public.validate_appointment_status_transition()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF OLD.status = 'completed' AND NEW.status <> OLD.status THEN
    RAISE EXCEPTION 'Completed appointments cannot change status';
  END IF;
  IF OLD.status IN ('cancelled', 'no_show') AND NEW.status <> OLD.status THEN
    RAISE EXCEPTION 'Closed appointments cannot change status';
  END IF;
  IF OLD.status = 'requested' AND NEW.status NOT IN ('requested', 'confirmed', 'cancelled', 'rescheduled') THEN
    RAISE EXCEPTION 'Invalid appointment status transition';
  END IF;
  IF OLD.status = 'confirmed' AND NEW.status NOT IN ('confirmed', 'cancelled', 'completed', 'no_show', 'rescheduled') THEN
    RAISE EXCEPTION 'Invalid appointment status transition';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_validate_appointment_status ON public.appointments;
CREATE TRIGGER trg_validate_appointment_status
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.validate_appointment_status_transition();

CREATE OR REPLACE FUNCTION public.validate_appointment_slot()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  v_date DATE := (NEW.scheduled_start AT TIME ZONE 'UTC')::date;
  v_day SMALLINT := EXTRACT(DOW FROM (NEW.scheduled_start AT TIME ZONE 'UTC'))::smallint;
  v_start TIME := (NEW.scheduled_start AT TIME ZONE 'UTC')::time;
  v_end TIME := (NEW.scheduled_end AT TIME ZONE 'UTC')::time;
  v_exception RECORD;
BEGIN
  SELECT * INTO v_exception FROM public.doctor_schedule_exceptions
  WHERE doctor_id = NEW.doctor_id AND date = v_date LIMIT 1;
  IF FOUND THEN
    IF v_exception.status IN ('unavailable', 'leave', 'holiday') THEN
      RAISE EXCEPTION 'Doctor is unavailable on this date';
    END IF;
    IF v_exception.start_time IS NOT NULL AND
       NOT (v_start >= v_exception.start_time AND v_end <= v_exception.end_time) THEN
      RAISE EXCEPTION 'Appointment is outside doctor availability';
    END IF;
  ELSIF NOT EXISTS (
    SELECT 1 FROM public.doctor_availability da
    WHERE da.doctor_id = NEW.doctor_id
      AND da.day_of_week = v_day AND da.is_available
      AND v_start >= da.start_time AND v_end <= da.end_time
  ) THEN
    RAISE EXCEPTION 'Appointment is outside doctor availability';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_validate_appointment_slot ON public.appointments;
CREATE TRIGGER trg_validate_appointment_slot
  BEFORE INSERT OR UPDATE OF doctor_id, scheduled_start, scheduled_end ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.validate_appointment_slot();

-- Explicit membership for realtime conversations.
ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.conversation_participants (
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (conversation_id, user_id)
);

ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

INSERT INTO public.conversation_participants (conversation_id, user_id)
SELECT c.id, c.patient_id FROM public.conversations c
ON CONFLICT DO NOTHING;
INSERT INTO public.conversation_participants (conversation_id, user_id)
SELECT c.id, c.doctor_id FROM public.conversations c
ON CONFLICT DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_conversation_participants_user
  ON public.conversation_participants(user_id, conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_doctor_verification ON public.doctor_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_doctor_specialization ON public.doctor_profiles(specialization);

ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS conversation_participants_read ON public.conversation_participants;
CREATE POLICY conversation_participants_read ON public.conversation_participants
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS conversation_participants_insert ON public.conversation_participants;

DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations they belong to" ON public.conversations;
DROP POLICY IF EXISTS "Users can create appointed conversations" ON public.conversations;
DROP POLICY IF EXISTS conversations_participant_read ON public.conversations;
DROP POLICY IF EXISTS conversations_participant_insert ON public.conversations;
CREATE POLICY conversations_participant_read ON public.conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = conversations.id AND cp.user_id = auth.uid()
    )
  );
CREATE POLICY conversations_participant_insert ON public.conversations
  FOR INSERT WITH CHECK (
    (patient_id = auth.uid() OR doctor_id = auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.appointments a
      JOIN public.doctor_profiles dp ON dp.id = a.doctor_id
      WHERE a.patient_id = public.conversations.patient_id
        AND dp.user_id = public.conversations.doctor_id
        AND a.status NOT IN ('cancelled', 'no_show')
    )
  );

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages to their conversations" ON public.messages;
DROP POLICY IF EXISTS messages_participant_read ON public.messages;
DROP POLICY IF EXISTS messages_participant_insert ON public.messages;
CREATE POLICY messages_participant_read ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id AND cp.user_id = auth.uid()
    )
  );
CREATE POLICY messages_participant_insert ON public.messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id AND cp.user_id = auth.uid()
    )
  );

-- Populate membership automatically for conversations created by the app.
CREATE OR REPLACE FUNCTION public.add_conversation_participants()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.conversation_participants (conversation_id, user_id)
  VALUES (NEW.id, NEW.patient_id), (NEW.id, NEW.doctor_id)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_add_conversation_participants ON public.conversations;
CREATE TRIGGER trg_add_conversation_participants
  AFTER INSERT ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.add_conversation_participants();

-- Trusted doctor promotion. Client signup metadata cannot call this as admin.
CREATE OR REPLACE FUNCTION public.admin_promote_to_doctor(
  p_user_id UUID,
  p_specialization TEXT
)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_doctor_id UUID;
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'ADMIN_REQUIRED'; END IF;
  IF NULLIF(trim(p_specialization), '') IS NULL THEN RAISE EXCEPTION 'SPECIALIZATION_REQUIRED'; END IF;
  UPDATE public.profiles SET role = 'doctor' WHERE id = p_user_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'USER_NOT_FOUND'; END IF;
  INSERT INTO public.doctor_profiles (user_id, specialization, verification_status)
  VALUES (p_user_id, NULLIF(trim(p_specialization), ''), 'pending')
  ON CONFLICT (user_id) DO UPDATE SET specialization = EXCLUDED.specialization;
  SELECT id INTO v_doctor_id FROM public.doctor_profiles WHERE user_id = p_user_id;
  RETURN v_doctor_id;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_promote_to_doctor(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_promote_to_doctor(UUID, TEXT) TO authenticated;
