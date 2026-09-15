import React from 'react';

export const Button = ({
  children,
  type = 'button',
  isLoading = false,
  disabled = false,
  variant = 'primary',
  className = '',
  onClick,
}) => {
  const baseStyles =
    'w-full py-3 px-4 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-sky-500/20',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100 shadow-slate-900/50',
    danger: 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {isLoading ? (
        <div className="h-5 w-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
      ) : (
        children
      )}
    </button>
  );
};
