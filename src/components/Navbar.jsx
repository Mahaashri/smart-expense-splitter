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
      <Link to="/" className="text-xl font-bold text-blue-500">
        💸 SplitSmart
      </Link>

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
            <span className="text-sm text-gray-400 hidden sm:block">
              {user.email}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-red-400 hover:text-red-500 transition border border-red-200 px-3 py-1 rounded-lg"
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