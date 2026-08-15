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
# Real-Time Data & Intelligent Support Layer

## Purpose

Extend the existing AI Customer Support Automation Platform with a robust architecture for:

* Real-time business data
* External APIs
* Customer-specific information
* Database tools
* Business actions
* Intelligent source selection
* RAG + real-time data combination
* Tool calling
* Authorization
* Validation
* Failure handling
* Client-specific integrations

Do not replace the existing RAG architecture.

This layer must work alongside the existing:

* Website
* Next.js API
* n8n
* AI Agent
* Supabase
* PostgreSQL
* pgvector
* Knowledge Base
* Human escalation

---

# 1. Core Principle

Separate information into three categories.

```text
STATIC BUSINESS KNOWLEDGE
        ↓
       RAG

LIVE BUSINESS DATA
        ↓
      TOOLS/APIs

BUSINESS ACTIONS
        ↓
   ACTION TOOLS
```

Never force real-time data into the vector database.

Never use stale RAG information for data that changes frequently.

---

# 2. Source Selection Architecture

The AI agent must intelligently determine where information should come from.

```text
                         USER QUESTION
                              │
                              ▼
                         AI AGENT
                              │
              ┌───────────────┼────────────────┐
              │               │                │
              ▼               ▼                ▼
         GENERAL         KNOWLEDGE         REAL-TIME
         QUESTION           RAG               TOOL
              │               │                │
              ▼               ▼                ▼
             LLM          pgvector        API / DB
              │               │                │
              └───────────────┼────────────────┘
                              ▼
                          RESPONSE
```

Do not blindly call RAG for every question.

Do not blindly call tools for every question.

Select the minimum reliable source required to answer the question.

---

# 3. Knowledge Base Questions

Use RAG for relatively stable information.

Examples:

* Refund policies
* Shipping policies
* Warranty
* Product manuals
* FAQs
* Terms and conditions
* Company information
* Troubleshooting guides
* Product documentation
* Support procedures

Example:

```text
Customer:
"What is your refund policy?"

Source:
RAG
```

---

# 4. Real-Time Information

Use tools/API/database queries for information that can change.

Examples:

* Order status
* Order tracking
* Inventory
* Current price
* Customer account status
* Subscription status
* Appointment availability
* Delivery status
* Payment status
* Current ticket status
* Current product availability

Example:

```text
Customer:
"Where is my order #ORD-5007?"

Source:
Order API / Database
```

Never answer this question from an old vector embedding.

---

# 5. Business Actions

Treat actions separately from information retrieval.

Examples:

```text
cancel_order()
request_refund()
create_support_ticket()
update_customer()
change_address()
book_appointment()
cancel_appointment()
update_subscription()
```

Actions must require appropriate validation and authorization.

Never allow the LLM to execute arbitrary database queries or arbitrary API requests.

---

# 6. Standard Tool Set

Create a reusable tool architecture.

Recommended tools:

```text
get_customer(customer_id)

get_customer_orders(customer_id)

get_order_status(order_id)

get_order_details(order_id)

check_inventory(product_id)

get_product(product_id)

get_current_price(product_id)

get_subscription(customer_id)

get_ticket(ticket_id)

create_support_ticket(customer_id, conversation_id, issue)

request_human_support(customer_id, conversation_id, reason)
```

Action tools may include:

```text
cancel_order(order_id)

request_refund(order_id, reason)

update_customer(customer_id, fields)

change_shipping_address(order_id, address)
```

Only expose tools that are actually supported by the client's backend.

---

# 7. Tool Contracts

Every tool must have:

* Name
* Description
* Input schema
* Output schema
* Validation
* Error response
* Authorization requirements
* Timeout
* Logging

Example:

```json
{
  "name": "get_order_status",
  "description": "Returns the current status of a customer's order.",
  "input": {
    "order_id": "string"
  },
  "output": {
    "order_id": "string",
    "status": "string",
    "tracking_number": "string|null",
    "estimated_delivery": "string|null"
  }
}
```

The AI should understand exactly when the tool should be used.

---

# 8. Never Trust LLM-Generated IDs

Never blindly execute:

```text
get_order_status(order_id)
```

just because the LLM supplied an order ID.

Validate:

1. Order ID format
2. Customer ownership
3. Authorization
4. Order existence

Example:

```text
Customer:
"Give me the status of order ORD-5007."

AI
 ↓
Extract order ID
 ↓
Validate order ID
 ↓
Check order belongs to customer
 ↓
Query order
 ↓
Return result
```

If ownership cannot be verified:

```text
Do not disclose order information.
```

---

# 9. RAG + Real-Time Combination

Some questions require multiple sources.

Example:

```text
Customer:
"Can I return the monitor I bought 15 days ago?"
```

The system should combine:

```text
Refund Policy
        +
Customer Order
        ↓
      AI
        ↓
Final Answer
```

Flow:

```text
Question
   ↓
AI Agent
   ├── RAG Search
   │      ↓
   │   Return Policy
   │
   └── get_order_details()
          ↓
       Purchase date
   ↓
LLM reasoning
   ↓
Answer
```

The final response must clearly distinguish policy information from customer-specific information.

---

# 10. Multi-Source Example

Question:

```text
"Can I cancel order ORD-5007?"
```

The agent may need:

```text
1. Order status → Real-time tool
2. Cancellation policy → RAG
3. Customer ownership → Database
4. Cancellation action → Action tool
```

Architecture:

```text
                 QUESTION
                    │
                    ▼
                 AI AGENT
                    │
          ┌─────────┼──────────┐
          ▼         ▼          ▼
       Order DB    RAG      Customer DB
          │         │          │
          └─────────┼──────────┘
                    ▼
               Eligibility
                    │
                    ▼
             Ask confirmation
                    │
                    ▼
             cancel_order()
                    │
                    ▼
              Confirmation
```

Never perform destructive actions without appropriate confirmation and authorization.

---

# 11. Read vs Write Tools

Classify tools.

## Read-only tools

Safe information retrieval:

```text
get_order_status()
get_customer_orders()
get_product()
check_inventory()
get_subscription()
get_ticket()
```

