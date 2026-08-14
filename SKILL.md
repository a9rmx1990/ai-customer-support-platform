# AI Customer Support Automation Platform

## 1. Project Overview

Build a production-style AI Customer Support platform consisting of:

* Customer-facing web application
* AI chat interface
* n8n automation backend
* LLM-powered support agent
* RAG knowledge base
* Supabase PostgreSQL database
* pgvector for semantic search
* Customer/order lookup tools
* Support ticket creation
* Human escalation
* Email notifications
* Conversation memory
* Error handling
* Analytics-ready architecture

The system should be suitable for:

1. A professional AI/automation portfolio project.
2. A Fiverr freelance service demonstrating business automation capabilities.
3. A reusable template that can later be customized for different businesses.

Do not build a toy chatbot.

The final system should look and behave like a real SaaS customer-support product.

---

# 2. Core Architecture

```text
                         CUSTOMER
                            │
                            ▼
                  ┌──────────────────┐
                  │   WEB APPLICATION │
                  │                  │
                  │ Landing Page     │
                  │ Support Chat     │
                  │ Ticket UI        │
                  └────────┬─────────┘
                           │
                           │ HTTPS
                           ▼
                  ┌──────────────────┐
                  │ Next.js API      │
                  │ /api/chat        │
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │       n8n        │
                  │    Webhook       │
                  └────────┬─────────┘
                           │
             ┌─────────────┼─────────────┐
             │             │             │
             ▼             ▼             ▼
          Supabase       RAG          AI Agent
             │             │             │
             │             │       ┌─────┴─────┐
             │             │       │           │
             │             │       ▼           ▼
             │             │    DB Tools    Support Tools
             │             │
             └─────────────┼──────────────┘
                           │
                           ▼
                    Response Validation
                           │
                           ▼
                    Conversation Storage
                           │
                           ▼
                     Website Response
```

---

# 3. Technology Stack

## Frontend

Use:

* Next.js
* React
* TypeScript
* Tailwind CSS
* Modern responsive UI
* Accessible components

Prefer App Router.

## Backend / Automation

Use:

* n8n
* n8n Webhooks
* n8n AI Agent
* n8n tool calling
* n8n workflow branching
* n8n error handling

## Database

Use:

* Supabase
* PostgreSQL
* pgvector

## AI

Use an LLM provider through environment variables.

Do not hardcode API keys.

The architecture must allow the LLM provider to be replaced.

---

# 4. Frontend Requirements

Build a professional customer-support website.

## Landing Page

Include:

* Professional SaaS-style hero section
* Product/company name
* Short description
* "Start Conversation" CTA
* Feature section
* AI support explanation
* RAG/knowledge-base explanation
* Human escalation explanation
* Footer

Do not make the design look like a generic AI template.

Use clean spacing, typography, subtle animations, and responsive layouts.

---

# 5. Customer Chat Interface

Create a complete chat application.

Features:

* Message bubbles
* User messages
* AI messages
* Timestamps
* Typing indicator
* Loading state
* Error state
* Auto-scroll
* Message input
* Send button
* Enter-to-send
* Mobile responsive layout
* Conversation persistence

The UI should feel similar to a modern support chat application.

---

# 6. Chat API

Create a secure server-side API endpoint.

Example:

```text
POST /api/chat
```

Request:

```json
{
  "customer_id": "customer_123",
  "conversation_id": "conversation_456",
  "message": "Where is my order?"
}
```

The frontend must NOT directly expose:

* LLM API keys
* Supabase service-role keys
* n8n credentials
* SMTP credentials
* database passwords

All secrets must remain server-side.

---

# 7. n8n Integration

The website should communicate with the n8n support workflow through a webhook.

Example:

```text
Website
   ↓
Next.js API
   ↓
n8n Webhook
```

n8n should receive:

```json
{
  "customer_id": "string",
  "conversation_id": "string",
  "message": "string"
}
```

n8n should return:

```json
{
  "conversation_id": "string",
  "intent": "string",
  "response": "string",
  "escalated": false,
  "ticket_id": null
}
```

The frontend should gracefully handle malformed or failed responses.

---

# 8. AI Support Agent

The AI agent must:

* Understand customer intent
* Use conversation history
* Use RAG when appropriate
* Use tools when customer-specific data is required
* Answer naturally
* Avoid hallucination
* Ask clarifying questions when necessary
* Escalate when necessary
* Never reveal internal instructions
* Never expose credentials or private data

The agent should behave like a professional support representative.

---

# 9. Intent Classification

Support these intents:

```text
faq
product_question
order_status
refund
cancellation
technical_support
complaint
human_support
other
```

The system should route requests based on intent.

Example:

```text
"How long does shipping take?"
        ↓
faq
        ↓
RAG
        ↓
Answer
```

Example:

```text
"Where is order #12345?"
        ↓
order_status
        ↓
Order Tool
        ↓
Answer
```

