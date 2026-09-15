import React from 'react';

export const LoadingCard = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-pulse space-y-3">
      <div className="h-4 bg-slate-800 rounded w-1/3"></div>
      <div className="h-8 bg-slate-800 rounded w-1/2"></div>
    </div>
  );
};
