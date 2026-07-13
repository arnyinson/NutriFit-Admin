import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Utensils, Dumbbell, Ticket, LogOut } from 'lucide-react';
import Logo from './Logo';

const navItems = [
  { label: 'Dashboard', Icon: LayoutDashboard, path: '/dashboard' },
  { label: 'User', Icon: Users, path: '/users' },
  { label: 'Meal Plan', Icon: Utensils, path: '/meal-plan' },
  { label: 'Workout', Icon: Dumbbell, path: '/workout' },
  { label: 'Feedback', Icon: Ticket, path: '/feedback' },
];

export default function Sidebar({ active }: { active: string }) {
  const navigate = useNavigate();

  return (
    <div className="w-56 min-h-screen bg-white border-r border-gray-100 flex flex-col py-8 px-4 shadow-sm">
      {/* Logo — clickable, mapupunta sa dashboard */}
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 mb-10 px-2 hover:opacity-80 transition-opacity"
      >
        <Logo size={32} />
        <span className="text-xl font-bold text-green-500">NutriFit</span>
      </button>

      {/* Nav Items */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(item => {
          const isActive = active === item.label;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left ${
                isActive
                  ? 'bg-green-500 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={() => navigate('/login')}
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
      >
        <LogOut size={18} />
        Logout
      </button>
    </div>
  );
}