## Write/action tools

Modify state:

```text
cancel_order()
request_refund()
update_customer()
change_address()
create_ticket()
```

The agent should treat write tools with additional caution.

---

# 12. Confirmation Policy

For potentially destructive actions:

```text
Customer:
"Cancel my order."

AI:
"I can cancel order ORD-5007. This action cannot be undone.
Would you like me to proceed?"
```

Only after confirmation:

```text
cancel_order()
```

Do not allow ambiguous messages to trigger destructive operations.

---

# 13. Client Integration Layer

The platform must be reusable across clients.

Do not hard-code one company's API.

Support integrations through:

```text
REST API
GraphQL API
PostgreSQL
Supabase
Shopify
WooCommerce
CRM
Helpdesk
Calendar
Booking system
Custom backend
```

The exact integration should be configurable.

---

# 14. REST API Tool Architecture

For external client APIs:

```text
AI Agent
   ↓
n8n Tool
   ↓
HTTP Request
   ↓
Client API
   ↓
JSON Response
   ↓
Validation
   ↓
AI Agent
```

Never expose client API credentials to the frontend.

Store credentials in n8n's credential system or secure server-side configuration.

---

# 15. Database Tool Architecture

For database-backed clients:

```text
AI Agent
   ↓
Controlled DB Tool
   ↓
Parameterized Query
   ↓
PostgreSQL
   ↓
Validated Result
   ↓
AI Agent
```

Never allow the LLM to generate unrestricted SQL.

Do not expose:

```text
DROP
DELETE
ALTER
UPDATE
INSERT
```

unless explicitly implemented as controlled business functions with authorization.

---

# 16. Tool Error Handling

Every tool must handle:

```text
API timeout
404
401
403
429
500
database failure
invalid input
missing data
malformed response
```

Example:

```text
Tool failed
    ↓
Retry if appropriate
    ↓
Still failed?
    ↓
Do not hallucinate
    ↓
Tell customer the information is temporarily unavailable
    ↓
Offer human escalation
```

---

# 17. API Timeouts

Do not allow an external API to block the entire conversation indefinitely.

Use reasonable timeouts.

If a tool times out:

```text
"I’m unable to retrieve that information right now.
Would you like me to connect you with support?"
```

Log the underlying error internally.

Do not expose stack traces.

---

# 18. API Rate Limits

Handle HTTP 429 responses.

Possible strategy:

```text
Request
 ↓
429
 ↓
Short retry
 ↓
Still unavailable
 ↓
Fallback
```

Do not perform unlimited retries.

---

# 19. Tool Response Validation

Never assume the external API returned valid data.

Validate the response before giving it to the LLM.

Example:

```json
{
  "order_id": "ORD-5007",
  "status": "shipped",
  "tracking_number": "TRK-98234108",
  "estimated_delivery": "2026-08-20"
}
```

Verify required fields before using them.

If invalid:

```text
Tool result invalid
        ↓
Do not generate factual answer
        ↓
Fallback / escalation
```

---

# 20. Freshness Rules

Classify data by freshness.

## Static

Use RAG:

```text
Warranty policy
Refund policy
Product manual
```

## Frequently changing

Use API/database:

```text
Inventory
Prices
Orders
Subscriptions
```

## Highly dynamic

Always use real-time source:

```text
Order tracking
Appointment slots
Live inventory
Current account balance
```

Never use stale embeddings for highly dynamic information.

---

# 21. Caching

Caching may be used for safe read-only information.

Examples:

```text
Product specifications
Public FAQ
Static product metadata
```

Do not cache highly dynamic customer-specific information unless the cache invalidation strategy is reliable.

Never cache sensitive information in the browser.

---

# 22. General Knowledge

The AI may answer general questions that do not require business knowledge.

Example:

```text
Customer:
"What is HTTP?"

Answer:
General LLM knowledge.
```

However, business-specific claims must use company sources.

Example:

```text
"What is your refund policy?"

Required:
Company RAG.
```

The AI must not substitute general knowledge for company-specific information.

---

# 23. Unknown Questions

If a question is outside the company's knowledge and does not have a supported tool:

Do not fabricate an answer.

Use:

```text
I don't currently have enough information to answer that accurately.
I can connect you with a support specialist if you'd like.
```

Do not automatically treat every unknown question as a system failure.

---

# 24. Intelligent Routing

The routing system should distinguish:

```text
GENERAL
KNOWLEDGE
REAL_TIME_DATA
ACTION
MULTI_SOURCE
HUMAN_ESCALATION
UNKNOWN
```

Example:

```text
"What is your warranty?"
→ KNOWLEDGE

"Where is my order?"
→ REAL_TIME_DATA

"Cancel my order."
→ ACTION

"Can I return the order I bought 15 days ago?"
→ MULTI_SOURCE

"Speak to a human."
→ HUMAN_ESCALATION

"What is quantum computing?"
→ GENERAL
```

---

# 25. Confidence and Source Validation

The AI must consider:

* Retrieval relevance
* Tool success
* Tool result validity
* Source freshness
* User authorization
* Question ambiguity

Never rely solely on an LLM-generated confidence score.

Use actual system signals wherever possible.

---

# 26. Response Generation

The final response should be based on verified information.

Example:

```text
RAG:
Refunds allowed within 30 days.

Tool:
Order purchased 15 days ago.

AI:
Your order is eligible for a return because it was purchased
15 days ago and your return policy allows returns within 30 days.
```

Do not claim:

```text
"Your refund has been processed."
```

unless the action tool actually succeeded.

---

# 27. Action Result Verification

After a write action:

```text
cancel_order()
```

verify the result.

Bad:

```text
Tool call failed
 ↓
AI says:
"Your order has been cancelled."
```

Correct:

```text
cancel_order()
 ↓
API confirms success
 ↓
AI:
"Your order has been cancelled successfully."
```

---

# 28. Audit Logging

Log tool activity.

Store:

```text
conversation_id
customer_id
tool_name
input_metadata
success
failure
timestamp
response_summary
```

Never log:

