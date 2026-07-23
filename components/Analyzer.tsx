"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { detect, getPoseLandmarker } from "@/lib/pose";
import { computeMetrics } from "@/lib/gait";
import { SKELETON_EDGES, LM } from "@/lib/skeleton";
import { saveSession } from "@/lib/storage";
import type { Session, Skeleton } from "@/lib/types";

type Status = "idle" | "loading" | "ready" | "recording" | "error";

const CAPTURE_SECONDS = 10;
const MAX_FRAMES = 900; // safety cap (~30s @30fps)

export function Analyzer({ onSession }: { onSession: (s: Session) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const landmarkerRef = useRef<Awaited<
    ReturnType<typeof getPoseLandmarker>
  > | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef<number>(-1);
  const framesRef = useRef<Skeleton[]>([]);
  const timesRef = useRef<number[]>([]);
  const recordingRef = useRef<boolean>(false);
  const streamRef = useRef<MediaStream | null>(null);

  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");
  const [elapsed, setElapsed] = useState<number>(0);
  const [detected, setDetected] = useState<boolean>(false);

  const drawOverlay = useCallback((skeleton: Skeleton | null) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (canvas.width !== video.videoWidth && video.videoWidth) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!skeleton) return;

    const w = canvas.width;
    const h = canvas.height;

    // edges
    ctx.strokeStyle = "#beaaff";
    ctx.lineWidth = Math.max(2, w * 0.004);
    ctx.lineCap = "round";
    for (const [a, b] of SKELETON_EDGES) {
      const pa = skeleton[a];
      const pb = skeleton[b];
      if (pa.visibility < 0.4 || pb.visibility < 0.4) continue;
      ctx.beginPath();
      ctx.moveTo(pa.x * w, pa.y * h);
      ctx.lineTo(pb.x * w, pb.y * h);
      ctx.stroke();
    }
    // key lower-limb joints in ember
    const emphasis = new Set<number>([
      LM.LEFT_HIP,
      LM.RIGHT_HIP,
      LM.LEFT_KNEE,
      LM.RIGHT_KNEE,
      LM.LEFT_ANKLE,
      LM.RIGHT_ANKLE,
    ]);
    for (let i = 0; i < skeleton.length; i++) {
      const p = skeleton[i];
      if (p.visibility < 0.4) continue;
      ctx.beginPath();
      ctx.fillStyle = emphasis.has(i) ? "#f97316" : "#beaaff";
      ctx.arc(p.x * w, p.y * h, emphasis.has(i) ? w * 0.008 : w * 0.005, 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

  const loop = useCallback(() => {
    const video = videoRef.current;
    const landmarker = landmarkerRef.current;
    if (video && landmarker && video.readyState >= 2) {
      const now = performance.now();
      if (video.currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = video.currentTime;
        let skeleton: Skeleton | null = null;
        try {
          skeleton = detect(landmarker, video, now);
        } catch {
          skeleton = null;
        }
        setDetected(!!skeleton);
        drawOverlay(skeleton);
        if (recordingRef.current && skeleton && framesRef.current.length < MAX_FRAMES) {
          framesRef.current.push(skeleton);
          timesRef.current.push(now);
        }
      }
    }
    rafRef.current = requestAnimationFrame(loop);
  }, [drawOverlay]);

  const enableCamera = useCallback(async () => {
    setError("");
    setStatus("loading");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 960 }, height: { ideal: 720 }, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) throw new Error("Video element unavailable.");
      video.srcObject = stream;
      await video.play();
      landmarkerRef.current = await getPoseLandmarker();
      setStatus("ready");
      if (rafRef.current == null) {
        rafRef.current = requestAnimationFrame(loop);
      }
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Unable to access camera or model.";
      setError(msg);
      setStatus("error");
    }
  }, [loop]);

  const finishCapture = useCallback(async () => {
    recordingRef.current = false;
    setStatus("ready");
    const frames = framesRef.current;
    const times = timesRef.current;
    const metrics = computeMetrics({ frames: [...frames], timestamps: [...times] });
    framesRef.current = [];
    timesRef.current = [];
    if (!metrics) {
      setError(
        "Not enough clean pose data captured. Ensure your full body — hips, knees, ankles — is in frame and try again."
      );
      return;
    }
    const session: Session = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `s_${Date.now()}`,
      createdAt: Date.now(),
      metrics,
    };
    try {
      await saveSession(session);
    } catch {
      // Persistence is best-effort; still surface the result.
    }
    onSession(session);
  }, [onSession]);

  const startCapture = useCallback(() => {
    setError("");
    framesRef.current = [];
    timesRef.current = [];
    recordingRef.current = true;
    setStatus("recording");
    setElapsed(0);
  }, []);

  // Countdown timer while recording.
  useEffect(() => {
    if (status !== "recording") return;
    const started = performance.now();
    const id = setInterval(() => {
      const e = (performance.now() - started) / 1000;
      setElapsed(e);
      if (e >= CAPTURE_SECONDS) {
        clearInterval(id);
        void finishCapture();
      }
    }, 100);
    return () => clearInterval(id);
  }, [status, finishCapture]);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const remaining = Math.max(0, CAPTURE_SECONDS - elapsed);

  return (
    <div className="surface-card p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="oryzo-label text-slate text-[12px]">
          Capture · Markerless Pose
        </span>
        <span className="oryzo-label text-[11px]">
          {status === "recording" ? (
            <span className="ember">● REC {remaining.toFixed(1)}s</span>
          ) : detected ? (
            <span className="text-ink-plum">POSE LOCKED</span>
          ) : (
            <span className="text-slate">NO POSE</span>
          )}
        </span>
      </div>

      <div className="relative w-full aspect-[4/3] bg-lavender-mist border border-mist rounded-cards overflow-hidden">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover -scale-x-100"
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover -scale-x-100 pointer-events-none"
        />
        {status === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center px-6">
            <span className="oryzo-body text-[18px] text-slate max-w-[420px]">
              Stand back so your full body is visible from the side or front,
              then walk in place or across the frame.
            </span>
            <button className="btn-pill text-[14px]" onClick={enableCamera}>
              Enable Camera
            </button>
          </div>
        )}
        {status === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="oryzo-label text-slate text-[14px] animate-pulse">
              Loading pose model…
            </span>
          </div>
        )}
        {status === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center">
            <span className="oryzo-body text-[18px] ember">Capture error</span>
            <span className="oryzo-body text-[14px] text-slate">{error}</span>
            <button className="btn-ghost text-[12px]" onClick={enableCamera}>
              Retry
            </button>
          </div>
        )}
      </div>

      {error && status !== "error" && (
        <p className="oryzo-body text-[14px] ember mt-4">{error}</p>
      )}

      <div className="flex flex-wrap items-center gap-4 mt-5">
        {(status === "ready" || status === "recording") && (
          <button
            className="btn-pill text-[14px]"
            onClick={startCapture}
            disabled={status === "recording"}
          >
            {status === "recording"
              ? `Analyzing… ${remaining.toFixed(0)}s`
              : `Analyze Gait · ${CAPTURE_SECONDS}s`}
          </button>
        )}
        {status === "recording" && (
          <button className="btn-ghost text-[12px]" onClick={finishCapture}>
            Stop Early
          </button>
        )}
        {(status === "ready" || status === "recording") && (
          <span className="oryzo-label text-slate text-[10px]">
            Keep hips · knees · ankles in frame throughout
          </span>
        )}
      </div>
    </div>
  );
}
