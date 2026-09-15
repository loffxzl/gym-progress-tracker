import React, { useState } from "react";

export const WeeklyMonthlyVolumeChart = ({ data = [], type = "weekly" }) => {
  const [hoveredBar, setHoveredBar] = useState(null);

  const title = type === "weekly" ? "Weekly Aggregated Volume" : "Monthly Aggregated Volume";
  const subtitle =
    type === "weekly" ? "Total volume (kg) per calendar week" : "Total volume (kg) per calendar month";
  const barColor = type === "weekly" ? "#f59e0b" : "#3b82f6"; // amber for weekly, blue for monthly
  const barHoverColor = type === "weekly" ? "#fbbf24" : "#60a5fa";

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border border-dashed border-gray-700 rounded-xl bg-gray-900/40 text-gray-400 p-6 text-center">
        <p className="font-medium text-gray-300">No {type} aggregated volume data available</p>
        <p className="text-sm text-gray-500 mt-1">Complete workout sessions to generate bar analytics.</p>
      </div>
    );
  }

  const width = 600;
  const height = 260;
  const paddingX = 60;
  const paddingTop = 30;
  const paddingBottom = 45;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingTop - paddingBottom;

  const volumes = data.map((d) => d.volume);
  const maxVolume = Math.max(...volumes, 100);
  const margin = maxVolume * 0.15;
  const maxY = Math.ceil(maxVolume + margin);

  const barCount = data.length;
  const barGap = 16;
  const barWidth = Math.max(16, (chartWidth - barGap * (barCount - 1)) / barCount);

  const ticksCount = 4;
  const ticks = Array.from({ length: ticksCount + 1 }, (_, i) => {
    const val = (maxY / ticksCount) * i;
    const y = paddingTop + chartHeight - (i / ticksCount) * chartHeight;
    return { val: Math.round(val), y };
  });

  return (
    <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: barColor }}
            ></span>
            {title}
          </h3>
          <p className="text-xs text-gray-400">{subtitle}</p>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          {/* Y-axis Ticks */}
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

          {/* Bar Rectangles */}
          {data.map((d, index) => {
            const label = d.weekLabel || d.monthLabel || `Bar ${index + 1}`;
            const h = (d.volume / maxY) * chartHeight;
            const x = paddingX + index * (barWidth + barGap);
            const y = paddingTop + chartHeight - h;
            const isHovered = hoveredBar?.label === label;

            return (
              <g key={index}>
                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(2, h)}
                  rx="4"
                  fill={isHovered ? barHoverColor : barColor}
                  opacity={isHovered ? 1 : 0.85}
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredBar({ ...d, label, x, y })}
                  onMouseLeave={() => setHoveredBar(null)}
                />

                {/* Top Value Label */}
                {d.volume > 0 && (
                  <text
                    x={x + barWidth / 2}
                    y={y - 6}
                    fill={isHovered ? "#ffffff" : "#9ca3af"}
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="font-mono"
                  >
                    {d.volume >= 1000 ? `${(d.volume / 1000).toFixed(1)}k` : d.volume}
                  </text>
                )}

                {/* X-axis Label */}
                <text
                  x={x + barWidth / 2}
                  y={paddingTop + chartHeight + 18}
                  fill="#9ca3af"
                  fontSize="9"
                  textAnchor="middle"
                  className="font-mono"
                >
                  {label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Hover Tooltip */}
      {hoveredBar && (
        <div
          className="absolute z-20 bg-gray-950 border border-amber-500/50 rounded-lg p-2.5 shadow-2xl pointer-events-none text-xs text-white flex flex-col gap-0.5 animate-fadeIn"
          style={{
            left: `${Math.min(Math.max(hoveredBar.x, 50), width - 120)}px`,
            top: `${Math.max(hoveredBar.y - 45, 10)}px`,
          }}
        >
          <div className="font-semibold text-amber-300">{hoveredBar.label}</div>
          <div className="font-bold text-sm text-white">{hoveredBar.volume.toLocaleString()} kg</div>
          <div className="text-[10px] text-gray-400">{hoveredBar.count} workouts completed</div>
        </div>
      )}
    </div>
  );
};