```text
passwords
API keys
access tokens
private secrets
```

Sensitive fields must be redacted.

---

# 29. Human Escalation

Escalate when:

* Tool repeatedly fails
* Customer requests a human
* Data cannot be verified
* Customer needs an unsupported action
* Sensitive case requires human review
* Business policy is ambiguous
* Authorization cannot be established

Escalation should include:

```text
customer_id
conversation_id
reason
intent
recent conversation
relevant RAG sources
tool failures
priority
```

---

# 30. Website UX

The website should make tool usage feel natural.

Do not expose internal tool names.

Bad:

```text
Calling get_order_status()
```

Good:

```text
Checking your order status...
```

Bad:

```text
RAG retrieval failed.
```

Good:

```text
I'm having trouble accessing that information right now.
```

---

# 31. Admin Integration Configuration

The admin system should eventually allow a client to configure supported data sources.

Example:

```text
Integrations

✓ Knowledge Base
✓ Orders API
✓ Customer Database

+ Add Integration
```

Possible fields:

```text
Integration Name
Type
Base URL
Authentication
Available Operations
Status
Last Successful Request
```

Never display secrets after saving.

---

# 32. Client Onboarding

A new client should provide:

```text
1. Company documents
2. FAQ
3. Product information
4. Policies
5. API documentation
6. API credentials
7. Database/API access
8. Support email
9. Escalation rules
```

The system should then configure:

```text
RAG
+
Tools
+
Data sources
+
Escalation
```

without rebuilding the entire application.

---

# 33. Example E-Commerce Client

For an e-commerce client:

```text
RAG
├── Refund Policy
├── Shipping Policy
├── Warranty
├── Product Manuals
└── FAQ

REAL-TIME
├── Orders
├── Inventory
├── Prices
├── Tracking
└── Customer Account

ACTIONS
├── Cancel Order
├── Request Refund
├── Create Ticket
└── Update Address
```

---

# 34. Example SaaS Client

For a SaaS client:

```text
RAG
├── Documentation
├── Pricing
├── Terms
├── Setup Guides
└── FAQ

REAL-TIME
├── Subscription
├── Usage
├── Account
└── Service Status

ACTIONS
├── Create Ticket
├── Change Plan
├── Cancel Subscription
└── Escalate
```

---

# 35. Final Architecture

The completed system should follow:

```text
                         CUSTOMER
                            │
                            ▼
                       WEBSITE CHAT
                            │
                            ▼
                       NEXT.JS API
                            │
                            ▼
                           n8n
                            │
                            ▼
                       AI SUPPORT
                          AGENT
                            │
          ┌─────────────────┼──────────────────┐
          │                 │                  │
          ▼                 ▼                  ▼
       KNOWLEDGE         REAL-TIME          ACTIONS
          RAG              TOOLS              TOOLS
          │                 │                  │
          ▼                 ▼                  ▼
      pgvector         APIs / DBs          APIs / DBs
          │                 │                  │
          └─────────────────┼──────────────────┘
                            │
                            ▼
                     SOURCE VALIDATION
                            │
                            ▼
                      RESPONSE / ACTION
                            │
                            ▼
                         CUSTOMER
```

---

# 36. Final Acceptance Criteria

The system is complete when it can correctly handle all of these:

### Static knowledge

```text
"What is your refund policy?"
→ RAG
```

### Real-time data

```text
"Where is order ORD-5007?"
→ Order API/database
```

### Action

```text
"Cancel order ORD-5007."
→ Confirmation
→ Action tool
→ Verified result
```

### Multi-source

```text
"Can I return the order I bought 15 days ago?"
→ RAG policy
→ Order data
→ Combined answer
```

### General knowledge

```text
"What is an API?"
→ General LLM knowledge
```

### Unknown business question

```text
"What is your policy on something not documented?"
→ No hallucination
→ Offer escalation
```

### Tool failure

```text
Order API unavailable
→ No fabricated status
→ Friendly fallback
→ Escalation option
```

### Security

```text
Customer cannot access:
- Other customers' orders
- API credentials
- Internal prompts
- Database credentials
- Unauthorized actions
```

---

# 37. Product Positioning

The final product should not be described as:

> "An n8n chatbot."

Position it as:

> **AI Customer Support Automation Platform with RAG, Real-Time Business Data, Tool Calling, and Human Escalation.**

Core capabilities:

```text
LLM
+
RAG
+
Real-Time APIs
+
Database Tools
+
Business Actions
+
n8n Automation
+
Supabase
+
Human Escalation
```

The architecture must remain modular so the same platform can be adapted to different Fiverr clients without rebuilding the core application.










Inspect the authentication implementation for the `/login` page.

There are two separate login methods:

1. Continue with Google
2. Sign In with Email

The Google OAuth flow should remain unchanged.

BUG:
The "Sign In with Email" form appears to authenticate a user even when the correct email address is entered with an incorrect password.

Investigate the complete email/password authentication flow.

Check:

* login page
* login API route
* NextAuth configuration
* CredentialsProvider/authorize function if present
* user lookup
* password hashing
* password comparison
* session/JWT creation
* demo/test-account authentication logic

IMPORTANT:

* Do not modify Google OAuth.
* Do not remove the existing one-click test accounts.
* Do not weaken authentication to make tests pass.
* Passwords must NEVER be stored as plaintext.
* Use the existing password hashing strategy if one already exists.
* Verify the supplied password against the stored password hash.
* If the email does not exist OR the password is incorrect, authentication must fail.
* Do not create a session/JWT when credentials are invalid.
* Return a generic authentication error such as "Invalid email or password" rather than revealing whether the email exists.
* Preserve the existing UI unless a UI change is required.

Also check whether the test accounts are bypassing normal password validation. If they are intentionally demo-only accounts, keep that behavior isolated and clearly separated from real user authentication.

After fixing it, test these cases:

1. Correct email + correct password → SUCCESS
2. Correct email + wrong password → FAIL
3. Wrong email + any password → FAIL
4. Empty email → FAIL
5. Empty password → FAIL
6. Google OAuth → still works
7. Test account one-click login → still works as intended

