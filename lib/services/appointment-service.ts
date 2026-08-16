/**
 * Appointment Service — Real Supabase-backed appointment operations.
 * 
 * All write operations go through the atomic PostgreSQL functions
 * (book_appointment_atomic, cancel_appointment_safe) defined in migration 003.
 * 
 * Patient identity is ALWAYS derived from the Supabase auth session.
 * Patient IDs from the client are NEVER trusted directly.
 * 
 * Falls back to in-memory mock store when Supabase is not configured.
 */

import { createServerClient } from '../supabase/server';
import { INITIAL_APPOINTMENTS } from '../mock-data';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseConfigured = SUPABASE_URL.startsWith('https://');

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface AppointmentRecord {
  id: string;
  patientId: string;
  patientName?: string;
  doctorId: string;
  doctorName: string;
  specialization: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: 'requested' | 'confirmed' | 'cancelled' | 'completed' | 'no_show' | 'rescheduled';
  reason: string | null;
  notes: string | null;
  createdAt: string;
}

export interface BookingResult {
  success: boolean;
  appointmentId?: string;
  status?: string;
  scheduledStart?: string;
  error?: string;
}

// ---------------------------------------------------------------------------
// getPatientAppointments — fetch all appointments for the authenticated patient
// patientId is the Supabase auth.users UUID
// ---------------------------------------------------------------------------
export async function getPatientAppointments(patientUserId: string, accessToken?: string): Promise<{
  success: boolean;
  appointments: AppointmentRecord[];
  error?: string;
}> {
  if (!supabaseConfigured) {
    // Legacy mock fallback
    const mockApts = INITIAL_APPOINTMENTS
      .filter(a => a.patient_id === patientUserId || patientUserId === 'PAT-2001')
      .map(a => ({
        id: a.appointment_id,
        patientId: a.patient_id,
        doctorId: 'mock-doc-001',
        doctorName: a.doctor_name,
        specialization: a.specialty,
        scheduledStart: a.date_time,
        scheduledEnd: new Date(new Date(a.date_time).getTime() + 30 * 60000).toISOString(),
        status: a.status as AppointmentRecord['status'],
        reason: null,
        notes: null,
        createdAt: a.date_time,
      }));
    return { success: true, appointments: mockApts };
  }

  try {
    const supabase = createServerClient(accessToken)!;
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        id, patient_id, doctor_id, scheduled_start, scheduled_end,
        status, reason, notes, created_at,
        doctor_profiles!inner (
          specialization,
          profiles!inner (full_name)
        )
      `)
      .eq('patient_id', patientUserId)
      .order('scheduled_start', { ascending: true });

    if (error) return { success: false, appointments: [], error: error.message };

    const appointments: AppointmentRecord[] = (data ?? []).map((row: any) => ({
      id: row.id,
      patientId: row.patient_id,
      doctorId: row.doctor_id,
      doctorName: row.doctor_profiles?.profiles?.full_name ?? 'Unknown Doctor',
      specialization: row.doctor_profiles?.specialization ?? 'General',
      scheduledStart: row.scheduled_start,
      scheduledEnd: row.scheduled_end,
      status: row.status,
      reason: row.reason,
      notes: row.notes,
      createdAt: row.created_at,
    }));

    return { success: true, appointments };
  } catch {
    return { success: false, appointments: [], error: 'FETCH_FAILED' };
  }
}

// ---------------------------------------------------------------------------
// getDoctorAppointments — fetch appointments for an authenticated doctor
// ---------------------------------------------------------------------------
export async function getDoctorAppointments(doctorProfileId: string, accessToken?: string): Promise<{
  success: boolean;
  appointments: AppointmentRecord[];
  error?: string;
}> {
  if (!supabaseConfigured) {
    return { success: true, appointments: [] };
  }

  try {
    const supabase = createServerClient(accessToken)!;
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        id, patient_id, doctor_id, scheduled_start, scheduled_end,
        status, reason, notes, created_at,
        doctor_profiles!inner (
          specialization,
          profiles!inner (full_name)
        ),
        patient_profile:profiles!patient_id (full_name)
      `)
      .eq('doctor_id', doctorProfileId)
      .order('scheduled_start', { ascending: true });

    if (error) return { success: false, appointments: [], error: error.message };

    const appointments: AppointmentRecord[] = (data ?? []).map((row: any) => ({
      id: row.id,
      patientId: row.patient_id,
      patientName: row.patient_profile?.full_name ?? 'Patient',
      doctorId: row.doctor_id,
      doctorName: row.doctor_profiles?.profiles?.full_name ?? 'Doctor',
      specialization: row.doctor_profiles?.specialization ?? 'General',
      scheduledStart: row.scheduled_start,
      scheduledEnd: row.scheduled_end,
      status: row.status,
      reason: row.reason,
      notes: row.notes,
      createdAt: row.created_at,
    }));

    return { success: true, appointments };
  } catch {
    return { success: false, appointments: [], error: 'FETCH_FAILED' };
  }
}

// ---------------------------------------------------------------------------
// bookAppointment — calls the atomic PostgreSQL booking function
// The patientId comes from auth.uid() inside the DB function — NOT from params.
// ---------------------------------------------------------------------------
export async function bookAppointment(params: {
  doctorId: string;
  scheduledStart: string;
  scheduledEnd: string;
  reason?: string;
  // patientAuthToken is the JWT from supabase.auth.getSession()
  // Passed as Authorization header so the DB function can call auth.uid()
  patientAuthToken?: string;
}): Promise<BookingResult> {
  if (!supabaseConfigured) {
    // Mock booking fallback
    const mockId = `MOCK-APT-${Date.now()}`;
    return {
      success: true,
      appointmentId: mockId,
      status: 'confirmed',
      scheduledStart: params.scheduledStart,
    };
  }

  try {
    const supabase = createServerClient(params.patientAuthToken)!;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc('book_appointment_atomic', {
      p_doctor_id: params.doctorId,
      p_scheduled_start: params.scheduledStart,
      p_scheduled_end: params.scheduledEnd,
      p_reason: params.reason ?? null,
    });

    if (error) return { success: false, error: error.message };

    const result = data as {
      success: boolean;
      appointment_id?: string;
      status?: string;
      scheduled_start?: string;
      error?: string;
    };

    if (!result.success) {
      return { success: false, error: result.error ?? 'BOOKING_FAILED' };
    }

    return {
      success: true,
      appointmentId: result.appointment_id,
      status: result.status,
      scheduledStart: result.scheduled_start,
    };
  } catch {
    return { success: false, error: 'BOOKING_FAILED' };
  }
}

// ---------------------------------------------------------------------------
// cancelAppointment — calls the safe cancellation function with auth check
// ---------------------------------------------------------------------------
export async function cancelAppointment(appointmentId: string, accessToken?: string): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!supabaseConfigured) {
    return { success: true };
  }

  try {
    const supabase = createServerClient(accessToken)!;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc('cancel_appointment_safe', {
      p_appointment_id: appointmentId,
    });

    if (error) return { success: false, error: error.message };

    const result = data as { success: boolean; error?: string };
    return { success: result.success, error: result.error };
  } catch {
    return { success: false, error: 'CANCELLATION_FAILED' };
  }
}
