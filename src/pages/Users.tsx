import { useState, useEffect, useCallback } from 'react';
import {
  Search, ChevronLeft, ChevronRight, Archive, RotateCcw, X, CheckCircle2, AlertTriangle,
  Users as UsersIcon, UserCheck, UserX, Ban,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import api from '../config/api';

type User = {
  id: string;
  name: string;
  email: string;
  age: number | null;
  birthday: string;
  dietary_goal: string;
  weight: string;
  is_active: boolean;
  archived: boolean;
  banned: boolean;
  ban_reason: string | null;
  last_login: string | null;
};

type UserDetail = {
  id: string;
  name: string;
  email: string;
  username: string | null;
  birthday: string;
  sex: string | null;
  height: string | number | null;
  weight: string | number | null;
  dietary_goal: string | null;
  activity_level: string | null;
  allergens: string[] | null;
  available_equipment: string[] | null;
  bmi: string | number | null;
  tdee: string | number | null;
  is_active: boolean;
  archived: boolean;
  banned: boolean;
  ban_reason: string | null;
  banned_at: string | null;
  last_login: string | null;
  created_at: string;
};

type PendingAction = { type: 'deactivate' | 'activate' | 'unarchive' | 'unban'; user: { id: string; name: string; is_active: boolean } };

const PAGE_SIZE = 10;

// Same list the backend accepts. "Other" requires a short description.
const BAN_REASONS = [
  'Fake or unrealistic account',
  'Duplicate account',
  'Violation of Terms and Conditions',
  'Abuse or spam in Support tickets',
  'Providing harmful false information',
  'Other',
];
const BAN_NOTE_MAX = 150;

const calculateAge = (birthday: string) => {
  if (!birthday) return null;
  const today = new Date();
  const birthDate = new Date(birthday);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const formatDateTime = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
    : '—';

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [goalFilter, setGoalFilter] = useState('All Goal');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [page, setPage] = useState(1);
  const [counts, setCounts] = useState({ total: 0, active: 0, inactive: 0, archived: 0, banned: 0 });
  const [banTarget, setBanTarget] = useState<{ id: string; name: string } | null>(null);
  const [banReason, setBanReason] = useState('');
  const [banNote, setBanNote] = useState('');
  const [banSubmitted, setBanSubmitted] = useState(false);
  const [banning, setBanning] = useState(false);

  const [pending, setPending] = useState<PendingAction | null>(null);
  const [confirming, setConfirming] = useState(false);

  const [detailUserId, setDetailUserId] = useState<string | null>(null);
  const [detail, setDetail] = useState<{ user: UserDetail } | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (goalFilter !== 'All Goal') params.dietary_goal = goalFilter;

      if (statusFilter === 'Banned') {
        params.banned = 'true';
      } else if (statusFilter === 'Archived') {
        params.archived = 'true';
      } else if (statusFilter === 'Active') {
        params.is_active = 'true';
      } else if (statusFilter === 'Inactive') {
        params.is_active = 'false';
      }

      const res = await api.get('/users', { params });
      const withAge = res.data.users.map((u: User) => ({
        ...u,
        age: calculateAge(u.birthday),
      }));
      setUsers(withAge);
      setPage(1);
    } catch (err) {
      console.error('Load users error:', err);
    } finally {
      setLoading(false);
    }
  }, [search, goalFilter, statusFilter]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadUsers();
    }, 300);
    return () => clearTimeout(timeout);
  }, [loadUsers]);

  // Totals are always computed from ALL users, regardless of the search / filters below.
  const loadCounts = useCallback(async () => {
    try {
      const res = await api.get('/users');
      const all: { is_active: boolean; archived: boolean; banned: boolean }[] = res.data.users;
      setCounts({
        total: all.length,
        active: all.filter((u) => !u.banned && !u.archived && u.is_active).length,
        inactive: all.filter((u) => !u.banned && !u.archived && !u.is_active).length,
        archived: all.filter((u) => !u.banned && u.archived).length,
        banned: all.filter((u) => u.banned).length,
      });
    } catch (err) {
      console.error('Load user counts error:', err);
    }
  }, []);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  // Open the detail modal and fetch the full profile.
  const openDetail = async (id: string) => {
    setDetailUserId(id);
    setDetail(null);
    setDetailError('');
    setDetailLoading(true);
    try {
      const res = await api.get(`/users/${id}/details`);
      setDetail({ user: res.data.user });
    } catch (err) {
      console.error('Load user details error:', err);
      setDetailError('Unable to load this user\'s details. Please try again.');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setDetailUserId(null);
    setDetail(null);
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, is_active: !currentStatus } : u)));
    setDetail((d) => (d && d.user.id === id ? { ...d, user: { ...d.user, is_active: !currentStatus } } : d));
    try {
      await api.patch(`/users/${id}/status`, { is_active: !currentStatus });
      loadCounts();
    } catch (err) {
      console.error('Toggle status error:', err);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, is_active: currentStatus } : u)));
      setDetail((d) => (d && d.user.id === id ? { ...d, user: { ...d.user, is_active: currentStatus } } : d));
      alert('Unable to update the account status. Please try again.');
    }
  };

  const handleUnarchive = async (id: string) => {
    const previous = users;
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, archived: false } : u)));
    try {
      await api.patch(`/users/${id}/unarchive`);
      loadCounts();
      if (statusFilter === 'Archived') {
        loadUsers();
      }
    } catch (err) {
      console.error('Unarchive error:', err);
      setUsers(previous);
      alert('Unable to unarchive this account. Please try again.');
    }
  };

  const handleUnban = async (id: string) => {
    try {
      await api.patch(`/users/${id}/unban`);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, banned: false, ban_reason: null, is_active: true } : u)));
      setDetail((d) =>
        d && d.user.id === id
          ? { ...d, user: { ...d.user, banned: false, ban_reason: null, banned_at: null, is_active: true } }
          : d
      );
      if (statusFilter === 'Banned') loadUsers();
      loadCounts();
    } catch (err) {
      console.error('Unban error:', err);
      alert('Unable to unban this account. Please try again.');
    }
  };

  const openBan = (id: string, name: string) => {
    setBanTarget({ id, name });
    setBanReason('');
    setBanNote('');
    setBanSubmitted(false);
  };

  const submitBan = async () => {
    if (!banTarget) return;
    setBanSubmitted(true);
    if (!banReason || (banReason === 'Other' && !banNote.trim())) return;
    setBanning(true);
    try {
      const res = await api.patch(`/users/${banTarget.id}/ban`, { reason: banReason, note: banNote.trim() });
      const saved = res.data.user;
      setUsers((prev) =>
        prev.map((u) => (u.id === banTarget.id ? { ...u, banned: true, ban_reason: saved.ban_reason, is_active: false } : u))
      );
      setDetail((d) =>
        d && d.user.id === banTarget.id
          ? { ...d, user: { ...d.user, banned: true, ban_reason: saved.ban_reason, banned_at: saved.banned_at, is_active: false } }
          : d
      );
      if (statusFilter !== 'All Status' && statusFilter !== 'Banned') loadUsers();
      loadCounts();
      setBanTarget(null);
    } catch (err) {
      console.error('Ban error:', err);
      alert('Unable to ban this account. Please try again.');
    } finally {
      setBanning(false);
    }
  };

  const runPending = async () => {
    if (!pending) return;
    setConfirming(true);
    if (pending.type === 'unban') {
      await handleUnban(pending.user.id);
    } else if (pending.type === 'unarchive') {
      await handleUnarchive(pending.user.id);
    } else {
      await toggleStatus(pending.user.id, pending.user.is_active);
    }
    setConfirming(false);
    setPending(null);
  };

  const getStatusLabel = (user: { archived: boolean; is_active: boolean; banned?: boolean }) => {
    if (user.banned) return 'Banned';
    if (user.archived) return 'Archived';
    return user.is_active ? 'Active' : 'Inactive';
  };

  const getStatusColor = (user: { archived: boolean; is_active: boolean; banned?: boolean }) => {
    if (user.banned) return 'text-red-600 bg-red-100';
    if (user.archived) return 'text-gray-500 bg-gray-100';
    return user.is_active ? 'text-green-600 bg-green-50' : 'text-orange-500 bg-orange-50';
  };

  const formatLastLogin = (isoDate: string | null) => {
    if (!isoDate) return 'Never';
    const date = new Date(isoDate);
    const daysAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (daysAgo === 0) return 'Today';
    if (daysAgo === 1) return 'Yesterday';
    return `${daysAgo} days ago`;
  };

  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  const paginatedUsers = users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const pageNumbers = (): (number | '…')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | '…')[] = [1];
    const from = Math.max(2, page - 1);
    const to = Math.min(totalPages - 1, page + 1);
    if (from > 2) pages.push('…');
    for (let p = from; p <= to; p++) pages.push(p);
    if (to < totalPages - 1) pages.push('…');
    pages.push(totalPages);
    return pages;
  };

  // Simple "is this a real, sensible account?" checks the admin can read at a glance.
  const integrityChecks = (u: UserDetail) => {
    const age = calculateAge(u.birthday);
    const height = Number(u.height);
    const weight = Number(u.weight);
    const bmi = Number(u.bmi);
    return [
      { label: 'Valid email format', ok: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(u.email) },
      { label: 'Age within 12–75 years', ok: age !== null && age >= 12 && age <= 75 },
      { label: 'Height is realistic (100–250 cm)', ok: height >= 100 && height <= 250 },
      { label: 'Weight is realistic (30–300 kg)', ok: weight >= 30 && weight <= 300 },
      { label: 'BMI is realistic (10–60)', ok: bmi >= 10 && bmi <= 60 },
      { label: 'Has logged in since registering', ok: !!u.last_login },
    ];
  };

  const confirmCopy = pending
    ? pending.type === 'deactivate'
      ? {
          title: 'Deactivate this account?',
          body: `${pending.user.name} will no longer be able to log in until the account is activated again.`,
          yes: 'Yes, deactivate',
          danger: true,
        }
      : pending.type === 'activate'
      ? {
          title: 'Activate this account?',
          body: `${pending.user.name} will be able to log in again.`,
          yes: 'Yes, activate',
          danger: false,
        }
      : pending.type === 'unban'
      ? {
          title: 'Unban this account?',
          body: `${pending.user.name} will be able to log in again and the ban reason will be cleared.`,
          yes: 'Yes, unban',
          danger: false,
        }
      : {
          title: 'Unarchive this account?',
          body: `${pending.user.name} will be restored as an active user.`,
          yes: 'Yes, unarchive',
          danger: false,
        }
    : null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar active="Account Management" />

      <div className="flex-1 p-4 lg:p-8 pt-20 lg:pt-8 min-w-0 w-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Account Management</h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage and monitor all NutriFit users. Click a user to view their full profile.
            Users inactive for 30+ days are automatically archived (stored, not deleted).
          </p>
        </div>

        {/* Totals */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 mb-6">
          {[
            { label: 'Total Users', value: counts.total, Icon: UsersIcon, color: 'text-blue-500', bg: 'bg-blue-50' },
            { label: 'Active', value: counts.active, Icon: UserCheck, color: 'text-green-500', bg: 'bg-green-50' },
            { label: 'Inactive', value: counts.inactive, Icon: UserX, color: 'text-orange-500', bg: 'bg-orange-50' },
            { label: 'Archived', value: counts.archived, Icon: Archive, color: 'text-gray-500', bg: 'bg-gray-100' },
            { label: 'Banned', value: counts.banned, Icon: Ban, color: 'text-red-600', bg: 'bg-red-50' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
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
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-xl px-4 bg-gray-50">
              <Search size={16} className="text-gray-400 flex-shrink-0" />
              <input
                className="flex-1 py-2.5 bg-transparent outline-none text-sm text-gray-700 min-w-0"
                placeholder="Search user by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <select
                className="flex-1 sm:flex-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 bg-gray-50 outline-none cursor-pointer"
                value={goalFilter}
                onChange={(e) => setGoalFilter(e.target.value)}
              >
                <option>All Goal</option>
                <option>Cutting</option>
                <option>Bulking</option>
                <option>Maintenance</option>
              </select>
              <select
                className="flex-1 sm:flex-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 bg-gray-50 outline-none cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option>All Status</option>
                <option>Active</option>
                <option>Inactive</option>
                <option>Archived</option>
                <option>Banned</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Name', 'Email', 'Age', 'Goal', 'Last Login', 'Status', 'Action'].map((h) => (
                    <th key={h} className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-sm">
                      Loading users...
                    </td>
                  </tr>
                ) : paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-sm">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => (
                    <tr
                      key={user.id}
                      onClick={() => openDetail(user.id)}
                      className={`border-b border-gray-50 hover:bg-green-50/40 transition-colors cursor-pointer ${user.archived ? 'opacity-70' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-600 flex-shrink-0">
                            {user.name[0]}
                          </div>
                          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{user.age ?? '—'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{user.dietary_goal}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{formatLastLogin(user.last_login)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${getStatusColor(user)}`}
                        >
                          {user.banned ? <Ban size={11} /> : user.archived && <Archive size={11} />}
                          {getStatusLabel(user)}
                        </span>
                      </td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        {user.banned ? (
                          <button
                            onClick={() => setPending({ type: 'unban', user: { id: user.id, name: user.name, is_active: user.is_active } })}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap bg-blue-50 text-blue-600 hover:bg-blue-100"
                          >
                            <RotateCcw size={13} />
                            Unban
                          </button>
                        ) : user.archived ? (
                          <button
                            onClick={() => setPending({ type: 'unarchive', user: { id: user.id, name: user.name, is_active: user.is_active } })}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap bg-blue-50 text-blue-600 hover:bg-blue-100"
                          >
                            <RotateCcw size={13} />
                            Unarchive
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                setPending({
                                  type: user.is_active ? 'deactivate' : 'activate',
                                  user: { id: user.id, name: user.name, is_active: user.is_active },
                                })
                              }
                              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                                user.is_active
                                  ? 'bg-orange-50 text-orange-500 hover:bg-orange-100'
                                  : 'bg-green-50 text-green-600 hover:bg-green-100'
                              }`}
                            >
                              {user.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => openBan(user.id, user.name)}
                              className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap bg-red-50 text-red-500 hover:bg-red-100"
                            >
                              <Ban size={12} />
                              Ban
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-400">
              Showing {paginatedUsers.length} of {users.length} users
            </p>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 flex items-center justify-center disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              {pageNumbers().map((p, i) =>
                p === '…' ? (
                  <span key={`gap-${i}`} className="px-1 text-gray-400 text-sm">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium ${
                      p === page ? 'bg-green-500 text-white' : 'border border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
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

      {/* User Detail Modal */}
      {detailUserId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-8 px-4">
          <div className="bg-white rounded-2xl w-full max-w-[720px] shadow-xl my-auto">
            <div className="flex justify-between items-center px-6 sm:px-8 pt-6 sm:pt-8 pb-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">User Details</h2>
              <button onClick={closeDetail} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="px-6 sm:px-8 py-6">
              {detailLoading ? (
                <p className="text-sm text-gray-400 text-center py-12">Loading user details...</p>
              ) : detailError ? (
                <p className="text-sm text-red-500 text-center py-12">{detailError}</p>
              ) : detail ? (
                <div className="flex flex-col gap-6">
                  {/* Identity */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-xl font-bold text-green-600 flex-shrink-0">
                      {detail.user.name[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-bold text-gray-800 truncate">{detail.user.name}</p>
                      <p className="text-sm text-gray-400 truncate">{detail.user.email}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${getStatusColor(detail.user)}`}>
                      {detail.user.banned ? <Ban size={11} /> : detail.user.archived && <Archive size={11} />}
                      {getStatusLabel(detail.user)}
                    </span>
                  </div>

                  {detail.user.banned && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                      <p className="text-xs font-bold text-red-600 flex items-center gap-1.5 mb-1">
                        <Ban size={13} /> This account is banned
                      </p>
                      <p className="text-sm text-red-700">{detail.user.ban_reason || '—'}</p>
                      <p className="text-[11px] text-red-400 mt-1">Banned on {formatDateTime(detail.user.banned_at)}</p>
                    </div>
                  )}

                  {/* Profile info */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-800 mb-3">Profile</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        ['Username', detail.user.username ? `@${detail.user.username}` : '—'],
                        ['Age', calculateAge(detail.user.birthday) ?? '—'],
                        ['Birthday', formatDate(detail.user.birthday)],
                        ['Sex', detail.user.sex || '—'],
                        ['Height', detail.user.height ? `${Number(detail.user.height)} cm` : '—'],
                        ['Weight', detail.user.weight ? `${Number(detail.user.weight)} kg` : '—'],
                        ['BMI', detail.user.bmi ? Number(detail.user.bmi).toFixed(1) : '—'],
                        ['TDEE', detail.user.tdee ? `${Number(detail.user.tdee)} kcal` : '—'],
                        ['Dietary Goal', detail.user.dietary_goal || '—'],
                      ].map(([label, value]) => (
                        <div key={String(label)} className="bg-gray-50 rounded-xl p-3">
                          <p className="text-[11px] text-gray-400 mb-0.5">{label}</p>
                          <p className="text-sm font-semibold text-gray-700 break-words">{value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 mt-3">
                      <p className="text-[11px] text-gray-400 mb-0.5">Activity Level</p>
                      <p className="text-sm font-semibold text-gray-700">{detail.user.activity_level || '—'}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-[11px] text-gray-400 mb-1.5">Allergens</p>
                        {detail.user.allergens && detail.user.allergens.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {detail.user.allergens.map((a) => (
                              <span key={a} className="text-[11px] bg-red-50 text-red-500 px-2 py-0.5 rounded-full">{a}</span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400">None</p>
                        )}
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-[11px] text-gray-400 mb-1.5">Available Equipment</p>
                        {detail.user.available_equipment && detail.user.available_equipment.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {detail.user.available_equipment.map((a) => (
                              <span key={a} className="text-[11px] bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full">{a}</span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400">—</p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-[11px] text-gray-400 mb-0.5">Registered</p>
                        <p className="text-sm font-semibold text-gray-700">{formatDateTime(detail.user.created_at)}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-[11px] text-gray-400 mb-0.5">Last Login</p>
                        <p className="text-sm font-semibold text-gray-700">{formatDateTime(detail.user.last_login)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Data integrity */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-800 mb-3">Data Integrity Check</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {integrityChecks(detail.user).map((c) => (
                        <div
                          key={c.label}
                          className={`flex items-center gap-2 text-xs rounded-lg px-3 py-2 ${
                            c.ok ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-600'
                          }`}
                        >
                          {c.ok ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                          {c.label}
                        </div>
                      ))}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-2">
                      Accounts with unrealistic or missing data may not be real users. You can deactivate them below.
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Footer actions */}
            <div className="flex gap-3 px-6 sm:px-8 pb-6 sm:pb-8">
              <button
                onClick={closeDetail}
                className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50"
              >
                Close
              </button>
              {detail && detail.user.banned ? (
                <button
                  onClick={() =>
                    setPending({
                      type: 'unban',
                      user: { id: detail.user.id, name: detail.user.name, is_active: detail.user.is_active },
                    })
                  }
                  className="flex-1 py-3 rounded-xl text-sm font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100"
                >
                  Unban account
                </button>
              ) : detail && detail.user.archived ? (
                <button
                  onClick={() =>
                    setPending({
                      type: 'unarchive',
                      user: { id: detail.user.id, name: detail.user.name, is_active: detail.user.is_active },
                    })
                  }
                  className="flex-1 py-3 rounded-xl text-sm font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100"
                >
                  Unarchive account
                </button>
              ) : detail ? (
                <>
                  <button
                    onClick={() =>
                      setPending({
                        type: detail.user.is_active ? 'deactivate' : 'activate',
                        user: { id: detail.user.id, name: detail.user.name, is_active: detail.user.is_active },
                      })
                    }
                    className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-colors ${
                      detail.user.is_active
                        ? 'bg-orange-50 text-orange-500 hover:bg-orange-100'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    {detail.user.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => openBan(detail.user.id, detail.user.name)}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600"
                  >
                    Ban
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Ban modal: reason is required and is shown to the user on login */}
      {banTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] px-4 overflow-y-auto py-8">
          <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-[440px] shadow-xl my-auto">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
              <Ban size={22} />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Ban {banTarget.name}?</h3>
            <p className="text-sm text-gray-500 mb-5">
              A ban is permanent until you unban the account. The user will see the reason below when they try to log in.
            </p>

            <label className="text-xs font-semibold text-gray-500 mb-1 block">Reason<span className="text-red-500"> *</span></label>
            <select
              className={`w-full border rounded-xl px-4 py-3 text-sm outline-none mb-1 ${
                banSubmitted && !banReason ? 'border-red-400 bg-red-50' : 'border-gray-200'
              }`}
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
            >
              <option value="">Select a reason...</option>
              {BAN_REASONS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
            {banSubmitted && !banReason && <p className="text-xs text-red-500 mb-2">Please select a reason.</p>}

            <label className="text-xs font-semibold text-gray-500 mt-3 mb-1 block">
              {banReason === 'Other' ? 'Describe the reason' : 'Additional note (optional)'}
              {banReason === 'Other' && <span className="text-red-500"> *</span>}
            </label>
            <textarea
              className={`w-full border rounded-xl px-4 py-3 text-sm outline-none min-h-20 resize-none ${
                banSubmitted && banReason === 'Other' && !banNote.trim() ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-green-400'
              }`}
              maxLength={BAN_NOTE_MAX}
              placeholder="Keep it short and do not include other users' personal details."
              value={banNote}
              onChange={(e) => setBanNote(e.target.value)}
            />
            <div className="flex justify-between mt-1 mb-4">
              <p className="text-xs text-red-500">
                {banSubmitted && banReason === 'Other' && !banNote.trim() ? 'Please describe the reason.' : ''}
              </p>
              <p className="text-xs text-gray-400">{banNote.length}/{BAN_NOTE_MAX}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 mb-5">
              <p className="text-[11px] text-gray-400 mb-1">The user will see:</p>
              <p className="text-xs text-gray-600">
                "Your account has been banned. Reason: {banReason ? (banReason === 'Other' ? banNote || '…' : banNote ? `${banReason} - ${banNote}` : banReason) : '…'}. If you believe this is a mistake, please contact support."
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setBanTarget(null)}
                disabled={banning}
                className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={submitBan}
                disabled={banning}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {banning ? 'Banning...' : 'Ban account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Yes / No confirmation */}
      {pending && confirmCopy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] px-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-[400px] shadow-xl">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                confirmCopy.danger ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'
              }`}
            >
              <AlertTriangle size={22} />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">{confirmCopy.title}</h3>
            <p className="text-sm text-gray-500 mb-6">{confirmCopy.body}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setPending(null)}
                disabled={confirming}
                className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50 disabled:opacity-60"
              >
                No
              </button>
              <button
                onClick={runPending}
                disabled={confirming}
                className={`flex-1 text-white py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 ${
                  confirmCopy.danger ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {confirming ? 'Please wait...' : confirmCopy.yes}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}