'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, RefreshCw, AlertCircle, Ticket, ChevronRight, Sparkles, Activity } from 'lucide-react';
import { Message } from '@/lib/mock-data';
import { apiFetch } from '@/lib/api-client';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      conversation_id: 'conv-init',
      role: 'assistant',
      content: 'Hello! I am your medical support assistant. How can I help you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      intent: 'Greeting',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!conversationId) {
      setConversationId(`conv-${Date.now().toString().slice(-6)}`);
    }
  }, [conversationId]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

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

    try {
      const res = await apiFetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: 'medical-support',
          conversation_id: conversationId,
          message: text,
        }),
      });

      const data = await res.json();

      const aiMsg: Message = {
        id: `msg-a-${Date.now()}`,
        conversation_id: data.conversation_id || conversationId,
        role: 'assistant',
        content: data.response || "I'm having trouble retrieving a response.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intent: data.intent,
        escalated: data.escalated,
        ticket_id: data.ticket_id,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errMsg: Message = {
        id: `msg-err-${Date.now()}`,
        conversation_id: conversationId,
        role: 'assistant',
        content: "We're having trouble connecting to support right now. Please try again in a moment.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intent: 'error',
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-clinical-mint hover:bg-emerald-400 p-3.5 rounded-xl text-ink shadow-lg flex items-center gap-2.5 transition-colors font-bold text-xs"
          aria-label="Open AI Support Chat"
        >
          <Bot className="w-5 h-5 stroke-[2]" />
          <span className="font-display">Need Help? Chat AI</span>
        </button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="w-[380px] sm:w-[420px] h-[560px] surface-overlay rounded-2xl border border-triage-border flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Header */}
          <div className="px-4 py-3 bg-surface-base border-b border-triage-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-surface-elevated border border-triage-border-active flex items-center justify-center text-clinical-mint font-bold">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xs text-white flex items-center gap-1.5">
                  AutoSupport Assistant
                  <span className="w-1.5 h-1.5 rounded-full bg-clinical-mint" />
                </h3>
                <p className="text-[10px] font-mono text-gray-400">n8n Agent • RAG Grounded</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-gray-400 hover:text-white hover:bg-surface-elevated rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Prompts Bar */}
          <div className="bg-surface-base px-3 py-1.5 border-b border-triage-border flex gap-1.5 overflow-x-auto text-[11px] font-mono scrollbar-none">
            <button
              onClick={() => handleSendMessage('Book an appointment with Dr. Sarah Jenkins')}
              className="px-2 py-1 rounded bg-surface-elevated text-gray-300 hover:text-clinical-mint border border-triage-border shrink-0 flex items-center gap-1 transition-colors"
            >
              <span>Book Doctor</span>
              <ChevronRight className="w-3 h-3 text-gray-500" />
            </button>
            <button
              onClick={() => handleSendMessage('Where is order #ORD-5001?')}
              className="px-2 py-1 rounded bg-surface-elevated text-gray-300 hover:text-signal-amber border border-triage-border shrink-0 flex items-center gap-1 transition-colors"
            >
              <span>Order #ORD-5001</span>
              <ChevronRight className="w-3 h-3 text-gray-500" />
            </button>
            <button
              onClick={() => handleSendMessage('I need human support.')}
              className="px-2 py-1 rounded bg-surface-elevated text-gray-300 hover:text-signal-violet border border-triage-border shrink-0 flex items-center gap-1 transition-colors"
            >
              <span>Human Agent</span>
              <ChevronRight className="w-3 h-3 text-gray-500" />
            </button>
          </div>

          {/* Message History */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-surface-base">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-end gap-2 max-w-[85%]">
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded bg-surface-elevated border border-triage-border flex items-center justify-center text-clinical-mint text-xs shrink-0">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`p-3 rounded-xl text-xs leading-relaxed font-body ${
                      msg.role === 'user'
                        ? 'bg-clinical-mint text-ink font-medium rounded-br-none'
                        : 'bg-surface-elevated text-gray-200 border border-triage-border rounded-bl-none'
                    }`}
                  >
                    {msg.intent && msg.role === 'assistant' && (
                      <div className="flex items-center gap-1 mb-1 text-[10px] font-mono font-semibold text-clinical-mint uppercase">
                        <Sparkles className="w-3 h-3" />
                        <span>Intent: {msg.intent}</span>
                      </div>
                    )}

                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {msg.ticket_id && (
                      <div className="mt-2 pt-1.5 border-t border-triage-border flex items-center gap-1 text-[10px] text-signal-amber font-mono font-semibold">
                        <Ticket className="w-3 h-3" />
                        <span>Ticket Created: #{msg.ticket_id}</span>
                      </div>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-6 h-6 rounded bg-surface-elevated border border-triage-border flex items-center justify-center text-gray-400 text-xs shrink-0">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-mono text-gray-500 mt-0.5 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs font-mono text-gray-400 italic">
                <div className="w-5 h-5 rounded bg-surface-elevated flex items-center justify-center text-clinical-mint">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                </div>
                <span>Executing tool triage...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-2.5 bg-surface-base border-t border-triage-border flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask order status, clinic scheduling, API docs..."
              className="flex-1 bg-surface-elevated text-gray-100 placeholder-gray-500 text-xs px-3 py-2 rounded-lg border border-triage-border focus:outline-none focus:border-triage-border-active font-body"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="p-2 rounded-lg bg-clinical-mint hover:bg-emerald-400 text-ink font-bold disabled:opacity-40 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
