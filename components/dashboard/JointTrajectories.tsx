"use client";

// Joint-angle trajectories over the captured window (Section 6 dashboard).

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import type { JointAngleSample } from "@/lib/types";

const CORK = "#e2e8f0"; // mist grid/axis
const EMBER = "#f97316"; // bitcoin-orange (right)
const CREAM = "#2c232e"; // ink-plum (left / text)

export function JointTrajectories({ data }: { data: JointAngleSample[] }) {
  const trimmed = data.map((d) => ({
    t: Number(d.t.toFixed(2)),
    "L KNEE": Number(d.leftKnee.toFixed(1)),
    "R KNEE": Number(d.rightKnee.toFixed(1)),
  }));

  return (
    <div className="surface-card p-6">
      <span className="oryzo-label text-slate text-[12px]">
        Knee Flexion Trajectory · Degrees
      </span>
      <div className="mt-4 h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={trimmed}
            margin={{ top: 8, right: 8, bottom: 8, left: -18 }}
          >
            <CartesianGrid stroke={CORK} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="t"
              stroke={CORK}
              tick={{ fill: "#6b7280", fontSize: 10 }}
              unit="s"
            />
            <YAxis
              stroke={CORK}
              tick={{ fill: "#6b7280", fontSize: 10 }}
              domain={[0, 180]}
            />
            <Tooltip
              contentStyle={{
                background: "#ffffff",
                border: `1px solid ${CORK}`,
                borderRadius: 12,
                color: CREAM,
                textTransform: "uppercase",
                fontSize: 11,
              }}
              labelStyle={{ color: "#6b7280" }}
            />
            <Legend
              wrapperStyle={{
                fontSize: 11,
                textTransform: "uppercase",
                color: CREAM,
              }}
            />
            <Line
              type="monotone"
              dataKey="L KNEE"
              stroke={CREAM}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="R KNEE"
              stroke={EMBER}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
