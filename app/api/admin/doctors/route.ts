import { NextRequest, NextResponse } from 'next/server';
import { requireApiUser, isApiError, getBearerToken } from '@/lib/api-auth';
import { createServerClient } from '@/lib/supabase/server';

async function requireAdmin(req: NextRequest) {
  const auth = await requireApiUser(req);
  if (isApiError(auth)) return auth;
  const client = createServerClient(getBearerToken(req));
  if (!client) return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 503 });
  const { data: profile, error } = await (client as any).from('profiles').select('role').eq('id', auth.id).single();
  if (error || profile?.role !== 'admin') return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  return { auth, client };
}

export async function GET(req: NextRequest) {
  const result = await requireAdmin(req);
  if (result instanceof Response) return result;
  const { data, error } = await (result.client as any)
    .from('doctor_profiles')
    .select('id, user_id, specialization, verification_status, profiles!user_id(id, full_name, role)')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: 'Failed to load doctors.' }, { status: 500 });
  return NextResponse.json({ doctors: data ?? [] });
}

export async function POST(req: NextRequest) {
  const result = await requireAdmin(req);
  if (result instanceof Response) return result;
  const body = await req.json().catch(() => ({}));
  const userId = typeof body.user_id === 'string' ? body.user_id : '';
  const specialization = typeof body.specialization === 'string' ? body.specialization.trim() : '';
  if (!userId || !specialization) return NextResponse.json({ error: 'user_id and specialization are required.' }, { status: 400 });
  const { data, error } = await (result.client as any).rpc('admin_promote_to_doctor', {
    p_user_id: userId,
    p_specialization: specialization,
  });
  if (error) return NextResponse.json({ error: 'Failed to promote user to doctor.' }, { status: 500 });
  return NextResponse.json({ success: true, doctor_id: data }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const result = await requireAdmin(req);
  if (result instanceof Response) return result;
  const body = await req.json().catch(() => ({}));
  const doctorId = typeof body.doctor_id === 'string' ? body.doctor_id : '';
  const status = body.verification_status;
  if (!doctorId || !['pending', 'verified', 'rejected', 'suspended'].includes(status)) {
    return NextResponse.json({ error: 'doctor_id and valid verification_status are required.' }, { status: 400 });
  }
  const { data, error } = await (result.client as any)
    .from('doctor_profiles').update({ verification_status: status }).eq('id', doctorId).select('id, verification_status').single();
  if (error) return NextResponse.json({ error: 'Failed to update doctor verification.' }, { status: 500 });
  return NextResponse.json({ success: true, doctor: data });
}
