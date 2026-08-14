export interface Customer {
  customer_id: string;
  name: string;
  email: string;
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
}

// 5 Demo Customers
export const INITIAL_CUSTOMERS: Customer[] = [
  { customer_id: 'CUST-1001', name: 'Ada Lovelace', email: 'ada@example.com', created_at: '2026-01-15T09:00:00Z' },
  { customer_id: 'CUST-1002', name: 'Alan Turing', email: 'alan@example.com', created_at: '2026-02-01T10:30:00Z' },
  { customer_id: 'CUST-1003', name: 'Grace Hopper', email: 'grace@example.com', created_at: '2026-02-20T14:15:00Z' },
  { customer_id: 'CUST-1004', name: 'Claude Shannon', email: 'claude@example.com', created_at: '2026-03-05T11:45:00Z' },
  { customer_id: 'CUST-1005', name: 'Margaret Hamilton', email: 'margaret@example.com', created_at: '2026-03-12T16:20:00Z' },
];

// 10 Demo Orders
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

// EXPANDED KNOWLEDGE BASE CHUNKS
export const KNOWLEDGE_CHUNKS: KnowledgeChunk[] = [
  {
    id: 1,
    document_id: 101,
    title: 'General Support Hours & Contact Info',
    category: 'FAQ',
    chunk_text: 'Support hours are Monday to Friday, 9:00 AM to 6:00 PM EST. Weekend support is available via email ticket escalation. Emergency server status issues are monitored 24/7. Contact us via chat here or email support@example.com.',
  },
  {
    id: 2,
    document_id: 102,
    title: 'Widget Pro Overview & Specifications',
    category: 'Product',
    chunk_text: 'The Widget Pro is our flagship automation hardware device. It features Wi-Fi 6, Bluetooth 5.2, USB-C fast charging, a 12-hour rechargeable battery, and built-in cloud synchronization. Setup takes under 5 minutes.',
  },
  {
    id: 3,
    document_id: 103,
    title: 'Widget Pro Setup & Installation Guide',
    category: 'Product',
    chunk_text: 'To set up Widget Pro: 1. Charge for 30 minutes via USB-C. 2. Turn on the device until the blue LED flashes. 3. Open your mobile app or web portal and click Add Device. 4. Enter your Wi-Fi password and verify setup.',
  },
  {
    id: 4,
    document_id: 104,
    title: 'Subscription Pricing Plans & Invoicing',
    category: 'Pricing',
    chunk_text: 'We offer three pricing tiers: Starter Plan is $19/month (1 user, core features). Professional Plan is $49/month (up to 5 team members, priority support, API access). Enterprise Plan starts at $199/month (unlimited seats, dedicated SLA, custom database integrations). Billed monthly or annually with a 15% discount.',
  },
  {
    id: 5,
    document_id: 105,
    title: 'Payment Methods & Billing Cycles',
    category: 'Pricing',
    chunk_text: 'We accept Visa, Mastercard, American Express, PayPal, Apple Pay, and ACH Bank Transfers (for Enterprise accounts). All subscriptions auto-renew monthly on the billing anniversary date unless cancelled prior.',
  },
  {
    id: 6,
    document_id: 106,
    title: 'Shipping Times, Express & Rates',
    category: 'Shipping',
    chunk_text: 'Physical orders ship within 1-2 business days. Standard US Shipping takes 3-5 business days ($5.99 or free on orders over $50). Express Shipping takes 1-2 business days ($14.99). International shipping takes 7-14 business days depending on customs.',
  },
  {
    id: 7,
    document_id: 107,
    title: 'International Shipping & Duties',
    category: 'Shipping',
    chunk_text: 'We ship to over 80 countries worldwide. International packages include real-time tracking. Please note customs, import duties, and VAT taxes are calculated at checkout or charged by local postal authorities depending on regional import laws.',
  },
  {
    id: 8,
    document_id: 108,
    title: '30-Day Refund & Return Policy',
    category: 'Refund',
    chunk_text: 'We offer a 30-day full refund guarantee on all hardware products. Items must be returned in original packaging with included accessories. Digital subscriptions are refundable within 14 days of initial purchase if unused.',
  },
  {
    id: 9,
    document_id: 109,
    title: 'Return Shipping & Processing Timeline',
    category: 'Refund',
    chunk_text: 'To initiate a return, request a prepaid shipping label from support. Once your return package is delivered to our warehouse, inspecting and processing your refund to your original payment method takes 5 to 10 business days.',
  },
  {
    id: 10,
    document_id: 110,
    title: 'Subscription Cancellation Policy',
    category: 'Cancellation',
    chunk_text: 'You can cancel your subscription at any time directly from Account Settings -> Billing -> Cancel Subscription, or by asking our support team. Cancellation takes effect at the end of your current paid billing period.',
  },
  {
    id: 11,
    document_id: 111,
    title: 'Order Cancellation Policy Before Shipment',
    category: 'Cancellation',
    chunk_text: 'Physical product orders can be cancelled for a 100% full refund before they enter the Shipped status (i.e. orders in Pending or Processing status). Once an order has shipped, it cannot be cancelled but can be returned under our 30-day money-back guarantee.',
  },
  {
    id: 12,
    document_id: 112,
    title: 'Hardware 2-Year Limited Warranty',
    category: 'Warranty',
    chunk_text: 'All new Widget Pro devices come with a 2-year limited manufacturer warranty against defects in materials and workmanship. If your device malfunctions under normal use, we will repair or replace it free of charge.',
  },
  {
    id: 13,
    document_id: 113,
    title: 'Accidental Damage & Extended Warranty',
    category: 'Warranty',
    chunk_text: 'The standard 2-year warranty covers hardware defects but does not cover water damage, drops, or unauthorized modifications. Optional Extended Protection ($29/year) covers accidental drops and liquid spills.',
  },
  {
    id: 14,
    document_id: 114,
    title: 'Account Security, Password Reset & 2FA',
    category: 'Account',
    chunk_text: 'Manage security under Account Settings -> Security. You can enable Two-Factor Authentication (2FA) via Authenticator App (Google/Authy) or SMS. If you forget your password, click Forgot Password on the login screen to receive a secure reset link via email.',
  },
  {
    id: 15,
    document_id: 115,
    title: 'Team Permissions & User Invites',
    category: 'Account',
    chunk_text: 'Professional and Enterprise account owners can invite team members under Settings -> Team. Available roles include Admin (full control), Editor (can edit workflows & integrations), and Viewer (read-only monitoring access).',
  },
  {
    id: 16,
    document_id: 116,
    title: 'Troubleshooting LED Error Light Codes',
    category: 'Troubleshooting',
    chunk_text: 'LED Status Indicators: Solid Blue = Connected & Ready. Flashing Blue = Pairing Mode. Flashing Red = Low Battery (charge device). Solid Red = Hardware Error (hold power button 10 seconds to factory reset).',
  },
  {
    id: 17,
    document_id: 117,
    title: 'Offline Sync & Memory Buffer',
    category: 'Troubleshooting',
    chunk_text: 'If Wi-Fi drops, Widget Pro automatically stores up to 48 hours of event data in internal flash memory buffer. Once internet connectivity is restored, cached logs sync automatically without data loss.',
  },
  {
    id: 18,
    document_id: 118,
    title: 'REST API & Webhooks Integration',
    category: 'API',
    chunk_text: 'We provide a REST API (v2) and Webhook events for custom integrations. API Keys can be generated under Developer Settings. Rate limit is 1,000 requests per minute per API key on Professional plans, and 10,000 requests/min on Enterprise.',
  },
  {
    id: 19,
    document_id: 120,
    title: 'Data Privacy, GDPR & Security Compliance',
    category: 'Terms',
    chunk_text: 'We are SOC 2 Type II certified and fully compliant with GDPR and CCPA privacy standards. Customer data is encrypted at rest using AES-256 and in transit using TLS 1.3. We never sell customer personal data to third parties.',
  },
  {
    id: 20,
    document_id: 121,
    title: 'Terms of Service & Terms of Use',
    category: 'Terms',
    chunk_text: 'By accessing our platform, you agree to our Terms of Use. Accounts are intended for registered individuals or organizations. Misuse, abuse, automated scraping, or unauthorized access attempts may lead to immediate account suspension.',
  },
];
