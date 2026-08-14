'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Bot, User, Send, Ticket, ShoppingBag, RefreshCw, CheckCircle2, ShieldCheck, XCircle, ChevronRight, AlertCircle, RotateCcw } from 'lucide-react';
import { INITIAL_CUSTOMERS, INITIAL_ORDERS, Customer, Order, Message } from '@/lib/mock-data';

function ChatPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [selectedCustomer, setSelectedCustomer] = useState<Customer>(INITIAL_CUSTOMERS[0]);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [conversationId, setConversationId] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeStatusIndicator, setActiveStatusIndicator] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-msg-1',
      conversation_id: 'conv-init',
      role: 'assistant',
      content: `Hello ${INITIAL_CUSTOMERS[0].name.split(' ')[0]}! I am your AI Support Assistant. I can check order statuses, process order cancellations/returns, ground policy questions in our knowledge base, or connect you with human support. How can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      intent: 'Greeting',
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setConversationId(`conv-${Date.now().toString().slice(-6)}`);
  }, []);

  const refreshOrders = async () => {
    try {
      const res = await fetch(`/api/orders?customer_id=${selectedCustomer.customer_id}`);
      const data = await res.json();
      if (data.orders) setCustomerOrders(data.orders);
    } catch (e) {
      setCustomerOrders(INITIAL_ORDERS.filter((o) => o.customer_id === selectedCustomer.customer_id));
    }
  };

  useEffect(() => {
    refreshOrders();
  }, [selectedCustomer]);

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

    const userMsg: Message = {
      id: `msg-u-${Date.now()}`,
      conversation_id: conversationId,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setLoading(true);
    setActiveStatusIndicator('Analyzing request & routing tool selection...');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: selectedCustomer.customer_id,
          conversation_id: conversationId,
          message: text,
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
      };

      setMessages((prev) => [...prev, aiMsg]);
      refreshOrders();
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          conversation_id: conversationId,
          role: 'assistant',
          content: "We're having trouble connecting to support right now. Please try again in a moment.",
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-5rem)] flex flex-col md:flex-row gap-6">
      {/* LEFT SIDEBAR - CUSTOMER SELECTOR & ACTIVE ORDERS */}
      <aside className="w-full md:w-80 glass-panel rounded-2xl p-4 flex flex-col gap-4 overflow-y-auto shrink-0">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center justify-between">
            <span>Select Customer Account</span>
            <span className="text-[10px] text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full border border-brand-500/30">
              Demo Users
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

        {/* ACTIVE CUSTOMER ORDERS & ACTION SHORTCUTS */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-brand-400" />
              <span>Orders ({customerOrders.length})</span>
            </h3>
            <button onClick={refreshOrders} className="text-gray-400 hover:text-white">
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {customerOrders.length === 0 ? (
              <p className="text-xs text-gray-500 italic">No order history for this account.</p>
            ) : (
              customerOrders.map((ord) => (
                <div
                  key={ord.order_id}
                  className="p-3 rounded-xl bg-gray-900/90 border border-gray-800 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{ord.order_id}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize ${
                        ord.status === 'delivered' || ord.status === 'refunded'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : ord.status === 'cancelled'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          : ord.status === 'shipped' || ord.status === 'in_transit'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-400 truncate">
                    {ord.items.map((i) => `${i.qty}x ${i.name}`).join(', ')}
                  </p>

                  <div className="pt-1 flex items-center justify-between text-[10px]">
                    <span className="text-gray-400 font-semibold">${ord.total.toFixed(2)}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleSendMessage(`Where is order #${ord.order_id}?`)}
                        className="text-brand-400 hover:underline"
                      >
                        Status
                      </button>
                      <span>•</span>
                      <button
                        onClick={() => handleSendMessage(`Can I return order #${ord.order_id}?`)}
                        className="text-emerald-400 hover:underline"
                      >
                        Return?
                      </button>
                      {ord.status === 'processing' && (
                        <>
                          <span>•</span>
                          <button
                            onClick={() => handleSendMessage(`Cancel order #${ord.order_id}`)}
                            className="text-rose-400 hover:underline font-semibold"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>

      {/* MAIN CHAT AREA */}
      <main className="flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden border border-gray-800">
        {/* Chat Header */}
        <div className="px-6 py-4 bg-gray-900/90 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white flex items-center gap-2">
                AI Customer Support Platform
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
                  RAG + Tools + Actions
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                Active Account: <span className="text-white font-medium">{selectedCustomer.name}</span> (<code className="text-brand-300">{selectedCustomer.customer_id}</code>)
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Ownership Verification Active</span>
          </div>
        </div>

        {/* Action Shortcut Chips */}
        <div className="px-4 py-2.5 bg-gray-900/40 border-b border-gray-800/60 flex items-center gap-2 overflow-x-auto text-xs scrollbar-none">
          <span className="text-gray-500 text-[11px] font-semibold uppercase tracking-wider shrink-0">Try Action / Tool:</span>
          {customerOrders.length > 0 && (
            <button
              onClick={() => handleSendMessage(`Where is order #${customerOrders[0].order_id}?`)}
              className="px-3 py-1 rounded-lg bg-gray-800 hover:bg-brand-600/30 text-gray-300 hover:text-brand-300 border border-gray-700/60 shrink-0"
            >
              Check #${customerOrders[0].order_id} Status
            </button>
          )}
          {customerOrders.some((o) => o.status === 'processing') && (
            <button
              onClick={() => {
                const procOrder = customerOrders.find((o) => o.status === 'processing');
                handleSendMessage(`Cancel order #${procOrder?.order_id}`);
              }}
              className="px-3 py-1 rounded-lg bg-gray-800 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0 font-semibold"
            >
              Cancel Processing Order
            </button>
          )}
          <button
            onClick={() => handleSendMessage(`Can I return order #${customerOrders[0]?.order_id || 'ORD-5003'}?`)}
            className="px-3 py-1 rounded-lg bg-gray-800 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0 font-semibold"
          >
            Multi-Source Return Check
          </button>
          <button
            onClick={() => handleSendMessage('Cancel order #ORD-5001')}
            className="px-3 py-1 rounded-lg bg-gray-800 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0"
          >
            Test Ownership Guardrail
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-950/80">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-end gap-3 max-w-[85%]">
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white shrink-0 shadow-md">
                    <Bot className="w-5 h-5" />
                  </div>
                )}

                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-brand-600 text-white rounded-br-none shadow-lg'
                      : 'bg-gray-900 text-gray-100 border border-gray-800 rounded-bl-none shadow-sm'
                  }`}
                >
                  {msg.intent && msg.role === 'assistant' && (
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 text-[10px] font-bold uppercase tracking-wider border border-brand-500/30">
                        {msg.intent}
                      </span>
                      {msg.status_indicator && (
                        <span className="text-[10px] text-gray-400 italic">
                          {msg.status_indicator}
                        </span>
                      )}
                    </div>
                  )}

                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {msg.ticket_id && (
                    <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-xs text-amber-300 font-medium">
                      <Ticket className="w-4 h-4 shrink-0" />
                      <span>Ticket Created: #{msg.ticket_id} • Escalated to human support queue</span>
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
              <div className="w-8 h-8 rounded-xl bg-brand-600/30 border border-brand-500/30 flex items-center justify-center text-brand-300">
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
            placeholder={`Ask policies, order status, or request actions as ${selectedCustomer.name}...`}
            className="flex-1 bg-gray-950 text-gray-100 placeholder-gray-500 text-sm px-4 py-3 rounded-xl border border-gray-800 focus:outline-none focus:border-brand-500"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || loading}
            className="gradient-button font-semibold px-6 py-3 rounded-xl text-white disabled:opacity-40 flex items-center gap-2 shadow-md transition-opacity"
          >
            <span>Send</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </main>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading chat interface...</div>}>
      <ChatPageContent />
    </Suspense>
  );
}
