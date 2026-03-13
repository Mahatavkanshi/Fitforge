"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DrawingUtils, FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";
import { createClient } from "@/lib/supabase/client";

type Stage = "up" | "down";
type WorkoutPhase = "idle" | "active" | "rest" | "completed";

type QualityStats = {
  samples: number;
  stableSamples: number;
};

type FormIssue = {
  id: "depth" | "valgus" | "lean" | "asymmetry";
  label: string;
};

const TARGET_SETS = 3;
const TARGET_REPS_PER_SET = 10;
const REST_SECONDS = 25;

const cues = {
  noPose: "Step fully into frame so the model can detect your full body.",
  depth: "Go slightly lower until your thighs are near parallel.",
  drive: "Drive through your heels and stand tall with control.",
  strong: "Great rep. Keep your chest proud and core tight.",
  rest: "Recover with slow breathing. Next set starts soon.",
  done: "Workout complete. Save this session to update your dashboard.",
};

const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task";

function calculateAngle(a: { x: number; y: number }, b: { x: number; y: number }, c: { x: number; y: number }) {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };

  const dot = ab.x * cb.x + ab.y * cb.y;
  const magAB = Math.hypot(ab.x, ab.y);
  const magCB = Math.hypot(cb.x, cb.y);

  if (!magAB || !magCB) {
    return 180;
  }

  const cosine = Math.min(1, Math.max(-1, dot / (magAB * magCB)));
  return (Math.acos(cosine) * 180) / Math.PI;
}

function average(values: number[]) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

function evaluateForm(
  pose: { x: number; y: number }[],
  leftKneeAngle: number,
  rightKneeAngle: number,
  averagedKneeAngle: number,
) {
  const issues: FormIssue[] = [];

  if (averagedKneeAngle > 145) {
    issues.push({ id: "depth", label: "Depth is shallow. Sink a bit more." });
  }

  const kneeDistance = Math.abs(pose[25].x - pose[26].x);
  const ankleDistance = Math.abs(pose[27].x - pose[28].x);

  if (ankleDistance > 0 && kneeDistance < ankleDistance * 0.72) {
    issues.push({ id: "valgus", label: "Knees are collapsing inward. Push them out." });
  }

  const leftTorsoAngle = calculateAngle(pose[11], pose[23], pose[25]);
  const rightTorsoAngle = calculateAngle(pose[12], pose[24], pose[26]);
  const torsoAngle = average([leftTorsoAngle, rightTorsoAngle]);

  if (torsoAngle < 120) {
    issues.push({ id: "lean", label: "Too much forward lean. Lift your chest." });
  }

  if (Math.abs(leftKneeAngle - rightKneeAngle) > 22) {
    issues.push({ id: "asymmetry", label: "Balance left and right leg movement." });
  }

  return { issues, torsoAngle };
}

