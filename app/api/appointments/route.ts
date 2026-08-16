import { NextRequest, NextResponse } from 'next/server';
import { getPatientAppointments, getDoctorAppointments, bookAppointment, cancelAppointment } from '@/lib/services/appointment-service';
import { getAppointmentsStore } from '@/lib/ai-agent-engine';
import { requireApiUser, isApiError, getBearerToken } from '@/lib/api-auth';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const auth = await requireApiUser(req);
  if (isApiError(auth)) return auth;
  const { searchParams } = new URL(req.url);
  const accessToken = getBearerToken(req);
  if (searchParams.get('view') === 'doctor' && process.env.NODE_ENV !== 'production') {
    return NextResponse.json({ appointments: getAppointmentsStore() });
  }
  if (process.env.NODE_ENV === 'production' && searchParams.get('view') === 'doctor') {
    const result = await getDoctorAppointmentsForUser(auth.id, accessToken);
    if (!result.success) return NextResponse.json({ error: result.error ?? 'DOCTOR_APPOINTMENTS_FAILED' }, { status: 500 });
    return NextResponse.json({ appointments: result.appointments });
  }
  const patientId = process.env.NODE_ENV === 'production' ? auth.id : searchParams.get('patient_id');

  if (!patientId) {
    return NextResponse.json({ error: 'patient_id is required' }, { status: 400 });
  }

  try {
    const result = await getPatientAppointments(patientId, accessToken);
    if (!result.success) {
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: result.error ?? 'APPOINTMENTS_FETCH_FAILED' }, { status: 500 });
      }
      // Graceful fallback to legacy in-memory store
      const legacyStore = getAppointmentsStore();
      const filtered = legacyStore.filter(
        (a) => a.patient_id.toLowerCase() === patientId.toLowerCase() || patientId === 'PAT-2001'
      );
      return NextResponse.json({ appointments: filtered });
    }
    return NextResponse.json({ appointments: result.appointments });
  } catch {
    // Last resort fallback — keeps existing UI working
    const store = getAppointmentsStore();
    const filtered = store.filter(
      (a) => a.patient_id.toLowerCase() === (patientId ?? '').toLowerCase() || patientId === 'PAT-2001'
    );
    return NextResponse.json({ appointments: filtered });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireApiUser(req);
    if (isApiError(auth)) return auth;
    const body = await req.json();
    const { doctor_id, scheduled_start, scheduled_end, reason } = body;

    // Doctors cannot book for themselves or other doctors. Booking is a
    // patient action; the database function enforces this in production too.
    const roleClient = createServerClient(getBearerToken(req));
    if (roleClient) {
      const { data: profile } = await (roleClient as any).from('profiles').select('role').eq('id', auth.id).maybeSingle();
      if (profile?.role === 'doctor') return NextResponse.json({ error: 'Doctors must use a patient account to book appointments.' }, { status: 403 });
    }

    // Supabase-backed booking path
    if (doctor_id && scheduled_start && scheduled_end) {
      const result = await bookAppointment({
        doctorId: doctor_id,
        scheduledStart: scheduled_start,
        scheduledEnd: scheduled_end,
        reason,
        patientAuthToken: getBearerToken(req),
      });

      if (!result.success) {
        const statusMap: Record<string, number> = {
          UNAUTHENTICATED: 401,
          UNAUTHORIZED: 403,
          DOCTOR_NOT_FOUND: 404,
          DOCTOR_NOT_VERIFIED: 422,
          SLOT_UNAVAILABLE: 409,
          SLOT_IN_THE_PAST: 422,
        };
        const httpStatus = statusMap[result.error ?? ''] ?? 500;
        return NextResponse.json({ error: result.error ?? 'BOOKING_FAILED' }, { status: httpStatus });
      }

      return NextResponse.json({ success: true, appointment: result }, { status: 201 });
    }

    // Legacy mock booking path (backwards compat when Supabase not configured)
    if (process.env.NODE_ENV === 'production') return NextResponse.json({ error: 'Legacy appointment booking is disabled in production.' }, { status: 410 });
    const { patient_id, doctor_name, date_time, specialty } = body;
    if (!patient_id || !doctor_name) {
      return NextResponse.json({ error: 'patient_id and doctor_name are required' }, { status: 400 });
    }

    const appointments = getAppointmentsStore();
    const newAptId = `APT-${8000 + appointments.length + 1}`;
    const newApt = {
      appointment_id: newAptId,
      patient_id,
      doctor_name,
      specialty: specialty || 'General Consultation',
      date_time: date_time || new Date(Date.now() + 86400000 * 2).toISOString(),
      type: 'in_person' as const,
      status: 'scheduled' as const,
      location: 'Downtown Health Center - Suite 402',
    };

    appointments.unshift(newApt);
    return NextResponse.json({ appointment: newApt, success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to schedule appointment' }, { status: 500 });
  }
}

async function getDoctorAppointmentsForUser(userId: string, accessToken?: string) {
  const client = createServerClient(accessToken);
  if (!client) return { success: false, appointments: [], error: 'SUPABASE_NOT_CONFIGURED' };
  const { data, error } = await (client as any).from('doctor_profiles').select('id').eq('user_id', userId).maybeSingle();
  if (error || !data) return { success: false, appointments: [], error: 'DOCTOR_PROFILE_NOT_FOUND' };
  return getDoctorAppointments(data.id, accessToken);
}

export async function DELETE(req: NextRequest) {
  const auth = await requireApiUser(req);
  if (isApiError(auth)) return auth;
  const appointmentId = new URL(req.url).searchParams.get('appointment_id');
  if (!appointmentId) return NextResponse.json({ error: 'appointment_id is required' }, { status: 400 });
  const result = await cancelAppointment(appointmentId, getBearerToken(req));
  if (!result.success) {
    const status = result.error === 'UNAUTHENTICATED' ? 401 : result.error === 'UNAUTHORIZED' ? 403 : 400;
    return NextResponse.json({ error: result.error ?? 'CANCELLATION_FAILED' }, { status });
  }
  return NextResponse.json(result);
}
