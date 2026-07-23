import { useState, useEffect, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
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
      if (statusFilter !== 'All Status') params.is_active = statusFilter === 'Active' ? 'true' : 'false';

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
    }, 300); // debounce para sa search
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

  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  const paginatedUsers = users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar active="User" />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
            <p className="text-sm text-gray-400 mt-1">Manage and monitor all NutriFit users</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm">A</div>
              <span className="text-sm font-medium text-gray-700">Admin</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-xl px-4 bg-gray-50">
              <Search size={16} className="text-gray-400" />
              <input
                className="flex-1 py-2.5 bg-transparent outline-none text-sm text-gray-700"
                placeholder="Search user by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 bg-gray-50 outline-none cursor-pointer"
              value={goalFilter}
              onChange={(e) => setGoalFilter(e.target.value)}
            >
              <option>All Goal</option>
              <option>Cutting</option>
              <option>Bulking</option>
              <option>Maintenance</option>
            </select>
            <select
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 bg-gray-50 outline-none cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Name', 'Email', 'Age', 'Goal', 'Weight', 'Status', 'Action'].map((h) => (
                  <th key={h} className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
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
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-600">
                          {user.name[0]}
                        </div>
                        <span className="text-sm font-medium text-gray-700">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{user.age ?? '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{user.dietary_goal}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{user.weight} kg</td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          user.is_active ? 'text-green-600 bg-green-50' : 'text-orange-500 bg-orange-50'
                        }`}
                      >
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(user.id, user.is_active)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                          user.is_active
                            ? 'bg-red-50 text-red-500 hover:bg-red-100'
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                      >
                        {user.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-400">
              Showing {paginatedUsers.length} of {users.length} users
            </p>
            <div className="flex items-center gap-2">
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