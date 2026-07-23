"use client";

// Fall-risk gauge with a bootstrap confidence band (Section 2e).

const ORANGE = "#f97316";
const MIST = "#e2e8f0";
const FOG = "#d1d5db";
const INK = "#2c232e";
const SLATE = "#6b7280";

function polar(cx: number, cy: number, r: number, frac: number) {
  const angle = Math.PI * (1 - frac);
  return { x: cx + r * Math.cos(angle), y: cy - r * Math.sin(angle) };
}

function arcPath(cx: number, cy: number, r: number, f0: number, f1: number) {
  const a = polar(cx, cy, r, f0);
  const b = polar(cx, cy, r, f1);
  const large = f1 - f0 > 0.5 ? 1 : 0;
  return `M ${a.x} ${a.y} A ${r} ${r} 0 ${large} 1 ${b.x} ${b.y}`;
}

export function RiskGauge({
  value,
  low,
  high,
  label,
}: {
  value: number;
  low: number;
  high: number;
  label: string;
}) {
  const W = 320;
  const H = 190;
  const cx = W / 2;
  const cy = H - 24;
  const r = 128;
  const marker = polar(cx, cy, r, value);

  return (
    <div className="surface-card p-6 flex flex-col items-center">
      <span className="oryzo-label text-slate text-[12px] self-start">
        Fall-Risk Index
      </span>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full max-w-[340px] mt-2"
        role="img"
        aria-label={`Fall risk ${(value * 100).toFixed(0)} percent, ${label}`}
      >
        <path
          d={arcPath(cx, cy, r, 0, 1)}
          fill="none"
          stroke={MIST}
          strokeWidth={14}
          strokeLinecap="round"
        />
        {/* bootstrap uncertainty band */}
        <path
          d={arcPath(cx, cy, r, Math.min(low, high), Math.max(low, high))}
          fill="none"
          stroke={FOG}
          strokeWidth={14}
          strokeLinecap="round"
        />
        {/* value arc */}
        <path
          d={arcPath(cx, cy, r, 0, Math.max(0.001, value))}
          fill="none"
          stroke={ORANGE}
          strokeWidth={14}
          strokeLinecap="round"
        />
        <circle cx={marker.x} cy={marker.y} r={9} fill={INK} />
        <text
          x={cx}
          y={cy - 34}
          textAnchor="middle"
          fill={INK}
          fontSize="46"
          fontWeight={500}
        >
          {(value * 100).toFixed(0)}
        </text>
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          fill={SLATE}
          fontSize="11"
          style={{ textTransform: "uppercase" }}
        >
          / 100 index
        </text>
      </svg>
      <div className="w-full flex items-center justify-between mt-2">
        <span className="oryzo-label ember text-[14px]">{label}</span>
        <span className="oryzo-label text-slate text-[11px]">
          95% CI {(low * 100).toFixed(0)}–{(high * 100).toFixed(0)}
        </span>
      </div>
    </div>
  );
}
