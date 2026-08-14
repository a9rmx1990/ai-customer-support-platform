# 🩺 Multi-Domain AI Customer & Healthcare Support Automation Platform

An enterprise-ready **Multi-Domain AI Support Platform** built with Next.js 14, TypeScript, Tailwind CSS, PostgreSQL (`pgvector`), and n8n Workflow Automation.

Supports 3 dedicated business & clinical domains out of the box:
1. 🩺 **Medical & Clinical Service Domain**: Doctor appointment scheduling, diagnostic lab test results lookup, prescription refills, clinic hours, insurance co-pays, HIPAA privacy compliance, and 911 emergency guardrails.
2. 🛍️ **Shopping & Delivery Domain**: Real-time order tracking (`#ORD-5001`), return eligibility checks, physical order cancellations before shipment, and express shipping rates.
3. 🏢 **Enterprise SaaS Domain**: Technical REST API & webhook documentation search, subscription billing tiers, and team seat management.

---

## 🌟 Key Features

- **Multi-Domain Vector Isolation**: RAG search dynamically filters vector chunks by selected domain (`medical`, `ecommerce`, `saas`).
- **Clinical & Medical Tool Suite**:
  - `get_patient_appointments`: Fetches patient doctor visits.
  - `book_appointment`: Schedules doctor visits with confirmation prompts.
  - `get_lab_results`: Fetches diagnostic metabolic & imaging reports.
  - `request_prescription_refill`: Processes prescription refill requests.
- **Medical Emergency Safeguard**: Triggers immediate 911 emergency disclaimers if severe symptoms (chest pain, shortness of breath) are detected.
- **E-Commerce Action Safeguards**: Confirms destructive order cancellations before execution and enforces strict customer ownership.
- **Interactive UI & Domain Switcher**: Switch between Medical Mode, Shopping Mode, and SaaS Mode in real-time.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Demo Scenarios

- **Medical Appointment Booking**: Switch domain to `🩺 Medical / Clinic` -> Send *"Book an appointment with Dr. Sarah Jenkins"*.
- **Lab Test Results Lookup**: Send *"Show my lab test results"* as patient `PAT-2001`.
- **911 Medical Emergency Guardrail**: Send *"I have severe chest pain and trouble breathing"*.
- **E-Commerce Order Tracking**: Switch domain to `🛍️ Shopping & Delivery` -> Send *"Where is order #ORD-5001?"*.
- **Order Cancellation**: Send *"Cancel order #ORD-5007"*.

---

## 📄 License
MIT License.
