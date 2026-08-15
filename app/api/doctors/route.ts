import { NextRequest, NextResponse } from 'next/server';
import { searchDoctors, getDoctorProfile, getDoctorAvailability } from '@/lib/services/doctor-service';

/**
 * GET /api/doctors
 * 
 * Query params:
 *   specialization  - filter by specialization (optional)
 *   doctor_id       - get single doctor profile (optional)
 *   availability    - get availability slots: doctor_id + date required
 *   date            - ISO date string YYYY-MM-DD (for availability)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const specialization = searchParams.get('specialization') ?? undefined;
  const doctorId = searchParams.get('doctor_id');
  const getAvailability = searchParams.get('availability') === 'true';
  const date = searchParams.get('date') ?? new Date().toISOString().split('T')[0];

  // GET /api/doctors?doctor_id=XXX&availability=true&date=YYYY-MM-DD
  if (doctorId && getAvailability) {
    const result = await getDoctorAvailability(doctorId, date);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({ slots: result.slots });
  }

  // GET /api/doctors?doctor_id=XXX
  if (doctorId) {
    const result = await getDoctorProfile(doctorId);
    if (!result.success || !result.doctor) {
      return NextResponse.json({ error: 'DOCTOR_NOT_FOUND' }, { status: 404 });
    }
    return NextResponse.json({ doctor: result.doctor });
  }

  // GET /api/doctors or GET /api/doctors?specialization=cardiology
  const result = await searchDoctors(specialization);
  if (!result.success) {
    return NextResponse.json({ error: 'SEARCH_FAILED' }, { status: 500 });
  }
  return NextResponse.json({ doctors: result.doctors });
}
