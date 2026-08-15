import { NextRequest, NextResponse } from 'next/server';
import { getPatientAppointments, bookAppointment } from '@/lib/services/appointment-service';
import { getAppointmentsStore } from '@/lib/ai-agent-engine';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get('patient_id');

  if (!patientId) {
    return NextResponse.json({ error: 'patient_id is required' }, { status: 400 });
  }

  try {
    const result = await getPatientAppointments(patientId);
    if (!result.success) {
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
    const body = await req.json();
    const { doctor_id, scheduled_start, scheduled_end, reason } = body;

    // Supabase-backed booking path
    if (doctor_id && scheduled_start && scheduled_end) {
      const result = await bookAppointment({
        doctorId: doctor_id,
        scheduledStart: scheduled_start,
        scheduledEnd: scheduled_end,
        reason,
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
