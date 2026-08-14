import { NextRequest, NextResponse } from 'next/server';
import { runAgentEngine, AgentRequest } from '@/lib/ai-agent-engine';
import { AppDomain } from '@/lib/mock-data';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const domain: AppDomain = (body.domain || 'medical') as AppDomain;
    const customer_id = (body.customer_id || (domain === 'medical' ? 'PAT-2001' : 'CUST-1001')).toString().trim();
    const conversation_id = (body.conversation_id || `conv-${Date.now()}`).toString().trim();
    const message = (body.message || '').toString().trim();

    if (!message) {
      return NextResponse.json(
        {
          error: 'Invalid payload. Message content is required.',
          conversation_id,
          intent: 'error',
          response: "Please provide a valid message so I can assist you.",
          escalated: false,
          ticket_id: null,
        },
        { status: 400 }
      );
    }

    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

    // 1. Forward to n8n webhook if URL is configured
    if (n8nWebhookUrl && n8nWebhookUrl.startsWith('http')) {
      try {
        const n8nResponse = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(process.env.N8N_WEBHOOK_SECRET
              ? { 'x-n8n-secret': process.env.N8N_WEBHOOK_SECRET }
              : {}),
          },
          body: JSON.stringify({
            customer_id,
            conversation_id,
            message,
            domain,
          }),
          signal: AbortSignal.timeout(15000),
        });

        if (n8nResponse.ok) {
          const data = await n8nResponse.json();
          return NextResponse.json({
            conversation_id: data.conversation_id || conversation_id,
            intent: data.intent || 'general',
            response: data.response || 'No response received from support system.',
            escalated: Boolean(data.escalated),
            ticket_id: data.ticket_id || null,
            status_indicator: data.status_indicator || 'Executed via n8n workflow',
            domain,
            source: 'n8n-webhook',
          });
        }
      } catch (err) {
        console.warn('n8n Webhook connection failed. Falling back to standalone engine.', err);
      }
    }

    // 2. Standalone Multi-Domain Engine Execution
    const payload: AgentRequest = {
      customer_id,
      conversation_id,
      message,
      domain,
    };

    const agentResult = await runAgentEngine(payload);

    return NextResponse.json({
      conversation_id: agentResult.conversation_id,
      intent: agentResult.intent,
      response: agentResult.response,
      escalated: agentResult.escalated,
      ticket_id: agentResult.ticket_id,
      tools_used: agentResult.tools_used,
      retrieved_docs: agentResult.retrieved_docs,
      status_indicator: agentResult.status_indicator,
      requires_confirmation: agentResult.requires_confirmation,
      pending_action: agentResult.pending_action,
      domain: agentResult.domain || domain,
      source: 'standalone-engine',
    });
  } catch (error: any) {
    console.error('API /api/chat error:', error);
    return NextResponse.json(
      {
        conversation_id: `conv-err-${Date.now()}`,
        intent: 'error',
        response: "We're having trouble connecting to support right now. Please try again in a moment.",
        escalated: false,
        ticket_id: null,
      },
      { status: 500 }
    );
  }
}
