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
  MessageSquare,
  Users,
  Radio,
  Zap,
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

import Navbar from '@/components/Navbar';
import { useAuth } from '@/lib/auth-context';
import {
  fetchUserConversations,
  getOrCreateConversation,
  fetchConversationMessages,
  sendRealtimeMessage,
  subscribeToConversationMessages,
  fetchPatientProfiles,
  ConversationItem,
  RealtimeChatMessage,
  PatientProfileItem,
} from '@/lib/services/realtime-chat-service';
import type { DoctorProfile } from '@/lib/services/doctor-service';
import { apiFetch } from '@/lib/api-client';

// ─── LIVE DOCTOR-PATIENT REALTIME CHAT COMPONENT ─────────────────────────────
function LiveDoctorChatWorkspace() {
  const { user } = useAuth();
  const currentUserId = user?.id ?? 'PAT-2001';
  const currentUserRole = user?.role ?? 'patient';
  const currentUserName = user?.name ?? 'User';

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [patients, setPatients] = useState<PatientProfileItem[]>([]);
  const [selectedConv, setSelectedConv] = useState<ConversationItem | null>(null);
  const [messages, setMessages] = useState<RealtimeChatMessage[]>([]);
  const [inputContent, setInputContent] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load user conversations and role-aware contact directory list
  useEffect(() => {
    setLoading(true);

    // Fetch user conversations from Supabase
    fetchUserConversations(currentUserId).then((res) => {
      if (res.success) {
        setConversations(res.conversations);
        if (res.conversations.length > 0) {
          setSelectedConv(res.conversations[0]);
        }
      }
    });

    // Role-based directory fetching:
    // Doctors see Registered Patients; Patients see Clinic Doctors
    if (currentUserRole === 'doctor') {
      fetchPatientProfiles(currentUserId).then((res) => {
        setPatients(res.patients);
        setLoading(false);
      });
    } else {
      apiFetch('/api/doctors')
        .then((r) => r.json())
        .then((d) => setDoctors(d.doctors ?? []))
        .catch(() => setDoctors([]))
        .finally(() => setLoading(false));
    }
  }, [currentUserId, currentUserRole]);

  // When selected conversation changes, fetch history & subscribe to Realtime
  useEffect(() => {
    if (!selectedConv) {
      setMessages([]);
      return;
    }

    // 1. Fetch history
    fetchConversationMessages(selectedConv.id, currentUserId).then((res) => {
      if (res.success) setMessages(res.messages);
    });

    // 2. Subscribe to Realtime WebSocket updates
    const unsubscribe = subscribeToConversationMessages(
      selectedConv.id,
      currentUserId,
      (incomingMsg) => {
        setMessages((prev) => {
          // Deduplicate by message ID
          if (prev.some((m) => m.id === incomingMsg.id)) return prev;
          return [...prev, incomingMsg];
        });
      }
    );

    // Cleanup subscription on unmount or conversation change
    return () => {
      unsubscribe();
    };
  }, [selectedConv, currentUserId]);

  // Start or open conversation with a specific doctor
  const handleSelectDoctor = async (doc: DoctorProfile) => {
    // Ensure we use the doctor's user ID (profiles.id) rather than the doctor record ID
    const patientId = currentUserId;
    const doctorUserId = doc.userId || doc.id;

    const res = await getOrCreateConversation({
      patientId,
      doctorId: doctorUserId,
    });

    if (res.success && res.conversationId) {
      const newConv: ConversationItem = {
        id: res.conversationId,
        patientId,
        doctorId: doctorUserId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        otherUser: {
          id: doctorUserId,
          fullName: doc.name,
          role: 'doctor',
          specialization: doc.specialization,
        },
      };

      setConversations((prev) => {
        const exists = prev.find((c) => c.id === res.conversationId);
        return exists ? prev : [newConv, ...prev];
      });
      setSelectedConv(newConv);
    }
  };

  // Start or open conversation with a specific patient (Doctor flow)
  const handleSelectPatient = async (patient: PatientProfileItem) => {
    const res = await getOrCreateConversation({
      patientId: patient.id,
      doctorId: currentUserId,
    });

    if (res.success && res.conversationId) {
      const newConv: ConversationItem = {
        id: res.conversationId,
        patientId: patient.id,
        doctorId: currentUserId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        otherUser: {
          id: patient.id,
          fullName: patient.fullName,
          role: 'patient',
          specialization: null,
        },
      };

      setConversations((prev) => {
        const exists = prev.find((c) => c.id === res.conversationId);
        return exists ? prev : [newConv, ...prev];
      });
      setSelectedConv(newConv);
    }
  };

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim() || !selectedConv || sending) return;

    const content = inputContent.trim();
    setInputContent('');
    setSending(true);

    const res = await sendRealtimeMessage({
      conversationId: selectedConv.id,
      senderId: currentUserId,
      content,
    });

    setSending(false);

    if (res.success && res.message) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === res.message!.id)) return prev;
        return [...prev, res.message!];
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)] min-h-[600px]">
      {/* Sidebar: Conversations & Contacts */}
      <div className="lg:col-span-4 flex flex-col surface-elevated rounded-2xl border border-triage-border overflow-hidden">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-triage-border bg-surface-base/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-clinical-mint animate-pulse" />
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              {currentUserRole === 'doctor' ? 'Patient Requests' : 'Your Conversations'}
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-clinical-mint/10 border border-clinical-mint/30 text-clinical-mint font-semibold">
            Supabase Realtime Active
          </span>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {conversations.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider px-2">Active Chats</p>
              {conversations.map((conv) => {
                const isActive = selectedConv?.id === conv.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConv(conv)}
                    className={`w-full p-3 rounded-xl text-left border transition-all flex items-center gap-3 ${
                      isActive
                        ? 'bg-surface-base border-clinical-mint/60 text-white shadow-lg'
                        : 'bg-surface-elevated hover:bg-surface-base/60 border-triage-border text-gray-300'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-clinical-mint/10 border border-clinical-mint/30 flex items-center justify-center text-clinical-mint font-bold text-xs shrink-0">
                      {conv.otherUser.fullName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">{conv.otherUser.fullName}</span>
                        <span className="text-[9px] font-mono text-gray-400">
                          {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-clinical-mint truncate">
                        {conv.otherUser.specialization || (conv.otherUser.role === 'doctor' ? 'Medical Doctor' : 'Patient Account')}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Patient Directory for Doctors */}
          {currentUserRole === 'doctor' && patients.length > 0 && (
            <div className="pt-3 space-y-1.5 border-t border-triage-border mt-3">
              <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider px-2">Registered Clinic Patients</p>
              {patients.map((pat) => (
                <button
                  key={pat.id}
                  onClick={() => handleSelectPatient(pat)}
                  className="w-full p-2.5 rounded-xl text-left bg-surface-base/40 hover:bg-surface-base border border-triage-border hover:border-clinical-mint/40 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded bg-surface-elevated border border-triage-border text-clinical-mint font-bold text-xs flex items-center justify-center">
                      👤
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-200">{pat.fullName}</p>
                      <p className="text-[9px] font-mono text-clinical-mint">Patient Account</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-clinical-mint bg-clinical-mint/10 px-2 py-0.5 rounded border border-clinical-mint/30">
                    Chat
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Doctor Directory for Patients */}
          {currentUserRole === 'patient' && doctors.length > 0 && (
            <div className="pt-3 space-y-1.5 border-t border-triage-border mt-3">
              <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider px-2">Verified Clinic Doctors</p>
              {doctors.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => handleSelectDoctor(doc)}
                  className="w-full p-2.5 rounded-xl text-left bg-surface-base/40 hover:bg-surface-base border border-triage-border hover:border-clinical-mint/40 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded bg-surface-elevated border border-triage-border text-clinical-mint font-bold text-xs flex items-center justify-center">
                      ✚
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-200">{doc.name}</p>
                      <p className="text-[9px] font-mono text-clinical-mint">{doc.specialization}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-clinical-mint bg-clinical-mint/10 px-2 py-0.5 rounded border border-clinical-mint/30">
                    Chat
                  </span>
                </button>
              ))}
            </div>
          )}

          {conversations.length === 0 && doctors.length === 0 && !loading && (
            <div className="p-6 text-center text-xs text-gray-400 font-mono space-y-2">
              <p>No active conversations.</p>
              <p className="text-[10px] text-gray-500">
                Log in as a Patient or Doctor in two browser windows to test real-time messages!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Pane */}
      <div className="lg:col-span-8 flex flex-col surface-elevated rounded-2xl border border-triage-border overflow-hidden">
        {selectedConv ? (
          <>
            {/* Chat Pane Header */}
            <div className="p-4 border-b border-triage-border bg-surface-base/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-clinical-mint/10 border border-clinical-mint/30 flex items-center justify-center text-clinical-mint font-bold text-sm">
                  {selectedConv.otherUser.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-none">{selectedConv.otherUser.fullName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-clinical-mint animate-pulse" />
                    <span className="text-[10px] font-mono text-clinical-mint uppercase font-semibold">
                      {selectedConv.otherUser.specialization || selectedConv.otherUser.role} · Live Realtime Channel
                    </span>
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-gray-400 bg-surface-base px-2.5 py-1 rounded-lg border border-triage-border">
                RLS Encrypted
              </span>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-surface-base/30">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-surface-elevated border border-triage-border flex items-center justify-center text-clinical-mint">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-mono font-semibold text-gray-300">
                    Real-time Conversation Started
                  </p>
                  <p className="text-[11px] text-gray-400 max-w-sm">
                    Send a message below. Supabase Realtime will stream replies instantly across active browser windows.
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isSelf = msg.isSelf || msg.senderId === currentUserId;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="text-[10px] font-mono font-semibold text-gray-400">
                          {isSelf ? 'You' : msg.senderName}
                        </span>
                        <span className="text-[9px] font-mono text-gray-500">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div
                        className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                          isSelf
                            ? 'bg-clinical-mint/15 text-white border border-clinical-mint/40 rounded-br-none shadow-sm'
                            : 'bg-surface-elevated text-gray-100 border border-triage-border rounded-bl-none shadow-sm'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Box */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-triage-border bg-surface-base/80 flex gap-2">
              <input
                type="text"
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                placeholder={`Type a message to ${selectedConv.otherUser.fullName}…`}
                className="flex-1 bg-surface-elevated text-white text-xs px-4 py-3 rounded-xl border border-triage-border focus:outline-none focus:border-clinical-mint/60 font-body placeholder:text-gray-500"
              />
              <button
                type="submit"
                disabled={!inputContent.trim() || sending}
                className="px-5 py-3 rounded-xl bg-clinical-mint hover:bg-emerald-400 text-ink font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-40 shrink-0"
              >
                <Send className="w-4 h-4" />
                <span>{sending ? 'Sending...' : 'Send'}</span>
              </button>
            </form>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
            <Stethoscope className="w-10 h-10 text-clinical-mint/60" />
            <h3 className="text-sm font-bold text-white">Select a Conversation</h3>
            <p className="text-xs text-gray-400 max-w-sm">
              Choose a doctor or patient from the left panel to begin real-time consultation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN CHAT PAGE WRAPPER WITH TAB MODE SWITCHER ───────────────────────────
function ChatPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialDomain = (searchParams.get('domain') || 'medical') as AppDomain;
  const { user } = useAuth();

  const [activeDomain, setActiveDomain] = useState<AppDomain>(initialDomain);
  const [chatMode, setChatMode] = useState<'ai' | 'doctor'>('ai');

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

  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    setConversationId(`conv-${Date.now().toString().slice(-6)}`);
  }, []);

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
        const resApt = await apiFetch(`/api/appointments?patient_id=${selectedPatient.patient_id}`);
        const dataApt = await resApt.json();
        if (dataApt.appointments) setPatientAppointments(dataApt.appointments);

        const resLab = await apiFetch(`/api/lab-results?patient_id=${selectedPatient.patient_id}`);
        const dataLab = await resLab.json();
        if (dataLab.results) setPatientLabResults(dataLab.results);
      } else {
        const resOrd = await apiFetch(`/api/orders?customer_id=${selectedCustomer.customer_id}`);
        const dataOrd = await resOrd.json();
        if (dataOrd.orders) setCustomerOrders(dataOrd.orders);
      }
    } catch {
      // Graceful fallback
    }
  };

  useEffect(() => {
    refreshDomainData();
  }, [activeDomain, selectedPatient, selectedCustomer]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      conversation_id: conversationId,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      domain: activeDomain,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
        const res = await apiFetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversation_id: conversationId,
          domain: activeDomain,
          user_id: activeDomain === 'medical' ? selectedPatient.patient_id : selectedCustomer.customer_id,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.reply) {
        const botMsg: Message = {
          id: `reply-${Date.now()}`,
          conversation_id: conversationId,
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          intent: data.intent || 'General Query',
          domain: activeDomain,
        };
        setMessages((prev) => [...prev, botMsg]);
        refreshDomainData();
      }
    } catch {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4 font-body">
        {/* Workspace Mode Switcher Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 surface-elevated rounded-2xl border border-triage-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-surface-base border border-triage-border text-clinical-mint flex items-center justify-center font-bold">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Communication Portal</h2>
              <p className="text-[10px] font-mono text-gray-400">
                User: <span className="text-clinical-mint font-semibold">{user?.name ?? 'Ada Lovelace'}</span> ({user?.role ?? 'Patient'})
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1.5 bg-surface-base p-1 rounded-xl border border-triage-border">
            <button
              onClick={() => setChatMode('ai')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-2 transition-all ${
                chatMode === 'ai'
                  ? 'bg-surface-elevated text-clinical-mint border border-triage-border-active shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>🤖 Clinical AI Assistant</span>
            </button>

            <button
              onClick={() => setChatMode('doctor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-2 transition-all ${
                chatMode === 'doctor'
                  ? 'bg-surface-elevated text-clinical-mint border border-triage-border-active shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-clinical-mint animate-pulse" />
              <span>🩺 Live Doctor ↔ Patient Chat (Realtime)</span>
            </button>
          </div>
        </div>

        {/* Render Selected Workspace */}
        {chatMode === 'doctor' ? (
          <LiveDoctorChatWorkspace />
        ) : (
          /* Existing AI Bot Workspace */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-200px)] min-h-[560px]">
            {/* Left Column: Context Card */}
            <div className="lg:col-span-4 flex flex-col surface-elevated rounded-2xl border border-triage-border p-4 space-y-4 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-triage-border pb-3">
                <span className="text-xs font-mono font-semibold text-gray-400 uppercase tracking-wider">Patient Context</span>
                <span className="badge-mint text-[10px]">Verified Record</span>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-base border border-triage-border space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-surface-overlay border border-triage-border text-clinical-mint font-mono font-bold flex items-center justify-center text-xs">
                    {selectedPatient.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">{selectedPatient.name}</h3>
                    <p className="text-[10px] font-mono text-gray-400">ID: {selectedPatient.patient_id} • DOB: {selectedPatient.dob}</p>
                  </div>
                </div>
                <p className="text-[10px] font-mono text-clinical-mint pt-1 border-t border-triage-border/50">
                  Primary Doctor: {selectedPatient.primary_doctor}
                </p>
              </div>

              <div className="space-y-2 flex-1">
                <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Recent Lab Reports</p>
                {patientLabResults.map((result, idx) => (
                  <div key={result.lab_id || `lab-${idx}`} className="p-2.5 rounded-lg bg-surface-base border border-triage-border text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-200">{result.test_name}</span>
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${result.result_status === 'normal' ? 'badge-mint' : 'badge-amber'}`}>
                        {(result.result_status || 'normal').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[10px] font-mono text-gray-400">{result.date_conducted} • {result.summary}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: AI Chat Panel */}
            <div className="lg:col-span-8 flex flex-col surface-elevated rounded-2xl border border-triage-border overflow-hidden">
              <div className="p-4 border-b border-triage-border bg-surface-base/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-clinical-mint" />
                  <span className="text-xs font-mono font-bold text-white">Clinical AI Medical Assistant</span>
                </div>
                <span className="text-[10px] font-mono text-gray-400">Gemini 1.5 Pro</span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-base/30">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[10px] font-mono font-semibold text-gray-400">
                        {msg.role === 'user' ? 'You' : 'Clinical AI'}
                      </span>
                      {msg.intent && <span className="text-[9px] font-mono badge-mint">{msg.intent}</span>}
                    </div>
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-clinical-mint/15 text-white border border-clinical-mint/40 rounded-br-none'
                          : 'bg-surface-elevated text-gray-100 border border-triage-border rounded-bl-none'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputMessage);
                }}
                className="p-3 border-t border-triage-border bg-surface-base/80 flex gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask clinical assistant or request appointment..."
                  className="flex-1 bg-surface-elevated text-white text-xs px-4 py-3 rounded-xl border border-triage-border focus:outline-none focus:border-clinical-mint/60"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || loading}
                  className="px-5 py-3 rounded-xl bg-clinical-mint text-ink font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Thinking...' : 'Send'}</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen surface-base flex items-center justify-center text-xs font-mono text-gray-400">Loading Clinical Chat...</div>}>
      <ChatPageContent />
    </Suspense>
  );
}
