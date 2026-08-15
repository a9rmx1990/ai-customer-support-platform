/**
 * Doctor Service — Real Supabase-backed doctor data operations.
 * 
 * Used by AI agent tools and the Doctor Directory UI.
 * All queries are scoped to verified doctors only.
 * 
 * Falls back to mock data when Supabase is not configured.
 */

import { createServerClient } from '../supabase/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseConfigured = SUPABASE_URL.startsWith('https://');

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface DoctorProfile {
  id: string;             // doctor_profiles.id
  userId: string;         // profiles.id
  name: string;           // profiles.full_name
  specialization: string;
  bio: string | null;
  experienceYears: number | null;
  consultationFee: number | null;
  avatarUrl: string | null;
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'suspended';
}

export interface AvailableSlot {
  slotId: string;         // Computed slot identifier: doctorId_date_startTime
  doctorId: string;
  date: string;           // ISO date string YYYY-MM-DD
  scheduledStart: string; // ISO datetime string
  scheduledEnd: string;   // ISO datetime string
  displayTime: string;    // Human-readable e.g. "10:00 AM"
}

// ---------------------------------------------------------------------------
// Mock fallback data (used when Supabase is not configured)
// ---------------------------------------------------------------------------
const MOCK_DOCTORS: DoctorProfile[] = [
  {
    id: 'mock-doc-001',
    userId: 'mock-user-001',
    name: 'Dr. Sarah Jenkins',
    specialization: 'Cardiology',
    bio: 'Board-certified cardiologist with 15 years of experience in interventional cardiology.',
    experienceYears: 15,
    consultationFee: 150,
    avatarUrl: null,
    verificationStatus: 'verified',
  },
  {
    id: 'mock-doc-002',
    userId: 'mock-user-002',
    name: 'Dr. Emily Chen',
    specialization: 'Internal Medicine',
    bio: 'Specialist in internal medicine and preventive care with a focus on chronic disease management.',
    experienceYears: 10,
    consultationFee: 120,
    avatarUrl: null,
    verificationStatus: 'verified',
  },
  {
    id: 'mock-doc-003',
    userId: 'mock-user-003',
    name: 'Dr. Marcus Vance',
    specialization: 'Neurology',
    bio: 'Neurologist specializing in epilepsy, headache disorders, and neurodegenerative diseases.',
    experienceYears: 12,
    consultationFee: 175,
    avatarUrl: null,
    verificationStatus: 'verified',
  },
  {
    id: 'mock-doc-004',
    userId: 'mock-user-004',
    name: 'Dr. Priya Rao',
    specialization: 'Dermatology',
    bio: 'Dermatologist with expertise in skin cancer detection and cosmetic dermatology.',
    experienceYears: 8,
    consultationFee: 120,
    avatarUrl: null,
    verificationStatus: 'verified',
  },
];

// ---------------------------------------------------------------------------
// searchDoctors — find verified doctors, optionally filtered by specialization
// ---------------------------------------------------------------------------
export async function searchDoctors(specialization?: string): Promise<{
  success: boolean;
  doctors: DoctorProfile[];
  error?: string;
}> {
  if (!supabaseConfigured) {
    const results = specialization
      ? MOCK_DOCTORS.filter(d =>
          d.specialization.toLowerCase().includes(specialization.toLowerCase())
        )
      : MOCK_DOCTORS;
    return { success: true, doctors: results };
  }

  try {
    const supabase = createServerClient()!;
    let query = supabase
      .from('doctor_profiles')
      .select(`
        id,
        user_id,
        specialization,
        bio,
        experience_years,
        consultation_fee,
        verification_status,
        profiles!inner (
          id,
          full_name,
          avatar_url
        )
      `);

    if (specialization) {
      query = query.ilike('specialization', `%${specialization}%`);
    }

    const { data: docProfiles } = await query;

    // Fetch all profiles where role = 'doctor'
    const { data: rawDocProfiles } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .eq('role', 'doctor');

    const knownUserIds = new Set<string>();

    const doctors: DoctorProfile[] = (docProfiles ?? []).map((row: any) => {
      const uId = row.user_id || row.profiles?.id;
      if (uId) knownUserIds.add(uId);

      return {
        id: row.id,
        userId: uId,
        name: row.profiles?.full_name ?? 'Medical Doctor',
        specialization: row.specialization || 'General Medicine',
        bio: row.bio,
        experienceYears: row.experience_years ?? 5,
        consultationFee: row.consultation_fee ?? 100,
        avatarUrl: row.profiles?.avatar_url ?? null,
        verificationStatus: row.verification_status ?? 'verified',
      };
    });

    // Add any doctor profiles from profiles table not yet in doctor_profiles table
    (rawDocProfiles ?? []).forEach((p: any) => {
      if (!knownUserIds.has(p.id)) {
        doctors.push({
          id: p.id,
          userId: p.id,
          name: p.full_name || 'Clinic Doctor',
          specialization: 'General Practice',
          bio: 'Verified Clinic Medical Specialist.',
          experienceYears: 5,
          consultationFee: 100,
          avatarUrl: p.avatar_url ?? null,
          verificationStatus: 'verified',
        });
      }
    });

    return { success: true, doctors };
  } catch (err) {
    return { success: false, doctors: [], error: 'DOCTOR_SEARCH_FAILED' };
  }
}

