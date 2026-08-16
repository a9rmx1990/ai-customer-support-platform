-- Ensure doctor accounts become discoverable immediately after signup and
-- restrict doctor/patient communication to real appointments.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT;
BEGIN
  -- Client metadata must never grant doctor/admin privileges.
  v_role := 'patient';

  INSERT INTO public.profiles (id, full_name, role, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    v_role,
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    avatar_url = EXCLUDED.avatar_url;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Backfill doctor profiles for accounts created before this migration.
INSERT INTO public.doctor_profiles (user_id, specialization, verification_status)
SELECT p.id, 'General Practice', 'pending'
FROM public.profiles p
LEFT JOIN public.doctor_profiles dp ON dp.user_id = p.id
WHERE p.role = 'doctor' AND dp.id IS NULL
ON CONFLICT (user_id) DO NOTHING;

DROP POLICY IF EXISTS "Doctors can view assigned patients" ON public.profiles;
CREATE POLICY "Doctors can view assigned patients"
  ON public.profiles FOR SELECT
  USING (
    role = 'patient'
    AND EXISTS (
      SELECT 1
      FROM public.appointments a
      JOIN public.doctor_profiles dp ON dp.id = a.doctor_id
      WHERE a.patient_id = profiles.id
        AND dp.user_id = auth.uid()
        AND a.status NOT IN ('cancelled', 'no_show')
    )
  );

DROP POLICY IF EXISTS "Users can create conversations they belong to" ON public.conversations;
DROP POLICY IF EXISTS "Users can create appointed conversations" ON public.conversations;
CREATE POLICY "Users can create appointed conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (
    (auth.uid() = patient_id OR auth.uid() = doctor_id)
    AND EXISTS (
      SELECT 1
      FROM public.appointments a
      JOIN public.doctor_profiles dp ON dp.id = a.doctor_id
      WHERE a.patient_id = conversations.patient_id
        AND dp.user_id = conversations.doctor_id
        AND a.status NOT IN ('cancelled', 'no_show')
    )
  );
