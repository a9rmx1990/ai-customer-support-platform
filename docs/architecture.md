# AI Customer Support Platform — Technical Architecture

This document details the architectural design, component interactions, data model, and security boundaries of the **AI Customer Support Automation Platform**.

---

## System Components

```text
[ Customer Browser ]
        │
        │ HTTP (JSON)
        ▼
[ Next.js Web App ]
  ├── App Router Pages (/chat, /tickets, /knowledge, /architecture)
  └── API Route (/api/chat)
        │
        │ HTTP Webhook
        ▼
[ n8n Automation Engine ]
  ├── Webhook Endpoint
  ├── Input Sanitizer & Session Normalizer
  ├── Postgres Chat Memory (n8n_chat_histories)
  ├── Google Gemini Chat Agent (gemini-1.5-flash)
  ├── pgvector Vector Store Tool (knowledge_chunks)
  ├── Database SQL Tools (get_customer, get_order_status, etc.)
  ├── Output Parser & Sanitizer
  └── SMTP Email Escalation Node
        │
        ▼
[ Supabase PostgreSQL + pgvector ]
```

---

## Data Models

### 1. `customers`
Stores customer profile records.
- `customer_id` (TEXT, PK)
- `name` (TEXT)
- `email` (TEXT)
- `created_at` (TIMESTAMPTZ)

### 2. `conversations`
Tracks active and historical support chat sessions.
- `conversation_id` (TEXT, PK)
- `customer_id` (TEXT, FK)
- `status` (TEXT: `open`, `escalated`, `closed`)
- `created_at` (TIMESTAMPTZ)

### 3. `messages`
Stores exact message logs per conversation.
- `id` (BIGSERIAL, PK)
- `conversation_id` (TEXT)
- `role` (TEXT: `customer`, `user`, `assistant`, `system`, `tool`)
- `message` (TEXT)
- `timestamp` (TIMESTAMPTZ)

### 4. `support_tickets`
Created upon human escalation or explicit customer request.
- `ticket_id` (BIGSERIAL, PK)
- `customer_id` (TEXT)
- `conversation_id` (TEXT)
- `issue` (TEXT)
- `reason` (TEXT)
- `priority` (TEXT: `low`, `medium`, `high`, `urgent`)
- `status` (TEXT: `open`, `in_progress`, `resolved`, `closed`)

### 5. `orders`
E-commerce order records queried by the AI agent tools.
- `order_id` (TEXT, PK)
- `customer_id` (TEXT)
- `status` (TEXT: `pending`, `processing`, `shipped`, `in_transit`, `delivered`, `cancelled`)
- `total` (NUMERIC)
- `items` (JSONB)
- `tracking_number` (TEXT)
- `estimated_delivery` (TEXT)

### 6. `knowledge_chunks`
Vector store table storing chunked documentation and embeddings.
- `id` (BIGSERIAL, PK)
- `document_id` (BIGINT)
- `chunk_text` (TEXT)
- `embedding` (VECTOR(768))
- `metadata` (JSONB)

---

## Security Boundaries

1. **Client Isolation**: The Next.js frontend has zero direct access to database service keys or LLM API keys.
2. **Input Sanitization**: Incoming message payloads are trimmed, type-checked, and checked against injection attempt strings.
3. **Guardrails**: The main agent system prompt explicitly restricts disclosure of internal architecture, passwords, or system prompts.
