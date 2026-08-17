import { NextRequest, NextResponse } from 'next/server';
import { requireApiUser, isApiError } from '@/lib/api-auth';

// Medical requests never fall back to the legacy AutoSupport engine.
export async function POST(req: NextRequest) {
  const auth = await requireApiUser(req);
  if (isApiError(auth)) return auth;

  const body = await req.json().catch(() => ({}));
  const message = String(body.message || '').trim();
  const conversation_id = String(body.conversation_id || `clinical-${Date.now()}`).trim();

  if (!message || message.length > 10000) {
    return NextResponse.json({ error: 'A message between 1 and 10000 characters is required.' }, { status: 400 });
  }

  const webhookUrl = process.env.CLINICAL_N8N_WEBHOOK_URL;
  if (!webhookUrl || !webhookUrl.startsWith('http')) {
    return NextResponse.json({
      error: 'Clinical AI is not configured.',
      response: 'The clinical assistant is temporarily unavailable. Please contact your clinic directly.',
      conversation_id,
      intent: 'configuration_error',
      source: 'clinical-assistant',
    }, { status: 503 });
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.N8N_WEBHOOK_SECRET ? { 'x-n8n-secret': process.env.N8N_WEBHOOK_SECRET } : {}),
      },
      body: JSON.stringify({ user_id: auth.id, conversation_id, message, domain: 'medical' }),
      signal: AbortSignal.timeout(20000),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return NextResponse.json({ error: 'Clinical AI workflow failed.', conversation_id }, { status: 502 });

    return NextResponse.json({
      conversation_id: data.conversation_id || conversation_id,
      intent: data.intent || 'medical_information',
      response: data.response || 'I could not generate a safe answer. Please contact your clinician.',
      escalated: Boolean(data.escalated),
      ticket_id: data.ticket_id || null,
      retrieved_docs: data.retrieved_docs || null,
      source: 'clinical-n8n-gemini-rag',
      domain: 'medical',
    });
  } catch (error) {
    console.error('Clinical AI workflow unavailable:', error);
    return NextResponse.json({
      error: 'Clinical AI workflow unavailable.',
      response: 'The clinical assistant is temporarily unavailable. Please contact your clinic directly.',
      conversation_id,
      intent: 'service_unavailable',
      source: 'clinical-assistant',
    }, { status: 503 });
  }
}
