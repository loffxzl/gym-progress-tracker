import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const ErrorState = ({
  title = 'Failed to load data',
  message = 'An error occurred while fetching information from the server.',
  onRetry,
}) => {
  return (
    <div className="bg-rose-950/20 border border-rose-900/40 rounded-2xl p-8 text-center space-y-4 max-w-md mx-auto my-6">
      <div className="inline-flex p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20 text-rose-400">
        <AlertCircle className="h-8 w-8" />
      </div>
      <div>
        <h3 className="text-base font-bold text-white">{title}</h3>
        <p className="text-xs text-slate-400 mt-1">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center space-x-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-lg shadow-rose-600/20 transition-all"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
};
