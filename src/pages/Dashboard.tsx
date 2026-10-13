import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Utensils, Dumbbell, AlertTriangle, ArrowRight, TrendingUp } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import api from '../config/api';

type DashboardStats = {
  totalUsers: string;
  activeMealPlans: string;
  activeWorkoutPlans: string;
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
  const [error, setError] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [goalDistribution, setGoalDistribution] = useState<GoalDistributionItem[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);

  const loadDashboard = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.get('/users/admin/dashboard-stats');
      setStats(res.data.stats);
      setGoalDistribution(res.data.goalDistribution);
      setRecentUsers(res.data.recentUsers);
    } catch (err) {
      console.error('Load dashboard error:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalGoalCount = goalDistribution.reduce((sum, g) => sum + Number(g.count), 0);
  const todayLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const statCards = stats
    ? [
        { label: 'Total Users', value: Number(stats.totalUsers).toLocaleString(), Icon: Users, color: 'text-green-600', bg: 'bg-green-50', ring: 'group-hover:ring-green-100', bar: 'bg-green-500', path: '/users' },
        { label: 'Active Meal Plans', value: Number(stats.activeMealPlans).toLocaleString(), Icon: Utensils, color: 'text-orange-600', bg: 'bg-orange-50', ring: 'group-hover:ring-orange-100', bar: 'bg-orange-500', path: '/meal-plan' },
        { label: 'Active Workout Plans', value: Number(stats.activeWorkoutPlans).toLocaleString(), Icon: Dumbbell, color: 'text-blue-600', bg: 'bg-blue-50', ring: 'group-hover:ring-blue-100', bar: 'bg-blue-500', path: '/workout' },
        { label: 'Allergy Cases', value: Number(stats.allergyCases).toLocaleString(), Icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', ring: 'group-hover:ring-red-100', bar: 'bg-red-500', path: '/users' },
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
        <div className="flex-1 flex items-center justify-center pt-16 lg:pt-0">
          <p className="text-gray-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 relative">
      {/* Subtle decorative background blooms */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 right-[-6rem] w-[28rem] h-[28rem] rounded-full bg-green-200/30 blur-3xl" />
        <div className="absolute top-[22rem] right-[10%] w-72 h-72 rounded-full bg-purple-200/25 blur-3xl" />
        <div className="absolute bottom-[-6rem] left-[20%] w-96 h-96 rounded-full bg-green-100/40 blur-3xl" />
      </div>

      <Sidebar active="Dashboard" />

      <div className="flex-1 p-4 lg:p-8 pt-20 lg:pt-8 relative min-w-0 w-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        </div>

        {error && (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-red-50 border border-red-100 text-red-600 rounded-2xl px-5 py-4">
            <p className="text-sm">Unable to load the dashboard data. The server may be waking up.</p>
            <button
              onClick={loadDashboard}
              className="self-start sm:self-auto bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {/* Welcome banner */}
        <div className="relative overflow-hidden bg-gradient-to-br from-green-600 to-green-500 rounded-2xl p-5 sm:p-6 mb-6 lg:mb-8 shadow-sm">
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute right-16 bottom-[-3rem] w-28 h-28 rounded-full bg-purple-400/20" />
          <div className="relative">
            <p className="text-green-50 text-sm font-medium">{todayLabel}</p>
            <h2 className="text-white text-lg sm:text-xl font-bold mt-1">Welcome back, Admin 👋</h2>
            <p className="text-green-50 text-sm mt-1">
              {stats ? `${Number(stats.totalUsers).toLocaleString()} users are currently on the platform.` : 'Loading platform overview...'}
            </p>
          </div>
        </div>

        {/* Stats Cards — clickable, navigates to related page */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          {statCards.map((stat, i) => (
            <button
              key={i}
              onClick={() => navigate(stat.path)}
              className={`group bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 ring-1 ring-transparent transition-all hover:shadow-md hover:-translate-y-0.5 ${stat.ring} relative overflow-hidden text-left cursor-pointer`}
            >
              <div className={`absolute left-0 top-0 h-1 w-full ${stat.bar}`} />
              <div className="flex items-center gap-3 mb-1">
                <div className={`${stat.bg} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <stat.Icon size={22} className={stat.color} />
                </div>
                <div className="min-w-0">
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-gray-500 leading-tight">{stat.label}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Goal Distribution */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 xl:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-green-500" />
              <h2 className="text-base font-bold text-gray-800">Goal Distribution</h2>
            </div>
            {totalGoalCount === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No user data yet.</p>
            ) : (
              <div className="flex flex-col sm:flex-row xl:flex-col items-center gap-6">
                <div className="flex justify-center flex-shrink-0">
                  <div
                    className="relative w-36 h-36 rounded-full"
                    style={{ background: buildConicGradient() }}
                  >
                    <div className="absolute inset-5 bg-white rounded-full flex flex-col items-center justify-center">
                      <span className="text-lg font-bold text-gray-800 leading-none">{totalGoalCount}</span>
                      <span className="text-[11px] text-gray-400 mt-1">users</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-3 flex-1 w-full min-w-0">
                  {goalDistribution.map((goal, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${goalColors[goal.dietary_goal] || 'bg-gray-400'}`} />
                      <span className="text-sm text-gray-600 truncate">{goal.dietary_goal}</span>
                      <span className="text-xs text-gray-400 ml-auto whitespace-nowrap">{Number(goal.count)} users</span>
                      <span className="text-sm font-bold text-gray-800 w-10 text-right">
                        {Math.round((Number(goal.count) / totalGoalCount) * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recent Users */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 xl:col-span-2 min-w-0">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-gray-800">Recent Users</h2>
              <button
                onClick={() => navigate('/users')}
                className="flex items-center gap-1 text-xs text-green-500 font-semibold hover:underline flex-shrink-0"
              >
                View all <ArrowRight size={12} />
              </button>
            </div>
            {recentUsers.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No users yet.</p>
            ) : (
              <>
                {/* Phones: stacked cards (no sideways scrolling) */}
                <div className="md:hidden flex flex-col divide-y divide-gray-50">
                  {recentUsers.map((user, i) => (
                    <div key={i} className="py-3 flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                        {user.name[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-gray-700 truncate">{user.name}</p>
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                              user.is_active ? 'text-green-600 bg-green-50' : 'text-orange-500 bg-orange-50'
                            }`}
                          >
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {user.dietary_goal} · {user.age} yrs
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tablets and up: table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                        <th className="pb-3 font-medium">Users</th>
                        <th className="pb-3 font-medium">Email</th>
                        <th className="pb-3 font-medium">Age</th>
                        <th className="pb-3 font-medium">Goal</th>
                        <th className="pb-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUsers.map((user, i) => (
                        <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-3 pr-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                                {user.name[0]}
                              </div>
                              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">{user.name}</span>
                            </div>
                          </td>
                          <td className="py-3 pr-3 text-sm text-gray-500 max-w-[220px] truncate">{user.email}</td>
                          <td className="py-3 pr-3 text-sm text-gray-500">{user.age}</td>
                          <td className="py-3 pr-3 text-sm text-gray-500 whitespace-nowrap">{user.dietary_goal}</td>
                          <td className="py-3">
                            <span
                              className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ${
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
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}