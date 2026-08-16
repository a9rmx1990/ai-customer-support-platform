# Medical Care Coordination Platform

This project is a medical-only Next.js application for patients, doctors, appointments, secure communication, lab results, clinic knowledge, and support tickets. It does not contain SaaS, shopping, order, or delivery workflows.

## Stack

- Next.js 14 and TypeScript
- Supabase Auth, PostgreSQL, Row Level Security, and Realtime
- n8n connected to the same Supabase PostgreSQL database
- Gemini-powered medical support assistant with clinic knowledge retrieval

## Run locally

```bash
npm install
npm run dev
```

Configure Supabase URL/anon key, service-role key for trusted server jobs, n8n webhook URL/secret, and Gemini credentials in `.env.local`. Apply every SQL file in `supabase/migrations` in numeric order. Import the three workflows under `n8n/` into n8n and configure their Postgres credential to the same Supabase database.

The n8n webhook accepts only requests from the authenticated Next.js API and validates `N8N_WEBHOOK_SECRET`. The application validates Supabase users with `auth.getUser()` before forwarding medical requests.

## Important limitation

This is an engineering baseline, not a HIPAA/medical production certification. Before production, complete a formal threat model, audit logging review, PHI retention policy, encrypted backups, monitoring, incident response, provider agreements, and clinical safety review.
