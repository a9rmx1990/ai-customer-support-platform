# AI Customer Support Platform — Setup & Deployment Guide

This guide walks you through setting up Supabase, n8n, and Next.js from scratch.

---

## Step 1: Database Setup (Supabase / PostgreSQL)

1. Log into your Supabase project (or local PostgreSQL instance).
2. Open the **SQL Editor**.
3. Copy and paste the contents of `database/schema.sql` into the editor.
4. Execute the SQL query.
5. Verify that the `vector` extension is installed and all tables (`customers`, `orders`, `knowledge_chunks`, etc.) are created.

---

## Step 2: n8n Workflow Configuration

1. Launch your n8n instance (Self-hosted via Docker or n8n Cloud).
2. Create PostgreSQL and Google Gemini Credentials in n8n.
3. Import the three workflow JSON files from `n8n/`:
   - `n8n/db-schema-setup.json` -> Run once to confirm DB setup.
   - `n8n/rag-ingestion.json` -> Run to split, embed, and store document chunks in `knowledge_chunks`.
   - `n8n/main-agent.json` -> Activate the workflow and copy the Production Webhook URL.

---

## Step 3: Next.js Frontend Deployment

1. Set up environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   N8N_WEBHOOK_URL=http://localhost:5678/webhook/support-agent
   ```
2. Build and start the Next.js application:
   ```bash
   npm run build
   npm run start
   ```
3. Test all 5 demo scenarios via the interactive interface.
