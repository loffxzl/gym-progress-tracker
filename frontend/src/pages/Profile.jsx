import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { authApi } from "../api/authApi.js";
import { PageHeader } from "../components/common/PageHeader.jsx";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Ruler,
  Target,
  Award,
  Globe,
  Camera,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Save,
} from "lucide-react";

export const Profile = () => {
  const { user, updateUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Form Fields
  const [name, setName] = useState("");
  const [height, setHeight] = useState("");
  const [goalWeight, setGoalWeight] = useState("");
  const [experience, setExperience] = useState("INTERMEDIATE");
  const [units, setUnits] = useState("KG");
  const [timezone, setTimezone] = useState("UTC");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setHeight(user.height ? String(user.height) : "");
      setGoalWeight(user.goalWeight ? String(user.goalWeight) : "");
      setExperience(user.experience || "INTERMEDIATE");
      setUnits(user.units || "KG");
      setTimezone(user.timezone || "UTC");
      setAvatarUrl(user.avatarUrl || "");
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (name.trim().length < 2) {
      setErrorMsg("Full name must be at least 2 characters long.");
      return;
    }

    if (height) {
      const hNum = Number(height);
      if (isNaN(hNum) || hNum < 30 || hNum > 300) {
        setErrorMsg("Height must be a valid number between 30 cm and 300 cm.");
        return;
      }
    }

    if (goalWeight) {
      const gNum = Number(goalWeight);
      if (isNaN(gNum) || gNum < 1 || gNum > 1000) {
        setErrorMsg("Goal weight must be a valid number between 1 and 1000.");
        return;
      }
    }

    try {
      setSubmitting(true);
      const payload = {
        name: name.trim(),
        height: height ? Number(height) : null,
        goalWeight: goalWeight ? Number(goalWeight) : null,
        experience,
        units,
        timezone,
        avatarUrl: avatarUrl.trim() || null,
      };

      const res = await authApi.updateProfile(payload);
      if (res.data?.data) {
        updateUser(res.data.data);
        setSuccessMsg("Profile updated successfully!");
        setIsEditing(false);
      }
    } catch (err) {
      const validationErrors = err.response?.data?.errors;
      if (Array.isArray(validationErrors) && validationErrors.length > 0) {
        setErrorMsg(validationErrors.map((e) => e.message).join(". "));
      } else {
        setErrorMsg(err.response?.data?.message || "Failed to update profile settings.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <PageHeader
        title="User Profile & Settings 👤"
        description="Manage your athlete account details, physical body metrics, units, and timezone preferences."
        action={
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all text-sm"
          >
            <Edit3 className="h-4 w-4" />
            <span>{isEditing ? "View Profile" : "Edit Profile"}</span>
          </button>
        }
      />

      {/* Alert Messages */}
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

      {/* Main Profile Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-8 shadow-xl">
        {/* Profile Header & Avatar Placeholder */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-800 text-center sm:text-left">
          <div className="relative group">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={user?.name}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-indigo-500/50 shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-indigo-600 via-sky-600 to-emerald-500 p-0.5 shadow-lg">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-white font-extrabold text-3xl tracking-wider">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
              </div>
            )}
            <div className="absolute bottom-0 right-0 p-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300">
              <Camera className="h-3.5 w-3.5" />
            </div>
          </div>

          <div className="space-y-1 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h3 className="text-2xl font-extrabold text-white">{user?.name}</h3>
              <span className="px-2.5 py-0.5 bg-sky-950/80 border border-sky-800/60 text-sky-400 rounded-full text-xs font-mono font-bold uppercase inline-block w-fit mx-auto sm:mx-0">
                {user?.role || "USER"}
              </span>
            </div>
            <p className="text-sm text-slate-400">{user?.email}</p>
            <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                Joined: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Recently"}
              </span>
              <span className="flex items-center gap-1 font-mono text-indigo-400">
                <Globe className="h-3.5 w-3.5" />
                {user?.timezone || "UTC"}
              </span>
            </div>
          </div>
        </div>

        {/* View vs Edit Content */}
        {!isEditing ? (
          /* View Mode */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
                <User className="h-3.5 w-3.5 text-sky-400" />
                <span>Full Name</span>
              </p>
              <p className="text-base font-bold text-white">{user?.name || "N/A"}</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
                <Mail className="h-3.5 w-3.5 text-sky-400" />
                <span>Email Address</span>
              </p>
              <p className="text-base font-bold text-white">{user?.email || "N/A"}</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
                <Ruler className="h-3.5 w-3.5 text-amber-400" />
                <span>Height</span>
              </p>
              <p className="text-base font-bold text-white">
                {user?.height ? `${user.height} cm` : "Not set"}
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
                <Target className="h-3.5 w-3.5 text-emerald-400" />
                <span>Goal Weight</span>
              </p>
              <p className="text-base font-bold text-white">
                {user?.goalWeight ? `${user.goalWeight} kg` : "Not set"}
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
                <Award className="h-3.5 w-3.5 text-purple-400" />
                <span>Experience Level</span>
              </p>
              <p className="text-base font-bold text-purple-300 uppercase">
                {user?.experience || "INTERMEDIATE"}
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
                <Globe className="h-3.5 w-3.5 text-indigo-400" />
                <span>Preferred Units & Timezone</span>
              </p>
              <p className="text-base font-bold text-white font-mono">
                {user?.units || "KG"} • {user?.timezone || "UTC"}
              </p>
            </div>
          </div>
        ) : (
          /* Edit Mode Form */
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <h4 className="text-lg font-bold text-white border-b border-slate-800 pb-2">
              Edit Account & Fitness Settings
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Height (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 178"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Goal Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 75"
                  value={goalWeight}
                  onChange={(e) => setGoalWeight(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Experience Level
                </label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="BEGINNER">Beginner (&lt; 1 year)</option>
                  <option value="INTERMEDIATE">Intermediate (1–3 years)</option>
                  <option value="ADVANCED">Advanced (3+ years)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Preferred Units
                </label>
                <select
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="KG">Kilograms (kg)</option>
                  <option value="LBS">Pounds (lbs)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Timezone</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 font-mono"
                >
                  <option value="UTC">UTC (Universal Coordinated Time)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Avatar Image URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition flex items-center space-x-2 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{submitting ? "Saving..." : "Save Profile Settings"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
