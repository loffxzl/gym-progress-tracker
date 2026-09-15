import React, { useState, useEffect } from 'react';
import { Timer, Play, Pause, RotateCcw, Plus, Volume2, VolumeX, X } from 'lucide-react';

export const RestTimer = ({ onClose }) => {
  const [targetSeconds, setTargetSeconds] = useState(90);
  const [secondsLeft, setSecondsLeft] = useState(90);
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    let interval = null;

    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isActive) {
      setIsActive(false);
      if (!isMuted) {
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.5);
        } catch (e) {
          // Audio fallback
        }
      }
    }

    return () => clearInterval(interval);
  }, [isActive, secondsLeft, isMuted]);

  const startTimer = (secs) => {
    setTargetSeconds(secs);
    setSecondsLeft(secs);
    setIsActive(true);
  };

  const toggleActive = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setSecondsLeft(targetSeconds);
  };

  const addTime = (secs) => {
    setSecondsLeft((prev) => prev + secs);
    setTargetSeconds((prev) => prev + secs);
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`;
  };

  const progressPercent = targetSeconds > 0 ? ((targetSeconds - secondsLeft) / targetSeconds) * 100 : 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 animate-fade-in relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-sky-500/10 text-sky-400 rounded-xl">
            <Timer className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Rest Interval Timer</h4>
            <p className="text-[11px] text-slate-400">Track recovery between sets</p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
            title={isMuted ? 'Unmute alert sound' : 'Mute alert sound'}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-sky-400" />}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Timer Progress Ring & Display */}
      <div className="flex flex-col items-center justify-center py-2">
        <div className="text-4xl font-black font-mono tracking-tight text-white mb-2">
          {formatTime(secondsLeft)}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
          <div
            className={`h-full transition-all duration-1000 ${
              secondsLeft === 0 ? 'bg-emerald-400' : 'bg-sky-500'
            }`}
            style={{ width: `${Math.min(100, progressPercent)}%` }}
          />
        </div>
      </div>

      {/* Preset Interval Buttons */}
      <div className="grid grid-cols-4 gap-2">
        {[30, 60, 90, 120].map((secs) => (
          <button
            key={secs}
            type="button"
            onClick={() => startTimer(secs)}
            className={`py-1.5 text-xs font-bold rounded-xl border transition-all ${
              targetSeconds === secs && isActive
                ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-md shadow-sky-500/20'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-sky-500/40 hover:text-sky-400'
            }`}
          >
            {secs < 60 ? `${secs}s` : `${secs / 60}m`}
          </button>
        ))}
      </div>

      {/* Active Timer Controls */}
      <div className="flex items-center justify-center space-x-3 pt-1 border-t border-slate-800/80">
        <button
          type="button"
          onClick={toggleActive}
          className={`flex-1 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-lg ${
            isActive
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
              : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-sky-500/20'
          }`}
        >
          {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-slate-950" />}
          <span>{isActive ? 'Pause' : 'Start'}</span>
        </button>

        <button
          type="button"
          onClick={resetTimer}
          className="p-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl transition-all"
          title="Reset Timer"
        >
          <RotateCcw className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => addTime(30)}
          className="px-3 py-2.5 bg-slate-950 border border-slate-800 hover:border-sky-500/40 text-sky-400 font-bold text-xs rounded-xl transition-all flex items-center space-x-1"
          title="Add 30 seconds"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>30s</span>
        </button>
      </div>
    </div>
  );
};
