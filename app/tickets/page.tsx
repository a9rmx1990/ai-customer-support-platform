'use client';

import { useState, useEffect } from 'react';
import { Ticket, Plus, Filter, CheckCircle2, AlertTriangle, Clock, RefreshCw, User, MessageSquare } from 'lucide-react';
import { SupportTicket } from '@/lib/mock-data';

export default function TicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New ticket form state
  const [newCustId, setNewCustId] = useState('CUST-1001');
  const [newIssue, setNewIssue] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tickets');
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIssue.trim()) return;

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: newCustId,
          issue: newIssue,
          priority: newPriority,
          reason: 'Manual ticket logged by support agent',
        }),
      });
      if (res.ok) {
        setNewIssue('');
        setShowCreateModal(false);
        fetchTickets();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter === 'all') return true;
    return t.status === statusFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <Ticket className="w-8 h-8 text-brand-400" />
            Support Ticket Dashboard
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Real-time human escalation queue created by the n8n AI Support Agent.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchTickets}
            className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="gradient-button text-white text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>New Ticket</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total Tickets</p>
          <p className="text-3xl font-extrabold text-white mt-1">{tickets.length}</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Open Queue</p>
          <p className="text-3xl font-extrabold text-amber-400 mt-1">
            {tickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length}
          </p>
        </div>
        <div className="glass-panel p-5 rounded-2xl">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">High / Urgent</p>
          <p className="text-3xl font-extrabold text-rose-400 mt-1">
            {tickets.filter((t) => t.priority === 'high' || t.priority === 'urgent').length}
          </p>
        </div>
        <div className="glass-panel p-5 rounded-2xl">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Escalation Rate</p>
          <p className="text-3xl font-extrabold text-emerald-400 mt-1">4.2%</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs border-b border-gray-800">
        <Filter className="w-4 h-4 text-gray-500 mr-2 shrink-0" />
        {['all', 'open', 'in_progress', 'resolved', 'closed'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-1.5 rounded-lg font-semibold capitalize transition-all ${
              statusFilter === st
                ? 'bg-brand-600/30 text-brand-300 border border-brand-500/40'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
            }`}
          >
            {st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Tickets Table / List */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-gray-800">
        {loading ? (
          <div className="p-12 text-center text-gray-400 italic flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-brand-400" />
            <span>Loading support tickets from database...</span>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Ticket className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="font-semibold text-white">No tickets found</p>
            <p className="text-xs text-gray-500 mt-1">No tickets match the selected filter criteria.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {filteredTickets.map((t) => (
              <div key={t.ticket_id} className="p-5 hover:bg-gray-900/50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white text-base">#{t.ticket_id}</span>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        t.priority === 'urgent'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : t.priority === 'high'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {t.priority}
                    </span>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        t.status === 'open'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : t.status === 'in_progress'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      {t.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="font-semibold text-sm text-gray-100">{t.issue}</p>
                  {t.reason && (
                    <p className="text-xs text-gray-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Reason: {t.reason}</span>
                    </p>
                  )}
                </div>

                <div className="text-right text-xs text-gray-400 space-y-1 shrink-0">
                  <p className="font-medium text-gray-300 flex items-center gap-1 sm:justify-end">
                    <User className="w-3.5 h-3.5 text-brand-400" />
                    <span>Customer: {t.customer_id}</span>
                  </p>
                  <p className="text-[11px] text-gray-500 flex items-center gap-1 sm:justify-end">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(t.created_at).toLocaleString()}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE TICKET MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-gray-700 shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-white">Create Support Ticket</h3>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Customer Account</label>
                <select
                  value={newCustId}
                  onChange={(e) => setNewCustId(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 text-gray-100 p-2.5 rounded-xl"
                >
                  <option value="CUST-1001">CUST-1001 - Ada Lovelace</option>
                  <option value="CUST-1002">CUST-1002 - Alan Turing</option>
                  <option value="CUST-1003">CUST-1003 - Grace Hopper</option>
                  <option value="CUST-1004">CUST-1004 - Claude Shannon</option>
                  <option value="CUST-1005">CUST-1005 - Margaret Hamilton</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="w-full bg-gray-900 border border-gray-800 text-gray-100 p-2.5 rounded-xl"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Issue Description</label>
                <textarea
                  rows={3}
                  value={newIssue}
                  onChange={(e) => setNewIssue(e.target.value)}
                  placeholder="Describe customer issue..."
                  className="w-full bg-gray-900 border border-gray-800 text-gray-100 p-2.5 rounded-xl focus:border-brand-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gradient-button text-white px-5 py-2 rounded-xl font-semibold"
                >
                  Save Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
