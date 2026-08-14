'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, RefreshCw, AlertCircle, Ticket, ChevronRight } from 'lucide-react';
import { Message } from '@/lib/mock-data';

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
      content: 'Hello! I am your AI Customer Support Assistant. How can I help you today?',
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
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: 'CUST-1001',
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
          className="gradient-button p-4 rounded-full text-white shadow-2xl flex items-center gap-3 hover:scale-105 transition-transform group"
          aria-label="Open AI Support Chat"
        >
          <div className="relative">
            <Bot className="w-7 h-7" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-gray-900 animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-gray-900" />
          </div>
          <span className="font-semibold text-sm pr-1">Need Help? Chat AI</span>
        </button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="w-[380px] sm:w-[420px] h-[580px] glass-panel rounded-2xl border border-gray-700/80 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-gray-900 via-brand-950 to-gray-900 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                  AutoSupport Assistant
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </h3>
                <p className="text-[11px] text-gray-400">n8n Agent • RAG Grounded</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Prompts Bar */}
          <div className="bg-gray-900/90 px-3 py-2 border-b border-gray-800 flex gap-1.5 overflow-x-auto text-xs scrollbar-none">
            <button
              onClick={() => handleSendMessage('Where is order #ORD-5001?')}
              className="px-2.5 py-1 rounded-full bg-gray-800 hover:bg-brand-600/30 text-gray-300 hover:text-brand-300 border border-gray-700/60 shrink-0 flex items-center gap-1"
            >
              <span>Order #ORD-5001</span>
              <ChevronRight className="w-3 h-3 text-gray-400" />
            </button>
            <button
              onClick={() => handleSendMessage('What is your refund policy?')}
              className="px-2.5 py-1 rounded-full bg-gray-800 hover:bg-brand-600/30 text-gray-300 hover:text-brand-300 border border-gray-700/60 shrink-0 flex items-center gap-1"
            >
              <span>Refund Policy</span>
              <ChevronRight className="w-3 h-3 text-gray-400" />
            </button>
            <button
              onClick={() => handleSendMessage('I need to speak to a human support representative.')}
              className="px-2.5 py-1 rounded-full bg-gray-800 hover:bg-brand-600/30 text-gray-300 hover:text-brand-300 border border-gray-700/60 shrink-0 flex items-center gap-1"
            >
              <span>Human Agent</span>
              <ChevronRight className="w-3 h-3 text-gray-400" />
            </button>
          </div>

          {/* Message History */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gray-950/60">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-end gap-2 max-w-[85%]">
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white text-xs shrink-0 shadow-sm">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-brand-600 text-white rounded-br-none shadow-md'
                        : 'bg-gray-800/90 text-gray-200 border border-gray-700/60 rounded-bl-none'
                    }`}
                  >
                    {msg.intent && msg.role === 'assistant' && (
                      <div className="flex items-center gap-1.5 mb-1 text-[10px] font-semibold text-brand-300 uppercase tracking-wider">
                        <span>Intent: {msg.intent}</span>
                      </div>
                    )}

                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {msg.ticket_id && (
                      <div className="mt-2.5 pt-2 border-t border-gray-700/60 flex items-center gap-1.5 text-[11px] text-amber-400 font-semibold">
                        <Ticket className="w-3.5 h-3.5" />
                        <span>Ticket Created: #{msg.ticket_id}</span>
                      </div>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-lg bg-gray-700 flex items-center justify-center text-white text-xs shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-gray-500 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-gray-400 italic">
                <div className="w-6 h-6 rounded-lg bg-brand-600/40 flex items-center justify-center text-brand-300">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                </div>
                <span>AI Agent reasoning & fetching tool data...</span>
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
            className="p-3 bg-gray-900 border-t border-gray-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask order status, policies, or help..."
              className="flex-1 bg-gray-800 text-gray-100 placeholder-gray-500 text-xs px-3.5 py-2.5 rounded-xl border border-gray-700/60 focus:outline-none focus:border-brand-500"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="gradient-button p-2.5 rounded-xl text-white disabled:opacity-40 transition-opacity"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
