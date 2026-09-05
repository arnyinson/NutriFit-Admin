import { useState, useEffect, useCallback } from 'react';
import {
  Search, MessageSquare, Sparkles, CheckCircle2, Clock,
  X, Star, ChevronLeft, ChevronRight,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import api from '../config/api';

type Ticket = {
  id: string;
  user_name: string;
  user_email: string;
  message: string;
  created_at: string;
  status: 'Pending' | 'Resolved' | 'New';
  type: string;
  rating: number;
  admin_response: string | null;
};

type Summary = {
  total: string;
  new_count: string;
  pending_count: string;
  resolved_count: string;
};

const PAGE_SIZE = 10;

export default function Feedback() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [response, setResponse] = useState('');
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (statusFilter !== 'All Status') params.status = statusFilter;
      if (dateStart) params.date_start = dateStart;
      if (dateEnd) params.date_end = dateEnd;

      const res = await api.get('/tickets', { params });
      setTickets(res.data.tickets);
      setSummary(res.data.summary);
      setPage(1);
    } catch (err) {
      console.error('Load tickets error:', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, dateStart, dateEnd]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadTickets();
    }, 300);
    return () => clearTimeout(timeout);
  }, [loadTickets]);

  const getStatusColor = (status: string) => {
    if (status === 'Pending') return 'bg-orange-50 text-orange-500';
    if (status === 'Resolved') return 'bg-green-50 text-green-600';
    return 'bg-blue-50 text-blue-500';
  };

  const handleView = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setResponse(ticket.admin_response || '');
    setShowViewModal(true);

    // Auto-switch from "New" to "Pending" the moment the admin opens it
    if (ticket.status === 'New') {
      try {
        await api.patch(`/tickets/${ticket.id}/status`, { status: 'Pending' });
        setSelectedTicket((prev) => (prev ? { ...prev, status: 'Pending' } : prev));
        loadTickets(); // refresh the full list AND the summary counts
      } catch (err) {
        console.error('Auto-update to Pending error:', err);
      }
    }
  };

  const handleResolve = async () => {
    if (!selectedTicket) return;
    setSaving(true);
    try {
      await api.patch(`/tickets/${selectedTicket.id}/respond`, {
        admin_response: response,
        status: 'Resolved',
      });
      setTickets((prev) =>
        prev.map((t) =>
          t.id === selectedTicket.id ? { ...t, status: 'Resolved', admin_response: response } : t
        )
      );
      setShowViewModal(false);
      loadTickets();
    } catch (err) {
      console.error('Respond to ticket error:', err);
      alert('Unable to update ticket. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveResponseOnly = async () => {
    if (!selectedTicket) return;
    setSaving(true);
    try {
      await api.patch(`/tickets/${selectedTicket.id}/respond`, {
        admin_response: response,
        status: selectedTicket.status === 'New' ? 'Pending' : selectedTicket.status,
      });
      setShowViewModal(false);
      loadTickets();
    } catch (err) {
      console.error('Save response error:', err);
      alert('Unable to save response. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(tickets.length / PAGE_SIZE));
  const paginatedTickets = tickets.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = summary
    ? [
        { label: 'Total Feedback', value: summary.total, Icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: 'New Feedback', value: summary.new_count, Icon: Sparkles, color: 'text-green-500', bg: 'bg-green-50' },
        { label: 'Resolved', value: summary.resolved_count, Icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
        { label: 'Pending', value: summary.pending_count, Icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
      ]
    : [];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar active="Feedback" />

      <div className="flex-1 p-4 lg:p-8 pt-20 lg:pt-8 min-w-0 w-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Feedback Management</h1>
          <p className="text-sm text-gray-400 mt-1">Manage and review feedback submitted by mobile application users</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`${stat.bg} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <stat.Icon size={22} className={stat.color} />
                </div>
                <div className="min-w-0">
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-gray-500 truncate">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 lg:gap-4">
            <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-xl px-4 bg-gray-50">
              <Search size={16} className="text-gray-400 flex-shrink-0" />
              <input
                className="flex-1 py-2.5 bg-transparent outline-none text-sm text-gray-700 min-w-0"
                placeholder="Search user..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 bg-gray-50">
              <input
                className="py-2.5 bg-transparent outline-none text-sm text-gray-500 w-full sm:w-32"
                type="date"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
              />
              <span className="text-gray-300">—</span>
              <input
                className="py-2.5 bg-transparent outline-none text-sm text-gray-500 w-full sm:w-32"
                type="date"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
              />
            </div>
            <select
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 bg-gray-50 outline-none cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All Status</option>
              <option>New</option>
              <option>Pending</option>
              <option>Resolved</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Ticket ID', 'User', 'Message', 'Date', 'Status', 'Action'].map((h) => (
                    <th key={h} className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">Loading tickets...</td>
                  </tr>
                ) : paginatedTickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">No tickets found.</td>
                  </tr>
                ) : (
                  paginatedTickets.map((ticket) => (
                    <tr key={ticket.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono font-semibold text-gray-500 whitespace-nowrap">#{ticket.id.slice(0, 8).toUpperCase()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 flex-shrink-0">
                            {ticket.user_name[0]}
                          </div>
                          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">{ticket.user_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{ticket.message}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {new Date(ticket.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleView(ticket)}
                          className="bg-green-50 text-green-600 hover:bg-green-100 text-xs font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-400">Showing {paginatedTickets.length} of {tickets.length} tickets</p>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 flex items-center justify-center disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium ${
                    p === page ? 'bg-green-500 text-white' : 'border border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 flex items-center justify-center disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* View Ticket Modal */}
      {showViewModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-8 px-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-[520px] shadow-xl my-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Ticket Details</h2>
                <p className="text-xs font-mono text-gray-400 mt-0.5">#{selectedTicket.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {/* User Info */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl flex-wrap">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600 flex-shrink-0">
                  {selectedTicket.user_name[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-700 truncate">{selectedTicket.user_name}</p>
                  <p className="text-xs text-gray-400 truncate">{selectedTicket.user_email}</p>
                </div>
                <span className={`ml-auto text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${getStatusColor(selectedTicket.status)}`}>
                  {selectedTicket.status}
                </span>
              </div>

              {/* Type & Rating */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Type</p>
                  <p className="text-sm font-semibold text-gray-700">{selectedTicket.type}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Rating</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        className={s <= selectedTicket.rating ? 'text-yellow-400' : 'text-gray-300'}
                        fill={s <= selectedTicket.rating ? 'currentColor' : 'none'}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-2">Message</p>
                <p className="text-sm text-gray-700">{selectedTicket.message}</p>
              </div>

              {/* Response */}
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Admin Response</label>
                <textarea
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-400 min-h-24 resize-none"
                  placeholder="Type your response here..."
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50"
                >
                  Close
                </button>
                {selectedTicket.status !== 'Resolved' ? (
                  <button
                    onClick={handleResolve}
                    disabled={saving}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
                  >
                    {saving ? 'Saving...' : 'Mark as Resolved'}
                  </button>
                ) : (
                  <button
                    onClick={handleSaveResponseOnly}
                    disabled={saving}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
                  >
                    {saving ? 'Saving...' : 'Update Response'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}