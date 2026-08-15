# 🚀 AI Multi-Domain Customer Support & Triage Platform
## Client Handover & Operations Guide

Welcome to your production-ready **AI Customer Support & Escalation Platform**. This system integrates **Next.js 14**, **Google Gemini AI**, **n8n Workflow Automation**, **PostgreSQL pgvector RAG**, and **Real-Time Human Escalation Triage**.

---

### 📌 Quick Start (Local Development)

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local` and set your credentials:
   ```env
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   N8N_WEBHOOK_URL=http://localhost:5678/webhook/support-agent
   GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
   GOOGLE_CLIENT_ID=your_google_oauth_client_id
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

### 📂 Key Repository Structure

- **`app/`**: Next.js 14 App Router routes (`/`, `/chat`, `/tickets`, `/knowledge`, `/architecture`, `/login`, `/signup`).
- **`app/api/`**: Server-side API gateway endpoints (`/api/chat`, `/api/tickets`, `/api/knowledge`, `/api/orders`, `/api/appointments`, `/api/lab-results`).
- **`components/`**: Core UI components (`Navbar.tsx`, `ChatWidget.tsx`, `GoogleSignInButton.tsx`).
- **`lib/`**: Business logic engines (`ai-agent-engine.ts`, `mock-data.ts`, `auth-context.tsx`).
- **`n8n/`**: Production n8n workflow templates:
  - **`n8n/main-agent.json`**: Multi-agent support workflow with memory, tool calling, and response parsing.
  - **`n8n/rag-ingestion.json`**: Document chunking (800/100) & Gemini vector embedding pipeline (`text-embedding-004`).
  - **`n8n/db-schema-setup.json`**: SQL setup script for pgvector and tables (`customers`, `orders`, `knowledge_chunks`, `support_tickets`).

---

### 🩺 Supported Business Domains

1. **Medical / Clinic Support**:
   - Patient Profile Lookup & Health Records (`PAT-2001`, `PAT-2005`)
   - Telehealth & In-Person Appointment Scheduling
   - Diagnostic Lab Results Access
   - Emergency Clinical Triage Protocol

2. **Retail & E-Commerce**:
   - Order Tracking & Status Inquiries (`CUST-1001`, `CUST-1002`)
   - Shipping & Delivery Estimations
   - Refund & Return Processing Policy

3. **Enterprise SaaS**:
   - Subscription Billing & Invoicing
   - API Quotas & Rate Limits
   - Technical Support Ticket Escalation

---

### 📄 Ingesting Client Knowledge (PDF & Document Upload)

1. Navigate to **`http://localhost:3000/knowledge`**.
2. Click **`Upload / Add Document`**.
3. Select **Target Domain** (Medical, Retail, SaaS) and **Category**.
4. Either drag and drop a **PDF / TXT / Markdown file** or paste readable policy text.
5. Click **`Upload & Index PDF`** — the system will parse text, create 1536-dim vector chunks, and make it searchable immediately for AI RAG responses.

---

### 🔐 Demo Accounts & Test Identities

- **Medical Patient Demo**: `eleanor@example.com` (Patient ID: `PAT-2001`)
- **Retail Customer Demo**: `ada@example.com` (Customer ID: `CUST-1001`)
- **Google OAuth Sign-In**: Click **`Sign in with Google`** on `/login` or `/signup` for live single-sign-on.

---

### 🛠️ Production Build & Deployment

To generate an optimized production bundle:
```bash
npm run build
npm run start
```
The build compiles **20/20 routes** with zero compilation errors and static page optimization.
