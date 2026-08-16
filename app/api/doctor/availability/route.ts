import { NextRequest, NextResponse } from 'next/server';
import { requireApiUser, isApiError, getBearerToken } from '@/lib/api-auth';
import { createServerClient } from '@/lib/supabase/server';

async function doctorContext(req: NextRequest) {
  const auth = await requireApiUser(req);
  if (isApiError(auth)) return auth;
  const client = createServerClient(getBearerToken(req));
  if (!client) return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 503 });
  const { data: profile } = await (client as any).from('profiles').select('role').eq('id', auth.id).single();
  if (profile?.role !== 'doctor') return NextResponse.json({ error: 'Doctor access required.' }, { status: 403 });
  const { data: doctor } = await (client as any).from('doctor_profiles').select('id').eq('user_id', auth.id).single();
  if (!doctor) return NextResponse.json({ error: 'Doctor profile not found.' }, { status: 404 });
  return { client, doctorId: doctor.id };
}

export async function GET(req: NextRequest) {
  const context = await doctorContext(req);
  if (context instanceof Response) return context;
  const { data, error } = await (context.client as any).from('doctor_availability')
    .select('id, day_of_week, start_time, end_time, is_available')
    .eq('doctor_id', context.doctorId).order('day_of_week').order('start_time');
  if (error) return NextResponse.json({ error: 'Failed to load availability.' }, { status: 500 });
  return NextResponse.json({ availability: data ?? [] });
}

export async function POST(req: NextRequest) {
  const context = await doctorContext(req);
  if (context instanceof Response) return context;
  const body = await req.json().catch(() => ({}));
  const day = Number(body.day_of_week);
  const start = typeof body.start_time === 'string' ? body.start_time : '';
  const end = typeof body.end_time === 'string' ? body.end_time : '';
  if (!Number.isInteger(day) || day < 0 || day > 6 || !/^\d{2}:\d{2}$/.test(start) || !/^\d{2}:\d{2}$/.test(end) || start >= end) {
    return NextResponse.json({ error: 'Provide a valid day and time range.' }, { status: 400 });
  }
  const { data, error } = await (context.client as any).from('doctor_availability').insert({
    doctor_id: context.doctorId, day_of_week: day, start_time: start, end_time: end, is_available: true,
  }).select('id, day_of_week, start_time, end_time, is_available').single();
  if (error) return NextResponse.json({ error: error.code === '23505' ? 'This availability overlaps an existing period.' : 'Failed to save availability.' }, { status: 409 });
  return NextResponse.json({ availability: data }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const context = await doctorContext(req);
  if (context instanceof Response) return context;
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Availability id is required.' }, { status: 400 });
  const { error } = await (context.client as any).from('doctor_availability').delete().eq('id', id).eq('doctor_id', context.doctorId);
  if (error) return NextResponse.json({ error: 'Failed to remove availability.' }, { status: 500 });
  return NextResponse.json({ success: true });
}
