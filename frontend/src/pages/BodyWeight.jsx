import React, { useState, useEffect } from "react";
import { bodyWeightApi } from "../api/bodyWeightApi.js";
import { BodyWeightChart } from "../components/workout/BodyWeightChart.jsx";
import { StatCard } from "../components/common/StatCard.jsx";

export const BodyWeight = () => {
  const [data, setData] = useState({
    summary: {
      currentWeight: null,
      goalWeight: null,
      weightDifference: null,
      weeklyAverage: null,
      monthlyAverage: null,
      totalEntries: 0,
    },
    chartData: [],
    history: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals / Forms state
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [modalError, setModalError] = useState("");

  // Log weight form
  const [weightInput, setWeightInput] = useState("");
  const [dateInput, setDateInput] = useState(new Date().toISOString().split("T")[0]);
  const [notesInput, setNotesInput] = useState("");
  const [submittingLog, setSubmittingLog] = useState(false);

  // Goal weight form
  const [goalWeightInput, setGoalWeightInput] = useState("");
  const [submittingGoal, setSubmittingGoal] = useState(false);

  const fetchWeightData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await bodyWeightApi.getWeightData();
      if (res.data?.data) {
        setData(res.data.data);
        if (res.data.data.summary.goalWeight !== null) {
          setGoalWeightInput(String(res.data.data.summary.goalWeight));
        }
      }
    } catch (err) {
      console.error("Failed to fetch weight data:", err);
      setError(err.response?.data?.message || "Failed to load body weight data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeightData();
  }, []);

  const handleAddWeightLog = async (e) => {
    e.preventDefault();
    setModalError("");

    const w = Number(weightInput);
    if (!weightInput || isNaN(w) || w < 1 || w > 1000) {
      setModalError("Please enter a valid weight between 1 and 1000.");
      return;
    }

    if (dateInput) {
      const selectedDate = new Date(dateInput);
      if (selectedDate.getTime() > Date.now() + 86400000) {
        setModalError("Log date cannot be set in the future.");
        return;
      }
    }

    try {
      setSubmittingLog(true);
      await bodyWeightApi.addWeightLog({
        weight: w,
        date: dateInput ? new Date(dateInput).toISOString() : new Date().toISOString(),
        notes: notesInput.trim() || undefined,
      });

      setWeightInput("");
      setNotesInput("");
      setIsLogModalOpen(false);
      await fetchWeightData();
    } catch (err) {
      setModalError(err.response?.data?.message || "Failed to add weight entry");
    } finally {
      setSubmittingLog(false);
    }
  };

  const handleSetGoalWeight = async (e) => {
    e.preventDefault();
    setModalError("");

    const g = Number(goalWeightInput);
    if (!goalWeightInput || isNaN(g) || g < 1 || g > 1000) {
      setModalError("Please enter a valid goal weight between 1 and 1000.");
      return;
    }

    try {
      setSubmittingGoal(true);
      await bodyWeightApi.setGoalWeight(g);
      setIsGoalModalOpen(false);
      await fetchWeightData();
    } catch (err) {
      setModalError(err.response?.data?.message || "Failed to update goal weight");
    } finally {
      setSubmittingGoal(false);
    }
  };

  const handleDeleteLog = async (id) => {
    if (!window.confirm("Are you sure you want to delete this weight entry?")) return;
    try {
      await bodyWeightApi.deleteWeightLog(id);
      await fetchWeightData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete weight log");
    }
  };

  const summary = data.summary;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg border border-indigo-500/30">
              ⚖️
            </span>
            Body Weight Tracker
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Monitor body composition, rolling time-series averages, and goal trajectories
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsGoalModalOpen(true)}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 rounded-lg text-sm font-medium transition flex items-center gap-2"
          >
            <span>🎯</span>
            {summary.goalWeight ? "Update Goal" : "Set Goal Weight"}
          </button>

          <button
            onClick={() => setIsLogModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition shadow-lg shadow-indigo-600/20 flex items-center gap-2"
          >
            <span>➕</span>
            Log Weight
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-950/50 border border-red-800 text-red-300 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Stat Cards Grid (5 Key Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Current Weight"
          value={summary.currentWeight !== null ? `${summary.currentWeight} kg` : "--"}
          subtext="Latest logged entry"
          icon="⚖️"
        />
        <StatCard
          title="Goal Weight"
          value={summary.goalWeight !== null ? `${summary.goalWeight} kg` : "Not Set"}
          subtext="Target weight"
          icon="🎯"
        />
        <StatCard
          title="Weight Difference"
          value={
            summary.weightDifference !== null
              ? `${summary.weightDifference > 0 ? "+" : ""}${summary.weightDifference} kg`
              : "--"
          }
          subtext={
            summary.weightDifference !== null
              ? summary.weightDifference === 0
                ? "Target achieved!"
                : summary.weightDifference > 0
                ? "Above target goal"
                : "Below target goal"
              : "Set goal to compute"
          }
          icon="📊"
        />
        <StatCard
          title="Weekly Average"
          value={summary.weeklyAverage !== null ? `${summary.weeklyAverage} kg` : "--"}
          subtext="7-day rolling average"
          icon="📈"
        />
        <StatCard
          title="Monthly Average"
          value={summary.monthlyAverage !== null ? `${summary.monthlyAverage} kg` : "--"}
          subtext="30-day rolling average"
          icon="📅"
        />
      </div>

      {/* SVG Time-Series Chart */}
      {loading ? (
        <div className="h-64 bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-center text-gray-400">
          <div className="flex items-center gap-3">
            <svg className="animate-spin h-6 w-6 text-indigo-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span>Loading time-series analytics...</span>
          </div>
        </div>
      ) : (
        <BodyWeightChart data={data.chartData} goalWeight={summary.goalWeight} />
      )}

      {/* Log History Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📋</span>
            Weight History ({data.history.length})
          </h2>
        </div>

        {data.history.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-6">
            No weight logs recorded. Click "Log Weight" above to add your first entry.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Weight (kg)</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 text-sm">
                {data.history.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-800/30 transition">
                    <td className="py-3 px-4 font-mono text-gray-300">
                      {new Date(log.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-4 font-bold text-white font-mono">{log.weight} kg</td>
                    <td className="py-3 px-4 text-gray-400 italic">
                      {log.notes || <span className="text-gray-600 font-normal">--</span>}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteLog(log.id)}
                        className="text-red-400 hover:text-red-300 text-xs font-medium px-2 py-1 rounded bg-red-950/40 border border-red-800/40 hover:bg-red-900/60 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Weight Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>⚖️</span> Log Body Weight Entry
              </h3>
              <button
                onClick={() => {
                  setIsLogModalOpen(false);
                  setModalError("");
                }}
                className="text-gray-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="bg-rose-950/60 border border-rose-800 text-rose-200 px-3 py-2 rounded-lg text-xs flex items-center gap-2">
                <span>⚠️ {modalError}</span>
              </div>
            )}

            <form onSubmit={handleAddWeightLog} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Weight (kg) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="e.g. 75.5"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Date</label>
                <input
                  type="date"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  rows="2"
                  placeholder="Morning weigh-in, fasted..."
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogModalOpen(false);
                    setModalError("");
                  }}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingLog}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
                >
                  {submittingLog ? "Saving..." : "Save Log"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Goal Weight Modal */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>🎯</span> Set Goal Weight
              </h3>
              <button
                onClick={() => {
                  setIsGoalModalOpen(false);
                  setModalError("");
                }}
                className="text-gray-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="bg-rose-950/60 border border-rose-800 text-rose-200 px-3 py-2 rounded-lg text-xs flex items-center gap-2">
                <span>⚠️ {modalError}</span>
              </div>
            )}

            <form onSubmit={handleSetGoalWeight} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Target Goal Weight (kg) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="e.g. 70.0"
                  value={goalWeightInput}
                  onChange={(e) => setGoalWeightInput(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGoalModalOpen(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingGoal}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
                >
                  {submittingGoal ? "Updating..." : "Save Goal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
