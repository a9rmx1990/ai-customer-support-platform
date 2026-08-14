import { NextRequest, NextResponse } from 'next/server';
import { getTicketsStore, addTicketToStore } from '@/lib/ai-agent-engine';

export async function GET(req: NextRequest) {
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
    const body = await req.json();
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