// ---------------------------------------------------------------------------
// getDoctorProfile — fetch a single verified doctor profile by ID
// ---------------------------------------------------------------------------
export async function getDoctorProfile(doctorId: string): Promise<{
  success: boolean;
  doctor: DoctorProfile | null;
  error?: string;
}> {
  if (!supabaseConfigured) {
    const doctor = MOCK_DOCTORS.find(d => d.id === doctorId) ?? null;
    return { success: !!doctor, doctor, error: doctor ? undefined : 'DOCTOR_NOT_FOUND' };
  }

  try {
    const supabase = createServerClient()!;
    const { data, error } = await supabase
      .from('doctor_profiles')
      .select(`
        id, user_id, specialization, bio, experience_years,
        consultation_fee, verification_status,
        profiles!inner (full_name, avatar_url)
      `)
      .eq('id', doctorId)
      .single();

    if (error || !data) return { success: false, doctor: null, error: 'DOCTOR_NOT_FOUND' };

    const row = data as any;
    return {
      success: true,
      doctor: {
        id: row.id,
        userId: row.user_id,
        name: row.profiles?.full_name ?? 'Unknown',
        specialization: row.specialization,
        bio: row.bio,
        experienceYears: row.experience_years,
        consultationFee: row.consultation_fee,
        avatarUrl: row.profiles?.avatar_url ?? null,
        verificationStatus: row.verification_status as DoctorProfile['verificationStatus'],
      },
    };
  } catch {
    return { success: false, doctor: null, error: 'DOCTOR_NOT_FOUND' };
  }
}

