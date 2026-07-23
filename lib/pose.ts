// Client-side pose extraction wrapper (Section 3, Phase 1).
// Uses MediaPipe Tasks-Vision PoseLandmarker. WASM + model are fetched from CDN
// at runtime in the browser, so nothing server-side is required — Vercel-safe.

import type { Skeleton } from "./types";

// Types are loaded dynamically to keep the module out of the server bundle.
type PoseLandmarker = import("@mediapipe/tasks-vision").PoseLandmarker;

const WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

let landmarkerPromise: Promise<PoseLandmarker> | null = null;

export async function getPoseLandmarker(): Promise<PoseLandmarker> {
  if (typeof window === "undefined") {
    throw new Error("Pose landmarker can only be created in the browser.");
  }
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const vision = await import("@mediapipe/tasks-vision");
      const filesetResolver = await vision.FilesetResolver.forVisionTasks(
        WASM_URL
      );
      return vision.PoseLandmarker.createFromOptions(filesetResolver, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
        runningMode: "VIDEO",
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
    })().catch((err) => {
      // Allow a later retry if the first init fails (e.g. transient CDN error).
      landmarkerPromise = null;
      throw err;
    });
  }
  return landmarkerPromise;
}

// Run detection on a single video frame at a monotonic timestamp (ms).
export function detect(
  landmarker: PoseLandmarker,
  video: HTMLVideoElement,
  timestampMs: number
): Skeleton | null {
  const result = landmarker.detectForVideo(video, timestampMs);
  const lm = result.landmarks?.[0];
  if (!lm || lm.length === 0) return null;
  return lm.map((p) => ({
    x: p.x,
    y: p.y,
    z: p.z ?? 0,
    visibility: p.visibility ?? 1,
  }));
}
