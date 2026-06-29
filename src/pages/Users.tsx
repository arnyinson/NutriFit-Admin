import { useState } from 'react';
import Sidebar from '../components/Sidebar';

type User = {
  id: number;
  name: string;
  email: string;
  age: number;
  goal: string;
  weight: number;
  status: 'Active' | 'Inactive';
};

const initialUsers: User[] = [
  { id: 1, name: 'David Shee', email: 'davidshee@gmail.com', age: 30, goal: 'Cutting', weight: 61, status: 'Active' },
  { id: 2, name: 'Sarah Lee', email: 'sarahlee@gmail.com', age: 27, goal: 'Maintenance', weight: 64, status: 'Active' },
  { id: 3, name: 'Michael Brown', email: 'michaelbrown@gmail.com', age: 34, goal: 'Bulking', weight: 59, status: 'Active' },
  { id: 4, name: 'Jessica Wang', email: 'jessicawang@gmail.com', age: 25, goal: 'Cutting', weight: 52, status: 'Inactive' },
  { id: 5, name: 'Flever Eme', email: 'flevereme@gmail.com', age: 40, goal: 'Maintenance', weight: 62, status: 'Active' },
  { id: 6, name: 'Achilles Awitsheesh', email: 'achillesawitsheesh@gmail.com', age: 27, goal: 'Maintenance', weight: 60, status: 'Active' },
  { id: 7, name: 'Andrew Mayor', email: 'andrewmayor@gmail.com', age: 35, goal: 'Cutting', weight: 65, status: 'Active' },
  { id: 8, name: 'Lalab Steph', email: 'lalabsteph@gmail.com', age: 30, goal: 'Cutting', weight: 67, status: 'Active' },
  { id: 9, name: 'Kery Staf', email: 'kerystaf@gmail.com', age: 26, goal: 'Bulking', weight: 68, status: 'Active' },
  { id: 10, name: 'T-rex the destroyer', email: 'trexthedestroyer@gmail.com', age: 39, goal: 'Cutting', weight: 69, status: 'Inactive' },
];

export default function Users() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [search, setSearch] = useState('');
  const [goalFilter, setGoalFilter] = useState('All Goal');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchGoal = goalFilter === 'All Goal' || u.goal === goalFilter;
    const matchStatus = statusFilter === 'All Status' || u.status === statusFilter;
    return matchSearch && matchGoal && matchStatus;
  });

  const toggleStatus = (id: number) => {
    setUsers(prev => prev.map(u =>
      u.id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u
    ));
  };

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
              <span className="text-gray-400">🔍</span>
              <input
                className="flex-1 py-2.5 bg-transparent outline-none text-sm text-gray-700"
                placeholder="Search user by name or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 bg-gray-50 outline-none cursor-pointer"
              value={goalFilter}
              onChange={e => setGoalFilter(e.target.value)}
            >
              <option>All Goal</option>
              <option>Cutting</option>
              <option>Bulking</option>
              <option>Maintenance</option>
            </select>
            <select
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 bg-gray-50 outline-none cursor-pointer"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
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
                {['Name', 'Email', 'Age', 'Goal', 'Weight', 'Status', 'Action'].map(h => (
                  <th key={h} className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
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
                  <td className="px-6 py-4 text-sm text-gray-500">{user.age}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{user.goal}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{user.weight} kg</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      user.status === 'Active'
                        ? 'text-green-600 bg-green-50'
                        : 'text-orange-500 bg-orange-50'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleStatus(user.id)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                        user.status === 'Active'
                          ? 'bg-red-50 text-red-500 hover:bg-red-100'
                          : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                    >
                      {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-sm">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-400">
              Showing {filtered.length} of {users.length} users
            </p>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 text-sm">‹</button>
              {[1, 2, 3, 4].map(p => (
                <button key={p} className={`w-8 h-8 rounded-lg text-sm font-medium ${
                  p === 1 ? 'bg-green-500 text-white' : 'border border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}>
                  {p}
                </button>
              ))}
              <button className="w-8 h-8 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 text-sm">›</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}