import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, Dumbbell, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6 backdrop-blur-xl">
        <div className="relative inline-block">
          <div className="p-5 bg-sky-500/10 rounded-3xl border border-sky-500/20 text-sky-400 inline-block">
            <Compass className="h-12 w-12 animate-spin-slow text-sky-400" />
          </div>
          <span className="absolute -top-2 -right-2 bg-rose-500 text-white font-extrabold text-xs px-2.5 py-1 rounded-full shadow">
            404
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black text-white tracking-tight">Page Not Found</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            The page or resource you are looking for does not exist or has been moved.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-5 py-3 rounded-xl shadow-lg shadow-sky-500/20 transition-all text-sm"
          >
            <Home className="h-4 w-4" />
            <span>Go to Dashboard</span>
          </Link>
          <Link
            to="/workouts"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-5 py-3 rounded-xl border border-slate-700 transition-all text-sm"
          >
            <Dumbbell className="h-4 w-4" />
            <span>View Workouts</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
