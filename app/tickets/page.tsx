'use client';

import { useState, useEffect } from 'react';
import { Ticket, Plus, Filter, CheckCircle2, AlertTriangle, Clock, RefreshCw, User, X } from 'lucide-react';
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-triage-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-elevated border border-triage-border-active flex items-center justify-center text-clinical-mint">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-white tracking-tight flex items-center gap-2">
              Escalation Queue & Support Tickets
            </h1>
            <p className="text-xs text-gray-400 font-body">
              Real-time human escalation queue created by n8n AI tool triage & fallback workflows.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchTickets}
            className="p-2 rounded-lg bg-surface-elevated border border-triage-border text-gray-300 hover:text-white hover:border-triage-border-active transition-colors"
            title="Refresh tickets"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-2 rounded-lg bg-clinical-mint hover:bg-emerald-400 text-ink font-display font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create Ticket</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="surface-elevated p-4 rounded-xl border border-triage-border space-y-1">
          <p className="text-[10px] font-mono font-semibold uppercase tracking-wider text-gray-400">Total Tickets</p>
          <p className="text-2xl font-mono font-bold text-white">{tickets.length}</p>
        </div>
        <div className="surface-elevated p-4 rounded-xl border border-triage-border space-y-1">
          <p className="text-[10px] font-mono font-semibold uppercase tracking-wider text-gray-400">Open Queue</p>
          <p className="text-2xl font-mono font-bold text-signal-amber">
            {tickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length}
          </p>
        </div>
        <div className="surface-elevated p-4 rounded-xl border border-triage-border space-y-1">
          <p className="text-[10px] font-mono font-semibold uppercase tracking-wider text-gray-400">High / Urgent</p>
          <p className="text-2xl font-mono font-bold text-rose-400">
            {tickets.filter((t) => t.priority === 'high' || t.priority === 'urgent').length}
          </p>
        </div>
        <div className="surface-elevated p-4 rounded-xl border border-triage-border space-y-1">
          <p className="text-[10px] font-mono font-semibold uppercase tracking-wider text-gray-400">Escalation Rate</p>
          <p className="text-2xl font-mono font-bold text-clinical-mint">4.2%</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 text-xs border-b border-triage-border font-mono scrollbar-none">
        <Filter className="w-3.5 h-3.5 text-gray-500 mr-1 shrink-0" />
        {['all', 'open', 'in_progress', 'resolved', 'closed'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors ${
              statusFilter === st
                ? 'bg-surface-elevated text-clinical-mint border border-triage-border-active font-semibold'
                : 'text-gray-400 hover:text-white hover:bg-surface-elevated border border-transparent'
            }`}
          >
            {st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Tickets List */}
      <div className="surface-elevated rounded-2xl overflow-hidden border border-triage-border">
        {loading ? (
          <div className="p-12 text-center text-gray-400 italic flex items-center justify-center gap-2 font-mono text-xs">
            <RefreshCw className="w-4 h-4 animate-spin text-clinical-mint" />
            <span>Loading support tickets from database...</span>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-12 text-center text-gray-400 space-y-2">
            <Ticket className="w-8 h-8 text-gray-600 mx-auto" />
            <p className="font-semibold text-white text-xs">No tickets match criteria</p>
            <p className="text-[11px] text-gray-500 font-mono">Select another status filter or log a new ticket.</p>
          </div>
        ) : (
          <div className="divide-y divide-triage-border">
            {filteredTickets.map((t) => (
              <div
                key={t.ticket_id}
                className="p-4 hover:bg-surface-overlay transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-xs text-white">#{t.ticket_id}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold uppercase ${
                        t.priority === 'urgent'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          : t.priority === 'high'
                          ? 'bg-signal-amber/10 text-signal-amber border border-signal-amber/30'
                          : 'bg-surface-base text-gray-400 border border-triage-border'
                      }`}
                    >
                      {t.priority}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold uppercase ${
                        t.status === 'open'
                          ? 'bg-clinical-mint/10 text-clinical-mint border border-clinical-mint/20'
                          : t.status === 'in_progress'
                          ? 'bg-signal-violet/10 text-signal-violet border border-signal-violet/20'
                          : 'bg-surface-base text-gray-500 border border-triage-border'
                      }`}
                    >
                      {t.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="font-medium text-xs text-gray-100 font-body">{t.issue}</p>
                  {t.reason && (
                    <p className="text-[11px] text-gray-400 flex items-center gap-1.5 font-mono">
                      <AlertTriangle className="w-3 h-3 text-signal-amber shrink-0" />
                      <span>Reason: {t.reason}</span>
                    </p>
                  )}
                </div>

                <div className="text-right text-xs text-gray-400 space-y-1 shrink-0 font-mono">
                  <p className="font-medium text-gray-300 flex items-center gap-1 sm:justify-end">
                    <User className="w-3.5 h-3.5 text-clinical-mint" />
                    <span>{t.customer_id}</span>
                  </p>
                  <p className="text-[10px] text-gray-500 flex items-center gap-1 sm:justify-end">
                    <Clock className="w-3 h-3" />
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
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="surface-overlay w-full max-w-md p-6 rounded-2xl border border-triage-border shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-triage-border">
              <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                <Ticket className="w-4 h-4 text-clinical-mint" />
                <span>Create Support Ticket</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-gray-400 hover:text-white hover:bg-surface-base rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3.5 text-xs font-body">
              <div className="space-y-1">
                <label className="block text-gray-300 font-medium font-mono text-[11px]">Customer / Patient ID</label>
                <select
                  value={newCustId}
                  onChange={(e) => setNewCustId(e.target.value)}
                  className="w-full bg-surface-base text-gray-100 text-xs px-3 py-2 rounded-lg border border-triage-border focus:outline-none focus:border-triage-border-active font-mono"
                >
                  <option value="CUST-1001">CUST-1001 - Ada Lovelace</option>
                  <option value="CUST-1002">CUST-1002 - Alan Turing</option>
                  <option value="CUST-1003">CUST-1003 - Grace Hopper</option>
                  <option value="CUST-1004">CUST-1004 - Claude Shannon</option>
                  <option value="CUST-1005">CUST-1005 - Margaret Hamilton</option>
                  <option value="PAT-2001">PAT-2001 - Ada Lovelace (Patient)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-gray-300 font-medium font-mono text-[11px]">Priority Level</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="w-full bg-surface-base text-gray-100 text-xs px-3 py-2 rounded-lg border border-triage-border focus:outline-none focus:border-triage-border-active font-mono"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-gray-300 font-medium font-mono text-[11px]">Issue Description</label>
                <textarea
                  rows={3}
                  value={newIssue}
                  onChange={(e) => setNewIssue(e.target.value)}
                  placeholder="Describe customer issue or escalation reason..."
                  className="w-full bg-surface-base text-gray-100 text-xs p-3 rounded-lg border border-triage-border focus:outline-none focus:border-triage-border-active font-body"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-2 rounded-lg bg-surface-base text-gray-400 hover:text-white border border-triage-border text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-clinical-mint hover:bg-emerald-400 text-ink font-display font-bold text-xs transition-colors"
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

