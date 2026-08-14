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

function ChatPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialDomain = (searchParams.get('domain') || 'medical') as AppDomain;

  const [activeDomain, setActiveDomain] = useState<AppDomain>(initialDomain);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>(INITIAL_CUSTOMERS[0]);
  const [selectedPatient, setSelectedPatient] = useState<Patient>(INITIAL_PATIENTS[0]);

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
      <div className="glass-panel rounded-2xl p-2.5 flex items-center justify-between gap-3 overflow-x-auto shrink-0 border border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 shrink-0 px-2">
            Select Service Domain:
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveDomain('medical')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeDomain === 'medical'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-400/50'
                  : 'bg-gray-900/80 text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>🩺 Medical / Clinic Service</span>
            </button>

            <button
              onClick={() => setActiveDomain('ecommerce')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeDomain === 'ecommerce'
                  ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-950/40 ring-1 ring-brand-400/50'
                  : 'bg-gray-900/80 text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>🛍️ Shopping & Delivery</span>
            </button>

            <button
              onClick={() => setActiveDomain('saas')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeDomain === 'saas'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-950/40 ring-1 ring-purple-400/50'
                  : 'bg-gray-900/80 text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>🏢 Enterprise SaaS</span>
            </button>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 font-medium shrink-0">
          <HeartPulse className="w-3.5 h-3.5" />
          <span>Vector Store: <strong className="uppercase">{activeDomain}</strong> Collection</span>
        </div>
      </div>

      {/* MAIN WORKSPACE AREA */}
      <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">
        {/* LEFT DYNAMIC SIDEBAR (PATIENT / CUSTOMER) */}
        <aside className="w-full md:w-80 glass-panel rounded-2xl p-4 flex flex-col gap-4 overflow-y-auto shrink-0 border border-gray-800">
          {activeDomain === 'medical' ? (
            /* MEDICAL CLINIC SIDEBAR */
            <>
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5 flex items-center justify-between">
                  <span>Select Patient Profile</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
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
                        className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-emerald-600/20 border-emerald-500/50 text-white font-semibold shadow-sm'
                            : 'bg-gray-900/60 border-gray-800 text-gray-300 hover:bg-gray-800/80'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400 text-xs">
                            {p.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold">{p.name}</p>
                            <p className="text-[10px] text-gray-400">{p.patient_id}</p>
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <hr className="border-gray-800" />

              {/* PATIENT APPOINTMENTS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Doctor Visits ({patientAppointments.length})</span>
                  </h3>
                  <button onClick={refreshDomainData} className="text-gray-400 hover:text-white">
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-2">
                  {patientAppointments.map((apt) => (
                    <div key={apt.appointment_id} className="p-3 rounded-xl bg-gray-900/90 border border-gray-800 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-300">{apt.doctor_name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold uppercase">
                          {apt.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400">{apt.specialty}</p>
                      <p className="text-[10px] text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        <span>{new Date(apt.date_time).toLocaleDateString()} at 10:00 AM</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <hr className="border-gray-800" />

              {/* PATIENT LAB RESULTS */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-teal-400" />
                  <span>Lab Reports ({patientLabResults.length})</span>
                </h3>

                <div className="space-y-2">
                  {patientLabResults.map((lab) => (
                    <div key={lab.lab_id} className="p-2.5 rounded-xl bg-gray-900/90 border border-gray-800 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">{lab.test_name}</span>
                        <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
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
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5 flex items-center justify-between">
                  <span>Select Customer Account</span>
                  <span className="text-[10px] text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full border border-brand-500/30">
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
                        className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-brand-600/20 border-brand-500/50 text-white font-semibold shadow-sm'
                            : 'bg-gray-900/60 border-gray-800 text-gray-300 hover:bg-gray-800/80'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-gray-800 flex items-center justify-center font-bold text-brand-400 text-xs">
                            {cust.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold">{cust.name}</p>
                            <p className="text-[10px] text-gray-400">{cust.customer_id}</p>
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <hr className="border-gray-800" />

              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-brand-400" />
                    <span>Orders ({customerOrders.length})</span>
                  </h3>
                  <button onClick={refreshDomainData} className="text-gray-400 hover:text-white">
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-2">
                  {customerOrders.map((ord) => (
                    <div key={ord.order_id} className="p-3 rounded-xl bg-gray-900/90 border border-gray-800 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{ord.order_id}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize bg-brand-500/10 text-brand-400 border border-brand-500/30">
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
        <main className="flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden border border-gray-800">
          {/* Chat Header */}
          <div className="px-6 py-4 bg-gray-900/90 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md ${
                activeDomain === 'medical' ? 'bg-gradient-to-br from-emerald-600 to-teal-600' : 'bg-brand-600'
              }`}>
                {activeDomain === 'medical' ? <Stethoscope className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
              </div>
              <div>
                <h2 className="font-bold text-base text-white flex items-center gap-2">
                  {activeDomain === 'medical' ? 'Clinical Healthcare AI Support' : 'AI Customer Support Platform'}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
                    {activeDomain.toUpperCase()} Vector RAG Active
                  </span>
                </h2>
                <p className="text-xs text-gray-400">
                  Active User: <span className="text-white font-medium">
                    {activeDomain === 'medical' ? selectedPatient.name : selectedCustomer.name}
                  </span> (<code className="text-emerald-300">
                    {activeDomain === 'medical' ? selectedPatient.patient_id : selectedCustomer.customer_id}
                  </code>)
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>HIPAA & Security Rules Active</span>
            </div>
          </div>

          {/* Action Shortcut Chips (Dynamic by Domain) */}
          <div className="px-4 py-2.5 bg-gray-900/40 border-b border-gray-800/60 flex items-center gap-2 overflow-x-auto text-xs scrollbar-none">
            <span className="text-gray-500 text-[11px] font-semibold uppercase tracking-wider shrink-0">Try Action:</span>
            {activeDomain === 'medical' ? (
              <>
                <button
                  onClick={() => handleSendMessage('Book an appointment with Dr. Sarah Jenkins')}
                  className="px-3 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 shrink-0 font-semibold flex items-center gap-1.5"
                >
                  <Calendar className="w-3 h-3 text-emerald-400" />
                  <span>Book Doctor Visit</span>
                </button>

                <button
                  onClick={() => handleSendMessage('Show my lab test results')}
                  className="px-3 py-1 rounded-lg bg-teal-950/80 hover:bg-teal-600/30 text-teal-300 border border-teal-500/40 shrink-0 font-semibold flex items-center gap-1.5"
                >
                  <FileText className="w-3 h-3 text-teal-400" />
                  <span>Check Lab Results</span>
                </button>

                <button
                  onClick={() => handleSendMessage('Request prescription refill')}
                  className="px-3 py-1 rounded-lg bg-purple-950/80 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 shrink-0 font-semibold flex items-center gap-1.5"
                >
                  <Pill className="w-3 h-3 text-purple-400" />
                  <span>Prescription Refill</span>
                </button>

                <button
                  onClick={() => handleSendMessage('I have severe chest pain and trouble breathing')}
                  className="px-3 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 shrink-0 font-bold flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-3 h-3 text-rose-400" />
                  <span>Test 911 Emergency Rule</span>
                </button>
              </>
            ) : (
              <>
                {customerOrders.length > 0 && (
                  <button
                    onClick={() => handleSendMessage(`Where is order #${customerOrders[0].order_id}?`)}
                    className="px-3 py-1 rounded-lg bg-gray-800 hover:bg-brand-600/30 text-gray-300 hover:text-brand-300 border border-gray-700/60 shrink-0"
                  >
                    Check #${customerOrders[0].order_id} Status
                  </button>
                )}
                <button
                  onClick={() => handleSendMessage('Cancel order #ORD-5007')}
                  className="px-3 py-1 rounded-lg bg-gray-800 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0 font-semibold"
                >
                  Cancel Order #ORD-5007
                </button>
                <button
                  onClick={() => handleSendMessage('Can I return order #ORD-5003?')}
                  className="px-3 py-1 rounded-lg bg-gray-800 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0 font-semibold"
                >
                  Return Policy Check
                </button>
              </>
            )}
          </div>

          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-950/80">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className="flex items-end gap-3 max-w-[85%]">
                  {msg.role === 'assistant' && (
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md ${
                      activeDomain === 'medical' ? 'bg-emerald-600' : 'bg-brand-600'
                    }`}>
                      {activeDomain === 'medical' ? <Stethoscope className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                    </div>
                  )}

                  <div
                    className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? activeDomain === 'medical'
                          ? 'bg-emerald-600 text-white rounded-br-none shadow-lg'
                          : 'bg-brand-600 text-white rounded-br-none shadow-lg'
                        : 'bg-gray-900 text-gray-100 border border-gray-800 rounded-bl-none shadow-sm'
                    }`}
                  >
                    {msg.intent && msg.role === 'assistant' && (
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
                          {msg.intent}
                        </span>
                        {msg.status_indicator && (
                          <span className="text-[10px] text-gray-400 italic">{msg.status_indicator}</span>
                        )}
                      </div>
                    )}

                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {msg.ticket_id && (
                      <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-xs text-amber-300 font-medium">
                        <Ticket className="w-4 h-4 shrink-0" />
                        <span>Ticket Created: #{msg.ticket_id} • Escalated to clinical/support team</span>
                      </div>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-gray-800 flex items-center justify-center text-gray-300 shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-gray-500 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-3 text-xs text-gray-400 italic py-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600/30 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                </div>
                <span>{activeStatusIndicator || 'AI Agent reasoning & fetching tool data...'}</span>
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
            className="p-4 bg-gray-900 border-t border-gray-800 flex items-center gap-3"
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
              className="flex-1 bg-gray-950 text-gray-100 placeholder-gray-500 text-sm px-4 py-3 rounded-xl border border-gray-800 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className={`font-semibold px-6 py-3 rounded-xl text-white disabled:opacity-40 flex items-center gap-2 shadow-md transition-all ${
                activeDomain === 'medical'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-950/50'
                  : 'gradient-button'
              }`}
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading multi-domain support interface...</div>}>
      <ChatPageContent />
    </Suspense>
  );
}
