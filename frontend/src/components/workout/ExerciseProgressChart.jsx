import React, { useState, useEffect } from "react";

export const ExerciseProgressChart = ({ exerciseNames = [], exerciseProgress = {} }) => {
  const [selectedExercise, setSelectedExercise] = useState(exerciseNames[0] || "");
  const [metricMode, setMetricMode] = useState("maxWeight"); // 'maxWeight' | 'volume'
  const [hoveredPoint, setHoveredPoint] = useState(null);

  useEffect(() => {
    if (exerciseNames.length > 0 && !selectedExercise) {
      setSelectedExercise(exerciseNames[0]);
    }
  }, [exerciseNames, selectedExercise]);

  const historyData = selectedExercise ? exerciseProgress[selectedExercise] || [] : [];

  if (!exerciseNames || exerciseNames.length === 0 || historyData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border border-dashed border-gray-700 rounded-xl bg-gray-900/40 text-gray-400 p-6 text-center">
        <p className="font-medium text-gray-300">No Exercise Progress Data Yet</p>
        <p className="text-sm text-gray-500 mt-1">
          Log sets under specific exercises in your workouts to view exercise strength progression curves.
        </p>
      </div>
    );
  }

  const width = 640;
  const height = 260;
  const paddingX = 50;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingTop - paddingBottom;

  const values = historyData.map((d) => (metricMode === "maxWeight" ? d.maxWeight : d.volume));
  const rawMin = Math.min(...values, 0);
  const rawMax = Math.max(...values, 10);
  const margin = (rawMax - rawMin) * 0.15 || 5;
  const minY = Math.max(0, Math.floor(rawMin));
  const maxY = Math.ceil(rawMax + margin);

  const points = historyData.map((d, index) => {
    const val = metricMode === "maxWeight" ? d.maxWeight : d.volume;
    const x =
      historyData.length === 1
        ? paddingX + chartWidth / 2
        : paddingX + (index / (historyData.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((val - minY) / (maxY - minY)) * chartHeight;
    return { ...d, val, x, y };
  });

  const pointsString = points.map((p) => `${p.x},${p.y}`).join(" ");
  const areaString = `${paddingX},${paddingTop + chartHeight} ${pointsString} ${paddingX + chartWidth},${paddingTop + chartHeight}`;

  const ticksCount = 4;
  const ticks = Array.from({ length: ticksCount + 1 }, (_, i) => {
    const val = minY + ((maxY - minY) / ticksCount) * i;
    const y = paddingTop + chartHeight - (i / ticksCount) * chartHeight;
    return { val: Number(val.toFixed(1)), y };
  });

  const colorHex = metricMode === "maxWeight" ? "#8b5cf6" : "#ec4899"; // purple vs pink

  return (
    <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800 pb-3">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: colorHex }}
            ></span>
            Exercise Strength Trajectory
          </h3>
          <p className="text-xs text-gray-400">Track progression for individual exercise movements</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Metric Selector */}
          <div className="flex items-center bg-gray-950 border border-gray-800 rounded-lg p-1 text-xs">
            <button
              onClick={() => setMetricMode("maxWeight")}
              className={`px-2.5 py-1 rounded-md transition font-medium ${
                metricMode === "maxWeight"
                  ? "bg-purple-600 text-white shadow"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Max Weight
            </button>
            <button
              onClick={() => setMetricMode("volume")}
              className={`px-2.5 py-1 rounded-md transition font-medium ${
                metricMode === "volume"
                  ? "bg-pink-600 text-white shadow"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Set Volume
            </button>
          </div>

          {/* Exercise Dropdown */}
          <select
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white text-xs font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:border-purple-500"
          >
            {exerciseNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="exProgressAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colorHex} stopOpacity="0.35" />
              <stop offset="100%" stopColor={colorHex} stopOpacity="0.0" />
            </linearGradient>

            <filter id="exGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid Ticks */}
          {ticks.map((t, idx) => (
            <g key={idx}>
              <line
                x1={paddingX}
                y1={t.y}
                x2={paddingX + chartWidth}
                y2={t.y}
                stroke="#374151"
                strokeDasharray="3 3"
                strokeWidth="1"
                opacity="0.4"
              />
              <text
                x={paddingX - 10}
                y={t.y + 4}
                fill="#9ca3af"
                fontSize="10"
                textAnchor="end"
                className="font-mono"
              >
                {t.val}kg
              </text>
            </g>
          ))}

          {/* Filled Gradient Area */}
          {points.length > 1 && <polygon points={areaString} fill="url(#exProgressAreaGradient)" />}

          {/* Polyline */}
          {points.length > 1 ? (
            <polyline
              fill="none"
              stroke={colorHex}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={pointsString}
              filter="url(#exGlow)"
            />
          ) : (
            <circle cx={points[0].x} cy={points[0].y} r="6" fill={colorHex} filter="url(#exGlow)" />
          )}

          {/* Nodes */}
          {points.map((p, idx) => {
            const isHovered = hoveredPoint?.x === p.x;
            return (
              <g key={idx}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="14"
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(p)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? "7" : "4.5"}
                  fill={isHovered ? "#d8b4fe" : colorHex}
                  stroke="#3b0764"
                  strokeWidth="2"
                  className="transition-all duration-200 pointer-events-none"
                />

                {(historyData.length <= 10 ||
                  idx % Math.ceil(historyData.length / 8) === 0 ||
                  idx === historyData.length - 1) && (
                  <text
                    x={p.x}
                    y={paddingTop + chartHeight + 20}
                    fill="#9ca3af"
                    fontSize="10"
                    textAnchor="middle"
                    className="font-mono"
                  >
                    {p.formattedDate}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Hover Tooltip */}
      {hoveredPoint && (
        <div
          className="absolute z-20 bg-gray-950 border border-purple-500/50 rounded-lg p-2.5 shadow-2xl pointer-events-none text-xs text-white flex flex-col gap-0.5 animate-fadeIn"
          style={{
            left: `${Math.min(Math.max(hoveredPoint.x, 60), width - 130)}px`,
            top: `${Math.max(hoveredPoint.y - 50, 10)}px`,
          }}
        >
          <div className="font-semibold text-purple-300">{selectedExercise}</div>
          <div className="text-[10px] text-gray-400">
            {hoveredPoint.formattedDate} ({hoveredPoint.workoutTitle})
          </div>
          <div className="font-bold text-sm text-white">
            {metricMode === "maxWeight"
              ? `Max Weight: ${hoveredPoint.maxWeight} kg`
              : `Total Volume: ${hoveredPoint.volume.toLocaleString()} kg`}
          </div>
          <div className="text-[10px] text-gray-400">{hoveredPoint.setCount} sets performed</div>
        </div>
      )}
    </div>
  );
};
