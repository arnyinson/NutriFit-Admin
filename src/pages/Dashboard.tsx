import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const stats = [
  { label: 'Total User', value: '12,450', icon: '👤', color: 'text-green-500', bg: 'bg-green-50', change: '+12%' },
  { label: 'Active Meal Plans', value: '8,352', icon: '🍽️', color: 'text-orange-500', bg: 'bg-orange-50', change: '+3 this week' },
  { label: 'Weekly Reports', value: '4,570', icon: '📊', color: 'text-blue-500', bg: 'bg-blue-50', change: '+8%' },
  { label: 'Allergy Cases', value: '246', icon: '⚠️', color: 'text-red-500', bg: 'bg-red-50', change: '+14 this week' },
];

const recentUsers = [
  { name: 'David Shee', email: 'davidshee@gmail.com', age: 30, goal: 'Cutting', status: 'Active' },
  { name: 'Sarah Lee', email: 'sarahlee@gmail.com', age: 27, goal: 'Maintenance', status: 'Active' },
  { name: 'Michael Brown', email: 'michaelbrown@gmail.com', age: 34, goal: 'Bulking', status: 'Active' },
  { name: 'Jessica Wang', email: 'jessicawang@gmail.com', age: 25, goal: 'Cutting', status: 'Inactive' },
  { name: 'Flever Eme', email: 'flevereme@gmail.com', age: 40, goal: 'Maintenance', status: 'Active' },
];

const goalDistribution = [
  { label: 'Maintenance', percentage: 32, color: 'bg-green-500' },
  { label: 'Cut', percentage: 26, color: 'bg-blue-500' },
  { label: 'Bulking', percentage: 42, color: 'bg-orange-500' },
];

const userGrowth = [300, 380, 420, 460, 500, 480, 520, 560, 510, 540, 580, 600];
const growthLabels = ['Apr 16', 'Apr 17', 'Apr 20', 'Apr 21', 'Apr 22', 'Apr 23'];

export default function Dashboard() {
  const navigate = useNavigate();
  const maxGrowth = Math.max(...userGrowth);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar active="Dashboard" />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm">A</div>
            <span className="text-sm font-medium text-gray-700">Admin</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className={`${stat.bg} w-12 h-12 rounded-xl flex items-center justify-center text-2xl`}>
                  {stat.icon}
                </div>
                <div>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </div>
              <p className="text-xs text-green-500 font-medium">{stat.change}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* User Growth Chart */}
          <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-base font-bold text-gray-800 mb-4">User Growth</h2>
            <div className="flex items-end gap-3 h-40">
              {userGrowth.map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-green-500 rounded-t-md transition-all"
                    style={{ height: `${(val / maxGrowth) * 140}px` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              {growthLabels.map((label, i) => (
                <span key={i} className="text-xs text-gray-400">{label}</span>
              ))}
            </div>
          </div>

          {/* Goal Distribution */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-base font-bold text-gray-800 mb-4">Goal Distribution</h2>
            <div className="flex justify-center mb-4">
              <div className="relative w-32 h-32 rounded-full" style={{
                background: 'conic-gradient(#4CAF50 0% 32%, #2196F3 32% 58%, #FF9800 58% 100%)'
              }}>
                <div className="absolute inset-4 bg-white rounded-full" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {goalDistribution.map((goal, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${goal.color}`} />
                  <span className="text-xs text-gray-600">{goal.label}</span>
                  <span className="text-xs font-bold text-gray-800 ml-auto">{goal.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-gray-800">Recent Users</h2>
            <button
              onClick={() => navigate('/users')}
              className="text-xs text-green-500 font-semibold hover:underline"
            >
              View all →
            </button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                <th className="pb-3 font-medium">Users</th>
                <th className="pb-3 font-medium">Gmail</th>
                <th className="pb-3 font-medium">Age</th>
                <th className="pb-3 font-medium">Goal</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((user, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                        {user.name[0]}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-sm text-gray-500">{user.email}</td>
                  <td className="py-3 text-sm text-gray-500">{user.age}</td>
                  <td className="py-3 text-sm text-gray-500">{user.goal}</td>
                  <td className="py-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      user.status === 'Active'
                        ? 'text-green-600 bg-green-50'
                        : 'text-orange-500 bg-orange-50'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}