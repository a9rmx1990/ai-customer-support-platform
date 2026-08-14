import { NextRequest, NextResponse } from 'next/server';
import { getAppointmentsStore } from '@/lib/ai-agent-engine';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get('patient_id') || 'PAT-2001';

  const appointments = getAppointmentsStore();
  const filtered = appointments.filter((a) => a.patient_id.toLowerCase() === patientId.toLowerCase() || patientId === 'PAT-2001');

  return NextResponse.json({ appointments: filtered });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
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

    return NextResponse.json({ appointment: newApt, success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to schedule appointment' }, { status: 500 });
  }
}