Finally report:

* Root cause of the bug
* Files changed
* Authentication mechanism currently used
* Password hashing algorithm
* How invalid credentials are rejected
* Test results
# SKILL.md

# Production-Grade Real-World Medical AI Agent with Supabase

## 1. Purpose

Transform the existing Medical AI Assistant project from a **bot simulation/demo** into a **real-world multi-user medical appointment platform**.

The existing UI, AI agent, workflows, and features should be preserved where practical.

The objective is **not to rebuild the application from scratch**.

The objective is to replace simulated data and fake identities with:

* Real user authentication
* Real patient accounts
* Real doctor accounts
* Real doctor profiles
* Real doctor verification
* Real doctor availability
* Real appointment records
* Real patient ↔ doctor relationships
* Real database persistence
* Real authorization
* Real AI tool execution
* Real Supabase integration
* Real logout/login behavior
* Production-grade security

---

# 2. Core Architecture

The final architecture must follow:

```text
                         USER
                           │
                           ▼
                  ┌─────────────────┐
                  │   FRONTEND APP  │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ SUPABASE AUTH   │
                  └────────┬────────┘
                           │
                     Authenticated
                         Session
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
           PATIENT       DOCTOR        ADMIN
              │            │            │
              └────────────┼────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │   AI AGENT      │
                  │ LangGraph/etc.  │
                  └────────┬────────┘
                           │
                     Trusted Tools
                           │
                           ▼
                  ┌─────────────────┐
                  │ BACKEND / API    │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │    SUPABASE      │
                  │                 │
                  │ Auth             │
                  │ PostgreSQL       │
                  │ RLS              │
                  │ Storage          │
                  │ Realtime         │
                  └─────────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
            USERS        DOCTORS    APPOINTMENTS
```

### Fundamental principle

```text
LLM ≠ Database
LLM ≠ Doctor
LLM ≠ Patient
LLM ≠ Appointment System

LLM → orchestrates trusted application tools
```

The AI must never become the source of truth.

**Supabase/PostgreSQL is the source of truth.**

---

# 3. Replace the Existing Bot Simulation

The existing project may contain:

```text
Bot Doctor
Bot Patient
Bot Receptionist
Random Doctor
Demo User
Mock Appointment
Fake Doctor
Hardcoded Patient
```

These must NOT be used in production.

Remove hardcoded production data such as:

```javascript
const doctors = [
    {
        name: "Dr. Random",
        id: "doctor-1"
    }
];
```

Replace it with real Supabase queries.

Correct:

```text
Frontend
   ↓
Backend/service
   ↓
Supabase
   ↓
doctor_profiles
   ↓
Real doctor
```

Mock data may only exist inside:

```text
tests/
development/
seed/
fixtures/
```

It must never silently appear in production.

---

# 4. Supabase Is the Backend Foundation

Use Supabase for:

```text
Supabase Auth
PostgreSQL
Row Level Security
Storage
Realtime
Database migrations
```

The application must connect to a real Supabase project.

Do NOT use an in-memory database as the primary production database.

Do NOT use frontend-only state as persistent application state.

---

# 5. Supabase Project Configuration

Configure:

```text
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

Rules:

### Frontend

The frontend may use:

```text
SUPABASE_URL
SUPABASE_ANON_KEY
```

The frontend must NEVER contain:

```text
SUPABASE_SERVICE_ROLE_KEY
```

### Server

The service-role key may only exist in:

```text
server environment
secure backend environment variables
deployment secret manager
```

Never commit secrets to Git.

Never place service-role credentials in:

```text
React
Next.js client components
browser JavaScript
public/
.env committed to Git
```

---

# 6. Authentication

Use **Supabase Auth** as the application's authentication system.

Required functionality:

```text
Sign Up
Login
Logout
Session persistence
Session restoration
Password reset
Email verification where appropriate
```

The application startup flow must be:

```text
Application Starts
       ↓
Check Supabase Session
       │
       ├── No Session
       │      ↓
       │    Login
       │
       └── Valid Session
              ↓
           Load User
              ↓
        Determine Role
              ↓
           Dashboard
```

Never open the authenticated dashboard for an unauthenticated user.

---

# 7. Logout Must Work Correctly

The current application has reverse logout behavior where the user may reach the dashboard and then logout incorrectly.

Fix this.

Correct:

```text
Dashboard
   ↓
Logout
   ↓
supabase.auth.signOut()
   ↓
Session invalidated
   ↓
Login page
```

After logout:

* Clear authenticated frontend state
* Clear cached private data
* Redirect to login
* Prevent protected routes from rendering
* Prevent API requests using stale authentication state

A logged-out user must not be able to access:

```text
/dashboard
/patient
/doctor
/appointments
/profile
```

or equivalent protected routes.

---

# 8. Database Architecture

Use PostgreSQL through Supabase.

Recommended tables:

```text
profiles
patient_profiles
doctor_profiles
doctor_availability
doctor_schedule_exceptions
appointments
notifications
audit_logs
```

Supabase Auth maintains authentication identities.

Application tables reference the authenticated user's ID.

---

# 9. Profiles Table

Create a general profile table:

```text
profiles
--------------------------------
id
full_name
role
phone
avatar_url
created_at
updated_at
```

Where:

```text
id = auth.users.id
```

Roles:

```text
patient
doctor
admin
```

Do not rely only on frontend state to determine a user's role.

The backend/database must enforce authorization.

---

# 10. Patient Profiles

Create:

```text
patient_profiles
--------------------------------
id
user_id
date_of_birth
gender
emergency_contact
created_at
updated_at
```

Relationship:

```text
auth.users
    │
    └── profiles
            │
            └── patient_profiles
