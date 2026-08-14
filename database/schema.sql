-- ==========================================================
-- AI Customer Support Automation - Database Schema Setup
-- Idempotent PostgreSQL + pgvector schema script.
-- Safe to re-run. Execute ONCE before running n8n workflows.
-- ==========================================================

-- 1. Enable pgvector extension for AI embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Customers Table
CREATE TABLE IF NOT EXISTS customers (
  customer_id TEXT PRIMARY KEY,
  name        TEXT,
  email       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 3. Conversations Table
CREATE TABLE IF NOT EXISTS conversations (
  conversation_id TEXT PRIMARY KEY,
  customer_id     TEXT REFERENCES customers(customer_id) ON DELETE SET NULL,
  status          TEXT DEFAULT 'open',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- 4. Messages Table (Full conversation history)
CREATE TABLE IF NOT EXISTS messages (
  id              BIGSERIAL PRIMARY KEY,
  customer_id     TEXT,
  conversation_id TEXT,
  role            TEXT CHECK (role IN ('user', 'assistant', 'system', 'tool', 'customer')),
  message         TEXT NOT NULL,
  timestamp       TIMESTAMPTZ DEFAULT now()
);

-- 5. Support Tickets Table (Created on escalation / explicit ticket request)
CREATE TABLE IF NOT EXISTS support_tickets (
  ticket_id       BIGSERIAL PRIMARY KEY,
  customer_id     TEXT,
  conversation_id TEXT,
  issue           TEXT,
  reason          TEXT,
  priority        TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status          TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- 6. Orders Table (Looked up by order status tools)
CREATE TABLE IF NOT EXISTS orders (
  order_id           TEXT PRIMARY KEY,
  customer_id        TEXT,
  status             TEXT CHECK (status IN ('pending', 'processing', 'shipped', 'in_transit', 'delivered', 'cancelled')),
  total              NUMERIC(10, 2),
  items              JSONB,
  tracking_number    TEXT,
  estimated_delivery TEXT,
  created_at         TIMESTAMPTZ DEFAULT now(),
  updated_at         TIMESTAMPTZ DEFAULT now()
);

-- 7. Knowledge Base: Source Documents
CREATE TABLE IF NOT EXISTS knowledge_documents (
  document_id BIGSERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  category    TEXT,
  source      TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 8. Knowledge Base: Embedded Chunks (pgvector 1536 dims for text-embedding-3-small)
CREATE TABLE IF NOT EXISTS knowledge_chunks (
  id          BIGSERIAL PRIMARY KEY,
  document_id BIGINT REFERENCES knowledge_documents(document_id) ON DELETE CASCADE,
  chunk_text  TEXT NOT NULL,
  embedding   vector(1536),
  metadata    JSONB,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 9. Structured Application Logs (Per chat request)
CREATE TABLE IF NOT EXISTS support_logs (
  id              BIGSERIAL PRIMARY KEY,
  customer_id     TEXT,
  conversation_id TEXT,
  intent          TEXT,
  retrieved_docs  JSONB,
  tools_used      JSONB,
  response        TEXT,
  escalated       BOOLEAN DEFAULT false,
  ticket_id       BIGINT,
  errors          TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- 10. n8n Postgres Chat Memory Table
CREATE TABLE IF NOT EXISTS n8n_chat_histories (
  id         SERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  message    JSONB NOT NULL
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages (conversation_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders (customer_id);
CREATE INDEX IF NOT EXISTS idx_chunks_document ON knowledge_chunks (document_id);
CREATE INDEX IF NOT EXISTS idx_tickets_customer ON support_tickets (customer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_customer ON conversations (customer_id);

-- Seed Data (Customers & Orders)
INSERT INTO customers (customer_id, name, email) VALUES
  ('CUST-1001', 'Ada Lovelace', 'ada@example.com'),
  ('CUST-1002', 'Alan Turing',  'alan@example.com'),
  ('CUST-1003', 'Grace Hopper', 'grace@example.com'),
  ('CUST-1004', 'Claude Shannon', 'claude@example.com'),
  ('CUST-1005', 'Margaret Hamilton', 'margaret@example.com')
ON CONFLICT (customer_id) DO NOTHING;

INSERT INTO orders (order_id, customer_id, status, total, tracking_number, estimated_delivery, items) VALUES
  ('ORD-5001', 'CUST-1001', 'shipped',   129.99, 'TRK-98234101', '2026-08-16', '[{"sku":"WIDGET-PRO","qty":1, "name":"Widget Pro Unit"}]'),
  ('ORD-5002', 'CUST-1001', 'processing', 49.50, 'TRK-98234102', '2026-08-18', '[{"sku":"CABLE-USB-C","qty":2, "name":"Braided USB-C Cable"}]'),
  ('ORD-5003', 'CUST-1002', 'delivered',  15.00, 'TRK-98234103', '2026-08-10', '[{"sku":"ADAPTER-MINI","qty":1, "name":"Mini Power Adapter"}]'),
  ('ORD-5004', 'CUST-1002', 'in_transit', 199.00, 'TRK-98234104', '2026-08-15', '[{"sku":"DOCK-STATION","qty":1, "name":"Thunderbolt Dock"}]'),
  ('ORD-5005', 'CUST-1003', 'shipped',    89.00, 'TRK-98234105', '2026-08-17', '[{"sku":"KEYBOARD-MECH","qty":1, "name":"Wireless Mechanical Keyboard"}]'),
  ('ORD-5006', 'CUST-1003', 'delivered',  29.99, 'TRK-98234106', '2026-08-05', '[{"sku":"MOUSE-ERGO","qty":1, "name":"Ergonomic Wireless Mouse"}]'),
  ('ORD-5007', 'CUST-1004', 'pending',   349.99, 'TRK-98234107', '2026-08-20', '[{"sku":"MONITOR-4K","qty":1, "name":"27-inch 4K Display"}]'),
  ('ORD-5008', 'CUST-1004', 'delivered',  75.00, 'TRK-98234108', '2026-08-01', '[{"sku":"DESK-MAT","qty":1, "name":"Leather Desk Mat"}]'),
  ('ORD-5009', 'CUST-1005', 'cancelled',  120.00, NULL,          NULL,         '[{"sku":"HEADPHONES-BT","qty":1, "name":"Noise Cancelling Headphones"}]'),
  ('ORD-5010', 'CUST-1005', 'processing', 15.99, 'TRK-98234110', '2026-08-19', '[{"sku":"SCREEN-CLEAN","qty":1, "name":"Screen Cleaning Kit"}]')
ON CONFLICT (order_id) DO NOTHING;

INSERT INTO support_tickets (ticket_id, customer_id, conversation_id, issue, reason, priority, status) VALUES
  (10001, 'CUST-1001', 'conv-101', 'Tracking inquiry regarding ORD-5001', 'Customer requested human follow-up on customs hold', 'medium', 'open'),
  (10002, 'CUST-1003', 'conv-102', 'Damaged package received', 'Physical outer box crushed during transit', 'high', 'in_progress'),
  (10003, 'CUST-1005', 'conv-103', 'Subscription refund request', 'Cancelled service within 14-day digital product refund window', 'urgent', 'open')
ON CONFLICT (ticket_id) DO NOTHING;
