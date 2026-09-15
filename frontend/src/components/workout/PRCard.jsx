import React from 'react';
import { Trophy, Calendar, Dumbbell, Flame, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PRCard = ({
  title,
  value,
  unit = 'kg',
  subtitle,
  exerciseName,
  workoutTitle,
  date,
  workoutId,
  icon: Icon = Trophy,
  badgeColor = 'amber',
}) => {
  const colorMap = {
    amber: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      pillBg: 'bg-amber-500/20',
    },
    sky: {
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/30',
      text: 'text-sky-400',
      pillBg: 'bg-sky-500/20',
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      pillBg: 'bg-emerald-500/20',
    },
    rose: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      text: 'text-rose-400',
      pillBg: 'bg-rose-500/20',
    },
  };

  const theme = colorMap[badgeColor] || colorMap.amber;

  return (
    <div className={`bg-slate-900 border ${theme.border} rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all`}>
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full bg-gradient-to-br from-amber-500/10 to-transparent blur-xl pointer-events-none" />

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-1.5">
            <Award className={`h-4 w-4 ${theme.text}`} />
            <span className={`text-xs font-extrabold uppercase tracking-wider ${theme.text}`}>Personal Record</span>
          </div>
          <h3 className="text-base font-bold text-white">{title}</h3>
        </div>

        <div className={`p-3 rounded-2xl ${theme.bg} ${theme.text} border ${theme.border}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>

      {/* Main Metric Value */}
      <div>
        <p className="text-3xl font-black text-white tracking-tight">
          {typeof value === 'number' ? value.toLocaleString() : value || '0'}{' '}
          <span className={`text-lg font-bold ${theme.text}`}>{unit}</span>
        </p>

        {subtitle && (
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Record Context Footer */}
      {(exerciseName || workoutTitle || date) && (
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div>
            {exerciseName && (
              <span className="font-bold text-slate-200 block truncate max-w-[160px]">
                {exerciseName}
              </span>
            )}
            {workoutTitle && workoutId ? (
              <Link to={`/workouts/${workoutId}`} className="text-sky-400 hover:underline block truncate max-w-[160px]">
                {workoutTitle}
              </Link>
            ) : workoutTitle ? (
              <span className="text-slate-400 block truncate max-w-[160px]">{workoutTitle}</span>
            ) : null}
          </div>

          {date && (
            <span className="flex items-center space-x-1 text-[11px] text-slate-500 flex-shrink-0">
              <Calendar className="h-3 w-3 text-slate-400" />
              <span>{new Date(date).toLocaleDateString(undefined, { dateStyle: 'short' })}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