```

The `user_id` must reference the authenticated user.

---

# 11. Doctor Profiles

Create:

```text
doctor_profiles
--------------------------------
id
user_id
specialization
license_number
bio
experience_years
consultation_fee
verification_status
created_at
updated_at
```

Possible verification statuses:

```text
pending
verified
rejected
suspended
```

Only verified doctors should normally be available for appointment booking.

---

# 12. Real Doctor Accounts

Doctors are real authenticated users.

Example:

```text
auth.users
--------------------------------
id: abc123
email: rahul@example.com
```

```text
profiles
--------------------------------
id: abc123
full_name: Rahul Sharma
role: doctor
```

```text
doctor_profiles
--------------------------------
user_id: abc123
specialization: Cardiology
verification_status: verified
```

Therefore:

```text
Dr. Rahul Sharma
```

is a real account backed by Supabase.

It is NOT:

```text
Bot Doctor
```

and NOT an LLM-generated identity.

---

# 13. Doctor Registration

Doctor onboarding should follow:

```text
Doctor Sign Up
       ↓
Create Supabase Auth account
       ↓
Create profile
       ↓
Submit doctor information
       ↓
verification_status = pending
       ↓
Admin reviews
       ↓
verified
       ↓
Doctor becomes bookable
```

Never allow a user to become a verified doctor simply because the frontend sends:

```json
{
  "role": "doctor"
}
```

Role changes must be protected.

---

# 14. Doctor Availability

Create:

```text
doctor_availability
--------------------------------
id
doctor_id
day_of_week
start_time
end_time
is_available
created_at
updated_at
```

For exceptions:

```text
doctor_schedule_exceptions
--------------------------------
id
doctor_id
date
start_time
end_time
status
reason
```

Possible exception statuses:

```text
available
unavailable
leave
holiday
```

Availability must be calculated from real database records.

The AI must never invent availability.

---

# 15. Appointment Table

Create:

```text
appointments
--------------------------------
id
patient_id
doctor_id
scheduled_start
scheduled_end
status
reason
notes
created_at
updated_at
```

Possible statuses:

```text
requested
confirmed
cancelled
completed
no_show
rescheduled
```

Relationship:

```text
Patient
   │
   │ patient_id
   ▼
Appointment
   │
   │ doctor_id
   ▼
Doctor
```

This is the real relationship between two users.

---

# 16. Appointment Booking

The complete flow:

```text
User
 ↓
AI Agent
 ↓
Understand appointment request
 ↓
Collect missing information
 ↓
Search real doctors
 ↓
Check real availability
 ↓
Show available slots
 ↓
User chooses slot
 ↓
Ask for confirmation
 ↓
User confirms
 ↓
Backend validates slot again
 ↓
Create appointment
 ↓
Return real appointment
 ↓
Notify patient/doctor
```

Example:

```text
User:
"I want a cardiologist tomorrow."
```

AI:

```text
search_doctors("cardiology")
```

Backend:

```text
Dr. Rahul Sharma
Dr. Priya Rao
```

AI:

```text
get_doctor_availability(
    doctor_id = actual_database_id,
    date = tomorrow
)
```

Backend returns actual slots.

The AI presents those slots.

User selects one.

AI requests confirmation.

Only after confirmation:

```text
book_appointment()
```

---

# 17. Never Trust AI-Generated IDs

The AI must NEVER invent:

```text
doctor_id
patient_id
appointment_id
slot_id
user_id
```

Correct:

```text
AI
 ↓
search_doctors()
 ↓
Supabase
 ↓
actual doctor_id
 ↓
AI
 ↓
get_availability(doctor_id)
```

The IDs passed into subsequent operations must originate from trusted tool responses.

---

# 18. Never Trust Frontend Identity

Do not accept:

```json
{
  "patient_id": "some-id"
}
```

from the browser as the authoritative identity.

Instead:

```text
Supabase Auth Session
        ↓
Authenticated User ID
        ↓
profiles
        ↓
patient_profiles
        ↓
patient_id
```

The backend determines who is making the request.

---

# 19. AI Agent Tools

The AI should have controlled tools such as:

```text
search_doctors
get_doctor_profile
get_doctor_availability
book_appointment
get_my_appointments
get_appointment
cancel_appointment
request_reschedule
get_my_profile
```

Optional:

```text
send_notification
create_support_request
```

The AI should NOT receive unrestricted SQL access.

Bad:

```text
LLM
 ↓
raw SQL
 ↓
entire database
```

Good:

```text
LLM
 ↓
restricted tool
 ↓
backend service
 ↓
authorization
 ↓
Supabase
```

---

# 20. Tool Contracts

Tools must use strict schemas.

Example:

```typescript
searchDoctors({
    specialization?: string,
    date?: string
})
```

```typescript
getDoctorAvailability({
    doctorId: string,
    date: string
})
```

```typescript
bookAppointment({
    doctorId: string,
    slotId: string,
    reason?: string
})
```

Notice:

```text
patientId
```

does not need to come from the LLM.

The backend obtains the authenticated patient.

---

# 21. AI Agent State

For LangGraph or equivalent orchestration:

```typescript
type MedicalAgentState = {
    userId: string;
    role: "patient" | "doctor" | "admin";

    intent?: string;

    specialization?: string;
    doctorId?: string;

    requestedDate?: string;
    selectedSlotId?: string;

    appointmentId?: string;

    awaitingConfirmation?: boolean;

    error?: string;
};
```

`userId` must come from trusted authentication context.

It must not be accepted from arbitrary user text.

---

# 22. Recommended Agent Workflow

```text
START
  ↓
Authenticate User
  ↓
Load User Context
  ↓
Understand Intent
  ↓
Collect Missing Information
  ↓
Search Doctors
  ↓
Check Availability
  ↓
Present Options
  ↓
User Selection
  ↓
Confirmation
  ↓
Validate Availability Again
  ↓
Book Appointment
  ↓
Create Notification
  ↓
Return Confirmation
  ↓
END
```

LangGraph is recommended for complex stateful workflows.

Do not allow the LLM to freely execute arbitrary application operations.

---

# 23. Supabase Row Level Security

RLS is mandatory.

Enable RLS on all user-sensitive tables.

Examples:

```text
profiles
patient_profiles
doctor_profiles
appointments
notifications
doctor_availability
```

A patient should only access permitted records.

Conceptually:

```text
auth.uid()
   ↓
profiles.id
   ↓
patient_profiles.user_id
   ↓
