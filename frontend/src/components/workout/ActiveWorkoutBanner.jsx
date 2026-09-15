import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { workoutApi } from '../../api/workoutApi.js';
import { Play, Timer, ArrowRight } from 'lucide-react';

export const ActiveWorkoutBanner = () => {
  const { data: response } = useQuery({
    queryKey: ['activeWorkout'],
    queryFn: () => workoutApi.getActiveWorkout(),
    refetchInterval: 10000, // Sync active status every 10 seconds
  });

  const activeWorkout = response?.data;
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!activeWorkout?.startTime) {
      setElapsedSeconds(0);
      return;
    }

    const startMs = new Date(activeWorkout.startTime).getTime();

    const updateTimer = () => {
      const nowMs = new Date().getTime();
      setElapsedSeconds(Math.max(0, Math.floor((nowMs - startMs) / 1000)));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [activeWorkout]);

  if (!activeWorkout) return null;

  const formatTimer = (totalSecs) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-r from-sky-500/20 via-sky-500/10 to-transparent border border-sky-500/30 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-sky-500 text-slate-950 rounded-xl font-bold animate-pulse">
          <Timer className="h-6 w-6" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <p className="text-xs font-bold text-sky-400 uppercase tracking-wider">Active Session in Progress</p>
          </div>
          <h4 className="text-lg font-extrabold text-white mt-0.5">{activeWorkout.title}</h4>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Elapsed Time</p>
          <p className="text-xl font-black text-sky-400 font-mono tracking-tight">{formatTimer(elapsedSeconds)}</p>
        </div>

        <Link
          to="/workouts/new"
          className="inline-flex items-center space-x-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-sky-500/20 transition-all text-sm"
        >
          <span>Continue Session</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};
