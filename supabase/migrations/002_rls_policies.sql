-- =============================================================================
-- Migration 002: Row Level Security (RLS) Policies
-- Project: AI Medical Customer Support Platform
-- =============================================================================
-- These policies enforce authorization at the database layer.
-- Even if a bug exists in application code, RLS prevents unauthorized data access.

-- =============================================================================
-- ENABLE RLS ON ALL SENSITIVE TABLES
-- =============================================================================
ALTER TABLE public.profiles                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_availability       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_schedule_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs               ENABLE ROW LEVEL SECURITY;

-- Make this migration safe to re-run from the Supabase SQL editor. PostgreSQL
-- has no CREATE OR REPLACE POLICY, so remove only the policies owned by this
-- migration before recreating them below.
DO $$
DECLARE
  policy_row RECORD;
BEGIN
  FOR policy_row IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'profiles', 'patient_profiles', 'doctor_profiles',
        'doctor_availability', 'doctor_schedule_exceptions',
        'appointments', 'notifications', 'audit_logs'
      )
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON %I.%I',
      policy_row.policyname,
      policy_row.schemaname,
      policy_row.tablename
    );
  END LOOP;
END $$;

-- =============================================================================
-- HELPER: Check if the current user is an admin
-- =============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- =============================================================================
-- PROFILES POLICIES
-- =============================================================================
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Verified doctors are publicly searchable by patients
CREATE POLICY "Verified doctors are publicly discoverable"
  ON public.profiles FOR SELECT
  USING (
    role = 'doctor'
    AND EXISTS (
      SELECT 1 FROM public.doctor_profiles dp
      WHERE dp.user_id = profiles.id
        AND dp.verification_status = 'verified'
    )
  );

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

-- Users can update their own permitted profile fields
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- Prevent self-role escalation: user cannot change their own role
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

-- Profile is inserted by the handle_new_user trigger (SECURITY DEFINER)
-- No user-facing INSERT policy needed

-- Admins can update any profile (e.g. to verify doctors)
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- =============================================================================
-- PATIENT PROFILES POLICIES
-- =============================================================================
-- Patients can only view their own extended profile
CREATE POLICY "Patients can view own patient profile"
  ON public.patient_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Patients can insert their own patient profile
CREATE POLICY "Patients can create own patient profile"
  ON public.patient_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Patients can update own profile
CREATE POLICY "Patients can update own patient profile"
  ON public.patient_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all patient profiles
CREATE POLICY "Admins can view all patient profiles"
  ON public.patient_profiles FOR SELECT
  USING (public.is_admin());

-- =============================================================================
-- DOCTOR PROFILES POLICIES
-- =============================================================================
-- Verified doctor profiles are publicly readable (for appointment search)
CREATE POLICY "Verified doctor profiles are publicly readable"
  ON public.doctor_profiles FOR SELECT
  USING (verification_status = 'verified');

-- Doctors can read their own profile (regardless of verification status)
CREATE POLICY "Doctors can view own doctor profile"
  ON public.doctor_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Doctors can create their own profile (sets verification_status = 'pending')
CREATE POLICY "Doctors can create own doctor profile"
  ON public.doctor_profiles FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND verification_status = 'pending'  -- cannot self-verify on insert
  );

-- Doctors can update permitted fields of their own profile
CREATE POLICY "Doctors can update own permitted fields"
  ON public.doctor_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    -- Doctors cannot change their own verification_status
    AND verification_status = (SELECT verification_status FROM public.doctor_profiles WHERE user_id = auth.uid())
  );

-- Admins can view all doctor profiles
CREATE POLICY "Admins can view all doctor profiles"
  ON public.doctor_profiles FOR SELECT
  USING (public.is_admin());

-- Admins can update verification_status and other fields
CREATE POLICY "Admins can update doctor profiles"
  ON public.doctor_profiles FOR UPDATE
  USING (public.is_admin());

-- =============================================================================
-- DOCTOR AVAILABILITY POLICIES
-- =============================================================================
-- Availability of verified doctors is publicly readable
CREATE POLICY "Verified doctor availability is publicly readable"
  ON public.doctor_availability FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.doctor_profiles dp
      WHERE dp.id = doctor_availability.doctor_id
        AND dp.verification_status = 'verified'
    )
  );

-- Doctors can manage their own availability
CREATE POLICY "Doctors can manage own availability"
  ON public.doctor_availability FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.doctor_profiles dp
      WHERE dp.id = doctor_availability.doctor_id
        AND dp.user_id = auth.uid()
    )
  );

-- =============================================================================
-- DOCTOR SCHEDULE EXCEPTIONS POLICIES
-- =============================================================================
-- Doctors can manage their own exceptions
CREATE POLICY "Doctors can manage own schedule exceptions"
  ON public.doctor_schedule_exceptions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.doctor_profiles dp
      WHERE dp.id = doctor_schedule_exceptions.doctor_id
        AND dp.user_id = auth.uid()
    )
  );

-- Exceptions of verified doctors are publicly readable
CREATE POLICY "Verified doctor exceptions are publicly readable"
  ON public.doctor_schedule_exceptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.doctor_profiles dp
      WHERE dp.id = doctor_schedule_exceptions.doctor_id
        AND dp.verification_status = 'verified'
    )
  );

-- =============================================================================
-- APPOINTMENTS POLICIES
-- =============================================================================
-- Patients can view their own appointments
CREATE POLICY "Patients can view own appointments"
  ON public.appointments FOR SELECT
  USING (auth.uid() = patient_id);

-- Doctors can view appointments assigned to them
CREATE POLICY "Doctors can view their assigned appointments"
  ON public.appointments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.doctor_profiles dp
      WHERE dp.id = appointments.doctor_id
        AND dp.user_id = auth.uid()
    )
  );

-- Patients can create appointments (INSERT is executed via the atomic booking function)
CREATE POLICY "Patients can create appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

-- Patients can cancel their own appointments
CREATE POLICY "Patients can cancel own appointments"
  ON public.appointments FOR UPDATE
  USING (
    auth.uid() = patient_id
    AND status NOT IN ('completed', 'cancelled')
  )
  WITH CHECK (
    auth.uid() = patient_id
    AND status IN ('cancelled', 'rescheduled')
  );

-- Doctors can update appointment status for their appointments
CREATE POLICY "Doctors can update appointment status"
  ON public.appointments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.doctor_profiles dp
      WHERE dp.id = appointments.doctor_id
        AND dp.user_id = auth.uid()
    )
  );

-- Admins can manage all appointments
CREATE POLICY "Admins can manage all appointments"
  ON public.appointments FOR ALL
  USING (public.is_admin());

-- =============================================================================
-- NOTIFICATIONS POLICIES
-- =============================================================================
-- Users can only view their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can mark their own notifications as read
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- System inserts notifications via service-role key (backend only)
-- No user-facing INSERT policy

-- =============================================================================
-- AUDIT LOGS POLICIES
-- =============================================================================
-- Audit logs are insert-only from backend — no user reads or modifications
CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.is_admin());

-- No UPDATE or DELETE policies on audit_logs (immutable log)
