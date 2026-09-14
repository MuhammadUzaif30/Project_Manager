import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="font-semibold text-indigo-600 text-lg">
          IssueTracker
        </Link>

        {user && (
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-500">{user.name}</span>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
            >
              Log Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;