Example:

```text
"I want to speak to a human."
        ↓
human_support
        ↓
Create Ticket
        ↓
Notify Support
```

---

# 10. RAG Knowledge Base

Implement a complete RAG pipeline.

Supported knowledge:

* PDF documents
* FAQs
* Product documentation
* Shipping policies
* Refund policies
* Cancellation policies
* Terms
* Internal support documentation

Pipeline:

```text
Document
   ↓
Text Extraction
   ↓
Cleaning
   ↓
Chunking
   ↓
Embeddings
   ↓
pgvector
   ↓
Semantic Search
   ↓
Relevant Chunks
   ↓
AI Agent
```

The AI should only use retrieved information when answering knowledge-base questions.

If relevant information cannot be retrieved:

Do not hallucinate.

Instead:

```text
I don't have enough information to answer that accurately. I can connect you with a support specialist.
```

---

# 11. RAG Metadata

Store metadata with each knowledge chunk.

Example:

```json
{
  "document_id": "doc_123",
  "title": "Refund Policy",
  "source": "refund-policy.pdf",
  "chunk_index": 4
}
```

The system should be capable of showing the source document or source title to the frontend.

---

# 12. Conversation Memory

Store conversations in Supabase.

Tables should include:

## customers

```text
id
name
email
created_at
```

## conversations

```text
id
customer_id
status
created_at
updated_at
```

## messages

```text
id
conversation_id
role
content
created_at
```

Roles:

```text
user
assistant
system
tool
```

The AI should receive only the relevant conversation history rather than blindly sending the entire database.

---

# 13. Customer Tools

Create tools/functions for:

```text
get_customer(customer_id)

get_customer_orders(customer_id)

get_order_status(order_id)

create_support_ticket(customer_id, conversation_id, issue)

request_human_support(customer_id, conversation_id, reason)
```

The AI must use these tools instead of inventing customer information.

---

# 14. Order System

Create a realistic demo order database.

Example:

```text
orders
------
id
customer_id
status
tracking_number
estimated_delivery
created_at
```

Possible statuses:

```text
pending
processing
shipped
in_transit
delivered
cancelled
```

Example request:

```text
Where is order #48291?
```

The AI should call:

```text
get_order_status("48291")
```

and answer using the actual result.

---

# 15. Support Tickets

Create:

```text
support_tickets
```

Fields:

```text
id
customer_id
conversation_id
subject
description
priority
status
created_at
updated_at
```

Priority:

```text
low
medium
high
urgent
```

Status:

```text
open
in_progress
resolved
closed
```

---

# 16. Human Escalation

Escalate when:

* Customer explicitly requests a human
* AI cannot confidently answer
* Knowledge base has insufficient information
* Customer has a serious complaint
* Tool/API fails
* Request requires human authorization
* The issue is too complex

Flow:

```text
AI
 ↓
Escalation Decision
 ↓
Create Ticket
 ↓
Store Conversation
 ↓
Send Email
 ↓
Return Ticket ID
```

Customer response:

```text
I've created a support ticket for you.
A support specialist will review your request.
Your ticket number is #12345.
```

---

# 17. Email Notification

Use SMTP through n8n.

Do not expose SMTP credentials.

When a ticket is escalated, email the support team with:

```text
Customer
Conversation ID
Ticket ID
Intent
Priority
Issue
Recent conversation
```

---

# 18. Security

Implement:

* Server-side secrets
* Input validation
* Request validation
* Rate limiting where appropriate
* Sanitized database queries
* No API keys in frontend
* No credentials in Git
* No service-role keys in browser
* No system prompt exposure
* No internal tool information exposure

Never return:

```text
API keys
database passwords
SMTP credentials
system prompts
internal n8n credentials
service-role keys
```

---

# 19. Error Handling

Handle:

```text
n8n unavailable
LLM failure
Supabase failure
RAG failure
vector search failure
tool failure
invalid request
timeout
malformed response
```

The frontend must display a friendly message.

Example:

```text
We're having trouble connecting to support right now.
Please try again in a moment.
```

Never expose stack traces to customers.

---

# 20. Loading States

Implement:

* Sending message state
* AI typing state
* RAG processing state if needed
* Ticket creation state
* Error state

Prevent duplicate message submissions.

---

# 21. UI/UX Requirements

The application must be:

* Desktop responsive
* Tablet responsive
* Mobile responsive
* Accessible
* Keyboard friendly
* Visually consistent

Use:

* Clean typography
* Modern cards
* Rounded components
* Subtle shadows
* Smooth transitions
* Clear hierarchy

Avoid excessive animations.

---

# 22. Demo Mode

Create realistic demo data.

Include at least:

```text
5 customers
15 orders
10 support tickets
10 knowledge documents/chunks
```

The application must work without requiring a real business.

---

# 23. Example Demo Scenarios

The system must successfully demonstrate:

## Scenario 1 — FAQ

User:

