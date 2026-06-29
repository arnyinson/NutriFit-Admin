import { useState } from 'react';
import Sidebar from '../components/Sidebar';

type Ticket = {
  id: number;
  user: string;
  message: string;
  date: string;
  status: 'Pending' | 'Resolved' | 'New';
  type: string;
  rating: number;
};

const initialTickets: Ticket[] = [
  { id: 1, user: 'Stephan Carry', message: 'Add dark mode', date: 'January 10', status: 'Pending', type: 'Suggestion', rating: 5 },
  { id: 2, user: 'King Sitiago', message: 'Every time I open the exercise...', date: 'February 24', status: 'Pending', type: 'Bug Report', rating: 3 },
  { id: 3, user: 'Lorenzo Batumbakal', message: "I'm spending time waiting while...", date: 'February 29', status: 'Resolved', type: 'Complaint', rating: 2 },
  { id: 4, user: 'Malia Fernandez', message: 'For a basic tracker, it takes up too...', date: 'March 2', status: 'New', type: 'Question', rating: 4 },
  { id: 5, user: 'Gabriella Garcia', message: 'Despite having a robust internet...', date: 'March 3', status: 'New', type: 'Suggestion', rating: 4 },
];

const stats = [
  { label: 'Total Feedback', value: '120', icon: '💬', color: 'text-blue-500', bg: 'bg-blue-50' },
  { label: 'New Feedback', value: '35', icon: '🆕', color: 'text-green-500', bg: 'bg-green-50' },
  { label: 'Resolved', value: '60', icon: '✅', color: 'text-green-500', bg: 'bg-green-50' },
  { label: 'Pending', value: '25', icon: '⏳', color: 'text-orange-500', bg: 'bg-orange-50' },
];

export default function Feedback() {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [response, setResponse] = useState('');

  const filtered = tickets.filter(t => {
    const matchSearch = t.user.toLowerCase().includes(search.toLowerCase()) ||
      t.message.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All Status' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getStatusColor = (status: string) => {
    if (status === 'Pending') return 'bg-orange-50 text-orange-500';
    if (status === 'Resolved') return 'bg-green-50 text-green-600';
    return 'bg-blue-50 text-blue-500';
  };

  const handleResolve = (id: number) => {
    setTickets(prev => prev.map(t =>
      t.id === id ? { ...t, status: 'Resolved' } : t
    ));
    setShowViewModal(false);
  };

  const handleView = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setResponse('');
    setShowViewModal(true);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar active="Feedback" />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Feedback Management</h1>
            <p className="text-sm text-gray-400 mt-1">Manage and review feedback submitted by mobile application users</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm">A</div>
              <span className="text-sm font-medium text-gray-700">Admin</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`${stat.bg} w-12 h-12 rounded-xl flex items-center justify-center text-2xl`}>
                  {stat.icon}
                </div>
                <div>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-xl px-4 bg-gray-50">
              <span className="text-gray-400">🔍</span>
              <input
                className="flex-1 py-2.5 bg-transparent outline-none text-sm text-gray-700"
                placeholder="Search user..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 bg-gray-50">
              <input
                className="py-2.5 bg-transparent outline-none text-sm text-gray-500 w-32"
                type="text"
                placeholder="Start Date"
                value={dateStart}
                onChange={e => setDateStart(e.target.value)}
              />
              <span className="text-gray-300">—</span>
              <input
                className="py-2.5 bg-transparent outline-none text-sm text-gray-500 w-32"
                type="text"
                placeholder="End Date"
                value={dateEnd}
                onChange={e => setDateEnd(e.target.value)}
              />
            </div>
            <select
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 bg-gray-50 outline-none cursor-pointer"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option>All Status</option>
              <option>New</option>
              <option>Pending</option>
              <option>Resolved</option>
            </select>
            <button className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
              Filter
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['User', 'Message', 'Date', 'Status', 'Action'].map(h => (
                  <th key={h} className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(ticket => (
                <tr key={ticket.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                        {ticket.user[0]}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{ticket.user}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{ticket.message}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{ticket.date}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleView(ticket)}
                      className="bg-green-50 text-green-600 hover:bg-green-100 text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">
                    No tickets found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-400">Showing {filtered.length} of {tickets.length} tickets</p>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 text-sm">‹</button>
              {[1, 2, 3].map(p => (
                <button key={p} className={`w-8 h-8 rounded-lg text-sm font-medium ${
                  p === 1 ? 'bg-green-500 text-white' : 'border border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}>{p}</button>
              ))}
              <button className="w-8 h-8 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 text-sm">›</button>
            </div>
          </div>
        </div>
      </div>

      {/* View Ticket Modal */}
      {showViewModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-[520px] shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800">Ticket Details</h2>
              <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="flex flex-col gap-4">
              {/* User Info */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
                  {selectedTicket.user[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">{selectedTicket.user}</p>
                  <p className="text-xs text-gray-400">{selectedTicket.date}</p>
                </div>
                <span className={`ml-auto text-xs font-bold px-3 py-1 rounded-full ${getStatusColor(selectedTicket.status)}`}>
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
                    {[1, 2, 3, 4, 5].map(s => (
                      <span key={s} className={s <= selectedTicket.rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
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
                  onChange={e => setResponse(e.target.value)}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50"
                >
                  Close
                </button>
                {selectedTicket.status !== 'Resolved' && (
                  <button
                    onClick={() => handleResolve(selectedTicket.id)}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl text-sm font-semibold transition-colors"
                  >
                    Mark as Resolved
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