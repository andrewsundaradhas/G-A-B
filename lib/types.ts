// Shared data contracts for the pose → metric pipeline.
// These mirror Section 6 of the build spec (the data contract), so a trained
// PS2GAT ONNX model can consume the same Skeleton sequence later.

export interface Landmark {
  x: number; // normalized [0,1] image coords
  y: number;
  z: number; // relative depth (MediaPipe world-ish, in image scale)
  visibility: number; // [0,1]
}

// One frame of the skeleton graph (33 BlazePose landmarks).
export type Skeleton = Landmark[];

// A windowed sequence of skeleton frames + capture timestamps (ms).
export interface SkeletonWindow {
  frames: Skeleton[];
  timestamps: number[];
}

export interface JointAngleSample {
  t: number; // seconds from window start
  leftKnee: number; // degrees
  rightKnee: number;
  leftHip: number;
  rightHip: number;
}

// Per-symmetric-pair deviation, the interpretable CLSA signal.
export interface SymmetryPair {
  name: string;
  deviation: number; // [0,1], 0 = perfectly symmetric
}

export interface GaitMetrics {
  frames: number;
  durationSec: number;
  fps: number; // effective capture frame rate

  // --- temporal gait parameters ---
  cadenceSpm: number; // steps per minute
  stepCount: number;
  stepTimeSec: number; // mean inter-step interval
  stepTimeCV: number; // coefficient of variation (%) — validated fall predictor
  gaitCycleSec: number; // stride time (two steps)

  // --- CLSA symmetry (Section 2c) ---
  symmetryIndexGAI: number; // [0,1] weighted Gait Asymmetry Index, 0 = symmetric
  siStepTime: number; // clinical Symmetry Index on step time (%)
  siKneeRom: number; // clinical Symmetry Index on knee ROM (%)
  phaseLagPct: number; // L/R phase offset as % of gait cycle (~50 = normal antiphase)
  clsaCorrelation: number; // best-lag L/R correlation [−1,1], the attention score
  pairs: SymmetryPair[];

  // --- kinematics ---
  angleSeries: JointAngleSample[]; // physics-smoothed
  romLeftKnee: number; // degrees
  romRightKnee: number;
  romLeftHip: number;
  romRightHip: number;

  // --- physics-informed validity (Section 2d) ---
  physicsValidity: number; // [0,1] fraction of frames anatomically plausible + smooth
  romViolations: number; // count of out-of-range joint-angle frames
  jerkIndex: number; // temporal jerk (lower = smoother)

  // --- fall-risk regression + calibrated uncertainty (Section 2e) ---
  fallRisk: number; // [0,1]
  fallRiskLow: number; // bootstrap 95% CI lower
  fallRiskHigh: number; // bootstrap 95% CI upper
  fallRiskLabel: "LOW" | "MODERATE" | "ELEVATED" | "HIGH";

  classification: "NORMAL" | "PATHOLOGICAL" | "INDETERMINATE";
  classConfidence: number; // [0,1]
  qualityScore: number; // capture quality [0,1]
}

export interface Session {
  id: string;
  createdAt: number;
  metrics: GaitMetrics;
}
