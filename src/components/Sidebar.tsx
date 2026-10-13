import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Utensils, Dumbbell, Ticket, LogOut, ChevronDown, Menu, X } from 'lucide-react';
import Logo from './Logo';
import api from '../config/api';

const navItems = [
  { label: 'Dashboard', Icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Account Management', Icon: Users, path: '/users' },
  { label: 'Meal Plan Management', Icon: Utensils, path: '/meal-plan' },
  { label: 'Workout Management', Icon: Dumbbell, path: '/workout' },
  { label: 'Ticketing Support', Icon: Ticket, path: '/feedback' },
];

export default function Sidebar({ active }: { active: string }) {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [newTickets, setNewTickets] = useState(0);

  // Badge on "Ticketing Support": number of NEW tickets, refreshed every 15s.
  // It drops automatically once the admin opens a ticket (New -> Pending) or resolves it.
  useEffect(() => {
    let cancelled = false;
    const loadCount = async () => {
      try {
        const res = await api.get('/tickets');
        if (!cancelled) setNewTickets(parseInt(res.data?.summary?.new_count, 10) || 0);
      } catch {
        /* ignore — badge simply stays as is */
      }
    };
    loadCount();
    const interval = setInterval(loadCount, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

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
      {/* Mobile top bar */}
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

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — fixed, always visible on desktop (lg+), drawer on mobile */}
      <div
        className={`w-56 h-screen bg-white border-r border-gray-100 flex flex-col py-8 px-4 shadow-sm
          fixed top-0 left-0 z-50 transition-transform duration-200 overflow-y-auto
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <button
          onClick={() => handleNavClick('/dashboard')}
          className="flex items-center gap-2 mb-10 px-2 hover:opacity-80 transition-opacity flex-shrink-0"
        >
          <Logo size={32} />
          <span className="text-xl font-bold text-green-500">NutriFit</span>
        </button>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(item => {
            const isActive = active === item.label || (item.path === '/workout' && active.startsWith('Workout'));
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
                <span className="flex-1">{item.label}</span>
                {item.path === '/feedback' && newTickets > 0 && (
                  <span
                    className={`min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center ${
                      isActive ? 'bg-white text-green-600' : 'bg-red-500 text-white'
                    }`}
                  >
                    {newTickets > 99 ? '99+' : newTickets}
                  </span>
                )}
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
                onClick={() => {
                  setShowProfileMenu(false);
                  setShowLogoutConfirm(true);
                }}
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

      {/* Logout confirmation */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] px-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-[380px] shadow-xl">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
              <LogOut size={22} />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Log out?</h3>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to log out of the admin panel?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50"
              >
                No
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl text-sm font-semibold transition-colors"
              >
                Yes, log out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spacer — reserves space in the layout so page content never sits under the fixed sidebar */}
      <div className="hidden lg:block w-56 flex-shrink-0" />
    </>
  );
}