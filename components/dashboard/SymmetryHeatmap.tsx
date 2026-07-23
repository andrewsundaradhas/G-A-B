"use client";

// CLSA symmetry visualization (Section 2c): per-pair left/right deviation.
// Warm cream = symmetric, ember = asymmetric. This is the interpretable signal.

import type { SymmetryPair } from "@/lib/types";

function lerpColor(dev: number): string {
  // hero-violet (#beaaff, symmetric) -> bitcoin-orange (#f97316, asymmetric)
  const c0 = [190, 170, 255];
  const c1 = [249, 115, 22];
  const t = Math.max(0, Math.min(1, dev));
  const r = Math.round(c0[0] + (c1[0] - c0[0]) * t);
  const g = Math.round(c0[1] + (c1[1] - c0[1]) * t);
  const b = Math.round(c0[2] + (c1[2] - c0[2]) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

export function SymmetryHeatmap({ pairs }: { pairs: SymmetryPair[] }) {
  return (
    <div className="surface-card p-6">
      <div className="flex items-center justify-between">
        <span className="oryzo-label text-slate text-[12px]">
          Cross-Limb Symmetry · CLSA
        </span>
        <span className="oryzo-label text-slate text-[10px]">
          Left ↔ Right deviation
        </span>
      </div>
      <div className="mt-5 flex flex-col gap-3">
        {pairs.map((p) => (
          <div key={p.name} className="flex items-center gap-4">
            <span className="oryzo-label text-ink-plum text-[12px] w-[84px] shrink-0">
              {p.name}
            </span>
            <div className="flex-1 h-[18px] bg-mist rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.max(4, p.deviation * 100)}%`,
                  backgroundColor: lerpColor(p.deviation),
                }}
              />
            </div>
            <span className="oryzo-label text-slate text-[11px] w-[42px] text-right">
              {(p.deviation * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
