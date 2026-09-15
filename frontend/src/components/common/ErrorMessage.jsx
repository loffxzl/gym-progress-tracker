import React from 'react';
import { AlertCircle } from 'lucide-react';

export const ErrorMessage = ({ message }) => {
  if (!message) return null;

  return (
    <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center space-x-3 text-rose-400 text-sm animate-fade-in">
      <AlertCircle className="h-5 w-5 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
};
