-- =============================================================================
-- Migration 001: Initial Medical Platform Schema
-- Project: AI Medical Customer Support Platform
-- =============================================================================
-- Run this against your Supabase project via:
--   Supabase Dashboard → SQL Editor → paste and run
-- Or via the Supabase CLI: supabase db push

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- PROFILES TABLE
-- Extends Supabase auth.users with application-level user data.
-- id references auth.users.id — this is the single source of identity.
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('patient', 'doctor', 'admin')),
  phone       TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- PATIENT PROFILES TABLE
-- Extended attributes for users with role = 'patient'
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.patient_profiles (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  date_of_birth     DATE,
  gender            TEXT,
  emergency_contact TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- DOCTOR PROFILES TABLE
-- Extended attributes for users with role = 'doctor'.
-- Doctors must be verified before they appear in appointment search results.
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.doctor_profiles (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  specialization      TEXT NOT NULL,
  license_number      TEXT,
  bio                 TEXT,
  experience_years    INTEGER CHECK (experience_years >= 0),
  consultation_fee    NUMERIC(10, 2) CHECK (consultation_fee >= 0),
  verification_status TEXT NOT NULL DEFAULT 'pending'
                        CHECK (verification_status IN ('pending', 'verified', 'rejected', 'suspended')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- DOCTOR AVAILABILITY TABLE
-- Recurring weekly schedule for each doctor.
-- day_of_week: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.doctor_availability (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id    UUID NOT NULL REFERENCES public.doctor_profiles(id) ON DELETE CASCADE,
  day_of_week  SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time   TIME NOT NULL,
  end_time     TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (doctor_id, day_of_week)
);

-- =============================================================================
-- DOCTOR SCHEDULE EXCEPTIONS TABLE
-- One-off overrides to the weekly schedule (leave, holidays, special availability).
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.doctor_schedule_exceptions (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id  UUID NOT NULL REFERENCES public.doctor_profiles(id) ON DELETE CASCADE,
  date       DATE NOT NULL,
  start_time TIME,
  end_time   TIME,
  status     TEXT NOT NULL DEFAULT 'unavailable'
               CHECK (status IN ('available', 'unavailable', 'leave', 'holiday')),
  reason     TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- APPOINTMENTS TABLE
-- Links a real patient to a real doctor for a specific time slot.
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.appointments (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  doctor_id        UUID NOT NULL REFERENCES public.doctor_profiles(id) ON DELETE RESTRICT,
  scheduled_start  TIMESTAMPTZ NOT NULL,
  scheduled_end    TIMESTAMPTZ NOT NULL,
  status           TEXT NOT NULL DEFAULT 'requested'
                     CHECK (status IN ('requested', 'confirmed', 'cancelled', 'completed', 'no_show', 'rescheduled')),
  reason           TEXT,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Prevent double-booking: one active appointment per doctor per time slot
  CONSTRAINT no_overlapping_appointments EXCLUDE USING GIST (
    doctor_id WITH =,
    tstzrange(scheduled_start, scheduled_end) WITH &&
  ) WHERE (status NOT IN ('cancelled', 'no_show', 'rescheduled'))
);

-- Fallback unique constraint if GIST exclusion is not available
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_time
  ON public.appointments (doctor_id, scheduled_start, scheduled_end);

-- =============================================================================
-- NOTIFICATIONS TABLE
-- Application-level notifications tied to real database events.
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type           TEXT NOT NULL,
  title          TEXT NOT NULL,
  message        TEXT NOT NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  read           BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- AUDIT LOGS TABLE
-- Immutable audit trail. No DELETE or UPDATE policies.
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action        TEXT NOT NULL,
  resource_type TEXT,
  resource_id   TEXT,
  metadata      JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- AUTOMATIC updated_at TRIGGER
-- =============================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_patient_profiles_updated_at
  BEFORE UPDATE ON public.patient_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_doctor_profiles_updated_at
  BEFORE UPDATE ON public.doctor_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_doctor_availability_updated_at
  BEFORE UPDATE ON public.doctor_availability
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- Triggered by Supabase Auth when a new user registers.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
