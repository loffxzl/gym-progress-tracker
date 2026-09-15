import React, { useState } from "react";

export const BodyWeightChart = ({ data = [], goalWeight = null }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border border-dashed border-gray-700 rounded-xl bg-gray-900/40 text-gray-400 p-6 text-center">
        <svg className="w-12 h-12 mb-3 text-indigo-400 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
        <p className="font-medium text-gray-300">No Weight History Data Yet</p>
        <p className="text-sm text-gray-500 mt-1">Log your weight entries to visualize time-series progression curves.</p>
      </div>
    );
  }

  // Dimension setup
  const width = 640;
  const height = 260;
  const paddingX = 50;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingTop - paddingBottom;

  // Compute Min/Max bounds including goal weight if available
  const weights = data.map((d) => d.weight);
  if (goalWeight !== null && !isNaN(goalWeight)) {
    weights.push(goalWeight);
  }

  const rawMin = Math.min(...weights);
  const rawMax = Math.max(...weights);
  const margin = (rawMax - rawMin) * 0.15 || 2; // pad top/bottom
  const minY = Math.floor(rawMin - margin);
  const maxY = Math.ceil(rawMax + margin);

  // Map data point to SVG (x, y) coordinates
  const points = data.map((d, index) => {
    const x =
      data.length === 1
        ? paddingX + chartWidth / 2
        : paddingX + (index / (data.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((d.weight - minY) / (maxY - minY)) * chartHeight;
    return { ...d, x, y };
  });

  // Calculate polyline & area polygon points
  const pointsString = points.map((p) => `${p.x},${p.y}`).join(" ");
  const areaString = `${paddingX},${paddingTop + chartHeight} ${pointsString} ${paddingX + chartWidth},${paddingTop + chartHeight}`;

  // Goal Line Y
  let goalY = null;
  if (goalWeight !== null && !isNaN(goalWeight)) {
    goalY = paddingTop + chartHeight - ((goalWeight - minY) / (maxY - minY)) * chartHeight;
  }

  // Y-axis gridticks (4 levels)
  const ticksCount = 4;
  const ticks = Array.from({ length: ticksCount + 1 }, (_, i) => {
    const val = minY + ((maxY - minY) / ticksCount) * i;
    const y = paddingTop + chartHeight - (i / ticksCount) * chartHeight;
    return { val: Number(val.toFixed(1)), y };
  });

  return (
    <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            Weight Progression Curve
          </h3>
          <p className="text-xs text-gray-400">Time-series tracking & trajectory analysis</p>
        </div>
        {goalWeight && (
          <div className="flex items-center gap-2 text-xs bg-indigo-950/60 border border-indigo-800/40 text-indigo-300 px-3 py-1 rounded-full">
            <span className="w-3 h-0.5 bg-emerald-400 border-b border-dashed border-emerald-400 inline-block"></span>
            Goal Target: {goalWeight} kg
          </div>
        )}
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="weightAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>

            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Grid Ticks & Labels */}
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

          {/* Goal Weight Reference Line */}
          {goalY !== null && goalY >= paddingTop && goalY <= paddingTop + chartHeight && (
            <g>
              <line
                x1={paddingX}
                y1={goalY}
                x2={paddingX + chartWidth}
                y2={goalY}
                stroke="#10b981"
                strokeDasharray="5 5"
                strokeWidth="1.8"
                opacity="0.85"
              />
              <text
                x={paddingX + chartWidth + 6}
                y={goalY + 4}
                fill="#10b981"
                fontSize="10"
                fontWeight="bold"
                className="font-mono"
              >
                Goal
              </text>
            </g>
          )}

          {/* Filled Area Gradient */}
          {points.length > 1 && <polygon points={areaString} fill="url(#weightAreaGradient)" />}

          {/* Time Series Polyline */}
          {points.length > 1 ? (
            <polyline
              fill="none"
              stroke="#6366f1"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={pointsString}
              filter="url(#glow)"
            />
          ) : (
            <circle cx={points[0].x} cy={points[0].y} r="6" fill="#6366f1" filter="url(#glow)" />
          )}

          {/* Interactive Data Nodes */}
          {points.map((p, idx) => {
            const isHovered = hoveredPoint?.id === p.id;
            return (
              <g key={p.id || idx}>
                {/* Invisible hover region */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="14"
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(p)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                {/* Node Ring */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? "7" : "4.5"}
                  fill={isHovered ? "#38bdf8" : "#818cf8"}
                  stroke="#1e1b4b"
                  strokeWidth="2"
                  className="transition-all duration-200 pointer-events-none"
                />

                {/* X-axis Date Labels */}
                {(data.length <= 10 || idx % Math.ceil(data.length / 8) === 0 || idx === data.length - 1) && (
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

      {/* Hover Tooltip Overlay */}
      {hoveredPoint && (
        <div
          className="absolute z-20 bg-gray-950 border border-indigo-500/50 rounded-lg p-2.5 shadow-2xl pointer-events-none text-xs text-white flex flex-col gap-0.5 animate-fadeIn"
          style={{
            left: `${Math.min(Math.max(hoveredPoint.x, 60), width - 100)}px`,
            top: `${Math.max(hoveredPoint.y - 45, 10)}px`,
          }}
        >
          <div className="font-semibold text-indigo-300">{hoveredPoint.formattedDate}</div>
          <div className="font-bold text-sm text-white">{hoveredPoint.weight} kg</div>
          {hoveredPoint.notes && (
            <div className="text-[10px] text-gray-400 italic max-w-[150px] truncate">
              "{hoveredPoint.notes}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};
