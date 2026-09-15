import React from 'react';

export const StatCard = ({ title, value, unit, icon: Icon, color = 'sky' }) => {
  const colorStyles = {
    sky: 'bg-sky-500/10 border-sky-500/20 text-sky-400',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden transition-all hover:border-slate-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-black text-white mt-1">
            {value} {unit && <span className="text-sm font-normal text-slate-400">{unit}</span>}
          </h3>
        </div>
        {Icon && (
          <div className={`p-3 rounded-2xl border ${colorStyles[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </div>
  );
};
