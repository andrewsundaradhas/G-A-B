"use client";

import type { Session } from "@/lib/types";
import { RiskGauge } from "./dashboard/RiskGauge";
import { SymmetryHeatmap } from "./dashboard/SymmetryHeatmap";
import { JointTrajectories } from "./dashboard/JointTrajectories";
import { MetricCard } from "./dashboard/MetricCard";

export function Results({ session }: { session: Session }) {
  const m = session.metrics;
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="oryzo-label text-heading text-ink-plum">
            {m.classification}
          </h2>
          <p className="oryzo-label text-slate text-[12px] mt-2">
            Classification confidence {(m.classConfidence * 100).toFixed(0)}% ·
            Capture quality {(m.qualityScore * 100).toFixed(0)}% · Physics
            validity {(m.physicsValidity * 100).toFixed(0)}%
          </p>
        </div>
        <span className="oryzo-label text-slate text-[11px]">
          {m.frames} frames · {m.durationSec.toFixed(1)}s · {m.fps.toFixed(0)} fps
        </span>
      </div>

      {/* Temporal gait parameters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <MetricCard
          label="Cadence"
          value={m.cadenceSpm ? m.cadenceSpm.toFixed(0) : "—"}
          unit="SPM"
          sub={`${m.stepCount} steps · ${m.stepTimeSec.toFixed(2)}s / step`}
        />
        <MetricCard
          label="Step-Time Variability"
          value={m.stepTimeCV ? m.stepTimeCV.toFixed(1) : "—"}
          unit="% CV"
          sub={m.stepTimeCV > 12 ? "elevated" : "within range"}
        />
        <MetricCard
          label="Gait Asymmetry"
          value={(m.symmetryIndexGAI * 100).toFixed(0)}
          unit="GAI"
          sub={`Knee ROM SI ${m.siKneeRom.toFixed(0)}%`}
        />
        <MetricCard
          label="Fall Risk"
          value={(m.fallRisk * 100).toFixed(0)}
          unit={m.fallRiskLabel}
          sub={`95% CI ${(m.fallRiskLow * 100).toFixed(0)}–${(m.fallRiskHigh * 100).toFixed(0)}`}
        />
      </div>

      {/* Kinematics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <MetricCard
          label="ROM · Knee L / R"
          value={`${m.romLeftKnee.toFixed(0)}/${m.romRightKnee.toFixed(0)}`}
          unit="°"
          sub="flexion range"
        />
        <MetricCard
          label="ROM · Hip L / R"
          value={`${m.romLeftHip.toFixed(0)}/${m.romRightHip.toFixed(0)}`}
          unit="°"
        />
        <MetricCard
          label="L↔R Phase"
          value={m.phaseLagPct ? m.phaseLagPct.toFixed(0) : "—"}
          unit="% cycle"
          sub={`≈50% = normal · corr ${m.clsaCorrelation.toFixed(2)}`}
        />
        <MetricCard
          label="Smoothness"
          value={m.jerkIndex.toFixed(2)}
          unit="jerk"
          sub={`${m.romViolations} ROM violations`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskGauge
          value={m.fallRisk}
          low={m.fallRiskLow}
          high={m.fallRiskHigh}
          label={m.fallRiskLabel}
        />
        <SymmetryHeatmap pairs={m.pairs} />
      </div>

      <JointTrajectories data={m.angleSeries} />

      <p className="oryzo-label text-slate text-[10px] leading-[1.6]">
        * Research demonstrator. Metrics are computed on-device from markerless
        pose geometry using the PS2GAT algorithmic pipeline (CLSA cross-limb
        attention, physics-informed constraints, bootstrap uncertainty). The
        learned transformer weights are an offline component. Not a medical
        device and not for diagnostic use.
      </p>
    </div>
  );
}
