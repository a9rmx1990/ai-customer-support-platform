'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Bot,
  User,
  Send,
  Ticket,
  ShoppingBag,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  Stethoscope,
  Building2,
  Calendar,
  FileText,
  AlertTriangle,
  Pill,
  Clock,
  HeartPulse,
} from 'lucide-react';
import {
  INITIAL_CUSTOMERS,
  INITIAL_PATIENTS,
  INITIAL_ORDERS,
  INITIAL_APPOINTMENTS,
  INITIAL_LAB_RESULTS,
  Customer,
  Patient,
  Order,
  MedicalAppointment,
  LabResult,
  Message,
  AppDomain,
} from '@/lib/mock-data';

import { useAuth } from '@/lib/auth-context';

function ChatPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialDomain = (searchParams.get('domain') || 'medical') as AppDomain;
  const { user } = useAuth();

  const [activeDomain, setActiveDomain] = useState<AppDomain>(initialDomain);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>(INITIAL_CUSTOMERS[0]);
  const [selectedPatient, setSelectedPatient] = useState<Patient>(INITIAL_PATIENTS[0]);

  useEffect(() => {
    if (user) {
      const matchP = INITIAL_PATIENTS.find((p) => p.patient_id === user.id || p.email.toLowerCase() === user.email.toLowerCase());
      if (matchP) setSelectedPatient(matchP);
      const matchC = INITIAL_CUSTOMERS.find((c) => c.customer_id === user.id || c.email.toLowerCase() === user.email.toLowerCase());
      if (matchC) setSelectedCustomer(matchC);
    }
  }, [user]);

  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [patientAppointments, setPatientAppointments] = useState<MedicalAppointment[]>(INITIAL_APPOINTMENTS);
  const [patientLabResults, setPatientLabResults] = useState<LabResult[]>(INITIAL_LAB_RESULTS);

  const [conversationId, setConversationId] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeStatusIndicator, setActiveStatusIndicator] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    setConversationId(`conv-${Date.now().toString().slice(-6)}`);
  }, []);

  // Update initial greeting when domain changes
  useEffect(() => {
    const greetingText =
      activeDomain === 'medical'
        ? `Hello ${selectedPatient.name.split(' ')[0]}! Welcome to our Clinical AI Assistant. I can help schedule doctor visits, check diagnostic lab test results, request prescription refills, or answer clinic policy questions. How can I assist your health care today?`
        : `Hello ${selectedCustomer.name.split(' ')[0]}! Welcome to our AI E-Commerce Assistant. I can check order statuses, process cancellations/returns, or answer shipping & warranty questions. How can I help?`;

    setMessages([
      {
        id: `init-msg-${Date.now()}`,
        conversation_id: 'conv-init',
        role: 'assistant',
        content: greetingText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intent: 'Greeting',
        domain: activeDomain,
      },
    ]);
  }, [activeDomain, selectedPatient, selectedCustomer]);

  const refreshDomainData = async () => {
    try {
      if (activeDomain === 'medical') {
        const resApt = await fetch(`/api/appointments?patient_id=${selectedPatient.patient_id}`);
        const dataApt = await resApt.json();
        if (dataApt.appointments) setPatientAppointments(dataApt.appointments);

        const resLab = await fetch(`/api/lab-results?patient_id=${selectedPatient.patient_id}`);
        const dataLab = await resLab.json();
        if (dataLab.lab_results) setPatientLabResults(dataLab.lab_results);
      } else {
        const res = await fetch(`/api/orders?customer_id=${selectedCustomer.customer_id}`);
        const data = await res.json();
        if (data.orders) setCustomerOrders(data.orders);
      }
    } catch (e) {
      setCustomerOrders(INITIAL_ORDERS.filter((o) => o.customer_id === selectedCustomer.customer_id));
    }
  };

  useEffect(() => {
    refreshDomainData();
  }, [activeDomain, selectedCustomer, selectedPatient]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (initialQuery) {
      handleSendMessage(initialQuery);
    }
  }, [initialQuery]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    const currentUserId = activeDomain === 'medical' ? selectedPatient.patient_id : selectedCustomer.customer_id;

    const userMsg: Message = {
      id: `msg-u-${Date.now()}`,
      conversation_id: conversationId,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      domain: activeDomain,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setLoading(true);
    setActiveStatusIndicator(`Routing to ${activeDomain.toUpperCase()} domain vector database...`);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: currentUserId,
          conversation_id: conversationId,
          message: text,
          domain: activeDomain,
        }),
      });

      const data = await res.json();

      const aiMsg: Message = {
        id: `msg-a-${Date.now()}`,
        conversation_id: data.conversation_id || conversationId,
        role: 'assistant',
        content: data.response || 'No response returned from support agent.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intent: data.intent,
        escalated: data.escalated,
        ticket_id: data.ticket_id,
        status_indicator: data.status_indicator,
        domain: data.domain || activeDomain,
      };

      setMessages((prev) => [...prev, aiMsg]);
      refreshDomainData();
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          conversation_id: conversationId,
          role: 'assistant',
          content: "We're having trouble connecting to support right now. Please try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          intent: 'error',
        },
      ]);
    } finally {
      setLoading(false);
      setActiveStatusIndicator(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 h-[calc(100vh-5rem)] flex flex-col gap-4">
      {/* DOMAIN SELECTOR BAR */}
      <div className="surface-elevated rounded-2xl p-2.5 flex items-center justify-between gap-3 overflow-x-auto shrink-0 border border-triage-border">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-gray-400 shrink-0 px-1">
            Service Scope:
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveDomain('medical')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-display flex items-center gap-2 transition-colors ${
                activeDomain === 'medical'
                  ? 'bg-clinical-mint text-ink font-bold'
                  : 'bg-surface-base text-gray-400 hover:text-white hover:bg-surface-overlay border border-triage-border'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Medical / Clinical</span>
            </button>

            <button
              onClick={() => setActiveDomain('ecommerce')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-display flex items-center gap-2 transition-colors ${
                activeDomain === 'ecommerce'
                  ? 'bg-signal-amber text-ink font-bold'
                  : 'bg-surface-base text-gray-400 hover:text-white hover:bg-surface-overlay border border-triage-border'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Retail & Logistics</span>
            </button>

            <button
              onClick={() => setActiveDomain('saas')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-display flex items-center gap-2 transition-colors ${
                activeDomain === 'saas'
                  ? 'bg-signal-violet text-white font-bold'
                  : 'bg-surface-base text-gray-400 hover:text-white hover:bg-surface-overlay border border-triage-border'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Enterprise SaaS</span>
            </button>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-clinical-mint bg-clinical-mint/10 px-3 py-1 rounded-lg border border-clinical-mint/20 font-medium shrink-0">
          <HeartPulse className="w-3.5 h-3.5" />
          <span>Vector Collection: <strong className="uppercase">{activeDomain}</strong></span>
        </div>
      </div>

      {/* MAIN WORKSPACE AREA */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
        {/* LEFT DYNAMIC SIDEBAR (PATIENT / CUSTOMER) */}
        <aside className="w-full md:w-80 surface-elevated rounded-2xl p-4 flex flex-col gap-4 overflow-y-auto shrink-0 border border-triage-border">
          {activeDomain === 'medical' ? (
            /* MEDICAL CLINIC SIDEBAR */
            <>
              <div>
                <h2 className="text-[11px] font-mono font-semibold uppercase tracking-wider text-gray-400 mb-2.5 flex items-center justify-between">
                  <span>Patient Profile</span>
                  <span className="text-[10px] text-clinical-mint bg-clinical-mint/10 px-2 py-0.5 rounded border border-clinical-mint/20">
                    Clinical Demo
                  </span>
                </h2>

                <div className="space-y-1.5">
                  {INITIAL_PATIENTS.map((p) => {
                    const isSelected = p.patient_id === selectedPatient.patient_id;
                    return (
                      <button
                        key={p.patient_id}
                        onClick={() => setSelectedPatient(p)}
                        className={`w-full text-left p-2.5 rounded-xl border text-xs transition-colors flex items-center justify-between ${
                          isSelected
                            ? 'bg-clinical-mint/10 border-triage-border-active text-white font-semibold'
                            : 'bg-surface-base border-triage-border text-gray-300 hover:bg-surface-overlay'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-surface-base border border-triage-border flex items-center justify-center font-bold text-clinical-mint text-xs">
                            {p.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold">{p.name}</p>
                            <p className="text-[10px] font-mono text-gray-400">{p.patient_id}</p>
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-clinical-mint shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <hr className="border-triage-border" />

              {/* PATIENT APPOINTMENTS */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-mono font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-clinical-mint" />
                    <span>Doctor Visits ({patientAppointments.length})</span>
                  </h3>
                  <button onClick={refreshDomainData} className="text-gray-400 hover:text-white">
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-2">
                  {patientAppointments.map((apt) => (
                    <div key={apt.appointment_id} className="p-3 rounded-xl bg-surface-base border border-triage-border text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-clinical-mint">{apt.doctor_name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-clinical-mint/10 text-clinical-mint border border-clinical-mint/20 font-semibold uppercase">
                          {apt.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400">{apt.specialty}</p>
                      <p className="text-[10px] font-mono text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-clinical-mint" />
                        <span>{new Date(apt.date_time).toLocaleDateString()} at 10:00 AM</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <hr className="border-triage-border" />

              {/* PATIENT LAB RESULTS */}
              <div className="space-y-2.5">
                <h3 className="text-[11px] font-mono font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-clinical-cyan" />
                  <span>Lab Reports ({patientLabResults.length})</span>
                </h3>

                <div className="space-y-2">
                  {patientLabResults.map((lab) => (
                    <div key={lab.lab_id} className="p-2.5 rounded-xl bg-surface-base border border-triage-border text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">{lab.test_name}</span>
                        <span className="text-[9px] font-mono text-clinical-mint bg-clinical-mint/10 px-1.5 py-0.5 rounded border border-clinical-mint/20">
                          {lab.result_status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 line-clamp-1">{lab.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* E-COMMERCE SIDEBAR */
            <>
              <div>
                <h2 className="text-[11px] font-mono font-semibold uppercase tracking-wider text-gray-400 mb-2.5 flex items-center justify-between">
                  <span>Customer Account</span>
                  <span className="text-[10px] text-signal-amber bg-signal-amber/10 px-2 py-0.5 rounded border border-signal-amber/20">
                    E-Commerce
                  </span>
                </h2>

                <div className="space-y-1.5">
                  {INITIAL_CUSTOMERS.map((cust) => {
                    const isSelected = cust.customer_id === selectedCustomer.customer_id;
                    return (
                      <button
                        key={cust.customer_id}
                        onClick={() => setSelectedCustomer(cust)}
                        className={`w-full text-left p-2.5 rounded-xl border text-xs transition-colors flex items-center justify-between ${
                          isSelected
                            ? 'bg-signal-amber/10 border-signal-amber/30 text-white font-semibold'
                            : 'bg-surface-base border-triage-border text-gray-300 hover:bg-surface-overlay'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-surface-base border border-triage-border flex items-center justify-center font-bold text-signal-amber text-xs">
                            {cust.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold">{cust.name}</p>
                            <p className="text-[10px] font-mono text-gray-400">{cust.customer_id}</p>
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-signal-amber shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <hr className="border-triage-border" />

              <div className="flex-1 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-mono font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-signal-amber" />
                    <span>Orders ({customerOrders.length})</span>
                  </h3>
                  <button onClick={refreshDomainData} className="text-gray-400 hover:text-white">
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-2">
                  {customerOrders.map((ord) => (
                    <div key={ord.order_id} className="p-3 rounded-xl bg-surface-base border border-triage-border text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white font-mono">{ord.order_id}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded capitalize bg-signal-amber/10 text-signal-amber border border-signal-amber/20 font-semibold">
                          {ord.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 truncate">
                        {ord.items.map((i) => `${i.qty}x ${i.name}`).join(', ')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </aside>

        {/* MAIN CHAT AREA */}
        <main className="flex-1 surface-elevated rounded-2xl flex flex-col overflow-hidden border border-triage-border">
          {/* Chat Header */}
          <div className="px-5 py-3.5 bg-surface-base border-b border-triage-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-surface-overlay border border-triage-border-active flex items-center justify-center text-clinical-mint">
                {activeDomain === 'medical' ? <Stethoscope className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              <div>
                <h2 className="font-display font-bold text-sm text-white flex items-center gap-2">
                  {activeDomain === 'medical' ? 'Clinical Healthcare AI Support' : 'AI Support Engine'}
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-clinical-mint/10 text-clinical-mint border border-clinical-mint/20">
                    {activeDomain.toUpperCase()} Vector Active
                  </span>
                </h2>
                <p className="text-xs text-gray-400">
                  Active User:{' '}
                  <span className="text-white font-medium">
                    {activeDomain === 'medical' ? selectedPatient.name : selectedCustomer.name}
                  </span>{' '}
                  (<code className="text-clinical-mint font-mono text-[11px]">
                    {activeDomain === 'medical' ? selectedPatient.patient_id : selectedCustomer.customer_id}
                  </code>)
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-gray-400">
              <ShieldCheck className="w-4 h-4 text-clinical-mint" />
              <span>HIPAA Safeguard Active</span>
            </div>
          </div>

          {/* Action Shortcut Chips (Dynamic by Domain) */}
          <div className="px-4 py-2 bg-surface-base border-b border-triage-border flex items-center gap-2 overflow-x-auto text-xs font-mono scrollbar-none">
            <span className="text-gray-400 text-[10px] font-semibold uppercase shrink-0">Try Action:</span>
            {activeDomain === 'medical' ? (
              <>
                <button
                  onClick={() => handleSendMessage('Book an appointment with Dr. Sarah Jenkins')}
                  className="px-2.5 py-1 rounded-lg bg-surface-overlay hover:bg-surface-base text-gray-300 hover:text-clinical-mint border border-triage-border shrink-0 font-medium flex items-center gap-1.5 transition-colors text-[11px]"
                >
                  <Calendar className="w-3 h-3 text-clinical-mint" />
                  <span>Book Doctor Visit</span>
                </button>

                <button
                  onClick={() => handleSendMessage('Show my lab test results')}
                  className="px-2.5 py-1 rounded-lg bg-surface-overlay hover:bg-surface-base text-gray-300 hover:text-clinical-cyan border border-triage-border shrink-0 font-medium flex items-center gap-1.5 transition-colors text-[11px]"
                >
                  <FileText className="w-3 h-3 text-clinical-cyan" />
                  <span>Check Lab Results</span>
                </button>

                <button
                  onClick={() => handleSendMessage('Request prescription refill')}
                  className="px-2.5 py-1 rounded-lg bg-surface-overlay hover:bg-surface-base text-gray-300 hover:text-signal-violet border border-triage-border shrink-0 font-medium flex items-center gap-1.5 transition-colors text-[11px]"
                >
                  <Pill className="w-3 h-3 text-signal-violet" />
                  <span>Prescription Refill</span>
                </button>

                <button
                  onClick={() => handleSendMessage('I have severe chest pain and trouble breathing')}
                  className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0 font-semibold flex items-center gap-1.5 text-[11px]"
                >
                  <AlertTriangle className="w-3 h-3 text-rose-400" />
                  <span>Test 911 Guardrail</span>
                </button>
              </>
            ) : (
              <>
                {customerOrders.length > 0 && (
                  <button
                    onClick={() => handleSendMessage(`Where is order #${customerOrders[0].order_id}?`)}
                    className="px-2.5 py-1 rounded-lg bg-surface-overlay hover:bg-surface-base text-gray-300 hover:text-signal-amber border border-triage-border shrink-0 text-[11px]"
                  >
                    Check #${customerOrders[0].order_id} Status
                  </button>
                )}
                <button
                  onClick={() => handleSendMessage('Cancel order #ORD-5007')}
                  className="px-2.5 py-1 rounded-lg bg-surface-overlay hover:bg-surface-base text-rose-300 border border-rose-500/30 shrink-0 text-[11px]"
                >
                  Cancel Order #ORD-5007
                </button>
                <button
                  onClick={() => handleSendMessage('Can I return order #ORD-5003?')}
                  className="px-2.5 py-1 rounded-lg bg-surface-overlay hover:bg-surface-base text-clinical-mint border border-triage-border shrink-0 text-[11px]"
                >
                  Return Policy Check
                </button>
              </>
            )}
          </div>

          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3.5 bg-surface-base">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className="flex items-end gap-2.5 max-w-[85%]">
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-lg bg-surface-elevated border border-triage-border flex items-center justify-center text-clinical-mint shrink-0">
                      {activeDomain === 'medical' ? <Stethoscope className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                  )}

                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed font-body ${
                      msg.role === 'user'
                        ? 'bg-clinical-mint text-ink font-medium rounded-br-none'
                        : 'bg-surface-overlay text-gray-200 border border-triage-border rounded-bl-none'
                    }`}
                  >
                    {msg.intent && msg.role === 'assistant' && (
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-mono font-semibold text-clinical-mint uppercase tracking-wider">
                          Intent: {msg.intent}
                        </span>
                        {msg.status_indicator && (
                          <span className="text-[10px] font-mono text-gray-400 italic">{msg.status_indicator}</span>
                        )}
                      </div>
                    )}

                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {msg.ticket_id && (
                      <div className="mt-2.5 p-2 rounded-xl bg-signal-amber/10 border border-signal-amber/30 flex items-center gap-2 text-xs text-signal-amber font-mono">
                        <Ticket className="w-3.5 h-3.5 shrink-0" />
                        <span>Ticket Created: #{msg.ticket_id} • Escalated to team</span>
                      </div>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-lg bg-surface-elevated border border-triage-border flex items-center justify-center text-gray-400 shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-mono text-gray-500 mt-0.5 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs font-mono text-gray-400 italic py-1">
                <div className="w-6 h-6 rounded-lg bg-surface-elevated flex items-center justify-center text-clinical-mint">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                </div>
                <span>{activeStatusIndicator || 'Executing tool triage...'}</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Message Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-surface-base border-t border-triage-border flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                activeDomain === 'medical'
                  ? `Ask clinical FAQs, lab results, or schedule visits as ${selectedPatient.name}...`
                  : `Ask policies, order status, or request actions as ${selectedCustomer.name}...`
              }
              className="flex-1 bg-surface-elevated text-gray-100 placeholder-gray-500 text-xs px-3.5 py-2.5 rounded-xl border border-triage-border focus:outline-none focus:border-triage-border-active font-body"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="px-4 py-2.5 rounded-xl bg-clinical-mint hover:bg-emerald-400 text-ink font-display font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-40"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400 font-mono text-xs">Loading multi-domain support interface...</div>}>
      <ChatPageContent />
    </Suspense>
  );
}

