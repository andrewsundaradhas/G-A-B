"use client";

import type { Session } from "@/lib/types";

export function SessionHistory({
  sessions,
  onSelect,
  onClear,
}: {
  sessions: Session[];
  onSelect: (s: Session) => void;
  onClear: () => void;
}) {
  return (
    <div className="surface-card p-6">
      <div className="flex items-center justify-between mb-5">
        <span className="oryzo-label text-slate text-[12px]">
          Session History · Local (IndexedDB)
        </span>
        {sessions.length > 0 && (
          <button className="btn-ghost text-[10px]" onClick={onClear}>
            Clear All
          </button>
        )}
      </div>
      {sessions.length === 0 ? (
        <p className="oryzo-body text-[18px] text-slate">
          No sessions yet. Run an analysis to build a local longitudinal record —
          nothing leaves your device.
        </p>
      ) : (
        <div className="flex flex-col">
          {sessions.map((s, i) => (
            <button
              key={s.id}
              onClick={() => onSelect(s)}
              className="text-left py-4 flex items-center justify-between hover:bg-lavender-mist -mx-2 px-2 rounded-cards transition-colors"
              style={{
                borderTop: i === 0 ? "none" : "1px dashed #e2e8f0",
              }}
            >
              <div className="flex flex-col">
                <span className="oryzo-label text-ink-plum text-[12px]">
                  {new Date(s.createdAt).toLocaleString()}
                </span>
                <span className="oryzo-label text-slate text-[10px] mt-1">
                  {s.metrics.classification} · CAD {s.metrics.cadenceSpm.toFixed(0)} SPM
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="oryzo-label text-[12px]">
                  <span className="text-slate">RISK </span>
                  <span className="ember">
                    {(s.metrics.fallRisk * 100).toFixed(0)}
                  </span>
                </span>
                <span className="oryzo-label text-[12px]">
                  <span className="text-slate">SYM </span>
                  <span className="text-ink-plum">
                    {(s.metrics.symmetryIndexGAI * 100).toFixed(0)}
                  </span>
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