appointments.patient_id
```

A doctor should only manage their own availability and appointments.

An ordinary user must not be able to query another user's private records.

---

# 24. Patient Authorization

Patient permissions:

```text
✓ View own profile
✓ Update permitted profile information
✓ Search verified doctors
✓ View public doctor profiles
✓ View available slots
✓ Book appointments
✓ View own appointments
✓ Cancel own appointments
✓ Request rescheduling
```

Patient must NOT:

```text
✗ View another patient's records
✗ Modify another patient's appointments
✗ Modify doctor verification
✗ Modify doctor availability
✗ Access admin functions
```

---

# 25. Doctor Authorization

Doctor permissions:

```text
✓ View own profile
✓ Update permitted profile fields
✓ Manage own availability
✓ View own appointments
✓ Manage permitted appointment states
✓ View information necessary for their appointments
```

Doctor must NOT:

```text
✗ Modify another doctor's profile
✗ Modify another doctor's availability
✗ Access unrelated patient information
✗ Modify admin settings
```

---

# 26. Admin Authorization

Admin permissions may include:

```text
✓ Verify doctors
✓ Reject doctor applications
✓ Suspend doctors
✓ Manage users
✓ Review platform activity
✓ Manage system configuration
```

Admin permissions must be enforced server-side.

Never expose admin capability simply by hiding a frontend button.

---

# 27. Double Booking Prevention

This is mandatory.

The booking process must not rely on:

```text
check availability
     ↓
book later
```

without transactional protection.

Correct:

```text
BEGIN TRANSACTION
       ↓
Validate slot
       ↓
Lock/check availability
       ↓
Create appointment
       ↓
COMMIT
```

The database must prevent two users from successfully booking the same slot.

Use appropriate PostgreSQL constraints, transactions, locking, or an atomic booking function.

The exact implementation should match the application's appointment model.

---

# 28. Supabase Database Functions

For sensitive operations such as booking, consider using a PostgreSQL function/RPC.

Conceptually:

```text
book_appointment(
    doctor_id,
    slot_id,
    patient derived from auth.uid()
)
```

The function should:

```text
1. Identify authenticated user
2. Verify patient
3. Verify doctor
4. Verify doctor is verified
5. Verify slot exists
6. Verify slot is still available
7. Prevent double booking
8. Create appointment
9. Return appointment
```

This prevents business-critical logic from depending entirely on the client.

---

# 29. Never Fake Successful Operations

The AI must never say:

```text
"Your appointment has been booked."
```

unless the backend actually confirms:

```text
success = true
appointment_id = real ID
```

If Supabase returns an error:

```text
SLOT_UNAVAILABLE
```

the AI must explain that the slot is no longer available.

If booking fails:

```text
The appointment could not be booked.
```

Do not hallucinate success.

---

# 30. Appointment Confirmation

Before important actions:

```text
AI:
"I found Dr. Sharma at 3 PM tomorrow.
Would you like me to book this appointment?"

User:
"Yes."

AI
 ↓
book_appointment()
```

This confirmation is required for booking unless the product requirements explicitly define a different trusted flow.

---

# 31. Cancellation

Cancellation must verify:

```text
appointment exists
AND
authenticated user owns appointment / is authorized
AND
appointment can still be cancelled
```

Patient A must never be able to cancel Patient B's appointment.

---

# 32. Rescheduling

Use:

```text
Existing Appointment
       ↓
Request Reschedule
       ↓
Find New Availability
       ↓
User Selects Slot
       ↓
Confirm
       ↓
Validate Again
       ↓
Atomic Update
```

Do not blindly overwrite the appointment.

---

# 33. Real-Time Updates

Where useful, use Supabase Realtime.

Examples:

```text
Patient books appointment
       ↓
Doctor dashboard updates
```

```text
Doctor confirms appointment
       ↓
Patient dashboard updates
```

```text
Appointment cancelled
       ↓
Both relevant dashboards update
```

Realtime should never bypass authorization.

---

# 34. Notifications

Create:

```text
notifications
--------------------------------
id
user_id
type
title
message
appointment_id
read
created_at
```

Example events:

```text
APPOINTMENT_BOOKED
APPOINTMENT_CONFIRMED
APPOINTMENT_CANCELLED
APPOINTMENT_RESCHEDULED
DOCTOR_VERIFIED
```

Notifications must be created based on actual database events.

Never tell the user a notification was sent unless the notification system confirms it.

---

# 35. Supabase Storage

Use Supabase Storage for appropriate uploaded assets.

Potential buckets:

```text
avatars
doctor-documents
medical-documents
```

Sensitive files must have appropriate private bucket policies.

Do not make medical documents publicly accessible.

Use signed URLs or authorized access where appropriate.

Do not expose storage service credentials to the browser.

---

# 36. Medical Data Security

The system may eventually handle highly sensitive medical information.

Therefore:

* Use HTTPS
* Protect authentication sessions
* Use RLS
* Use least-privilege access
* Protect private storage
* Never expose service-role keys
* Never log sensitive medical information unnecessarily
* Avoid putting sensitive information into client-side analytics
* Add audit logging
* Restrict AI access to only necessary information
* Encrypt sensitive data where appropriate
* Follow applicable healthcare/privacy laws for the deployment jurisdiction

The application must not assume that an LLM should have unrestricted access to a patient's medical history.

---

# 37. Audit Logging

Create:

```text
audit_logs
--------------------------------
id
user_id
action
resource_type
resource_id
metadata
created_at
```

Examples:

```text
USER_LOGIN
USER_LOGOUT
APPOINTMENT_CREATED
APPOINTMENT_CANCELLED
APPOINTMENT_RESCHEDULED
DOCTOR_VERIFIED
DOCTOR_REJECTED
PROFILE_UPDATED
```

Do not store unnecessary sensitive medical information in logs.

---

# 38. Real Dashboard

After login:

```text
role = patient
    ↓
Patient Dashboard
```

```text
role = doctor
    ↓
Doctor Dashboard
```

```text
role = admin
    ↓
Admin Dashboard
```

Patient dashboard should display real Supabase data:

```text
Welcome, Asmit

