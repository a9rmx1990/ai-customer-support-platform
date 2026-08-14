-- ============================================================================
-- AI CUSTOMER & HEALTHCARE SUPPORT AUTOMATION PLATFORM (PostgreSQL + pgvector)
-- Multi-Domain Schema: Medical / Clinical Services, E-Commerce, Enterprise SaaS
-- ============================================================================

-- 1. Enable pgvector extension for embedding searches
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Customers Table (E-Commerce)
CREATE TABLE IF NOT EXISTS customers (
    customer_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Patients Table (Medical / Clinical)
CREATE TABLE IF NOT EXISTS patients (
    patient_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    dob DATE NOT NULL,
    primary_doctor VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Conversations Table
CREATE TABLE IF NOT EXISTS conversations (
    conversation_id VARCHAR(100) PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL,
    domain VARCHAR(50) DEFAULT 'medical',
    channel VARCHAR(50) DEFAULT 'web_chat',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Messages History Table
CREATE TABLE IF NOT EXISTS messages (
    message_id BIGSERIAL PRIMARY KEY,
    conversation_id VARCHAR(100) REFERENCES conversations(conversation_id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
    content TEXT NOT NULL,
    intent VARCHAR(50),
    domain VARCHAR(50) DEFAULT 'medical',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Support Tickets Escalation Table
CREATE TABLE IF NOT EXISTS support_tickets (
    ticket_id SERIAL PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL,
    conversation_id VARCHAR(100),
    issue VARCHAR(255) NOT NULL,
    reason TEXT,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Orders Table (E-Commerce)
CREATE TABLE IF NOT EXISTS orders (
    order_id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) REFERENCES customers(customer_id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL CHECK (status IN ('pending', 'processing', 'shipped', 'in_transit', 'delivered', 'cancelled', 'refunded')),
    total DECIMAL(10, 2) NOT NULL,
    tracking_number VARCHAR(100),
    estimated_delivery DATE,
    shipping_address TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Medical Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    appointment_id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) REFERENCES patients(patient_id) ON DELETE CASCADE,
    doctor_name VARCHAR(150) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    type VARCHAR(30) DEFAULT 'in_person' CHECK (type IN ('in_person', 'telehealth')),
    status VARCHAR(30) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    location TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Lab Results Table
CREATE TABLE IF NOT EXISTS lab_results (
    lab_id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) REFERENCES patients(patient_id) ON DELETE CASCADE,
    test_name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    result_status VARCHAR(30) DEFAULT 'normal' CHECK (result_status IN ('normal', 'abnormal', 'pending')),
    date_conducted DATE NOT NULL,
    summary TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Knowledge Base Documents Table
CREATE TABLE IF NOT EXISTS knowledge_documents (
    document_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    domain VARCHAR(50) DEFAULT 'medical',
    source_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Knowledge Base Chunks (pgvector 1536 dimensions)
CREATE TABLE IF NOT EXISTS knowledge_chunks (
    id SERIAL PRIMARY KEY,
    document_id INT REFERENCES knowledge_documents(document_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    domain VARCHAR(50) DEFAULT 'medical',
    chunk_text TEXT NOT NULL,
    embedding vector(1536)
);

-- 12. Support Logs Audit Table
CREATE TABLE IF NOT EXISTS support_logs (
    log_id BIGSERIAL PRIMARY KEY,
    customer_id VARCHAR(50),
    conversation_id VARCHAR(100),
    intent VARCHAR(50),
    domain VARCHAR(50) DEFAULT 'medical',
    retrieved_docs JSONB,
    tools_used JSONB,
    response TEXT,
    escalated BOOLEAN DEFAULT FALSE,
    ticket_id INT,
    errors TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. n8n Postgres Chat Memory Table
CREATE TABLE IF NOT EXISTS n8n_chat_histories (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    message JSONB NOT NULL
);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_patient ON lab_results(patient_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_tickets_customer ON support_tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_chunks_domain ON knowledge_chunks(domain);
CREATE INDEX IF NOT EXISTS idx_chunks_embedding ON knowledge_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- SEED PATIENTS
INSERT INTO patients (patient_id, name, email, dob, primary_doctor) VALUES
('PAT-2001', 'Ada Lovelace', 'ada@example.com', '1985-12-10', 'Dr. Sarah Jenkins (Cardiology)'),
('PAT-2002', 'Alan Turing', 'alan@example.com', '1982-06-23', 'Dr. Marcus Vance (Neurology)'),
('PAT-2003', 'Grace Hopper', 'grace@example.com', '1979-12-09', 'Dr. Emily Chen (Internal Medicine)')
ON CONFLICT (patient_id) DO NOTHING;

-- SEED APPOINTMENTS
INSERT INTO appointments (appointment_id, patient_id, doctor_name, specialty, date_time, type, status, location) VALUES
('APT-8001', 'PAT-2001', 'Dr. Sarah Jenkins', 'Cardiology', '2026-08-18 10:00:00+00', 'in_person', 'scheduled', 'Downtown Health Center - Suite 402'),
('APT-8002', 'PAT-2001', 'Dr. Emily Chen', 'Internal Medicine', '2026-08-25 14:30:00+00', 'telehealth', 'scheduled', 'Virtual Telehealth Portal')
ON CONFLICT (appointment_id) DO NOTHING;

-- SEED LAB RESULTS
INSERT INTO lab_results (lab_id, patient_id, test_name, category, result_status, date_conducted, summary) VALUES
('LAB-9001', 'PAT-2001', 'Comprehensive Metabolic & Blood Panel', 'Hematology', 'normal', '2026-08-11', 'All glucose, electrolyte, kidney, and liver enzyme levels within standard healthy ranges.')
ON CONFLICT (lab_id) DO NOTHING;
