"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { Results } from "@/components/Results";
import { SessionHistory } from "@/components/SessionHistory";
import { clearSessions, listSessions } from "@/lib/storage";
import type { Session } from "@/lib/types";

// Analyzer touches the camera + WASM; never render it on the server.
const Analyzer = dynamic(
  () => import("@/components/Analyzer").then((m) => m.Analyzer),
  {
    ssr: false,
    loading: () => (
      <div className="surface-card p-6 h-[420px] flex items-center justify-center">
        <span className="oryzo-label text-slate text-[14px] animate-pulse">
          Initializing capture…
        </span>
      </div>
    ),
  }
);

// StaggeredMenu uses gsap + useLayoutEffect; render it client-side only.
const StaggeredMenu = dynamic(
  () => import("@/components/StaggeredMenu").then((m) => m.default),
  { ssr: false }
);

const MENU_ITEMS = [
  { label: "Capture", ariaLabel: "Go to capture section", link: "#capture" },
  { label: "Results", ariaLabel: "Go to results section", link: "#results" },
  { label: "History", ariaLabel: "Go to session history", link: "#history" },
  { label: "Method", ariaLabel: "Go to method section", link: "#method" },
];

const SOCIAL_ITEMS = [
  { label: "GitHub", link: "https://github.com" },
  { label: "Docs", link: "#method" },
];

