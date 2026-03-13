"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DrawingUtils, FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";
import { createClient } from "@/lib/supabase/client";

type Stage = "up" | "down";

type QualityStats = {
  samples: number;
  stableSamples: number;
};

const cues = {
  noPose: "Step fully into frame so the model can detect your body.",
  depth: "Go a little lower for full squat depth.",
  drive: "Drive through your heels as you stand up.",
  strong: "Great depth. Keep your chest up and core braced.",
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

export function LivePoseTrainer() {
  const supabase = useMemo(() => createClient(), []);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef(-1);
  const stageRef = useRef<Stage>("up");
  const repsRef = useRef(0);
  const startedAtRef = useRef<number | null>(null);
  const qualityStatsRef = useRef<QualityStats>({ samples: 0, stableSamples: 0 });

  const [isLoadingModel, setIsLoadingModel] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [repCount, setRepCount] = useState(0);
  const [stage, setStage] = useState<Stage>("up");
  const [kneeAngle, setKneeAngle] = useState(180);
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

  function stopCamera() {
    stopLoop();

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsRunning(false);
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

      repsRef.current = 0;
      stageRef.current = "up";
      lastVideoTimeRef.current = -1;
      qualityStatsRef.current = { samples: 0, stableSamples: 0 };
      startedAtRef.current = Date.now();

      setRepCount(0);
      setStage("up");
      setCue(cues.drive);
      setKneeAngle(180);
      setIsRunning(true);

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

              qualityStatsRef.current.samples += 1;

              if (averagedKnee >= 75 && averagedKnee <= 170) {
                qualityStatsRef.current.stableSamples += 1;
              }

              if (averagedKnee < 95) {
                if (stageRef.current !== "down") {
                  stageRef.current = "down";
                  setStage("down");
                }

                setCue(cues.strong);
              }

              if (averagedKnee > 160 && stageRef.current === "down") {
                stageRef.current = "up";
                repsRef.current += 1;
                setRepCount(repsRef.current);
                setStage("up");
                setCue(cues.drive);
              } else if (averagedKnee > 145 && stageRef.current === "up") {
                setCue(cues.depth);
              }
            } else {
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
      setIsLoadingModel(false);
      stopCamera();
    }
  }

  async function saveSession() {
    if (isSaving) {
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
      const estimatedCalories = Math.max(25, Math.round(repCount * 0.4 + elapsedMinutes * 3));

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

      const { error: logError } = await supabase.from("exercise_logs").insert({
        session_id: session.id,
        user_id: user.id,
        exercise_name: "squat",
        reps: repCount,
        sets: 1,
        form_score: formScore,
      });

      if (logError) {
        throw new Error(logError.message);
      }

      setSaveMessage("Session saved. Dashboard stats are now updated from your data.");
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
            {isRunning ? "Tracking Active" : "Camera Idle"}
          </span>
        </div>

        <div className="relative mt-4 overflow-hidden rounded-2xl border border-line bg-slate-900">
          <video ref={videoRef} className="hidden" playsInline muted />
          <canvas ref={canvasRef} className="aspect-video w-full bg-slate-950" />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-line bg-white p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-muted">Exercise</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">Squat</p>
          </div>
          <div className="rounded-xl border border-line bg-white p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-muted">Reps</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{repCount}</p>
          </div>
          <div className="rounded-xl border border-line bg-white p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-muted">Knee Angle</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{kneeAngle} deg</p>
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
            className="rounded-xl border border-orange-200 bg-orange-50 px-5 py-3 text-sm font-semibold text-orange-800 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-70"
            onClick={saveSession}
            disabled={isSaving || repCount === 0}
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
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Current Stage</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{stage.toUpperCase()}</p>
          </div>
          <div className="rounded-xl border border-line bg-white p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Rep Rule</p>
            <p className="mt-1 text-sm text-slate-700">Rep counts when knee angle goes below 95 then back above 160.</p>
          </div>
          <div className="rounded-xl border border-line bg-white p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Tip</p>
            <p className="mt-1 text-sm text-slate-700">Keep your full body visible and avoid low light for best tracking.</p>
          </div>
        </div>
      </aside>
    </div>
  );
}
