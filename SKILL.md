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
