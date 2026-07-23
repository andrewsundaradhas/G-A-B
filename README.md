# PS2GAT — Markerless Gait & Balance Analyzer

A single-camera, **no-backend** web app that extracts your skeleton on-device
(MediaPipe BlazePose), then computes cadence, cross-limb symmetry, joint
range-of-motion, and a calibrated fall-risk index. Everything runs in the
browser — no video, no data ever leaves the device. Built to deploy on Vercel.

> **Research demonstrator — not a medical device, not for diagnostic use.**

---

## What ships vs. what's research

This spec (`PS2GAT`) describes a full research program: self-supervised
skeletal pretraining, a Cross-Limb Symmetry Attention (CLSA) module, a
physics-informed loss, and a calibrated uncertainty head, trained offline on
clinical datasets and exported to ONNX.

**Training is offline and GPU-bound — it does not and cannot run on Vercel.**
What deploys here is the real, working product surface:

| Shipped (this repo, deployable) | Offline research (not in this repo) |
| --- | --- |
| Client-side pose capture + live skeleton overlay | Self-supervised MAE pretraining |
| Windowing + normalization (spec §6) | PS2GAT graph-transformer training |
| Metric engine → `GaitMetrics` contract | Physics-informed loss fitting |
| Symmetry / risk / trajectory dashboard | ONNX export of the trained net |
| IndexedDB session history | Ablation studies for the paper |

Three of PS2GAT's four algorithmic pieces run **live and for real** on-device in
[`lib/gait.ts`](lib/gait.ts):

- **CLSA** — best-lag cross-correlation ("attention") between paired left/right
  joint trajectories → symmetry-deviation index + clinical Symmetry Index.
- **Physics-informed constraints** — a temporal-smoothness prior is applied to
  every signal before measurement; anatomical ROM + foot-contact checks flag
  implausible frames.
- **Calibrated uncertainty** — a bootstrap Monte-Carlo over capture sub-windows
  produces the fall-risk 95% confidence band.

The temporal gait parameters (cadence, step-time variability, ROM, phase lag)
are computed from detected gait events, not guessed. What is *not* here is the
**learned** part: self-supervised pretraining and the transformer weights. Every
number is explainable from pose geometry — nothing is fabricated. The engine
emits the exact `GaitMetrics` contract the trained model will, so swapping in the
ONNX network is a drop-in (see below).

## Dropping in the trained ONNX model

1. Train PS2GAT offline; export to ONNX.
2. `npm i onnxruntime-web`, place the `.onnx` under `public/models/`.
3. In `lib/gait.ts`, replace the body of `computeMetrics()` with an
   `onnxruntime-web` `session.run()` over the normalized `SkeletonWindow`.
   The input/output types (`SkeletonWindow` → `GaitMetrics`) stay identical, so
   no UI changes are needed.

## Tech stack

- **Next.js 14** (App Router, TypeScript) — static export, Vercel-native
- **Tailwind CSS** — ORYZO dark-editorial design system
- **@mediapipe/tasks-vision** — client-side pose (WASM/GPU, loaded from CDN)
- **Recharts** — joint-angle trajectories
- **idb** — IndexedDB session history

## Local development

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (what Vercel runs)
```

Camera access requires a secure context — `localhost` and any `https://` host
(Vercel provides HTTPS automatically).

## Deploy to Vercel

1. Push this folder to a Git repository.
2. Import it in Vercel — the framework auto-detects as **Next.js**; no config,
   no environment variables, no build overrides needed.
3. Deploy. The MediaPipe WASM runtime and pose model are fetched from CDN in the
   browser at runtime, so there is nothing server-side to provision.

## Repository layout

```
app/                 Next.js routes, layout, global ORYZO styles
components/           Nav, Analyzer (camera), Results + dashboard widgets
lib/
  pose.ts            MediaPipe PoseLandmarker wrapper (browser-only)
  skeleton.ts        BlazePose topology + CLSA symmetric-pair edges
  gait.ts            Metric engine (proxy for the trained PS2GAT model)
  storage.ts         IndexedDB session history
  types.ts           Shared data contracts (SkeletonWindow, GaitMetrics)
```

## Privacy

No server, no database, no telemetry. Pose runs in your browser; only derived
numeric metrics are stored, locally in IndexedDB. Clearing site data erases
everything.