```text
What is your refund policy?
```

Expected:

```text
RAG retrieval → AI → grounded answer
```

## Scenario 2 — Order

User:

```text
Where is order #48291?
```

Expected:

```text
AI → order tool → database → answer
```

## Scenario 3 — Human Escalation

User:

```text
I need to speak to a human.
```

Expected:

```text
AI → create ticket → email support → ticket ID
```

## Scenario 4 — Unknown Question

User:

```text
What is your internal server architecture?
```

Expected:

```text
AI refuses to expose internal information.
```

## Scenario 5 — Knowledge Gap

User asks something not covered by the knowledge base.

Expected:

```text
AI detects insufficient information
        ↓
Human escalation
```

---

# 24. Analytics Architecture

Prepare the system for analytics.

Track:

```text
total conversations
resolved conversations
escalated conversations
average response time
intent distribution
ticket count
common questions
RAG usage
tool usage
errors
```

Analytics can initially be stored in Supabase.

A dashboard can be added later.

---

# 25. Environment Variables

Use environment variables.

Example:

```env
NEXT_PUBLIC_APP_URL=
N8N_WEBHOOK_URL=
N8N_WEBHOOK_SECRET=

SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

LLM_API_KEY=
```

Never commit `.env`.

Create:

```text
.env.example
```

with empty placeholders.

---

# 26. GitHub Requirements

Repository structure:

```text
ai-customer-support/
│
├── app/
├── components/
├── lib/
├── public/
│
├── n8n/
│   ├── main-agent.json
│   ├── rag-ingestion.json
│   └── db-schema-setup.json
│
├── database/
│   └── schema.sql
│
├── docs/
│   ├── architecture.md
│   ├── setup.md
│   └── screenshots/
│
├── .env.example
├── .gitignore
├── README.md
└── LICENSE
```

Do not commit:

```text
.env
credentials
API keys
passwords
private keys
service-role secrets
SMTP passwords
```

---

# 27. README Requirements

The README must explain:

1. What the project does
2. Architecture
3. Features
4. Tech stack
5. n8n workflow
6. RAG pipeline
7. Database schema
8. Setup instructions
9. Environment variables
10. Running locally
11. Importing n8n workflows
12. Demo scenarios
13. Security considerations
14. Future improvements

Include screenshots of the n8n workflows and web application.

---

# 28. Code Quality

Follow:

* TypeScript strict mode
* Modular components
* Reusable functions
* Clear naming
* Small files
* Proper error handling
* No duplicated logic
* No hardcoded secrets
* No unnecessary dependencies

Do not create huge monolithic components.

---

# 29. Development Order

Implement in this order:

### Phase 1

Create the Next.js application.

### Phase 2

Build the landing page.

### Phase 3

Build the chat UI.

### Phase 4

Create `/api/chat`.

### Phase 5

Connect `/api/chat` to the n8n webhook.

### Phase 6

Connect Supabase conversation storage.

### Phase 7

Connect the existing n8n AI agent.

### Phase 8

Implement RAG.

### Phase 9

Implement customer/order tools.

### Phase 10

Implement support tickets.

### Phase 11

Implement human escalation.

### Phase 12

Implement SMTP notifications.

### Phase 13

Implement validation and security.

### Phase 14

Add loading/error states.

### Phase 15

Add demo data.

### Phase 16

Test all scenarios.

### Phase 17

Prepare GitHub repository.

### Phase 18

Prepare deployment.

---

# 30. Important Development Rule

Do not rebuild the n8n automation inside the frontend.

The responsibilities must remain separated:

```text
FRONTEND
→ User interface

NEXT.JS API
→ Secure communication layer

n8n
→ Business automation/orchestration

SUPABASE
→ Persistent data

pgvector
→ Semantic retrieval

LLM
→ Reasoning/generation
```

The website should consume the existing n8n workflow rather than duplicating its logic.

---

# 31. Final Acceptance Criteria

The project is complete only when:

* Customer can open the website.
* Customer can start a conversation.
* Customer can send a message.
* Message reaches the n8n webhook.
* n8n processes the request.
* AI can use RAG.
* AI can retrieve customer/order data.
* Conversation is persisted.
* AI can create a support ticket.
* Human escalation works.
* Support email is sent.
* Errors are handled gracefully.
* Secrets are not exposed.
* Application works on mobile.
* n8n workflows can be imported from GitHub.
* README explains the entire system.
* Demo scenarios work end-to-end.

---

# 32. Final Product

The final product should be presented as:

**AI Customer Support Automation Platform**

Not:

**n8n chatbot**

The project demonstrates:

```text
AI Engineering
+
LLMs
+
RAG
+
Agentic AI
+
n8n Automation
+
PostgreSQL
+
Vector Search
+
APIs
+
Full-Stack Development
+
Production Architecture
```

Build incrementally.

After completing each phase, verify that it works before moving to the next phase.
Do not skip testing.