export function LivePoseTrainer() {
  const supabase = useMemo(() => createClient(), []);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef(-1);

  const stageRef = useRef<Stage>("up");
  const phaseRef = useRef<WorkoutPhase>("idle");
  const repsInSetRef = useRef(0);
  const totalRepsRef = useRef(0);
  const currentSetRef = useRef(1);
  const startedAtRef = useRef<number | null>(null);
  const qualityStatsRef = useRef<QualityStats>({ samples: 0, stableSamples: 0 });

  const [isLoadingModel, setIsLoadingModel] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [phase, setPhase] = useState<WorkoutPhase>("idle");
  const [currentSet, setCurrentSet] = useState(1);
  const [repsInSet, setRepsInSet] = useState(0);
  const [totalReps, setTotalReps] = useState(0);
  const [restSeconds, setRestSeconds] = useState(REST_SECONDS);
  const [stage, setStage] = useState<Stage>("up");
  const [kneeAngle, setKneeAngle] = useState(180);
  const [torsoAngle, setTorsoAngle] = useState(180);
  const [formIssues, setFormIssues] = useState<FormIssue[]>([]);
  const [cue, setCue] = useState(cues.noPose);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      streamRef.current?.getTracks().forEach((track) => track.stop());
      poseLandmarkerRef.current?.close();
    };
  }, []);

  useEffect(() => {
    if (phase !== "rest") {
      return;
    }

    if (restSeconds <= 0) {
      phaseRef.current = "active";
      setPhase("active");
      setCue(cues.drive);
      setRestSeconds(REST_SECONDS);
      return;
    }

    const timeout = setTimeout(() => {
      setRestSeconds((value) => value - 1);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [phase, restSeconds]);

  async function ensureModel() {
    if (poseLandmarkerRef.current) {
      return poseLandmarkerRef.current;
    }

    setIsLoadingModel(true);

    try {
      const vision = await FilesetResolver.forVisionTasks(WASM_URL);

      const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: MODEL_URL,
        },
        runningMode: "VIDEO",
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      poseLandmarkerRef.current = poseLandmarker;
      return poseLandmarker;
    } finally {
      setIsLoadingModel(false);
    }
  }

  function stopLoop() {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }

  function resetWorkoutState(activeCamera = false) {
    stageRef.current = "up";
    phaseRef.current = activeCamera ? "active" : "idle";
    repsInSetRef.current = 0;
    totalRepsRef.current = 0;
    currentSetRef.current = 1;
    qualityStatsRef.current = { samples: 0, stableSamples: 0 };
    startedAtRef.current = activeCamera ? Date.now() : null;

    setPhase(activeCamera ? "active" : "idle");
    setCurrentSet(1);
    setRepsInSet(0);
    setTotalReps(0);
    setRestSeconds(REST_SECONDS);
    setStage("up");
    setKneeAngle(180);
    setTorsoAngle(180);
    setFormIssues([]);
    setCue(activeCamera ? cues.drive : cues.noPose);
  }

  function stopCamera() {
    stopLoop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsRunning(false);
    resetWorkoutState(false);
  }

  function completeSet() {
    if (currentSetRef.current >= TARGET_SETS) {
      phaseRef.current = "completed";
      setPhase("completed");
      setCue(cues.done);
      return;
    }

    currentSetRef.current += 1;
    repsInSetRef.current = 0;

    phaseRef.current = "rest";
    setPhase("rest");
    setCurrentSet(currentSetRef.current);
    setRepsInSet(0);
    setRestSeconds(REST_SECONDS);
    setCue(cues.rest);
  }

  async function startSession() {
    setError(null);
    setSaveMessage(null);

    try {
      const poseLandmarker = await ensureModel();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = stream;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas) {
        throw new Error("Trainer view is not ready yet.");
      }

      video.srcObject = stream;
      await video.play();

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      lastVideoTimeRef.current = -1;
      setIsRunning(true);
      resetWorkoutState(true);

      const render = () => {
        const currentVideo = videoRef.current;
        const currentCanvas = canvasRef.current;

        if (!currentVideo || !currentCanvas || !poseLandmarkerRef.current) {
          return;
        }

        const context = currentCanvas.getContext("2d");

        if (!context) {
          return;
        }

        if (currentVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
          context.save();
          context.clearRect(0, 0, currentCanvas.width, currentCanvas.height);
          context.drawImage(currentVideo, 0, 0, currentCanvas.width, currentCanvas.height);

          if (lastVideoTimeRef.current !== currentVideo.currentTime) {
            lastVideoTimeRef.current = currentVideo.currentTime;

            const result = poseLandmarker.detectForVideo(currentVideo, performance.now());
            const drawingUtils = new DrawingUtils(context);
            const pose = result.landmarks[0];

            if (pose) {
              drawingUtils.drawLandmarks(pose, {
                radius: 3,
                color: "#ea580c",
              });
              drawingUtils.drawConnectors(pose, PoseLandmarker.POSE_CONNECTIONS, {
                lineWidth: 2,
                color: "#f97316",
              });

              const leftKnee = calculateAngle(pose[23], pose[25], pose[27]);
              const rightKnee = calculateAngle(pose[24], pose[26], pose[28]);
              const averagedKnee = average([leftKnee, rightKnee]);

              setKneeAngle(Math.round(averagedKnee));

              const { issues, torsoAngle: measuredTorsoAngle } = evaluateForm(
                pose,
                leftKnee,
                rightKnee,
                averagedKnee,
              );

              setTorsoAngle(Math.round(measuredTorsoAngle));
              setFormIssues(issues);

              if (phaseRef.current === "active") {
                qualityStatsRef.current.samples += 1;

                if (issues.length === 0 && averagedKnee >= 80 && averagedKnee <= 165) {
                  qualityStatsRef.current.stableSamples += 1;
                }

                if (averagedKnee < 95 && stageRef.current !== "down") {
                  stageRef.current = "down";
                  setStage("down");
                }

                if (averagedKnee > 160 && stageRef.current === "down") {
                  stageRef.current = "up";
                  repsInSetRef.current += 1;
                  totalRepsRef.current += 1;

                  setStage("up");
                  setRepsInSet(repsInSetRef.current);
                  setTotalReps(totalRepsRef.current);

                  if (repsInSetRef.current >= TARGET_REPS_PER_SET) {
                    completeSet();
                  }
                }

                if (issues.some((item) => item.id === "valgus")) {
                  setCue("Press knees outward as you descend.");
                } else if (issues.some((item) => item.id === "lean")) {
                  setCue("Keep chest up and hips under control.");
                } else if (issues.some((item) => item.id === "depth")) {
                  setCue(cues.depth);
                } else {
                  setCue(cues.strong);
                }
              }

              if (phaseRef.current === "rest") {
                setCue(`${cues.rest} ${restSeconds}s remaining.`);
              }
            } else {
              setFormIssues([]);
              setCue(cues.noPose);
            }
          }

          context.restore();
        }

        rafRef.current = requestAnimationFrame(render);
      };

      rafRef.current = requestAnimationFrame(render);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to start the camera.");
      stopCamera();
    }
  }

  async function saveSession() {
    if (isSaving || totalReps === 0) {
      return;
    }

    setError(null);
    setSaveMessage(null);

    try {
      setIsSaving(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You need to sign in again before saving your workout.");
      }

      const startedAt = startedAtRef.current ?? Date.now();
      const elapsedMinutes = Math.max(1, Math.round((Date.now() - startedAt) / 60000));
      const estimatedCalories = Math.max(30, Math.round(totalReps * 0.5 + elapsedMinutes * 3));

      const { data: session, error: sessionError } = await supabase
        .from("workout_sessions")
        .insert({
          user_id: user.id,
          workout_type: "squat_form_drill",
          duration_minutes: elapsedMinutes,
          calories_burned: estimatedCalories,
          started_at: new Date(startedAt).toISOString(),
          completed_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (sessionError) {
        throw new Error(sessionError.message);
      }

      const formScore = Math.round(
        (qualityStatsRef.current.stableSamples / Math.max(1, qualityStatsRef.current.samples)) * 100,
      );

      const completedSets =
        phaseRef.current === "completed" ? TARGET_SETS : Math.max(0, currentSetRef.current - 1);

      const { error: logError } = await supabase.from("exercise_logs").insert({
        session_id: session.id,
        user_id: user.id,
        exercise_name: "squat",
        reps: totalReps,
        sets: completedSets,
        form_score: formScore,
      });

      if (logError) {
        throw new Error(logError.message);
      }

      setSaveMessage("Session saved. Open dashboard or progress to see updated analytics.");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to save this session.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
      <section className="rounded-3xl border border-line bg-surface p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-600">Live Trainer</p>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              isRunning ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
            }`}
          >
            {isRunning ? `Set ${currentSet}/${TARGET_SETS} - ${phase.toUpperCase()}` : "Camera Idle"}
          </span>
        </div>

        <div className="relative mt-4 overflow-hidden rounded-2xl border border-line bg-slate-900">
          <video ref={videoRef} className="hidden" playsInline muted />
          <canvas ref={canvasRef} className="aspect-video w-full bg-slate-950" />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-line bg-white p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-muted">Exercise</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">Squat</p>
          </div>
          <div className="rounded-xl border border-line bg-white p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-muted">Set Reps</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {repsInSet} / {TARGET_REPS_PER_SET}
            </p>
          </div>
          <div className="rounded-xl border border-line bg-white p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-muted">Total Reps</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{totalReps}</p>
          </div>
          <div className="rounded-xl border border-line bg-white p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-muted">Rest Timer</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{phase === "rest" ? `${restSeconds}s` : "-"}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-70"
            onClick={startSession}
            disabled={isRunning || isLoadingModel}
          >
            {isLoadingModel ? "Loading model..." : "Start Camera"}
          </button>

          <button
            type="button"
            className="rounded-xl border border-line bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-70"
            onClick={stopCamera}
            disabled={!isRunning}
          >
            Stop Camera
          </button>

          <button
            type="button"
            className="rounded-xl border border-line bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-70"
            onClick={() => resetWorkoutState(isRunning)}
            disabled={!isRunning}
          >
            Reset Workout
          </button>

          <button
            type="button"
            className="rounded-xl border border-orange-200 bg-orange-50 px-5 py-3 text-sm font-semibold text-orange-800 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-70"
            onClick={saveSession}
            disabled={isSaving || totalReps === 0}
          >
            {isSaving ? "Saving..." : "Save Session"}
          </button>
        </div>

        {error ? <p className="mt-3 text-sm text-rose-700">{error}</p> : null}
        {saveMessage ? <p className="mt-3 text-sm text-emerald-700">{saveMessage}</p> : null}
      </section>

      <aside className="space-y-4 rounded-3xl border border-line bg-surface p-5 sm:p-6">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">Real-time coaching</h2>
        <div className="rounded-xl border border-orange-100 bg-orange-50/70 p-4 text-sm text-orange-900">
          {cue}
        </div>

        <div className="grid gap-3 text-sm text-slate-700">
          <div className="rounded-xl border border-line bg-white p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Knee Angle</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{kneeAngle} deg</p>
          </div>
          <div className="rounded-xl border border-line bg-white p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Torso Angle</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{torsoAngle} deg</p>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-white p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-muted">Form Alerts</p>
          {formIssues.length ? (
            <ul className="mt-2 space-y-2 text-sm text-slate-700">
              {formIssues.map((issue) => (
                <li key={issue.id}>{issue.label}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-emerald-700">No major form issues detected.</p>
          )}
        </div>

        <div className="rounded-xl border border-line bg-white p-4 text-sm text-slate-700">
          <p className="text-xs uppercase tracking-[0.14em] text-muted">Program</p>
          <p className="mt-1">{TARGET_SETS} sets x {TARGET_REPS_PER_SET} reps with {REST_SECONDS}s rest.</p>
        </div>
      </aside>
    </div>
  );
}
