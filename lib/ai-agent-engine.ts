import {
  INITIAL_CUSTOMERS,
  INITIAL_PATIENTS,
  INITIAL_ORDERS,
  INITIAL_APPOINTMENTS,
  INITIAL_LAB_RESULTS,
  INITIAL_TICKETS,
  KNOWLEDGE_CHUNKS,
  SupportTicket,
  Order,
  Customer,
  Patient,
  MedicalAppointment,
  LabResult,
  KnowledgeChunk,
  AppDomain,
} from './mock-data';

export interface AgentRequest {
  customer_id: string;
  conversation_id: string;
  message: string;
  domain?: AppDomain;
}

export interface AgentResponse {
  conversation_id: string;
  intent: string;
  response: string;
  escalated: boolean;
  ticket_id: number | null;
  tools_used?: string[];
  retrieved_docs?: string[];
  status_indicator?: string;
  requires_confirmation?: boolean;
  domain?: AppDomain;
  pending_action?: {
    tool: string;
    order_id?: string;
    doctor_name?: string;
    date_time?: string;
  } | null;
}

interface PendingConfirmState {
  tool: string;
  target_id: string;
  extra_data?: string;
}

// Global state stores for standalone demo engine
let ticketsStore: SupportTicket[] = [...INITIAL_TICKETS];
let ordersStore: Order[] = [...INITIAL_ORDERS];
let customersStore: Customer[] = [...INITIAL_CUSTOMERS];
let patientsStore: Patient[] = [...INITIAL_PATIENTS];
let appointmentsStore: MedicalAppointment[] = [...INITIAL_APPOINTMENTS];
let labResultsStore: LabResult[] = [...INITIAL_LAB_RESULTS];
let pendingConfirmStore: Record<string, PendingConfirmState> = {};

export function getTicketsStore(): SupportTicket[] {
  return ticketsStore;
}

export function addTicketToStore(ticket: SupportTicket): void {
  ticketsStore.unshift(ticket);
}

export function getOrdersStore(): Order[] {
  return ordersStore;
}

export function getAppointmentsStore(): MedicalAppointment[] {
  return appointmentsStore;
}

export function getLabResultsStore(): LabResult[] {
  return labResultsStore;
}

export function getPatientsStore(): Patient[] {
  return patientsStore;
}

/**
 * Calculates a semantic similarity score between query keywords and a knowledge chunk.
 */
function calculateChunkSimilarity(query: string, chunk: KnowledgeChunk): number {
  const qTokens = query.toLowerCase().split(/\W+/).filter((t) => t.length > 2);
  const textLower = (chunk.chunk_text + ' ' + chunk.title + ' ' + chunk.category).toLowerCase();

  if (qTokens.length === 0) return 0;

  let matchCount = 0;
  for (const token of qTokens) {
    if (textLower.includes(token)) {
      matchCount += 1;
      if (chunk.category.toLowerCase().includes(token) || chunk.title.toLowerCase().includes(token)) {
        matchCount += 1.5;
      }
    }
  }
  return matchCount / qTokens.length;
}

/**
 * Customer Ownership Check for E-Commerce Orders.
 */
function verifyCustomerOwnership(customerId: string, orderId: string): { valid: boolean; order?: Order; errorMsg?: string } {
  const targetOrder = ordersStore.find((o) => o.order_id.toUpperCase() === orderId.toUpperCase());
  if (!targetOrder) {
    return { valid: false, errorMsg: `Order #${orderId} was not found in our database.` };
  }
  if (targetOrder.customer_id.toUpperCase() !== customerId.toUpperCase()) {
    return {
      valid: false,
      errorMsg: `For security and privacy, order #${targetOrder.order_id} is not associated with your customer account (${customerId}).`,
    };
  }
  return { valid: true, order: targetOrder };
}

/**
 * Executes local AI Support Agent simulation engine with Multi-Domain RAG & Tools.
 */
