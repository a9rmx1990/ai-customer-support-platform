export type AppDomain = 'medical' | 'ecommerce' | 'saas';

export interface Customer {
  customer_id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface Patient {
  patient_id: string;
  name: string;
  email: string;
  dob: string;
  primary_doctor: string;
  created_at: string;
}

export interface OrderItem {
  sku: string;
  qty: number;
  name: string;
}

export interface Order {
  order_id: string;
  customer_id: string;
  status: 'pending' | 'processing' | 'shipped' | 'in_transit' | 'delivered' | 'cancelled' | 'refunded';
  total: number;
  tracking_number?: string;
  estimated_delivery?: string;
  shipping_address?: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
  refund_reason?: string;
}

export interface MedicalAppointment {
  appointment_id: string;
  patient_id: string;
  doctor_name: string;
  specialty: string;
  date_time: string;
  type: 'in_person' | 'telehealth';
  status: 'scheduled' | 'completed' | 'cancelled';
  location: string;
}

export interface LabResult {
  lab_id: string;
  patient_id: string;
  test_name: string;
  category: string;
  result_status: 'normal' | 'abnormal' | 'pending';
  date_conducted: string;
  summary: string;
}

export interface SupportTicket {
  ticket_id: number;
  customer_id: string;
  conversation_id: string;
  issue: string;
  reason?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface KnowledgeChunk {
  id: number;
  document_id: number;
  title: string;
  category: string;
  domain: AppDomain;
  chunk_text: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: string;
  intent?: string;
  escalated?: boolean;
  ticket_id?: number | null;
  status_indicator?: string;
  domain?: AppDomain;
}

// 5 Demo Customers (E-Commerce)
export const INITIAL_CUSTOMERS: Customer[] = [
  { customer_id: 'CUST-1001', name: 'Ada Lovelace', email: 'ada@example.com', created_at: '2026-01-15T09:00:00Z' },
  { customer_id: 'CUST-1002', name: 'Alan Turing', email: 'alan@example.com', created_at: '2026-02-01T10:30:00Z' },
  { customer_id: 'CUST-1003', name: 'Grace Hopper', email: 'grace@example.com', created_at: '2026-02-20T14:15:00Z' },
  { customer_id: 'CUST-1004', name: 'Claude Shannon', email: 'claude@example.com', created_at: '2026-03-05T11:45:00Z' },
  { customer_id: 'CUST-1005', name: 'Margaret Hamilton', email: 'margaret@example.com', created_at: '2026-03-12T16:20:00Z' },
];

// 5 Demo Patients (Medical Clinic)
export const INITIAL_PATIENTS: Patient[] = [
  { patient_id: 'PAT-2001', name: 'Ada Lovelace', email: 'ada@example.com', dob: '1985-12-10', primary_doctor: 'Dr. Sarah Jenkins (Cardiology)', created_at: '2025-05-10T09:00:00Z' },
  { patient_id: 'PAT-2002', name: 'Alan Turing', email: 'alan@example.com', dob: '1982-06-23', primary_doctor: 'Dr. Marcus Vance (Neurology)', created_at: '2025-06-15T10:30:00Z' },
  { patient_id: 'PAT-2003', name: 'Grace Hopper', email: 'grace@example.com', dob: '1979-12-09', primary_doctor: 'Dr. Emily Chen (Internal Medicine)', created_at: '2025-07-20T14:15:00Z' },
  { patient_id: 'PAT-2004', name: 'Claude Shannon', email: 'claude@example.com', dob: '1990-04-30', primary_doctor: 'Dr. Robert Ross (Dermatology)', created_at: '2025-08-05T11:45:00Z' },
  { patient_id: 'PAT-2005', name: 'Margaret Hamilton', email: 'margaret@example.com', dob: '1988-08-17', primary_doctor: 'Dr. Lisa Ray (Endocrinology)', created_at: '2025-09-12T16:20:00Z' },
];

// Demo Medical Appointments
export const INITIAL_APPOINTMENTS: MedicalAppointment[] = [
  {
    appointment_id: 'APT-8001',
    patient_id: 'PAT-2001',
    doctor_name: 'Dr. Sarah Jenkins',
    specialty: 'Cardiology',
    date_time: '2026-08-18T10:00:00Z',
    type: 'in_person',
    status: 'scheduled',
    location: 'Downtown Health Center - Suite 402',
  },
  {
    appointment_id: 'APT-8002',
    patient_id: 'PAT-2001',
    doctor_name: 'Dr. Emily Chen',
    specialty: 'Internal Medicine',
    date_time: '2026-08-25T14:30:00Z',
    type: 'telehealth',
    status: 'scheduled',
    location: 'Virtual Telehealth Portal',
  },
  {
    appointment_id: 'APT-8003',
    patient_id: 'PAT-2002',
    doctor_name: 'Dr. Marcus Vance',
    specialty: 'Neurology',
    date_time: '2026-08-20T11:15:00Z',
    type: 'in_person',
    status: 'scheduled',
    location: 'Central Medical Pavilion - Suite 210',
  },
  {
    appointment_id: 'APT-8004',
    patient_id: 'PAT-2003',
    doctor_name: 'Dr. Emily Chen',
    specialty: 'Internal Medicine',
    date_time: '2026-08-10T09:00:00Z',
    type: 'in_person',
    status: 'completed',
    location: 'Downtown Health Center - Suite 101',
  },
];

// Demo Lab Test Results
export const INITIAL_LAB_RESULTS: LabResult[] = [
  {
    lab_id: 'LAB-9001',
    patient_id: 'PAT-2001',
    test_name: 'Comprehensive Metabolic & Blood Panel',
    category: 'Hematology',
    result_status: 'normal',
    date_conducted: '2026-08-11',
    summary: 'All glucose, electrolyte, kidney, and liver enzyme levels within standard healthy ranges.',
  },
  {
    lab_id: 'LAB-9002',
    patient_id: 'PAT-2001',
    test_name: 'Lipid & Cholesterol Profile',
    category: 'Cardiology',
    result_status: 'normal',
    date_conducted: '2026-08-11',
    summary: 'Total cholesterol: 175 mg/dL. HDL: 58 mg/dL. Triglycerides normal.',
  },
  {
    lab_id: 'LAB-9003',
    patient_id: 'PAT-2002',
    test_name: 'Brain MRI Diagnostic Imaging',
    category: 'Radiology',
    result_status: 'normal',
    date_conducted: '2026-08-08',
    summary: 'No acute intracranial pathology detected. Ventricles and sulci clear.',
  },
];

// 10 Demo Orders (E-Commerce)
export const INITIAL_ORDERS: Order[] = [
  {
    order_id: 'ORD-5001',
    customer_id: 'CUST-1001',
    status: 'shipped',
    total: 129.99,
    tracking_number: 'TRK-98234101',
    estimated_delivery: '2026-08-16',
    shipping_address: '123 Babbage Way, London, UK',
    items: [{ sku: 'WIDGET-PRO', qty: 1, name: 'Widget Pro Unit' }],
    created_at: '2026-08-10T12:00:00Z',
    updated_at: '2026-08-12T14:00:00Z',
  },
  {
    order_id: 'ORD-5002',
    customer_id: 'CUST-1001',
    status: 'processing',
    total: 49.50,
    tracking_number: 'TRK-98234102',
    estimated_delivery: '2026-08-18',
    shipping_address: '123 Babbage Way, London, UK',
    items: [{ sku: 'CABLE-USB-C', qty: 2, name: 'Braided USB-C Cable' }],
    created_at: '2026-08-13T09:30:00Z',
    updated_at: '2026-08-13T09:30:00Z',
  },
  {
    order_id: 'ORD-5003',
    customer_id: 'CUST-1002',
    status: 'delivered',
    total: 15.00,
    tracking_number: 'TRK-98234103',
    estimated_delivery: '2026-08-10',
    shipping_address: '456 Enigma Ave, Cambridge, UK',
    items: [{ sku: 'ADAPTER-MINI', qty: 1, name: 'Mini Power Adapter' }],
    created_at: '2026-08-04T10:00:00Z',
    updated_at: '2026-08-10T16:00:00Z',
  },
  {
    order_id: 'ORD-5004',
    customer_id: 'CUST-1002',
    status: 'in_transit',
    total: 199.00,
    tracking_number: 'TRK-98234104',
    estimated_delivery: '2026-08-15',
    shipping_address: '456 Enigma Ave, Cambridge, UK',
    items: [{ sku: 'DOCK-STATION', qty: 1, name: 'Thunderbolt Dock' }],
    created_at: '2026-08-11T11:15:00Z',
    updated_at: '2026-08-13T08:00:00Z',
  },
  {
    order_id: 'ORD-5005',
    customer_id: 'CUST-1003',
    status: 'shipped',
    total: 89.00,
    tracking_number: 'TRK-98234105',
    estimated_delivery: '2026-08-17',
    shipping_address: '789 COBOL St, Arlington, VA',
    items: [{ sku: 'KEYBOARD-MECH', qty: 1, name: 'Wireless Mechanical Keyboard' }],
    created_at: '2026-08-11T15:45:00Z',
    updated_at: '2026-08-13T10:30:00Z',
  },
  {
    order_id: 'ORD-5006',
    customer_id: 'CUST-1003',
    status: 'delivered',
    total: 29.99,
    tracking_number: 'TRK-98234106',
    estimated_delivery: '2026-08-05',
    shipping_address: '789 COBOL St, Arlington, VA',
    items: [{ sku: 'MOUSE-ERGO', qty: 1, name: 'Ergonomic Wireless Mouse' }],
    created_at: '2026-07-29T14:00:00Z',
    updated_at: '2026-08-05T11:20:00Z',
  },
  {
    order_id: 'ORD-5007',
    customer_id: 'CUST-1004',
    status: 'processing',
    total: 349.99,
    tracking_number: 'TRK-98234107',
    estimated_delivery: '2026-08-20',
    shipping_address: '101 Information Theory Rd, MIT, MA',
    items: [{ sku: 'MONITOR-4K', qty: 1, name: '27-inch 4K Display' }],
    created_at: '2026-08-14T08:10:00Z',
    updated_at: '2026-08-14T08:10:00Z',
  },
  {
    order_id: 'ORD-5008',
    customer_id: 'CUST-1004',
    status: 'delivered',
    total: 75.00,
    tracking_number: 'TRK-98234108',
    estimated_delivery: '2026-08-01',
    shipping_address: '101 Information Theory Rd, MIT, MA',
    items: [{ sku: 'DESK-MAT', qty: 1, name: 'Leather Desk Mat' }],
    created_at: '2026-07-25T13:30:00Z',
    updated_at: '2026-08-01T15:00:00Z',
  },
  {
    order_id: 'ORD-5009',
    customer_id: 'CUST-1005',
    status: 'cancelled',
    total: 120.00,
    shipping_address: '202 Apollo Lander Way, Houston, TX',
    items: [{ sku: 'HEADPHONES-BT', qty: 1, name: 'Noise Cancelling Headphones' }],
    created_at: '2026-08-02T10:00:00Z',
    updated_at: '2026-08-03T09:00:00Z',
  },
  {
    order_id: 'ORD-5010',
    customer_id: 'CUST-1005',
    status: 'processing',
    total: 15.99,
    tracking_number: 'TRK-98234110',
    estimated_delivery: '2026-08-19',
    shipping_address: '202 Apollo Lander Way, Houston, TX',
    items: [{ sku: 'SCREEN-CLEAN', qty: 1, name: 'Screen Cleaning Kit' }],
    created_at: '2026-08-14T11:00:00Z',
    updated_at: '2026-08-14T11:00:00Z',
  },
];

// Initial Support Tickets
export const INITIAL_TICKETS: SupportTicket[] = [
  {
    ticket_id: 10001,
    customer_id: 'CUST-1001',
    conversation_id: 'conv-101',
    issue: 'Tracking inquiry regarding ORD-5001',
    reason: 'Customer requested human follow-up on customs hold',
    priority: 'medium',
    status: 'open',
    created_at: '2026-08-14T10:00:00Z',
    updated_at: '2026-08-14T10:00:00Z',
  },
  {
    ticket_id: 10002,
    customer_id: 'CUST-1003',
    conversation_id: 'conv-102',
    issue: 'Damaged package received',
    reason: 'Physical outer box crushed during transit',
    priority: 'high',
    status: 'in_progress',
    created_at: '2026-08-13T16:45:00Z',
    updated_at: '2026-08-14T09:15:00Z',
  },
  {
    ticket_id: 10003,
    customer_id: 'CUST-1005',
    conversation_id: 'conv-103',
    issue: 'Subscription refund request',
    reason: 'Cancelled service within 14-day digital product refund window',
    priority: 'urgent',
    status: 'open',
    created_at: '2026-08-14T12:30:00Z',
    updated_at: '2026-08-14T12:30:00Z',
  },
];

// MULTI-DOMAIN KNOWLEDGE BASE CHUNKS (Medical, E-Commerce, SaaS)
export const KNOWLEDGE_CHUNKS: KnowledgeChunk[] = [
  // 🩺 MEDICAL / CLINIC DOMAIN CHUNKS
  {
    id: 201,
    document_id: 301,
    title: 'Clinic Hours, Locations & Urgent Care',
    category: 'Clinical FAQ',
    domain: 'medical',
    chunk_text: 'Downtown Health Clinic is open Monday-Friday 8:00 AM - 7:00 PM EST, and Saturday 9:00 AM - 2:00 PM. Urgent Care walk-ins are accepted daily. For life-threatening medical emergencies, call 911 or visit the nearest ER immediately.',
  },
  {
    id: 202,
    document_id: 302,
    title: 'Doctor Appointment Scheduling & Telehealth',
    category: 'Appointments',
    domain: 'medical',
    chunk_text: 'Appointments can be booked online via our patient portal or through this AI assistant. We offer both In-Person clinic visits and Virtual Telehealth consultations. Please arrive 15 minutes early for in-person check-in.',
  },
  {
    id: 203,
    document_id: 303,
    title: 'Appointment Rescheduling & Cancellation Policy',
    category: 'Appointments',
    domain: 'medical',
    chunk_text: 'Please provide at least 24 hours advance notice to cancel or reschedule an appointment without incurring a $25 late cancellation fee. You can cancel or change your visit directly in the portal or by messaging support.',
  },
  {
    id: 204,
    document_id: 304,
    title: 'Lab Test Results & Diagnostic Reports',
    category: 'Lab Results',
    domain: 'medical',
    chunk_text: 'Routine blood panels and diagnostic imaging reports are published to your Patient Portal within 24 to 48 hours of test completion. Your primary physician will review abnormal findings and contact you directly.',
  },
  {
    id: 205,
    document_id: 305,
    title: 'Prescription Refill Request Procedure',
    category: 'Pharmacy',
    domain: 'medical',
    chunk_text: 'To request a prescription refill, select your medication in the portal or ask this AI assistant. Refill requests take 1-2 business days to process and send to your designated retail or mail-order pharmacy.',
  },
  {
    id: 206,
    document_id: 306,
    title: 'Health Insurance, Copays & Billing',
    category: 'Billing',
    domain: 'medical',
    chunk_text: 'We accept major health insurance providers including Blue Cross Blue Shield, Aetna, UnitedHealthcare, Cigna, and Medicare. Copayments are due at the time of service. We accept credit cards, HSA, and FSA cards.',
  },
  {
    id: 207,
    document_id: 307,
    title: 'Specialist Referrals & Second Opinions',
    category: 'Clinical Care',
    domain: 'medical',
    chunk_text: 'Referrals to in-house specialists (Cardiology, Neurology, Dermatology, Orthopedics) require an initial primary care consultation. Referral processing takes 3-5 business days for insurance pre-authorization.',
  },
  {
    id: 208,
    document_id: 308,
    title: 'HIPAA Patient Privacy & Medical Records',
    category: 'Privacy',
    domain: 'medical',
    chunk_text: 'We strictly comply with HIPAA regulations. Your Protected Health Information (PHI) is encrypted end-to-end. Medical records can be requested under Patient Settings -> Records and are delivered within 3 business days.',
  },

  // 🛍️ SHOPPING & E-COMMERCE DELIVERY CHUNKS
  {
    id: 1,
    document_id: 101,
    title: 'General Support Hours & Contact Info',
    category: 'FAQ',
    domain: 'ecommerce',
    chunk_text: 'Support hours are Monday to Friday, 9:00 AM to 6:00 PM EST. Weekend support is available via email ticket escalation. Emergency server status issues are monitored 24/7. Contact us via chat here or email support@example.com.',
  },
  {
    id: 2,
    document_id: 102,
    title: 'Widget Pro Overview & Specifications',
    category: 'Product',
    domain: 'ecommerce',
    chunk_text: 'The Widget Pro is our flagship automation hardware device. It features Wi-Fi 6, Bluetooth 5.2, USB-C fast charging, a 12-hour rechargeable battery, and built-in cloud synchronization. Setup takes under 5 minutes.',
  },
  {
    id: 6,
    document_id: 106,
    title: 'Shipping Times, Express & Rates',
    category: 'Shipping',
    domain: 'ecommerce',
    chunk_text: 'Physical orders ship within 1-2 business days. Standard US Shipping takes 3-5 business days ($5.99 or free on orders over $50). Express Shipping takes 1-2 business days ($14.99). International shipping takes 7-14 business days depending on customs.',
  },
  {
    id: 8,
    document_id: 108,
    title: '30-Day Refund & Return Policy',
    category: 'Refund',
    domain: 'ecommerce',
    chunk_text: 'We offer a 30-day full refund guarantee on all hardware products. Items must be returned in original packaging with included accessories. Digital subscriptions are refundable within 14 days of initial purchase if unused.',
  },
  {
    id: 11,
    document_id: 111,
    title: 'Order Cancellation Policy Before Shipment',
    category: 'Cancellation',
    domain: 'ecommerce',
    chunk_text: 'Physical product orders can be cancelled for a 100% full refund before they enter the Shipped status (i.e. orders in Pending or Processing status). Once an order has shipped, it cannot be cancelled but can be returned under our 30-day money-back guarantee.',
  },
  {
    id: 12,
    document_id: 112,
    title: 'Hardware 2-Year Limited Warranty',
    category: 'Warranty',
    domain: 'ecommerce',
    chunk_text: 'All new Widget Pro devices come with a 2-year limited manufacturer warranty against defects in materials and workmanship. If your device malfunctions under normal use, we will repair or replace it free of charge.',
  },

  // 🏢 ENTERPRISE SAAS CHUNKS
  {
    id: 4,
    document_id: 104,
    title: 'Subscription Pricing Plans & Invoicing',
    category: 'Pricing',
    domain: 'saas',
    chunk_text: 'We offer three pricing tiers: Starter Plan is $19/month (1 user, core features). Professional Plan is $49/month (up to 5 team members, priority support, API access). Enterprise Plan starts at $199/month (unlimited seats, dedicated SLA, custom database integrations). Billed monthly or annually with a 15% discount.',
  },
  {
    id: 15,
    document_id: 115,
    title: 'Team Permissions & User Invites',
    category: 'Account',
    domain: 'saas',
    chunk_text: 'Professional and Enterprise account owners can invite team members under Settings -> Team. Available roles include Admin (full control), Editor (can edit workflows & integrations), and Viewer (read-only monitoring access).',
  },
  {
    id: 18,
    document_id: 118,
    title: 'REST API & Webhooks Integration',
    category: 'API',
    domain: 'saas',
    chunk_text: 'We provide a REST API (v2) and Webhook events for custom integrations. API Keys can be generated under Developer Settings. Rate limit is 1,000 requests per minute per API key on Professional plans, and 10,000 requests/min on Enterprise.',
  },
];
