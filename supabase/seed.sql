-- =============================================================================
-- Supabase Development Seed Data
-- FOR LOCAL DEVELOPMENT ONLY — never run this against production
-- =============================================================================
-- Usage: paste into Supabase Dashboard → SQL Editor while on your dev project
-- Or: supabase db reset (will run migrations + this seed file)

-- WARNING: This creates development auth users directly.
-- In production, users are created via Supabase Auth sign-up flow.
-- Passwords here are for development convenience only.

-- =============================================================================
-- DEVELOPMENT DOCTOR ACCOUNTS
-- These are seeded as auth.users + profiles + doctor_profiles
-- In production, doctors go through the real registration and verification flow.
-- =============================================================================

-- NOTE: Supabase does not allow direct insert into auth.users via SQL seed in all environments.
-- Use the Supabase Dashboard → Authentication → Users to manually create dev doctor accounts,
-- then run the profile insert section below with the UUIDs you receive.

-- After creating users in Auth, insert their profiles:
-- Replace the UUIDs below with the actual UUIDs from your Supabase Auth dashboard.

/*
-- EXAMPLE (replace UUIDs with real ones from your Supabase Auth dashboard):

INSERT INTO public.profiles (id, full_name, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Dr. Rahul Sharma', 'doctor'),
  ('00000000-0000-0000-0000-000000000002', 'Dr. Priya Rao', 'doctor'),
  ('00000000-0000-0000-0000-000000000003', 'Admin User', 'admin')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.doctor_profiles (user_id, specialization, license_number, bio, experience_years, consultation_fee, verification_status) VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'Cardiology',
    'MED-CARD-001',
    'Dr. Rahul Sharma is a board-certified cardiologist with 12 years of experience in interventional cardiology and heart failure management.',
    12,
    150.00,
    'verified'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'Dermatology',
    'MED-DERM-002',
    'Dr. Priya Rao specializes in medical and cosmetic dermatology with expertise in skin cancer detection and chronic skin condition management.',
    8,
    120.00,
    'verified'
  )
ON CONFLICT (user_id) DO NOTHING;

-- Doctor Availability (Monday=1 through Friday=5, 9 AM to 5 PM)
INSERT INTO public.doctor_availability (doctor_id, day_of_week, start_time, end_time, is_available)
SELECT
  dp.id,
  day,
  '09:00'::TIME,
  '17:00'::TIME,
  true
FROM public.doctor_profiles dp
CROSS JOIN generate_series(1, 5) AS day
WHERE dp.user_id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002'
)
ON CONFLICT (doctor_id, day_of_week) DO NOTHING;

*/

-- =============================================================================
-- Quick verification queries (run after seeding)
-- =============================================================================
-- SELECT p.full_name, p.role, dp.specialization, dp.verification_status
-- FROM public.profiles p
-- LEFT JOIN public.doctor_profiles dp ON dp.user_id = p.id
-- ORDER BY p.role, p.full_name;

-- SELECT COUNT(*) as available_doctors FROM public.doctor_profiles WHERE verification_status = 'verified';