Upcoming Appointment

Dr. Rahul Sharma
Cardiologist
August 16, 2026
3:00 PM

[View Appointment]

AI Medical Assistant
"What can I help you with?"
```

Doctor dashboard:

```text
Welcome, Dr. Rahul Sharma

Today's Appointments

10:00 AM — Patient
11:30 AM — Patient
3:00 PM — Patient

[Manage Availability]
```

No hardcoded names.

---

# 39. Doctor Search

Doctor search must query verified doctors.

Conceptually:

```sql
SELECT
    d.id,
    p.full_name,
    d.specialization,
    d.bio,
    d.experience_years
FROM doctor_profiles d
JOIN profiles p
    ON p.id = d.user_id
WHERE
    p.role = 'doctor'
    AND d.verification_status = 'verified';
```

The actual implementation should follow the project's existing Supabase schema.

---

# 40. Data Flow Example

User:

```text
"I want to see a dermatologist tomorrow."
```

Flow:

```text
USER
 ↓
Frontend
 ↓
Authenticated Supabase Session
 ↓
AI Agent
 ↓
search_doctors()
 ↓
Supabase PostgreSQL
 ↓
Verified Doctors
 ↓
get_doctor_availability()
 ↓
Supabase PostgreSQL
 ↓
Available Slots
 ↓
AI
 ↓
User selects slot
 ↓
AI asks confirmation
 ↓
User confirms
 ↓
book_appointment()
 ↓
Backend / Supabase RPC
 ↓
Authorization
 ↓
Transaction
 ↓
appointments
 ↓
notification
 ↓
AI confirmation
```

---

# 41. Example Tool Flow

### Search

```text
search_doctors({
    specialization: "dermatology"
})
```

returns:

```json
{
    "success": true,
    "doctors": [
        {
            "id": "real-doctor-id",
            "name": "Dr. Priya Rao",
            "specialization": "Dermatology"
        }
    ]
}
```

### Availability

```text
get_doctor_availability({
    doctorId: "real-doctor-id",
    date: "2026-08-16"
})
```

returns:

```json
{
    "success": true,
    "slots": [
        {
            "id": "real-slot-id",
            "start": "10:00",
            "end": "10:30"
        }
    ]
}
```

### Booking

```text
book_appointment({
    doctorId: "real-doctor-id",
    slotId: "real-slot-id"
})
```

Backend derives:

```text
patient_id
```

from authenticated Supabase user.

It returns:

```json
{
    "success": true,
    "appointmentId": "real-appointment-id",
    "status": "confirmed"
}
```

Only then should the AI confirm the appointment.

---

# 42. Environment Variables

Use environment variables.

Example:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=

AI_API_KEY=
```

Never commit actual credentials.

Add:

```text
.env
.env.local
```

to `.gitignore` where appropriate.

Provide:

```text
.env.example
```

with placeholders.

---

# 43. Database Migrations

Do not manually modify production database structure without migration tracking.

Maintain:

```text
supabase/
    migrations/
```

Every schema change should be represented as a migration.

Examples:

```text
001_create_profiles.sql
002_create_patient_profiles.sql
003_create_doctor_profiles.sql
004_create_availability.sql
005_create_appointments.sql
006_create_notifications.sql
007_create_rls_policies.sql
008_create_booking_function.sql
```

Migration names may differ according to the project's existing structure.

---

# 44. Seed Data

Development seed data may contain:

```text
development doctors
development users
development appointments
```

but clearly label them as development/test data.

Production must not depend on fake seed doctors.

Recommended:

```text
supabase/seed.sql
```

for local development only.

---

# 45. Existing Project Migration Strategy

Do NOT immediately rewrite the entire application.

First inspect:

```text
frontend
backend
AI agent
database
authentication
API routes
components
mock data
hardcoded users
hardcoded doctors
appointment logic
environment variables
```

Then identify what is simulated.

Replace components incrementally:

```text
Hardcoded Auth
       ↓
Supabase Auth

Fake Users
       ↓
Supabase profiles

Fake Doctors
       ↓
doctor_profiles

Fake Availability
       ↓
doctor_availability

Fake Appointments
       ↓
appointments

Fake Agent Tools
       ↓
real Supabase-backed tools
```

Preserve the existing UI wherever possible.

---

# 46. Do Not Break Existing AI Features

The AI agent already implemented in the project should remain functional.

Do not remove:

* Existing system prompts
* Existing conversation UI
* Existing RAG functionality
* Existing knowledge base
* Existing agent workflow

unless required for the production migration.

Instead, connect existing AI functionality to real tools and authenticated application state.

---

# 47. RAG vs Database

Do NOT put transactional information into RAG.

Use RAG for:

```text
Medical information
Hospital policies
Doctor information descriptions
FAQ
General healthcare knowledge
Platform documentation
```

Use Supabase/PostgreSQL for:

```text
Users
Doctors
Availability
Appointments
Patient profiles
Notifications
Permissions
Transactional state
```

Example:

```text
"What symptoms can indicate dehydration?"
        ↓
RAG / medical knowledge

"Is Dr. Sharma available tomorrow?"
        ↓
Supabase

"Book Dr. Sharma at 3 PM."
        ↓
Supabase + appointment tool
```

The AI must distinguish knowledge retrieval from transactional operations.

---

# 48. Security Boundary

The final system should follow:

```text
                 ┌─────────────┐
                 │     LLM     │
                 └──────┬──────┘
                        │
                  Controlled Tools
                        │
                        ▼
                 ┌─────────────┐
                 │   Backend   │
                 └──────┬──────┘
                        │
                Authentication
                Authorization
                Business Rules
                        │
                        ▼
                 ┌─────────────┐
                 │  Supabase   │
                 │ PostgreSQL  │
                 │     RLS     │
                 └─────────────┘
```

Never:

```text
LLM
 ↓
Direct unrestricted database access
```

---

# 49. Error Handling

Every tool should return structured errors.

Example:

```json
{
    "success": false,
    "error": "SLOT_UNAVAILABLE"
}
```

Possible errors:

