import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Dumbbell, LogOut, Menu, X, PlusCircle } from 'lucide-react';

export const Navbar = ({ onToggleSidebar, isSidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Left Section: Mobile Menu Toggle & Brand Logo */}
        <div className="flex items-center space-x-3">
          {user && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
            >
              {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}

          <Link to="/" className="flex items-center space-x-3 text-sky-400 font-extrabold text-xl">
            <div className="p-2 bg-sky-500/10 rounded-xl border border-sky-500/20">
              <Dumbbell className="h-5 w-5 text-sky-400" />
            </div>
            <span className="tracking-tight text-white">Fit<span className="text-sky-400">Pulse</span></span>
          </Link>
        </div>

        {/* Right Section: Actions & Profile */}
        {user && (
          <div className="flex items-center space-x-4">
            <Link
              to="/workouts/new"
              className="hidden sm:inline-flex items-center space-x-2 text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 px-3.5 py-2 rounded-xl transition-all shadow-md shadow-sky-500/20"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Log Workout</span>
            </Link>

            <div className="flex items-center space-x-3 pl-3 border-l border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold text-xs uppercase">
                  {user.name ? user.name.charAt(0) : 'U'}
                </div>
                <span className="text-sm font-medium text-slate-200 hidden md:inline">
                  {user.name}
                </span>
              </div>

              <button
                onClick={handleLogout}
                title="Logout"
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
