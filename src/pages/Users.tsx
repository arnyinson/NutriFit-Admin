import { useState, useEffect, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, Archive, RotateCcw } from 'lucide-react';
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
  last_login: string | null;
};

const PAGE_SIZE = 10;

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [goalFilter, setGoalFilter] = useState('All Goal');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [page, setPage] = useState(1);

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

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (goalFilter !== 'All Goal') params.dietary_goal = goalFilter;

      if (statusFilter === 'Archived') {
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
    }, 300); // debounce for search
    return () => clearTimeout(timeout);
  }, [loadUsers]);

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, is_active: !currentStatus } : u)));
    try {
      await api.patch(`/users/${id}/status`, { is_active: !currentStatus });
    } catch (err) {
      console.error('Toggle status error:', err);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, is_active: currentStatus } : u)));
    }
  };

  const handleUnarchive = async (id: string) => {
    const previous = users;
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, archived: false } : u)));
    try {
      await api.patch(`/users/${id}/unarchive`);
      // If currently filtering by "Archived", the row should disappear from the list
      if (statusFilter === 'Archived') {
        loadUsers();
      }
    } catch (err) {
      console.error('Unarchive error:', err);
      setUsers(previous);
    }
  };

  const getStatusLabel = (user: User) => {
    if (user.archived) return 'Archived';
    return user.is_active ? 'Active' : 'Inactive';
  };

  const getStatusColor = (user: User) => {
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar active="User" />

      <div className="flex-1 p-4 lg:p-8 pt-20 lg:pt-8 min-w-0 w-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage and monitor all NutriFit users. Users inactive for 30+ days are automatically archived.
          </p>
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
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
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
                    <tr key={user.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${user.archived ? 'opacity-70' : ''}`}>
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
                          {user.archived && <Archive size={11} />}
                          {getStatusLabel(user)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.archived ? (
                          <button
                            onClick={() => handleUnarchive(user.id)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap bg-blue-50 text-blue-600 hover:bg-blue-100"
                          >
                            <RotateCcw size={13} />
                            Unarchive
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleStatus(user.id, user.is_active)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                              user.is_active
                                ? 'bg-red-50 text-red-500 hover:bg-red-100'
                                : 'bg-green-50 text-green-600 hover:bg-green-100'
                            }`}
                          >
                            {user.is_active ? 'Deactivate' : 'Activate'}
                          </button>
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
    </div>
  );
}