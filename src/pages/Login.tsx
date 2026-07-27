import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import Logo from '../components/Logo';
import api from '../config/api';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please enter username and password.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/admin-login', { username, password });
      localStorage.setItem('adminToken', res.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      const message = err.response?.data?.error || 'Invalid username or password.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-96 flex flex-col items-center gap-4">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-2">
          <Logo size={40} />
          <span className="text-3xl font-bold text-green-500">NutriFit</span>
        </div>

        {/* Username */}
        <div className="w-full flex items-center border border-gray-200 rounded-xl px-4 bg-gray-50 gap-2">
          <User size={18} className="text-gray-400" />
          <input
            className="flex-1 py-3 bg-transparent outline-none text-sm text-gray-700"
            type="text"
            placeholder="Admin"
            value={username}
            onChange={e => { setUsername(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            disabled={loading}
          />
        </div>

        {/* Password */}
        <div className="w-full flex items-center border border-gray-200 rounded-xl px-4 bg-gray-50 gap-2">
          <Lock size={18} className="text-gray-400" />
          <input
            className="flex-1 py-3 bg-transparent outline-none text-sm text-gray-700"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            disabled={loading}
          />
          <button
            className="p-1 hover:opacity-70"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff size={18} className="text-gray-400" />
            ) : (
              <Eye size={18} className="text-gray-400" />
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        {/* Login Button */}
        <button
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl text-base transition-colors mt-2 disabled:opacity-60"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        {/* Footer */}
        <p className="text-gray-400 text-xs mt-2">© 2026 NutriFit</p>
      </div>
    </div>
  );
}