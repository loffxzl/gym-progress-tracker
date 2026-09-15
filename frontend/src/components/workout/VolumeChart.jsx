import React, { useState } from "react";

export const VolumeChart = ({ data = [] }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border border-dashed border-gray-700 rounded-xl bg-gray-900/40 text-gray-400 p-6 text-center">
        <p className="font-medium text-gray-300">No Workout Volume History Yet</p>
        <p className="text-sm text-gray-500 mt-1">
          Complete workouts to generate total volume lift trajectory curves.
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

  const volumes = data.map((d) => d.volume);
  const rawMin = Math.min(...volumes, 0);
  const rawMax = Math.max(...volumes, 100);
  const margin = (rawMax - rawMin) * 0.15 || 50;
  const minY = Math.max(0, Math.floor(rawMin));
  const maxY = Math.ceil(rawMax + margin);

  const points = data.map((d, index) => {
    const x =
      data.length === 1
        ? paddingX + chartWidth / 2
        : paddingX + (index / (data.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((d.volume - minY) / (maxY - minY)) * chartHeight;
    return { ...d, x, y };
  });

  const pointsString = points.map((p) => `${p.x},${p.y}`).join(" ");
  const areaString = `${paddingX},${paddingTop + chartHeight} ${pointsString} ${paddingX + chartWidth},${paddingTop + chartHeight}`;

  const ticksCount = 4;
  const ticks = Array.from({ length: ticksCount + 1 }, (_, i) => {
    const val = minY + ((maxY - minY) / ticksCount) * i;
    const y = paddingTop + chartHeight - (i / ticksCount) * chartHeight;
    return { val: Math.round(val), y };
  });

  return (
    <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Session Volume Curve (kg)
          </h3>
          <p className="text-xs text-gray-400">Total volume lifted per workout session</p>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="volumeAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>

            <filter id="volumeGlow" x="-20%" y="-20%" width="140%" height="140%">
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
                {t.val.toLocaleString()}kg
              </text>
            </g>
          ))}

          {/* Gradient Fill */}
          {points.length > 1 && <polygon points={areaString} fill="url(#volumeAreaGradient)" />}

          {/* Polyline */}
          {points.length > 1 ? (
            <polyline
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={pointsString}
              filter="url(#volumeGlow)"
            />
          ) : (
            <circle cx={points[0].x} cy={points[0].y} r="6" fill="#10b981" filter="url(#volumeGlow)" />
          )}

          {/* Nodes */}
          {points.map((p, idx) => {
            const isHovered = hoveredPoint?.id === p.id;
            return (
              <g key={p.id || idx}>
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
                  fill={isHovered ? "#34d399" : "#10b981"}
                  stroke="#064e3b"
                  strokeWidth="2"
                  className="transition-all duration-200 pointer-events-none"
                />

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

      {/* Hover Tooltip */}
      {hoveredPoint && (
        <div
          className="absolute z-20 bg-gray-950 border border-emerald-500/50 rounded-lg p-2.5 shadow-2xl pointer-events-none text-xs text-white flex flex-col gap-0.5 animate-fadeIn"
          style={{
            left: `${Math.min(Math.max(hoveredPoint.x, 60), width - 120)}px`,
            top: `${Math.max(hoveredPoint.y - 50, 10)}px`,
          }}
        >
          <div className="font-semibold text-emerald-300">{hoveredPoint.title}</div>
          <div className="text-[10px] text-gray-400">{hoveredPoint.formattedDate}</div>
          <div className="font-bold text-sm text-white">{hoveredPoint.volume.toLocaleString()} kg</div>
          <div className="text-[10px] text-gray-400">
            {hoveredPoint.exerciseCount} exercises, {hoveredPoint.setCount} sets
          </div>
        </div>
      )}
    </div>
  );
};
