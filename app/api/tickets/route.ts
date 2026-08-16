import { NextRequest, NextResponse } from 'next/server';
import { getTicketsStore, addTicketToStore } from '@/lib/ai-agent-engine';
import { requireApiUser, isApiError } from '@/lib/api-auth';
import { createServerClient } from '@/lib/supabase/server';
import { getBearerToken } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  const auth = await requireApiUser(req);
  if (isApiError(auth)) return auth;
  if (process.env.NODE_ENV === 'production') {
    const client = createServerClient(getBearerToken(req));
    if (!client) return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 503 });
    const { data, error } = await (client as any).from('support_tickets').select('*').order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: 'Failed to load tickets.' }, { status: 500 });
    return NextResponse.json({ tickets: data ?? [] });
  }
  const { searchParams } = new URL(req.url);
  const customerId = searchParams.get('customer_id');

  let tickets = getTicketsStore();
  if (customerId) {
    tickets = tickets.filter((t) => t.customer_id.toLowerCase() === customerId.toLowerCase());
  }

  return NextResponse.json({ tickets });
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireApiUser(req);
    if (isApiError(auth)) return auth;
    const body = await req.json();
    const roleClient = createServerClient(getBearerToken(req));
    if (roleClient) {
      const { data: roleProfile } = await (roleClient as any).from('profiles').select('role').eq('id', auth.id).maybeSingle();
      if (roleProfile?.role === 'doctor') return NextResponse.json({ error: 'Doctors cannot create support tickets.' }, { status: 403 });
    }
    if (process.env.NODE_ENV === 'production') {
      const issue = typeof body.issue === 'string' ? body.issue.trim() : '';
      const reason = typeof body.reason === 'string' ? body.reason.trim() : null;
      const priority = ['low', 'medium', 'high', 'urgent'].includes(body.priority) ? body.priority : 'medium';
      if (!issue || issue.length > 2000) return NextResponse.json({ error: 'Issue is required and must be under 2000 characters.' }, { status: 400 });
      const client = createServerClient(getBearerToken(req));
      if (!client) return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 503 });
      const { data, error } = await (client as any).from('support_tickets').insert({
        user_id: auth.id,
        customer_id: auth.id,
        conversation_id: typeof body.conversation_id === 'string' ? body.conversation_id : null,
        issue,
        reason,
        priority,
        status: 'open',
      }).select('*').single();
      if (error) return NextResponse.json({ error: 'Failed to create ticket.' }, { status: 500 });
      return NextResponse.json({ ticket: data, success: true }, { status: 201 });
    }
    const customer_id = body.customer_id || 'CUST-1001';
    const conversation_id = body.conversation_id || `conv-${Date.now()}`;
    const issue = body.issue || 'Manual support ticket created from dashboard';
    const reason = body.reason || 'User created ticket via support UI';
    const priority = body.priority || 'medium';

    const tickets = getTicketsStore();
    const newTicketId = 10000 + tickets.length + 1;
    const newTicket = {
      ticket_id: newTicketId,
      customer_id,
      conversation_id,
      issue,
      reason,
      priority,
      status: 'open' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    addTicketToStore(newTicket);

    return NextResponse.json({ ticket: newTicket, success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
  }
}