export default function Home() {
  const [active, setActive] = useState<Session | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const resultsRef = useRef<HTMLElement>(null);

  const refresh = useCallback(async () => {
    try {
      setSessions(await listSessions());
    } catch {
      setSessions([]);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleSession = useCallback(
    (s: Session) => {
      setActive(s);
      void refresh();
      requestAnimationFrame(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    },
    [refresh]
  );

  const handleClear = useCallback(async () => {
    await clearSessions();
    setActive(null);
    await refresh();
  }, [refresh]);

  return (
    <main className="min-h-screen overflow-x-hidden">
      {/* Staggered slide-out menu (React Bits) as the primary navigation */}
      <StaggeredMenu
        position="right"
        isFixed
        items={MENU_ITEMS}
        socialItems={SOCIAL_ITEMS}
        displaySocials
        displayItemNumbering
        logoUrl="/logo.svg"
        menuButtonColor="#2c232e"
        openMenuButtonColor="#2c232e"
        changeMenuColorOnOpen={false}
        colors={["#e2d9ff", "#beaaff"]}
        accentColor="#f97316"
      />

      {/* Hero */}
      <section className="min-h-screen flex flex-col justify-center px-6 md:px-12 pt-28 pb-16 relative bg-hero-violet">
        <span className="oryzo-label text-slate text-[12px] mb-4">
          Physics-Informed · Symmetry-Attentive · Markerless
        </span>
        <h1 className="oryzo-label text-ink-plum text-[40px] sm:text-[56px] md:text-[92px] leading-[0.9] max-w-[16ch]">
          Gait &amp; Balance,
          <br />
          Read From Light.
        </h1>
        <p className="oryzo-body text-[18px] sm:text-[22px] md:text-body text-slate max-w-[46ch] mt-8">
          A single camera. No markers, no wearables, no server. PS2GAT extracts
          your skeleton on-device and reports cadence, cross-limb symmetry, joint
          range-of-motion, and a calibrated fall-risk index.
        </p>
        <div className="flex items-center gap-4 mt-10">
          <a href="#capture" className="btn-pill text-[14px]">
            Start Analysis
          </a>
          <a href="#method" className="btn-ghost text-[12px]">
            The Method
          </a>
        </div>
        {/* vertical sidebar label */}
        <span
          className="hidden md:block absolute right-6 top-1/2 oryzo-label text-slate text-[10px]"
          style={{ transform: "translateY(-50%) rotate(90deg)", transformOrigin: "right center" }}
        >
          PS2GAT · MARKERLESS · 1-CAMERA
        </span>
      </section>

      <div className="px-6 md:px-12">
        <hr className="dashed-divider" />
      </div>

      {/* Capture */}
      <section id="capture" className="px-6 md:px-12 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-10 items-start">
          <div className="lg:sticky lg:top-28">
            <h2 className="oryzo-label text-heading text-ink-plum">
              Capture.
            </h2>
            <p className="oryzo-body text-body text-slate mt-6 max-w-[40ch]">
              Position yourself so hips, knees, and ankles stay in frame. Walk in
              place or across the view for ten seconds. Everything runs in your
              browser.
            </p>
            <ul className="mt-8 flex flex-col gap-3">
              {[
                "1 · Enable camera",
                "2 · Frame full lower body",
                "3 · Walk 10 seconds",
                "4 · Read your metrics",
              ].map((step) => (
                <li
                  key={step}
                  className="oryzo-label text-ink-plum text-[12px] pb-3 border-b border-dashed border-mist"
                >
                  {step}
                </li>
              ))}
            </ul>
          </div>
          <Analyzer onSession={handleSession} />
        </div>
      </section>

      {/* Results */}
      <section ref={resultsRef} id="results" className="px-6 md:px-12 py-20 scroll-mt-24">
        <span className="oryzo-label text-slate text-[12px]">Results</span>
        <div className="mt-8">
          {active ? (
            <Results session={active} />
          ) : (
            <div className="surface-card p-10 text-center">
              <p className="oryzo-body text-body text-slate">
                Your gait report will appear here after a capture.
              </p>
            </div>
          )}
        </div>
      </section>

      <div className="px-6 md:px-12">
        <hr className="dashed-divider" />
      </div>

      {/* History */}
      <section id="history" className="px-6 md:px-12 py-20">
        <span className="oryzo-label text-slate text-[12px]">History</span>
        <div className="mt-8">
          <SessionHistory
            sessions={sessions}
            onSelect={handleSession}
            onClear={handleClear}
          />
        </div>
      </section>

      <div className="px-6 md:px-12">
        <hr className="dashed-divider" />
      </div>

      {/* Method */}
      <section id="method" className="px-6 md:px-12 py-24">
        <h2 className="oryzo-label text-heading text-ink-plum max-w-[18ch]">
          The PS2GAT Method.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12 mt-12">
          {[
            {
              t: "Self-Supervised Pretraining",
              d: "Masked skeleton reconstruction on large unlabeled walking corpora solves the small-clinical-data problem before any labels are seen.",
            },
            {
              t: "Cross-Limb Symmetry Attention",
              d: "Runs on-device: a best-lag cross-correlation ‘attention’ between corresponding left/right joint trajectories yields an interpretable symmetry-deviation index, reported against the clinical Gait Asymmetry Index.",
            },
            {
              t: "Physics-Informed Constraints",
              d: "Runs on-device: a temporal-smoothness prior is applied to every signal, and anatomical range-of-motion + foot-contact checks flag biomechanically implausible frames.",
            },
            {
              t: "Calibrated Uncertainty",
              d: "Runs on-device: a bootstrap Monte-Carlo over capture sub-windows produces a 95% confidence band on fall-risk — not a bare point estimate.",
            },
          ].map((c) => (
            <div key={c.t}>
              <h3 className="oryzo-label text-heading-sm text-ink-plum">
                {c.t}
              </h3>
              <p className="oryzo-body text-body text-slate mt-4">{c.d}</p>
            </div>
          ))}
        </div>
        <p className="oryzo-body text-[14px] text-slate mt-16 max-w-[70ch]">
          This deployment runs the markerless capture pipeline plus the CLSA,
          physics-informed, and bootstrap-uncertainty algorithms live in your
          browser. The self-supervised pretraining and the learned transformer
          weights are the offline research component; once exported to ONNX they
          drop into the same SkeletonWindow → GaitMetrics interface without UI
          changes — see the repository README.
        </p>
        <p className="oryzo-label ember text-[10px] mt-10">
          * Research demonstrator — not a medical device.
        </p>
      </section>

      <footer className="px-6 md:px-12 py-10 border-t border-dashed border-mist">
        <span className="oryzo-label text-slate text-[10px]">
          PS2GAT Gait Lab · Client-Side · No Data Leaves Your Device
        </span>
      </footer>
    </main>
  );
}
