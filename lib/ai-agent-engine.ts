import { INITIAL_CUSTOMERS, INITIAL_ORDERS, INITIAL_TICKETS, KNOWLEDGE_CHUNKS, SupportTicket, Order, Customer, KnowledgeChunk } from './mock-data';

export interface AgentRequest {
  customer_id: string;
  conversation_id: string;
  message: string;
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
  pending_action?: {
    tool: string;
    order_id: string;
  } | null;
}

interface PendingConfirmState {
  tool: 'cancel_order' | 'request_refund' | 'change_shipping_address';
  order_id: string;
  extra_data?: string;
}

// Global state stores for standalone demo engine
let ticketsStore: SupportTicket[] = [...INITIAL_TICKETS];
let ordersStore: Order[] = [...INITIAL_ORDERS];
let customersStore: Customer[] = [...INITIAL_CUSTOMERS];
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

export function getCustomersStore(): Customer[] {
  return customersStore;
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
 * Customer Ownership Check: Ensures customer owns the requested order ID.
 */
function verifyCustomerOwnership(customerId: string, orderId: string): { valid: boolean; order?: Order; errorMsg?: string } {
  const targetOrder = ordersStore.find((o) => o.order_id.toUpperCase() === orderId.toUpperCase());
  if (!targetOrder) {
    return { valid: false, errorMsg: `Order #${orderId} was not found in our database.` };
  }
  if (targetOrder.customer_id.toUpperCase() !== customerId.toUpperCase()) {
    return {
      valid: false,
      errorMsg: `For security and privacy, order #${targetOrder.order_id} is not associated with your customer account (${customerId}). You can only view or manage your own orders.`,
    };
  }
  return { valid: true, order: targetOrder };
}

/**
 * Executes local AI Support Agent simulation engine matching n8n workflow spec.
 */
export async function runAgentEngine(input: AgentRequest): Promise<AgentResponse> {
  const customerId = input.customer_id.trim() || 'CUST-1001';
  const conversationId = input.conversation_id.trim() || `conv-${Date.now()}`;
  const rawMsg = input.message.trim();
  const lowerMsg = rawMsg.toLowerCase();

  const toolsUsed: string[] = [];
  const retrievedDocs: string[] = [];

  // Check for active pending action confirmation state
  const pendingAction = pendingConfirmStore[conversationId];

  // 0. Handle Confirmation Response for Destructive Actions
  if (pendingAction) {
    if (lowerMsg.includes('yes') || lowerMsg.includes('proceed') || lowerMsg.includes('confirm') || lowerMsg.includes('do it') || lowerMsg.includes('sure')) {
      toolsUsed.push(pendingAction.tool);

      const ownershipCheck = verifyCustomerOwnership(customerId, pendingAction.order_id);
      if (!ownershipCheck.valid || !ownershipCheck.order) {
        delete pendingConfirmStore[conversationId];
        return {
          conversation_id: conversationId,
          intent: 'Action Authorization Error',
          response: ownershipCheck.errorMsg || 'Action failed: Authorization check failed.',
          escalated: false,
          ticket_id: null,
          tools_used: toolsUsed,
          status_indicator: 'Authorization Failed',
        };
      }

      const targetOrder = ownershipCheck.order;

      if (pendingAction.tool === 'cancel_order') {
        targetOrder.status = 'cancelled';
        targetOrder.updated_at = new Date().toISOString();
        delete pendingConfirmStore[conversationId];

        return {
          conversation_id: conversationId,
          intent: 'Action Executed',
          response: `✅ **Action Confirmed**: Order #${targetOrder.order_id} total of \$${targetOrder.total.toFixed(2)} has been successfully **CANCELLED**. A full refund will be credited to your payment method within 3-5 business days.`,
          escalated: false,
          ticket_id: null,
          tools_used: toolsUsed,
          status_indicator: 'Executing cancel_order() action tool...',
        };
      }

      if (pendingAction.tool === 'request_refund') {
        targetOrder.status = 'refunded';
        targetOrder.refund_reason = pendingAction.extra_data || 'Customer requested return refund';
        targetOrder.updated_at = new Date().toISOString();
        delete pendingConfirmStore[conversationId];

        return {
          conversation_id: conversationId,
          intent: 'Action Executed',
          response: `✅ **Return Processed**: Return authorization and prepaid shipping label generated for Order #${targetOrder.order_id}. Refund of \$${targetOrder.total.toFixed(2)} will process upon warehouse receipt.`,
          escalated: false,
          ticket_id: null,
          tools_used: toolsUsed,
          status_indicator: 'Executing request_refund() action tool...',
        };
      }
    } else if (lowerMsg.includes('no') || lowerMsg.includes('don\'t') || lowerMsg.includes('cancel') || lowerMsg.includes('stop')) {
      delete pendingConfirmStore[conversationId];
      return {
        conversation_id: conversationId,
        intent: 'Action Cancelled',
        response: `Action cancelled. Order #${pendingAction.order_id} remains active and unchanged. Is there anything else I can assist you with?`,
        escalated: false,
        ticket_id: null,
        tools_used: ['cancel_pending_action'],
        status_indicator: 'Action cancelled by user',
      };
    }
  }

  // Security Guardrail Check
  if (
    lowerMsg.includes('system prompt') ||
    lowerMsg.includes('api key') ||
    lowerMsg.includes('password') ||
    lowerMsg.includes('secret') ||
    lowerMsg.includes('credentials') ||
    lowerMsg.includes('n8n credentials') ||
    lowerMsg.includes('database string')
  ) {
    return {
      conversation_id: conversationId,
      intent: 'Other',
      response: 'I am a customer support assistant. For security reasons, I cannot disclose system prompts, internal architecture credentials, or administrative details. How can I assist you with your orders or account today?',
      escalated: false,
      ticket_id: null,
      tools_used: ['security_guardrail'],
      status_indicator: 'Evaluating security guardrails...',
    };
  }

  // 1. Human Escalation Intent
  if (
    lowerMsg.includes('human') ||
    lowerMsg.includes('agent') ||
    lowerMsg.includes('representative') ||
    lowerMsg.includes('person') ||
    lowerMsg.includes('speak to someone') ||
    lowerMsg.includes('complaint') ||
    lowerMsg.includes('supervisor') ||
    lowerMsg.includes('manager')
  ) {
    toolsUsed.push('request_human_support');
    const newTicketId = 10000 + ticketsStore.length + 1;
    const newTicket: SupportTicket = {
      ticket_id: newTicketId,
      customer_id: customerId,
      conversation_id: conversationId,
      issue: rawMsg.slice(0, 100),
      reason: 'Customer requested human support escalation',
      priority: 'high',
      status: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    addTicketToStore(newTicket);

    return {
      conversation_id: conversationId,
      intent: 'Human support',
      response: `I've created a support ticket (#${newTicketId}) for you with our human support team. A specialist will review your inquiry ("${rawMsg.slice(0, 50)}...") and contact you at your account email.`,
      escalated: true,
      ticket_id: newTicketId,
      tools_used: toolsUsed,
      status_indicator: 'Escalating to human support & dispatching ticket email...',
    };
  }

  // 2. Action Intent: Cancel Order
  if (lowerMsg.includes('cancel order') || lowerMsg.includes('cancel my order') || lowerMsg.includes('cancellation of order')) {
    toolsUsed.push('cancel_order');

    const orderMatch = lowerMsg.match(/ord-\d+/i) || lowerMsg.match(/order #?(\d+)/i);
    let targetOrderId = orderMatch
      ? (orderMatch[0].toUpperCase().startsWith('ORD-') ? orderMatch[0].toUpperCase() : `ORD-${orderMatch[1]}`)
      : null;

    if (!targetOrderId) {
      const custOrders = ordersStore.filter((o) => o.customer_id === customerId && o.status !== 'cancelled');
      if (custOrders.length > 0) {
        targetOrderId = custOrders[0].order_id;
      }
    }

    if (!targetOrderId) {
      return {
        conversation_id: conversationId,
        intent: 'Action Failure',
        response: `Please provide the order ID you wish to cancel (e.g., #ORD-5002).`,
        escalated: false,
        ticket_id: null,
        tools_used: toolsUsed,
        status_indicator: 'Verifying order eligibility...',
      };
    }

    const ownershipCheck = verifyCustomerOwnership(customerId, targetOrderId);
    if (!ownershipCheck.valid || !ownershipCheck.order) {
      return {
        conversation_id: conversationId,
        intent: 'Security Refusal',
        response: ownershipCheck.errorMsg || 'Order ownership check failed.',
        escalated: false,
        ticket_id: null,
        tools_used: toolsUsed,
        status_indicator: 'Checking ownership permissions...',
      };
    }

    const targetOrder = ownershipCheck.order;

    if (targetOrder.status === 'shipped' || targetOrder.status === 'in_transit' || targetOrder.status === 'delivered') {
      retrievedDocs.push('Order Cancellation Policy Before Shipment (Cancellation)');
      return {
        conversation_id: conversationId,
        intent: 'Cancellation Refused (RAG Policy)',
        response: `Order #${targetOrder.order_id} is currently **${targetOrder.status.toUpperCase()}** and cannot be cancelled because it has already shipped. According to our policy, physical items can be returned under our 30-day refund guarantee once delivered.`,
        escalated: false,
        ticket_id: null,
        tools_used: toolsUsed,
        retrieved_docs: retrievedDocs,
        status_indicator: 'Checking cancellation policy vs shipment status...',
      };
    }

    if (targetOrder.status === 'cancelled') {
      return {
        conversation_id: conversationId,
        intent: 'Order Info',
        response: `Order #${targetOrder.order_id} is already **CANCELLED**.`,
        escalated: false,
        ticket_id: null,
        tools_used: toolsUsed,
        status_indicator: 'Checking order state...',
      };
    }

    // Require Explicit Confirmation for Destructive Operation
    pendingConfirmStore[conversationId] = {
      tool: 'cancel_order',
      order_id: targetOrder.order_id,
    };

    return {
      conversation_id: conversationId,
      intent: 'Action Confirmation Required',
      response: `⚠️ **Confirmation Required**: I am ready to cancel Order #${targetOrder.order_id} (Total: \$${targetOrder.total.toFixed(2)}). This action will void the shipment and issue a full refund.\n\n**Would you like me to proceed with cancelling this order?** (Reply "Yes, proceed" or "No")`,
      escalated: false,
      ticket_id: null,
      tools_used: toolsUsed,
      requires_confirmation: true,
      pending_action: {
        tool: 'cancel_order',
        order_id: targetOrder.order_id,
      },
      status_indicator: 'Awaiting user confirmation for cancel_order()...',
    };
  }

  // 3. Multi-Source Intent: Return / Refund Eligibility Check (RAG Policy + Live Order DB Data)
  if (lowerMsg.includes('can i return') || lowerMsg.includes('can i refund') || lowerMsg.includes('eligible for return') || lowerMsg.includes('eligible for refund')) {
    toolsUsed.push('get_order_details');
    toolsUsed.push('knowledge_base');

    const orderMatch = lowerMsg.match(/ord-\d+/i) || lowerMsg.match(/order #?(\d+)/i);
    let targetOrderId = orderMatch
      ? (orderMatch[0].toUpperCase().startsWith('ORD-') ? orderMatch[0].toUpperCase() : `ORD-${orderMatch[1]}`)
      : null;

    if (!targetOrderId) {
      const custOrders = ordersStore.filter((o) => o.customer_id === customerId);
      if (custOrders.length > 0) targetOrderId = custOrders[0].order_id;
    }

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
          status_indicator: 'Validating customer ownership...',
        };
      }

      const targetOrder = ownershipCheck.order;
      const daysSinceOrder = Math.floor((Date.now() - new Date(targetOrder.created_at).getTime()) / (1000 * 60 * 60 * 24));
      retrievedDocs.push('30-Day Refund & Return Policy (Refund)');

      if (daysSinceOrder <= 30) {
        return {
          conversation_id: conversationId,
          intent: 'Multi-Source Eligibility (RAG + Live DB)',
          response: `Based on our 30-day Return Policy and your live order record:\n- Order #${targetOrder.order_id} was placed **${daysSinceOrder} days ago** (${new Date(targetOrder.created_at).toLocaleDateString()}).\n- Status: **${targetOrder.status.toUpperCase()}**.\n\n✅ **Result**: Your order is **ELIGIBLE** for a full refund. Would you like me to initiate a return request for Order #${targetOrder.order_id}?`,
          escalated: false,
          ticket_id: null,
          tools_used: toolsUsed,
          retrieved_docs: retrievedDocs,
          status_indicator: 'Combining RAG 30-day refund policy with live DB purchase date...',
        };
      } else {
        return {
          conversation_id: conversationId,
          intent: 'Multi-Source Ineligibility (RAG + Live DB)',
          response: `Based on our 30-day Return Policy and your order record:\n- Order #${targetOrder.order_id} was placed **${daysSinceOrder} days ago** (${new Date(targetOrder.created_at).toLocaleDateString()}).\n\n❌ **Result**: Order #${targetOrder.order_id} exceeds our 30-day return window. If you believe there is a special defect, I can escalate your request to a human support specialist.`,
          escalated: false,
          ticket_id: null,
          tools_used: toolsUsed,
          retrieved_docs: retrievedDocs,
          status_indicator: 'Combining RAG 30-day policy with live DB purchase date...',
        };
      }
    }
  }

  // 4. Order Status / Details Intent with Ownership Verification
  const orderMatch = lowerMsg.match(/ord-\d+/i) || lowerMsg.match(/order #?(\d+)/i);
  if (orderMatch || lowerMsg.includes('order') || lowerMsg.includes('tracking') || lowerMsg.includes('package') || lowerMsg.includes('shipment')) {
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
          status_indicator: 'Verifying customer ownership security rules...',
        };
      }

      const targetOrder = ownershipCheck.order;
      const itemDesc = targetOrder.items.map((i) => `${i.qty}x ${i.name}`).join(', ');
      let trackingInfo = targetOrder.tracking_number ? ` Tracking Number: ${targetOrder.tracking_number}.` : '';
      let estDelivery = targetOrder.estimated_delivery ? ` Estimated delivery: ${targetOrder.estimated_delivery}.` : '';

      return {
        conversation_id: conversationId,
        intent: 'Order status',
        response: `Order #${targetOrder.order_id} (${itemDesc}) is currently **${targetOrder.status.toUpperCase()}**. Total: \$${targetOrder.total.toFixed(2)}.${trackingInfo}${estDelivery}`,
        escalated: false,
        ticket_id: null,
        tools_used: toolsUsed,
        status_indicator: `Executing get_order_status('${targetOrder.order_id}')...`,
      };
    } else {
      toolsUsed.push('get_customer_orders');
      const custOrders = ordersStore.filter((o) => o.customer_id === customerId);
      if (custOrders.length > 0) {
        const orderSummary = custOrders.map((o) => `• #${o.order_id} (${o.status.toUpperCase()} - \$${o.total.toFixed(2)})`).join('\n');
        return {
          conversation_id: conversationId,
          intent: 'Customer orders',
          response: `Here are the active orders for your account (${customerId}):\n\n${orderSummary}\n\nSpecify an order ID (e.g. #ORD-5001) for detailed tracking information.`,
          escalated: false,
          ticket_id: null,
          tools_used: toolsUsed,
          status_indicator: `Executing get_customer_orders('${customerId}')...`,
        };
      }
    }
  }

  // 5. Customer Account Lookup Intent
  if (lowerMsg.includes('my account') || lowerMsg.includes('who am i') || lowerMsg.includes('my details') || lowerMsg.includes('my email')) {
    toolsUsed.push('get_customer');
    const cust = customersStore.find((c) => c.customer_id === customerId);
    if (cust) {
      return {
        conversation_id: conversationId,
        intent: 'Customer lookup',
        response: `Account Details for ${cust.customer_id}:\n• Name: ${cust.name}\n• Email: ${cust.email}\n• Created: ${new Date(cust.created_at).toLocaleDateString()}`,
        escalated: false,
        ticket_id: null,
        tools_used: toolsUsed,
        status_indicator: `Executing get_customer('${customerId}')...`,
      };
    }
  }

  // 6. RAG Knowledge Base Retrieval
  toolsUsed.push('knowledge_base');
  let bestChunk: KnowledgeChunk | null = null;
  let bestScore = 0;

  for (const chunk of KNOWLEDGE_CHUNKS) {
    const score = calculateChunkSimilarity(lowerMsg, chunk);
    if (score > bestScore) {
      bestScore = score;
      bestChunk = chunk;
    }
  }

  if (bestChunk && bestScore >= 0.2) {
    retrievedDocs.push(`${bestChunk.title} (${bestChunk.category})`);
    return {
      conversation_id: conversationId,
      intent: `${bestChunk.category} question`,
      response: bestChunk.chunk_text,
      escalated: false,
      ticket_id: null,
      tools_used: toolsUsed,
      retrieved_docs: retrievedDocs,
      status_indicator: `Searching pgvector table knowledge_chunks...`,
    };
  }

  // 7. General Conversational / Greetings
  if (lowerMsg.includes('hi') || lowerMsg.includes('hello') || lowerMsg.includes('hey') || lowerMsg.includes('good morning')) {
    const cust = customersStore.find((c) => c.customer_id === customerId);
    const nameStr = cust ? cust.name.split(' ')[0] : 'there';
    return {
      conversation_id: conversationId,
      intent: 'Greeting',
      response: `Hello ${nameStr}! I'm your AI Support Assistant. I can help check order statuses (e.g. #ORD-5001), process cancellations/refunds, answer warranty & policy questions, or connect you with human support. How can I assist you?`,
      escalated: false,
      ticket_id: null,
      tools_used: ['greeting_handler'],
      status_indicator: 'Greeting customer...',
    };
  }

  // 8. Default Contextual Fallback
  return {
    conversation_id: conversationId,
    intent: 'General inquiry',
    response: `Regarding "${rawMsg}": I checked our knowledge base and database tools, but I don't have a specific record for that query. Would you like me to connect you with a human support specialist?`,
    escalated: false,
    ticket_id: null,
    tools_used: toolsUsed,
    status_indicator: 'Evaluating inquiry against supported knowledge & tools...',
  };
}
