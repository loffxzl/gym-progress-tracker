import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { searchApi } from "../../api/searchApi.js";
import { Search, X, Dumbbell, Calendar, FileText, Scale, Loader2, Command } from "lucide-react";

export const GlobalSearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ exercises: [], workouts: [], setNotes: [], weightNotes: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Handle Cmd+K / Ctrl+K shortcut to toggle modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Trigger open via parent
          const searchBtn = document.getElementById("global-search-trigger");
          if (searchBtn) searchBtn.click();
        }
      } else if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults({ exercises: [], workouts: [], setNotes: [], weightNotes: [] });
    }
  }, [isOpen]);

  // Debounced search query execution
  useEffect(() => {
    if (!query.trim()) {
      setResults({ exercises: [], workouts: [], setNotes: [], weightNotes: [] });
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await searchApi.globalSearch(query.trim());
        if (res.data?.data) {
          setResults(res.data.data);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const totalResults =
    results.exercises.length +
    results.workouts.length +
    results.setNotes.length +
    results.weightNotes.length;

  const handleSelectResult = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 bg-black/75 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-950/50">
          <Search className="h-5 w-5 text-slate-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search exercises, workouts, notes, weigh-ins... (Press ESC to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none text-base"
          />
          {loading && <Loader2 className="h-5 w-5 text-sky-400 animate-spin mr-2 shrink-0" />}
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Results Area */}
        <div className="overflow-y-auto p-4 space-y-6 flex-1">
          {!query.trim() && (
            <div className="py-10 text-center space-y-2 text-slate-500">
              <div className="inline-flex p-3 bg-slate-800/50 rounded-full text-slate-400 mb-1">
                <Command className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-slate-400">Search Across All Fitness Records</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Type an exercise name, workout title, or set note (e.g. "Bench Press", "Leg Day", "PR").
              </p>
            </div>
          )}

          {query.trim() && !loading && totalResults === 0 && (
            <div className="py-10 text-center text-slate-400">
              <p className="font-semibold text-white">No results found for "{query}"</p>
              <p className="text-xs text-slate-500 mt-1">
                Try searching with a different exercise name or keyword.
              </p>
            </div>
          )}

          {/* 1. Exercises Group */}
          {results.exercises.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 px-2">
                <Dumbbell className="h-3.5 w-3.5 text-sky-400" />
                <span>Exercises ({results.exercises.length})</span>
              </div>
              <div className="space-y-1">
                {results.exercises.map((ex) => (
                  <div
                    key={ex.id}
                    onClick={() => handleSelectResult("/exercises")}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 cursor-pointer transition"
                  >
                    <div>
                      <div className="font-bold text-white text-sm">{ex.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Equipment: {ex.equipment || "Standard"}
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-sky-950/60 border border-sky-800/40 text-sky-300 rounded-lg">
                      {ex.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Workouts Group */}
          {results.workouts.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 px-2">
                <Calendar className="h-3.5 w-3.5 text-amber-400" />
                <span>Workouts ({results.workouts.length})</span>
              </div>
              <div className="space-y-1">
                {results.workouts.map((w) => (
                  <div
                    key={w.id}
                    onClick={() => handleSelectResult(`/workouts/${w.id}`)}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 cursor-pointer transition"
                  >
                    <div>
                      <div className="font-bold text-white text-sm">{w.title}</div>
                      {w.notes && (
                        <div className="text-xs text-slate-400 italic line-clamp-1 mt-0.5">
                          "{w.notes}"
                        </div>
                      )}
                    </div>
                    <div className="text-xs font-mono text-slate-400">
                      {new Date(w.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Set Notes Group */}
          {results.setNotes.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 px-2">
                <FileText className="h-3.5 w-3.5 text-purple-400" />
                <span>Set Notes ({results.setNotes.length})</span>
              </div>
              <div className="space-y-1">
                {results.setNotes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => handleSelectResult(`/workouts/${note.workoutId}`)}
                    className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 cursor-pointer transition space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-300 text-sm">
                        {note.exerciseName} (Set #{note.setNumber})
                      </span>
                      <span className="text-xs font-mono text-white">
                        {note.weight}kg × {note.reps} reps
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 italic bg-slate-900 p-2 rounded-lg border border-slate-800">
                      "{note.notes}"
                    </div>
                    <div className="text-[10px] text-slate-400 text-right">
                      From: {note.workoutTitle}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Weight Notes Group */}
          {results.weightNotes.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 px-2">
                <Scale className="h-3.5 w-3.5 text-indigo-400" />
                <span>Body Weight Weigh-in Notes ({results.weightNotes.length})</span>
              </div>
              <div className="space-y-1">
                {results.weightNotes.map((bw) => (
                  <div
                    key={bw.id}
                    onClick={() => handleSelectResult("/weight")}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 cursor-pointer transition"
                  >
                    <div>
                      <div className="font-bold text-indigo-300 text-sm">{bw.weight} kg</div>
                      <div className="text-xs text-slate-400 italic">"{bw.notes}"</div>
                    </div>
                    <div className="text-xs font-mono text-slate-400">
                      {new Date(bw.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 text-xs text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] font-mono">⌘K</span>
            <span>Global Search</span>
          </div>
          <div>{totalResults} matches</div>
        </div>
      </div>
    </div>
  );
};
