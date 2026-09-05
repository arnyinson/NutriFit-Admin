import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Utensils, BarChart3, AlertTriangle, ArrowRight, TrendingUp } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import api from '../config/api';

type DashboardStats = {
  totalUsers: string;
  activeMealPlans: string;
  weeklyReports: string;
  allergyCases: string;
};

type GoalDistributionItem = {
  dietary_goal: string;
  count: string;
};

type RecentUser = {
  name: string;
  email: string;
  dietary_goal: string;
  is_active: boolean;
  age: number;
};

const goalColors: Record<string, string> = {
  Maintenance: 'bg-green-500',
  Cutting: 'bg-blue-500',
  Bulking: 'bg-orange-500',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [goalDistribution, setGoalDistribution] = useState<GoalDistributionItem[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await api.get('/users/admin/dashboard-stats');
        setStats(res.data.stats);
        setGoalDistribution(res.data.goalDistribution);
        setRecentUsers(res.data.recentUsers);
      } catch (err) {
        console.error('Load dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const totalGoalCount = goalDistribution.reduce((sum, g) => sum + Number(g.count), 0);
  const todayLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const statCards = stats
    ? [
        { label: 'Total Users', value: Number(stats.totalUsers).toLocaleString(), Icon: Users, color: 'text-green-600', bg: 'bg-green-50', ring: 'group-hover:ring-green-100', bar: 'bg-green-500' },
        { label: 'Active Meal Plans', value: Number(stats.activeMealPlans).toLocaleString(), Icon: Utensils, color: 'text-orange-600', bg: 'bg-orange-50', ring: 'group-hover:ring-orange-100', bar: 'bg-orange-500' },
        { label: 'Weekly Reports', value: Number(stats.weeklyReports).toLocaleString(), Icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50', ring: 'group-hover:ring-blue-100', bar: 'bg-blue-500' },
        { label: 'Allergy Cases', value: Number(stats.allergyCases).toLocaleString(), Icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', ring: 'group-hover:ring-red-100', bar: 'bg-red-500' },
      ]
    : [];

  // Conic gradient string para sa pie chart, dynamic base sa totoong distribution
  const buildConicGradient = () => {
    if (totalGoalCount === 0) return '#E5E7EB';
    const colorMap: Record<string, string> = {
      Maintenance: '#4CAF50',
      Cutting: '#2196F3',
      Bulking: '#FF9800',
    };
    let cumulative = 0;
    const segments = goalDistribution.map((g) => {
      const pct = (Number(g.count) / totalGoalCount) * 100;
      const start = cumulative;
      cumulative += pct;
      const color = colorMap[g.dietary_goal] || '#9CA3AF';
      return `${color} ${start}% ${cumulative}%`;
    });
    return `conic-gradient(${segments.join(', ')})`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar active="Dashboard" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Subtle decorative background blooms */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 right-[-6rem] w-[28rem] h-[28rem] rounded-full bg-green-200/30 blur-3xl" />
        <div className="absolute top-[22rem] right-[10%] w-72 h-72 rounded-full bg-purple-200/25 blur-3xl" />
        <div className="absolute bottom-[-6rem] left-[20%] w-96 h-96 rounded-full bg-green-100/40 blur-3xl" />
      </div>

      <Sidebar active="Dashboard" />

      <div className="flex-1 p-8 relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm">A</div>
            <span className="text-sm font-medium text-gray-700">Admin</span>
          </div>
        </div>

        {/* Welcome banner */}
        <div className="relative overflow-hidden bg-gradient-to-br from-green-600 to-green-500 rounded-2xl p-6 mb-8 shadow-sm">
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute right-16 bottom-[-3rem] w-28 h-28 rounded-full bg-purple-400/20" />
          <div className="relative">
            <p className="text-green-50 text-sm font-medium">{todayLabel}</p>
            <h2 className="text-white text-xl font-bold mt-1">Welcome back, Admin 👋</h2>
            <p className="text-green-50 text-sm mt-1">
              {stats ? `${Number(stats.totalUsers).toLocaleString()} users are currently on the platform.` : 'Loading platform overview...'}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, i) => (
            <div
              key={i}
              className={`group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ring-1 ring-transparent transition-all hover:shadow-md ${stat.ring} relative overflow-hidden`}
            >
              <div className={`absolute left-0 top-0 h-1 w-full ${stat.bar}`} />
              <div className="flex items-center gap-3 mb-1">
                <div className={`${stat.bg} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <stat.Icon size={22} className={stat.color} />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Goal Distribution */}
          <div className="col-span-3 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-green-500" />
              <h2 className="text-base font-bold text-gray-800">Goal Distribution</h2>
            </div>
            {totalGoalCount === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No user data yet.</p>
            ) : (
              <div className="flex items-center gap-8">
                <div className="flex justify-center">
                  <div
                    className="relative w-32 h-32 rounded-full"
                    style={{ background: buildConicGradient() }}
                  >
                    <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-700">{totalGoalCount} users</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  {goalDistribution.map((goal, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${goalColors[goal.dietary_goal] || 'bg-gray-400'}`} />
                      <span className="text-xs text-gray-600">{goal.dietary_goal}</span>
                      <span className="text-xs font-bold text-gray-800 ml-auto">
                        {Math.round((Number(goal.count) / totalGoalCount) * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-gray-800">Recent Users</h2>
            <button
              onClick={() => navigate('/users')}
              className="flex items-center gap-1 text-xs text-green-500 font-semibold hover:underline"
            >
              View all <ArrowRight size={12} />
            </button>
          </div>
          {recentUsers.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No users yet.</p>
          ) : (
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
                    <td className="py-3 text-sm text-gray-500">{user.dietary_goal}</td>
                    <td className="py-3">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-full ${
                          user.is_active ? 'text-green-600 bg-green-50' : 'text-orange-500 bg-orange-50'
                        }`}
                      >
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}