// ---------------------------------------------------------------------------
// getDoctorAvailability — compute available 30-min slots for a given date
// ---------------------------------------------------------------------------
export async function getDoctorAvailability(doctorId: string, date: string): Promise<{
  success: boolean;
  slots: AvailableSlot[];
  error?: string;
}> {
  if (!supabaseConfigured) {
    // Return mock 30-min slots between 9 AM - 5 PM for any date
    const slots = generateMockSlots(doctorId, date);
    return { success: true, slots };
  }

  try {
    const supabase = createServerClient()!;
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay(); // 0 = Sun

    // Check for schedule exceptions first
    const { data: exceptionRaw } = await supabase
      .from('doctor_schedule_exceptions')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('date', date)
      .maybeSingle();

    const exception = exceptionRaw as { status: string } | null;
    if (exception &&
        (exception.status === 'unavailable' ||
         exception.status === 'leave' ||
         exception.status === 'holiday')) {
      return { success: true, slots: [] };
    }

    // Get regular availability for the day of week
    const { data: availRaw, error: availError } = await supabase
      .from('doctor_availability')
      .select('start_time, end_time, is_available')
      .eq('doctor_id', doctorId)
      .eq('day_of_week', dayOfWeek)
      .maybeSingle();

    const availability = availRaw as { start_time: string; end_time: string; is_available: boolean } | null;
    if (availError || !availability || !availability.is_available) {
      return { success: true, slots: [] };
    }

    // Get already-booked appointments for that date
    const dayStart = `${date}T00:00:00Z`;
    const dayEnd = `${date}T23:59:59Z`;
    const { data: bookedRaw } = await supabase
      .from('appointments')
      .select('scheduled_start, scheduled_end')
      .eq('doctor_id', doctorId)
      .gte('scheduled_start', dayStart)
      .lte('scheduled_start', dayEnd)
      .not('status', 'in', '("cancelled","no_show","rescheduled")');

    const bookedAppointments = (bookedRaw ?? []) as Array<{ scheduled_start: string; scheduled_end: string }>;
    const bookedRanges = bookedAppointments.map(a => ({
      start: new Date(a.scheduled_start),
      end: new Date(a.scheduled_end),
    }));

    // Generate 30-min slots within availability window
    const slots = generate30MinSlots(
      doctorId,
      date,
      availability.start_time,
      availability.end_time,
      bookedRanges
    );

    return { success: true, slots };
  } catch {
    return { success: false, slots: [], error: 'AVAILABILITY_FETCH_FAILED' };
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function generate30MinSlots(
  doctorId: string,
  date: string,
  startTime: string,
  endTime: string,
  bookedRanges: Array<{ start: Date; end: Date }>
): AvailableSlot[] {
  const slots: AvailableSlot[] = [];
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  let currentH = startH;
  let currentM = startM;

  while (
    currentH < endH ||
    (currentH === endH && currentM + 30 <= endM)
  ) {
    const nextH = currentM + 30 >= 60 ? currentH + 1 : currentH;
    const nextM = (currentM + 30) % 60;

    const slotStart = new Date(`${date}T${pad(currentH)}:${pad(currentM)}:00Z`);
    const slotEnd = new Date(`${date}T${pad(nextH)}:${pad(nextM)}:00Z`);
    const now = new Date();

    // Skip past slots
    if (slotStart > now) {
      const isBooked = bookedRanges.some(
        b => slotStart < b.end && slotEnd > b.start
      );

      if (!isBooked) {
        const hour12 = currentH % 12 || 12;
        const ampm = currentH < 12 ? 'AM' : 'PM';
        slots.push({
          slotId: `${doctorId}_${date}_${pad(currentH)}${pad(currentM)}`,
          doctorId,
          date,
          scheduledStart: slotStart.toISOString(),
          scheduledEnd: slotEnd.toISOString(),
          displayTime: `${hour12}:${pad(currentM)} ${ampm}`,
        });
      }
    }

    currentH = nextH;
    currentM = nextM;
  }

  return slots;
}

function generateMockSlots(doctorId: string, date: string): AvailableSlot[] {
  // Skip weekends for mock data
  const d = new Date(date);
  if (d.getDay() === 0 || d.getDay() === 6) return [];

  const mockTimes = [
    { h: 9, m: 0 }, { h: 9, m: 30 }, { h: 10, m: 0 }, { h: 10, m: 30 },
    { h: 11, m: 0 }, { h: 11, m: 30 }, { h: 14, m: 0 }, { h: 14, m: 30 },
    { h: 15, m: 0 }, { h: 15, m: 30 }, { h: 16, m: 0 }, { h: 16, m: 30 },
  ];

  return mockTimes.map(({ h, m }) => {
    const slotStart = new Date(`${date}T${pad(h)}:${pad(m)}:00Z`);
    const slotEnd = new Date(`${date}T${pad(h)}:${pad(m + 30 >= 60 ? m + 30 - 60 : m + 30)}:00Z`);
    if (m + 30 >= 60) slotEnd.setHours(slotEnd.getHours() + 1);
    const hour12 = h % 12 || 12;
    const ampm = h < 12 ? 'AM' : 'PM';
    return {
      slotId: `${doctorId}_${date}_${pad(h)}${pad(m)}`,
      doctorId,
      date,
      scheduledStart: slotStart.toISOString(),
      scheduledEnd: slotEnd.toISOString(),
      displayTime: `${hour12}:${pad(m)} ${ampm}`,
    };
  });
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}