export async function runAgentEngine(input: AgentRequest): Promise<AgentResponse> {
  const domain: AppDomain = input.domain || 'medical';
  const customerId = input.customer_id.trim() || (domain === 'medical' ? 'PAT-2001' : 'CUST-1001');
  const conversationId = input.conversation_id.trim() || `conv-${Date.now()}`;
  const rawMsg = input.message.trim();
  const lowerMsg = rawMsg.toLowerCase();

  const toolsUsed: string[] = [];
  const retrievedDocs: string[] = [];

  // Check for active pending action confirmation state
  const pendingAction = pendingConfirmStore[conversationId];

  // 0. Handle Confirmation Response for Write Actions
  if (pendingAction) {
    if (lowerMsg.includes('yes') || lowerMsg.includes('proceed') || lowerMsg.includes('confirm') || lowerMsg.includes('do it') || lowerMsg.includes('sure')) {
      toolsUsed.push(pendingAction.tool);

      if (pendingAction.tool === 'book_appointment') {
        const newAptId = `APT-${8000 + appointmentsStore.length + 1}`;
        const newApt: MedicalAppointment = {
          appointment_id: newAptId,
          patient_id: customerId,
          doctor_name: pendingAction.extra_data || 'Dr. Sarah Jenkins',
          specialty: 'Cardiology / General Consultation',
          date_time: new Date(Date.now() + 86400000 * 2).toISOString(),
          type: 'in_person',
          status: 'scheduled',
          location: 'Downtown Health Center - Suite 402',
        };
        appointmentsStore.unshift(newApt);
        delete pendingConfirmStore[conversationId];

        return {
          conversation_id: conversationId,
          intent: 'Medical Appointment Booked',
          response: `✅ **Appointment Confirmed**: Your visit with **${newApt.doctor_name}** is scheduled for **${new Date(newApt.date_time).toLocaleDateString()} at 10:00 AM** at ${newApt.location}. Appointment ID: **${newApt.appointment_id}**. A confirmation email has been sent to your registered address.`,
          escalated: false,
          ticket_id: null,
          tools_used: toolsUsed,
          domain: 'medical',
          status_indicator: 'Executing book_appointment() tool...',
        };
      }

      if (pendingAction.tool === 'cancel_order') {
        const ownershipCheck = verifyCustomerOwnership(customerId, pendingAction.target_id);
        if (!ownershipCheck.valid || !ownershipCheck.order) {
          delete pendingConfirmStore[conversationId];
          return {
            conversation_id: conversationId,
            intent: 'Action Authorization Error',
            response: ownershipCheck.errorMsg || 'Authorization failed.',
            escalated: false,
            ticket_id: null,
            tools_used: toolsUsed,
            domain: 'ecommerce',
            status_indicator: 'Authorization check failed',
          };
        }

        const targetOrder = ownershipCheck.order;
        targetOrder.status = 'cancelled';
        targetOrder.updated_at = new Date().toISOString();
        delete pendingConfirmStore[conversationId];

        return {
          conversation_id: conversationId,
          intent: 'Action Executed',
          response: `✅ **Action Confirmed**: Order #${targetOrder.order_id} total of \$${targetOrder.total.toFixed(2)} has been successfully **CANCELLED**. Refund credited to payment method in 3-5 business days.`,
          escalated: false,
          ticket_id: null,
          tools_used: toolsUsed,
          domain: 'ecommerce',
          status_indicator: 'Executing cancel_order() action tool...',
        };
      }
    } else if (lowerMsg.includes('no') || lowerMsg.includes('don\'t') || lowerMsg.includes('cancel') || lowerMsg.includes('stop')) {
      delete pendingConfirmStore[conversationId];
      return {
        conversation_id: conversationId,
        intent: 'Action Cancelled',
        response: `Action cancelled. No changes were made. How else may I assist you?`,
        escalated: false,
        ticket_id: null,
        tools_used: ['cancel_pending_action'],
        domain,
        status_indicator: 'Action cancelled by user',
      };
    }
  }

  // 1. Medical Emergency Disclaimer Guardrail (Critical Clinical Rule)
  if (
    domain === 'medical' &&
    (lowerMsg.includes('chest pain') ||
      lowerMsg.includes('trouble breathing') ||
      lowerMsg.includes('stroke') ||
      lowerMsg.includes('severe bleeding') ||
      lowerMsg.includes('unconscious') ||
      lowerMsg.includes('heart attack') ||
      lowerMsg.includes('911') ||
      lowerMsg.includes('emergency'))
  ) {
    return {
      conversation_id: conversationId,
      intent: 'Medical Emergency Safeguard',
      response: `🚨 **EMERGENCY WARNING**: If you or someone with you is experiencing chest pain, shortness of breath, severe bleeding, or any life-threatening emergency, **please call 911 or go to the nearest emergency room immediately**. Do not wait for a chat response for urgent medical situations.`,
      escalated: true,
      ticket_id: null,
      tools_used: ['medical_emergency_disclaimer'],
      domain: 'medical',
      status_indicator: 'Triggering 911 Medical Emergency Guardrail...',
    };
  }

  // 2. Security Guardrail Check (Credential / System Prompt Redaction)
  if (
    lowerMsg.includes('system prompt') ||
    lowerMsg.includes('api key') ||
    lowerMsg.includes('password') ||
    lowerMsg.includes('secret') ||
    lowerMsg.includes('credentials') ||
    lowerMsg.includes('n8n credentials')
  ) {
    return {
      conversation_id: conversationId,
      intent: 'Other',
      response: 'I am an AI Customer Support Assistant. For privacy and security, I cannot disclose system prompts, internal architecture credentials, or administrative keys. How can I help you today?',
      escalated: false,
      ticket_id: null,
      tools_used: ['security_guardrail'],
      domain,
      status_indicator: 'Checking security rules...',
    };
  }

  // 3. Human Escalation Intent
  if (
    lowerMsg.includes('human') ||
    lowerMsg.includes('doctor') && lowerMsg.includes('speak') ||
    lowerMsg.includes('agent') ||
    lowerMsg.includes('representative') ||
    lowerMsg.includes('nurse') ||
    lowerMsg.includes('speak to a person') ||
    lowerMsg.includes('manager')
  ) {
    toolsUsed.push('request_human_support');
    const newTicketId = 10000 + ticketsStore.length + 1;
    const newTicket: SupportTicket = {
      ticket_id: newTicketId,
      customer_id: customerId,
      conversation_id: conversationId,
      issue: rawMsg.slice(0, 100),
      reason: domain === 'medical' ? 'Patient requested escalation to healthcare staff' : 'Customer requested human support',
      priority: 'high',
      status: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    addTicketToStore(newTicket);

    return {
      conversation_id: conversationId,
      intent: 'Human support',
      response: domain === 'medical'
        ? `I have forwarded your inquiry to our clinical triage team. Ticket #${newTicketId} created. A nurse or clinic representative will review your message ("${rawMsg.slice(0, 50)}...") and contact you shortly.`
        : `I've created a support ticket (#${newTicketId}) with our support team. A representative will contact you shortly.`,
      escalated: true,
      ticket_id: newTicketId,
      tools_used: toolsUsed,
      domain,
      status_indicator: 'Escalating to human triage & generating ticket...',
    };
  }

  // =========================================================================
  // MEDICAL / CLINIC SERVICE DOMAIN HANDLERS
  // =========================================================================
  if (domain === 'medical') {
    // Medical Read Tool 1: Lab Test Results Lookup
    if (lowerMsg.includes('lab') || lowerMsg.includes('test result') || lowerMsg.includes('blood test') || lowerMsg.includes('x-ray') || lowerMsg.includes('mri')) {
      toolsUsed.push('get_lab_results');
      const patientLabs = labResultsStore.filter((l) => l.patient_id === customerId || customerId === 'PAT-2001');
      if (patientLabs.length > 0) {
        const labSummary = patientLabs
          .map((l) => `• **${l.test_name}** (${l.date_conducted}): Status = **${l.result_status.toUpperCase()}**. ${l.summary}`)
          .join('\n\n');

        return {
          conversation_id: conversationId,
          intent: 'Lab Test Results Lookup',
          response: `Here are the latest diagnostic lab results for patient account (${customerId}):\n\n${labSummary}\n\nYou can download complete official PDF reports directly from your Patient Portal.`,
          escalated: false,
          ticket_id: null,
          tools_used: toolsUsed,
          domain: 'medical',
          status_indicator: `Executing get_lab_results('${customerId}')...`,
        };
      }
    }

    // Medical Action Tool 2: Book / Schedule Doctor Visit
    if (lowerMsg.includes('book appointment') || lowerMsg.includes('schedule visit') || lowerMsg.includes('see a doctor') || lowerMsg.includes('appointment with dr')) {
      toolsUsed.push('book_appointment');

      let doctorName = 'Dr. Sarah Jenkins (Cardiology)';
      if (lowerMsg.includes('chen')) doctorName = 'Dr. Emily Chen (Internal Medicine)';
      if (lowerMsg.includes('vance')) doctorName = 'Dr. Marcus Vance (Neurology)';

      pendingConfirmStore[conversationId] = {
        tool: 'book_appointment',
        target_id: customerId,
        extra_data: doctorName,
      };

      return {
        conversation_id: conversationId,
        intent: 'Appointment Booking Confirmation Required',
        response: `📋 **Schedule Doctor Appointment**: I am ready to book an In-Person visit with **${doctorName}** for **this Thursday at 10:00 AM** at Downtown Health Center.\n\n**Would you like me to confirm and lock in this appointment?** (Reply "Yes, proceed" or "No")`,
        escalated: false,
        ticket_id: null,
        tools_used: toolsUsed,
        requires_confirmation: true,
        domain: 'medical',
        pending_action: {
          tool: 'book_appointment',
          doctor_name: doctorName,
        },
        status_indicator: 'Awaiting patient confirmation for appointment booking...',
      };
    }

    // Medical Read Tool 3: Get Scheduled Appointments
    if (lowerMsg.includes('my appointment') || lowerMsg.includes('upcoming visit') || lowerMsg.includes('when is my visit')) {
      toolsUsed.push('get_patient_appointments');
      const apts = appointmentsStore.filter((a) => a.patient_id === customerId || customerId === 'PAT-2001');
      if (apts.length > 0) {
        const aptSummary = apts
          .map((a) => `• **${a.doctor_name}** (${a.specialty}) - ${new Date(a.date_time).toLocaleDateString()} at ${new Date(a.date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} [${a.type.toUpperCase()}]. Location: ${a.location}`)
          .join('\n\n');

        return {
          conversation_id: conversationId,
          intent: 'Patient Appointments Lookup',
          response: `Here are your scheduled appointments:\n\n${aptSummary}`,
          escalated: false,
          ticket_id: null,
          tools_used: toolsUsed,
          domain: 'medical',
          status_indicator: `Executing get_patient_appointments('${customerId}')...`,
        };
      }
    }

    // Medical Action Tool 4: Prescription Refill Request
    if (lowerMsg.includes('prescription') || lowerMsg.includes('refill') || lowerMsg.includes('medication')) {
      toolsUsed.push('request_prescription_refill');
      return {
        conversation_id: conversationId,
        intent: 'Prescription Refill Request',
        response: `💊 **Prescription Refill Submitted**: Your refill request for primary prescription medications has been transmitted to your primary physician (${patientsStore[0].primary_doctor}) for electronic authorization. Processing takes 1-2 business days.`,
        escalated: false,
        ticket_id: null,
        tools_used: toolsUsed,
        domain: 'medical',
        status_indicator: 'Executing request_prescription_refill()...',
      };
    }
  }

  // =========================================================================
  // SHOPPING & E-COMMERCE DOMAIN HANDLERS
  // =========================================================================
  if (domain === 'ecommerce' || domain === 'saas') {
    // Action Intent: Cancel Order
    if (lowerMsg.includes('cancel order') || lowerMsg.includes('cancel my order')) {
      toolsUsed.push('cancel_order');
      const orderMatch = lowerMsg.match(/ord-\d+/i) || lowerMsg.match(/order #?(\d+)/i);
      let targetOrderId = orderMatch
        ? (orderMatch[0].toUpperCase().startsWith('ORD-') ? orderMatch[0].toUpperCase() : `ORD-${orderMatch[1]}`)
        : null;

      if (!targetOrderId) {
        const custOrders = ordersStore.filter((o) => o.customer_id === customerId && o.status !== 'cancelled');
        if (custOrders.length > 0) targetOrderId = custOrders[0].order_id;
      }

      if (targetOrderId) {
        const ownershipCheck = verifyCustomerOwnership(customerId, targetOrderId);
        if (!ownershipCheck.valid || !ownershipCheck.order) {
          return {
            conversation_id: conversationId,
            intent: 'Security Refusal',
            response: ownershipCheck.errorMsg || 'Ownership verification failed.',
            escalated: false,
            ticket_id: null,
            tools_used: toolsUsed,
            domain: 'ecommerce',
            status_indicator: 'Checking ownership security rules...',
          };
        }

        const targetOrder = ownershipCheck.order;

        if (targetOrder.status === 'shipped' || targetOrder.status === 'in_transit' || targetOrder.status === 'delivered') {
          retrievedDocs.push('Order Cancellation Policy Before Shipment (Cancellation)');
          return {
            conversation_id: conversationId,
            intent: 'Cancellation Refused (RAG Policy)',
            response: `Order #${targetOrder.order_id} is currently **${targetOrder.status.toUpperCase()}** and cannot be cancelled because it has already shipped. Items can be returned under our 30-day refund policy once delivered.`,
            escalated: false,
            ticket_id: null,
            tools_used: toolsUsed,
            retrieved_docs: retrievedDocs,
            domain: 'ecommerce',
            status_indicator: 'Checking cancellation policy vs shipping status...',
          };
        }

        pendingConfirmStore[conversationId] = {
          tool: 'cancel_order',
          target_id: targetOrder.order_id,
        };

        return {
          conversation_id: conversationId,
          intent: 'Action Confirmation Required',
          response: `⚠️ **Confirmation Required**: Ready to cancel Order #${targetOrder.order_id} (Total: \$${targetOrder.total.toFixed(2)}).\n\n**Would you like me to proceed with cancelling this order?** (Reply "Yes, proceed" or "No")`,
          escalated: false,
          ticket_id: null,
          tools_used: toolsUsed,
          requires_confirmation: true,
          domain: 'ecommerce',
          pending_action: {
            tool: 'cancel_order',
            order_id: targetOrder.order_id,
          },
          status_indicator: 'Awaiting confirmation for cancel_order()...',
        };
      }
    }

    // Read Tool: Order Status Lookup
    const orderMatch = lowerMsg.match(/ord-\d+/i) || lowerMsg.match(/order #?(\d+)/i);
    if (orderMatch || lowerMsg.includes('order') || lowerMsg.includes('tracking') || lowerMsg.includes('package')) {
      toolsUsed.push('get_order_status');
      let targetOrderId = orderMatch
        ? (orderMatch[0].toUpperCase().startsWith('ORD-') ? orderMatch[0].toUpperCase() : `ORD-${orderMatch[1]}`)
        : null;

      if (targetOrderId) {
        const ownershipCheck = verifyCustomerOwnership(customerId, targetOrderId);
        if (!ownershipCheck.valid || !ownershipCheck.order) {
          return {
            conversation_id: conversationId,
            intent: 'Security Refusal',
            response: ownershipCheck.errorMsg || 'Ownership check failed.',
            escalated: false,
            ticket_id: null,
            tools_used: toolsUsed,
            domain: 'ecommerce',
            status_indicator: 'Verifying customer ownership...',
          };
        }

        const targetOrder = ownershipCheck.order;
        const itemDesc = targetOrder.items.map((i) => `${i.qty}x ${i.name}`).join(', ');
        let trackingInfo = targetOrder.tracking_number ? ` Tracking: ${targetOrder.tracking_number}.` : '';

        return {
          conversation_id: conversationId,
          intent: 'Order status',
          response: `Order #${targetOrder.order_id} (${itemDesc}) is currently **${targetOrder.status.toUpperCase()}**. Total: \$${targetOrder.total.toFixed(2)}.${trackingInfo}`,
          escalated: false,
          ticket_id: null,
          tools_used: toolsUsed,
          domain: 'ecommerce',
          status_indicator: `Executing get_order_status('${targetOrder.order_id}')...`,
        };
      }
    }
  }

  // =========================================================================
  // RAG VECTOR SEARCH FILTERED BY DOMAIN
  // =========================================================================
  toolsUsed.push('knowledge_base');

  // ISOLATED DOMAIN VECTOR SEARCH
  const domainChunks = KNOWLEDGE_CHUNKS.filter((c) => c.domain === domain || (domain === 'ecommerce' && c.domain === 'saas'));

  let bestChunk: KnowledgeChunk | null = null;
  let bestScore = 0;

  for (const chunk of domainChunks) {
    const score = calculateChunkSimilarity(lowerMsg, chunk);
    if (score > bestScore) {
      bestScore = score;
      bestChunk = chunk;
    }
  }

  if (bestChunk && bestScore >= 0.15) {
    retrievedDocs.push(`${bestChunk.title} (${bestChunk.category})`);
    return {
      conversation_id: conversationId,
      intent: `${bestChunk.category} question`,
      response: bestChunk.chunk_text,
      escalated: false,
      ticket_id: null,
      tools_used: toolsUsed,
      retrieved_docs: retrievedDocs,
      domain,
      status_indicator: `Searching ${domain.toUpperCase()} domain pgvector chunks...`,
    };
  }

  // Conversational Greeting Fallback
  if (lowerMsg.includes('hi') || lowerMsg.includes('hello') || lowerMsg.includes('hey')) {
    const pName = domain === 'medical' ? patientsStore[0].name.split(' ')[0] : customersStore[0].name.split(' ')[0];
    return {
      conversation_id: conversationId,
      intent: 'Greeting',
      response: domain === 'medical'
        ? `Hello ${pName}! Welcome to our Clinical AI Assistant. I can help schedule doctor visits, look up lab test results, request prescription refills, or answer insurance & clinic questions. How may I assist your health care today?`
        : `Hello ${pName}! Welcome to AutoSupport AI. I can help check order tracking, process returns, or answer policy questions. How can I help?`,
      escalated: false,
      ticket_id: null,
      tools_used: ['greeting_handler'],
      domain,
      status_indicator: `Greeting user in ${domain.toUpperCase()} mode...`,
    };
  }

  // Direct Google Gemini API Integration Call (if GEMINI_API_KEY is configured)
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey.length > 10 && !apiKey.includes('your_gemini_api_key')) {
    try {
      const sysPrompt = domain === 'medical'
        ? 'You are a professional Clinical AI Assistant. Provide helpful, accurate, empathetic medical customer service information. Remind users to call 911 for emergencies.'
        : 'You are a helpful Customer Support AI Assistant for an e-commerce platform. Provide polite, clear customer service assistance.';

      const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${sysPrompt}\n\nUser Question: ${rawMsg}` }] }],
        }),
        signal: AbortSignal.timeout(6000),
      });

      if (geminiRes.ok) {
        const geminiData = await geminiRes.json();
        const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (generatedText) {
          return {
            conversation_id: conversationId,
            intent: 'Google Gemini Response',
            response: generatedText.trim(),
            escalated: false,
            ticket_id: null,
            tools_used: [...toolsUsed, 'google_gemini_1.5_flash'],
            domain,
            status_indicator: 'Generated response using Google Gemini 1.5 Flash API',
          };
        }
      }
    } catch (err) {
      console.warn('Gemini direct API call notice:', err);
    }
  }

  // General Domain-Grounded Fallback
  return {
    conversation_id: conversationId,
    intent: 'General inquiry',
    response: domain === 'medical'
      ? `Regarding "${rawMsg}": I checked our clinical knowledge base, but I don't have a direct medical record for that inquiry. Would you like me to connect you with a clinical triage nurse or book a doctor consultation?`
      : `Regarding "${rawMsg}": I checked our knowledge base and tools, but I don't have a specific entry for that query. Would you like me to connect you with support?`,
    escalated: false,
    ticket_id: null,
    tools_used: toolsUsed,
    domain,
    status_indicator: `Evaluating ${domain.toUpperCase()} query...`,
  };
}
