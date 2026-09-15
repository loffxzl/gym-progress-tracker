import React, { forwardRef } from 'react';

export const Input = forwardRef(
  ({ label, error, type = 'text', placeholder, icon: Icon, ...props }, ref) => {
    return (
      <div>
        {label && (
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && <Icon className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />}
          <input
            ref={ref}
            type={type}
            placeholder={placeholder}
            {...props}
            className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 bg-slate-950 border ${
              error ? 'border-rose-500/80 focus:border-rose-500' : 'border-slate-800 focus:border-sky-500'
            } rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 ${
              error ? 'focus:ring-rose-500' : 'focus:ring-sky-500'
            } transition-all text-sm`}
          />
        </div>
        {error && <p className="mt-1 text-xs text-rose-400 font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
