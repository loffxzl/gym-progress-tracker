import React from 'react';

export const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center my-6">
      {Icon && <Icon className="h-12 w-12 text-slate-600 mx-auto mb-4" />}
      <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
      {description && <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
};
