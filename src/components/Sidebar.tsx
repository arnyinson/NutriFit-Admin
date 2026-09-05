import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Utensils, Dumbbell, Ticket, LogOut, ChevronDown, Menu, X } from 'lucide-react';
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
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Isara ang profile dropdown kapag nag-click sa labas nito
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile top bar — makikita lang sa maliliit na screens */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <Logo size={28} />
          <span className="text-lg font-bold text-green-500">NutriFit</span>
        </div>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="text-gray-600 p-2 hover:bg-gray-50 rounded-lg"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Overlay kapag bukas ang mobile menu */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — TALAGANG fixed sa screen, hindi na gumagalaw kahit anong scroll ng content */}
      <div
        className={`w-56 h-screen bg-white border-r border-gray-100 flex flex-col py-8 px-4 shadow-sm
          fixed top-0 left-0 z-50 transition-transform duration-200 overflow-y-auto
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo — clickable, mapupunta sa dashboard */}
        <button
          onClick={() => handleNavClick('/dashboard')}
          className="flex items-center gap-2 mb-10 px-2 hover:opacity-80 transition-opacity flex-shrink-0"
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
                onClick={() => handleNavClick(item.path)}
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

    
        <div className="relative mt-4 pt-4 border-t border-gray-100 flex-shrink-0" ref={profileMenuRef}>
          {showProfileMenu && (
            <div className="absolute bottom-full mb-2 left-0 right-0 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-50">
                <p className="text-sm font-semibold text-gray-800">Admin</p>
                <p className="text-xs text-gray-400">Administrator</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors text-left"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
          <button
            onClick={() => setShowProfileMenu((v) => !v)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
              A
            </div>
            <span className="flex-1 text-left">Admin</span>
            <ChevronDown size={16} className={`text-gray-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      <div className="hidden lg:block w-56 flex-shrink-0" />
    </>
  );
}