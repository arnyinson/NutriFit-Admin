import { useNavigate } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', icon: '📊', path: '/dashboard' },
  { label: 'User', icon: '👥', path: '/users' },
  { label: 'Meal Plan', icon: '🍽️', path: '/meal-plan' },
  { label: 'Workout', icon: '💪', path: '/workout' },
  { label: 'Feedback', icon: '🎫', path: '/feedback' },
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
        <span className="text-2xl">🥗</span>
        <span className="text-xl font-bold text-green-500">NutriFit</span>
      </button>

      {/* Nav Items */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(item => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left ${
              active === item.label
                ? 'bg-green-500 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <button
        onClick={() => navigate('/login')}
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
      >
        <span className="text-lg">🚪</span>
        Logout
      </button>
    </div>
  );
}