import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { authApi } from "../api/authApi.js";
import { PageHeader } from "../components/common/PageHeader.jsx";
import {
  Moon,
  Sun,
  Laptop,
  Scale,
  Volume2,
  VolumeX,
  Clock,
  HardDrive,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Save,
  Shield,
} from "lucide-react";

export const Settings = () => {
  const { user, updateUser } = useAuth();
  const { theme, changeTheme } = useTheme();

  const [units, setUnits] = useState(user?.units || "KG");
  const [restTimerSound, setRestTimerSound] = useState(
    user?.restTimerSound !== undefined ? user.restTimerSound : true
  );
  const [autoStartRestTimer, setAutoStartRestTimer] = useState(
    user?.autoStartRestTimer || false
  );

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (user) {
      if (user.units) setUnits(user.units);
      if (user.restTimerSound !== undefined) setRestTimerSound(user.restTimerSound);
      if (user.autoStartRestTimer !== undefined) setAutoStartRestTimer(user.autoStartRestTimer);
    }
  }, [user]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    try {
      setSaving(true);
      const payload = {
        units,
        restTimerSound,
        autoStartRestTimer,
      };

      const res = await authApi.updateProfile(payload);
      if (res.data?.data) {
        updateUser(res.data.data);
        localStorage.setItem("units", units);
        setSuccessMsg("Settings and preferences saved successfully!");
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleClearLocalStorage = () => {
    if (window.confirm("Clear non-auth local storage settings? (Theme will reset to Dark)")) {
      const token = localStorage.getItem("token");
      localStorage.clear();
      if (token) localStorage.setItem("token", token);
      changeTheme("DARK");
      alert("Local storage settings reset!");
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Header */}
      <PageHeader
        title="Application Settings & Preferences ⚙️"
        description="Customize dark mode themes, weight measurement units, timer sound alerts, and storage settings."
      />

      {/* Alert Banners */}
      {successMsg && (
        <div className="bg-emerald-950/60 border border-emerald-800 text-emerald-200 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-950/60 border border-rose-800 text-rose-200 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* 1. Theme / Dark Mode Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Moon className="h-5 w-5 text-indigo-400" />
            <div>
              <h3 className="text-lg font-bold text-white">Appearance & Theme Mode</h3>
              <p className="text-xs text-slate-400">Choose your preferred visual color theme</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <button
              type="button"
              onClick={() => changeTheme("DARK")}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition ${
                theme === "DARK"
                  ? "bg-indigo-950/60 border-indigo-500 text-white shadow-lg shadow-indigo-500/10"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <Moon className="h-6 w-6 text-indigo-400" />
              <span className="font-bold text-sm">Dark Mode</span>
              <span className="text-[10px] text-slate-500">Optimized for gym dark screens</span>
            </button>

            <button
              type="button"
              onClick={() => changeTheme("LIGHT")}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition ${
                theme === "LIGHT"
                  ? "bg-indigo-950/60 border-indigo-500 text-white shadow-lg shadow-indigo-500/10"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <Sun className="h-6 w-6 text-amber-400" />
              <span className="font-bold text-sm">Light Mode</span>
              <span className="text-[10px] text-slate-500">High contrast daylight view</span>
            </button>

            <button
              type="button"
              onClick={() => changeTheme("SYSTEM")}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition ${
                theme === "SYSTEM"
                  ? "bg-indigo-950/60 border-indigo-500 text-white shadow-lg shadow-indigo-500/10"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <Laptop className="h-6 w-6 text-sky-400" />
              <span className="font-bold text-sm">System Theme</span>
              <span className="text-[10px] text-slate-500">Match operating system preference</span>
            </button>
          </div>
        </div>

        {/* 2. Units & Preferences */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Scale className="h-5 w-5 text-emerald-400" />
            <div>
              <h3 className="text-lg font-bold text-white">Units & Measurement Preferences</h3>
              <p className="text-xs text-slate-400">Specify weight metrics display formatting</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Default Weight Unit
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUnits("KG")}
                  className={`py-2.5 rounded-xl border text-sm font-bold transition ${
                    units === "KG"
                      ? "bg-emerald-950/80 border-emerald-500 text-emerald-300"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  Kilograms (kg)
                </button>
                <button
                  type="button"
                  onClick={() => setUnits("LBS")}
                  className={`py-2.5 rounded-xl border text-sm font-bold transition ${
                    units === "LBS"
                      ? "bg-emerald-950/80 border-emerald-500 text-emerald-300"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  Pounds (lbs)
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Rest Interval Sound Alerts
              </label>
              <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center space-x-2 text-xs text-slate-300">
                  {restTimerSound ? (
                    <Volume2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <VolumeX className="h-4 w-4 text-slate-500" />
                  )}
                  <span>Play audio beep upon timer completion</span>
                </div>
                <input
                  type="checkbox"
                  checked={restTimerSound}
                  onChange={(e) => setRestTimerSound(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-900 border-slate-700 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Storage & Cache Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <HardDrive className="h-5 w-5 text-sky-400" />
              <div>
                <h3 className="text-lg font-bold text-white">Local Storage & Cache Memory</h3>
                <p className="text-xs text-slate-400">Inspecting client-side browser persistence</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClearLocalStorage}
              className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Reset Cache</span>
            </button>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Theme Mode:</span>
              <span className="text-indigo-400">{theme}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Units Preference:</span>
              <span className="text-emerald-400">{units}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Auth Session JWT:</span>
              <span className="text-sky-400">
                {localStorage.getItem("token") ? "Active (Bearer Header)" : "None"}
              </span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-600/20 transition flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? "Saving Preferences..." : "Save All Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
