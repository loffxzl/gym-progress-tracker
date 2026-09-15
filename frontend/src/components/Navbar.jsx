import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Dumbbell, LogOut, LayoutDashboard, PlusCircle, User, BarChart3, Search, Settings as SettingsIcon, Sparkles } from 'lucide-react';
import { GlobalSearchModal } from './common/GlobalSearchModal.jsx';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 text-sky-400 font-extrabold text-xl">
            <div className="p-2 bg-sky-500/10 rounded-xl border border-sky-500/20">
              <Dumbbell className="h-6 w-6 text-sky-400" />
            </div>
            <span className="tracking-tight text-white">Fit<span className="text-sky-400">Pulse</span></span>
          </Link>

          {/* Nav Links */}
          {user && (
            <div className="flex items-center space-x-6">
              <Link
                to="/"
                className="flex items-center space-x-2 text-sm font-medium text-slate-300 hover:text-sky-400 transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/ai-coach"
                className="flex items-center space-x-2 text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <Sparkles className="h-4 w-4 fill-indigo-400/20" />
                <span>AI Coach</span>
              </Link>

              <Link
                to="/analytics"
                className="flex items-center space-x-2 text-sm font-medium text-slate-300 hover:text-sky-400 transition-colors"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </Link>

              <Link
                to="/workouts"
                className="flex items-center space-x-2 text-sm font-medium text-slate-300 hover:text-sky-400 transition-colors"
              >
                <Dumbbell className="h-4 w-4" />
                <span>Workouts</span>
              </Link>

              <Link
                to="/exercises"
                className="flex items-center space-x-2 text-sm font-medium text-slate-300 hover:text-sky-400 transition-colors"
              >
                <Dumbbell className="h-4 w-4" />
                <span>Exercises</span>
              </Link>

              <Link
                to="/weight"
                className="flex items-center space-x-2 text-sm font-medium text-slate-300 hover:text-sky-400 transition-colors"
              >
                <span className="text-base leading-none">⚖️</span>
                <span>Weight</span>
              </Link>

              <button
                id="global-search-trigger"
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center space-x-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-xl transition-all"
                title="Search (Cmd+K)"
              >
                <Search className="h-3.5 w-3.5 text-sky-400" />
                <span className="hidden md:inline">Search...</span>
                <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-[10px] text-slate-400 font-mono">⌘K</span>
              </button>

              <Link
                to="/settings"
                className="flex items-center space-x-2 text-sm font-medium text-slate-300 hover:text-sky-400 transition-colors"
                title="Settings & Preferences"
              >
                <SettingsIcon className="h-4 w-4" />
                <span className="hidden lg:inline">Settings</span>
              </Link>

              <Link
                to="/workouts/new"
                className="flex items-center space-x-2 text-sm font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 px-4 py-2 rounded-xl transition-all shadow-lg shadow-sky-500/20"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Log Workout</span>
              </Link>

              {/* User Profile & Logout */}
              <div className="flex items-center space-x-4 pl-4 border-l border-slate-800">
                <Link to="/profile" className="flex items-center space-x-2 text-slate-300 hover:text-sky-400 transition">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sky-400 font-bold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium hidden md:inline">{user.name}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </nav>
  );
};