```text
UNAUTHENTICATED
UNAUTHORIZED
DOCTOR_NOT_FOUND
DOCTOR_NOT_VERIFIED
SLOT_NOT_FOUND
SLOT_UNAVAILABLE
APPOINTMENT_NOT_FOUND
BOOKING_FAILED
CANCELLATION_NOT_ALLOWED
```

The AI should convert these into natural language.

Example:

```text
Backend:
SLOT_UNAVAILABLE
```

AI:

```text
"That 3 PM slot was just taken. I can check the doctor's
next available times for you."
```

---

# 50. Testing

Before deployment, test:

## Authentication

```text
[ ] Sign up
[ ] Login
[ ] Logout
[ ] Session persistence
[ ] Session expiration
[ ] Password reset
[ ] Unauthorized route access
```

## Patient

```text
[ ] Patient profile creation
[ ] Patient dashboard
[ ] Doctor search
[ ] Appointment booking
[ ] Appointment viewing
[ ] Appointment cancellation
[ ] Appointment rescheduling
```

## Doctor

```text
[ ] Doctor registration
[ ] Doctor verification
[ ] Doctor dashboard
[ ] Availability management
[ ] Appointment management
```

## Authorization

```text
[ ] Patient cannot access another patient's data
[ ] Patient cannot modify doctor data
[ ] Doctor cannot access another doctor's private data
[ ] Doctor cannot access unrelated patient data
[ ] Non-admin cannot verify doctors
[ ] Service-role key is never exposed
```

## AI

```text
[ ] Booking intent detection
[ ] Missing information handling
[ ] Real doctor search
[ ] Real availability search
[ ] Correct tool selection
[ ] Confirmation before booking
[ ] Correct appointment creation
[ ] Correct error handling
[ ] No hallucinated booking
[ ] No invented doctor
[ ] No invented appointment
```

## Concurrency

```text
[ ] Two users cannot book the same slot
[ ] Booking remains atomic
[ ] Cancel + book race conditions handled
[ ] Rescheduling remains atomic
```

---

# 51. Production Acceptance Checklist

The project is considered successfully converted from simulation to a real-world application only when:

```text
[ ] Supabase project connected
[ ] Supabase Auth implemented
[ ] Login implemented
[ ] Signup implemented
[ ] Logout implemented correctly
[ ] Session persistence implemented
[ ] Protected routes implemented
[ ] Profiles table implemented
[ ] Patient profiles implemented
[ ] Doctor profiles implemented
[ ] Doctor verification implemented
[ ] Doctor availability implemented
[ ] Appointment table implemented
[ ] Notifications implemented
[ ] Audit logging implemented
[ ] Supabase RLS enabled
[ ] RLS policies tested
[ ] Real doctor accounts supported
[ ] Real patient accounts supported
[ ] No production fake doctors
[ ] No production fake patients
[ ] No production bot identities
[ ] No hardcoded appointment records
[ ] Doctor data comes from Supabase
[ ] Availability comes from Supabase
[ ] Appointments persist in Supabase
[ ] AI uses real tools
[ ] AI cannot invent IDs
[ ] Backend derives current user identity
[ ] Service-role key protected
[ ] Booking requires confirmation
[ ] Booking is transactionally safe
[ ] Double booking prevented
[ ] Cancellation authorization implemented
[ ] Rescheduling authorization implemented
[ ] Notifications tied to real events
[ ] AI cannot claim fake success
[ ] RAG separated from transactional data
[ ] Sensitive data protected
[ ] Storage policies configured
[ ] Database migrations created
[ ] Environment variables configured
[ ] Production tests completed
```

---

# 52. Final Target

The final application should behave like this:

```text
                     REAL USER
                         │
                         ▼
                    SIGN UP / LOGIN
                         │
                         ▼
                   SUPABASE AUTH
                         │
                         ▼
                  AUTHENTICATED USER
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
           PATIENT     DOCTOR      ADMIN
              │          │          │
              └──────────┼──────────┘
                         ▼
                     DASHBOARD
                         │
                         ▼
                    AI ASSISTANT
                         │
                         ▼
                  TOOL CALLING
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
        Search Doctor  Availability  Booking
              │          │          │
              └──────────┼──────────┘
                         ▼
                    SUPABASE
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
           USERS      DOCTORS    APPOINTMENTS
                         │
                         ▼
                    NOTIFICATIONS
```

The user should be able to say:

```text
"I need a cardiologist tomorrow."
```

and the system should:

```text
1. Identify the authenticated patient
2. Understand the request
3. Find REAL verified doctors
4. Query REAL availability
5. Present REAL time slots
6. Ask for confirmation
7. Validate the slot again
8. Create a REAL Supabase appointment
9. Associate the appointment with the REAL patient
10. Associate it with the REAL doctor
11. Notify the appropriate users
12. Return the REAL appointment confirmation
```

The doctor should be able to log into a completely separate account and see that appointment.

The patient should be able to log out.

The doctor should be able to log out.

When either logs back in, their data should still exist.

There must be no concept of:

```text
"Bot Doctor"
"Bot Patient"
"Random User"
"Fake Appointment"
"AI-created doctor"
```

in the production application.

---

# 53. Definition of Done

The application is complete when it has transitioned from:

```text
                  DEMO

User
 ↓
AI
 ↓
Fake Doctor
 ↓
Fake Appointment
```

to:

```text
                REAL SYSTEM

Real Patient
      │
      ▼
Supabase Auth
      │
      ▼
AI Agent
      │
      ▼
Authenticated Tool
      │
      ▼
Backend Business Logic
      │
      ▼
Supabase PostgreSQL + RLS
      │
      ├── Real Patient
      ├── Real Doctor
      ├── Real Availability
      └── Real Appointment
              │
              ▼
        Real Notification
```

The AI is the **intelligent interface and orchestrator**.

Supabase is the **identity, persistence, authorization, and data layer**.

The backend is the **business-rule and security boundary**.

The frontend is the **user experience**.

The database contains the **real-world source of truth**.

That is the required architecture for this project to be considered a **real-world AI medical assistant rather than a bot simulation**.
