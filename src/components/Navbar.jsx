import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useTheme } from '../context/ThemeContext';

function Navbar({ user }) {
  const navigate = useNavigate();
  const { dark, setDark } = useTheme();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-blue-100 dark:border-slate-700 px-6 py-4 flex items-center justify-between shadow-sm">
      
      {/* Left — Logo */}
      <Link to="/" className="text-xl font-bold text-blue-500">
        💸 SplitSmart
      </Link>

      {/* Right — Actions */}
      <div className="flex items-center gap-3">

        {/* Theme Toggle */}
        <button
          onClick={() => setDark(!dark)}
          className="text-xl hover:scale-110 transition"
          title="Toggle theme"
        >
          {dark ? '☀️' : '🌙'}
        </button>

        {user ? (
          <>
            {/* Dashboard Button — clear for users */}
            <Link
              to="/"
              className="flex items-center gap-1 text-sm text-blue-500 font-medium bg-blue-50 dark:bg-slate-700 px-3 py-2 rounded-lg hover:bg-blue-100 transition"
            >
              🏠 My Groups
            </Link>

            {/* User name badge */}
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 px-3 py-2 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                {user.email.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
                {user.email.split('@')[0]}
              </span>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="text-sm text-red-400 hover:text-red-500 transition border border-red-200 px-3 py-2 rounded-lg"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="bg-blue-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;