import { type SupabaseClient } from "@supabase/supabase-js";

export type DashboardMetrics = {
  weeklySessions: number;
  consistencyScore: number;
  caloriesBurned: number;
  readiness: "Fresh" | "Good" | "Challenging" | "High Load";
  readinessHelper: string;
  totalReps: number;
  averageFormScore: number;
  weeklyDurationMinutes: number;
  workoutTypes: string[];
};

function getReadiness(weeklyMinutes: number): DashboardMetrics["readiness"] {
  if (weeklyMinutes < 90) {
    return "Fresh";
  }

  if (weeklyMinutes < 180) {
    return "Good";
  }

  if (weeklyMinutes < 300) {
    return "Challenging";
  }

  return "High Load";
}

function getReadinessHelper(readiness: DashboardMetrics["readiness"]) {
  switch (readiness) {
    case "Fresh":
      return "Low load this week";
    case "Good":
      return "Balanced workload";
    case "Challenging":
      return "Prioritize recovery sleep";
    case "High Load":
      return "Schedule deload session";
    default:
      return "Balanced workload";
  }
}

export async function getDashboardMetrics(supabase: SupabaseClient, userId: string): Promise<DashboardMetrics> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [{ data: sessionsData, error: sessionsError }, { data: logsData, error: logsError }] =
    await Promise.all([
      supabase
        .from("workout_sessions")
        .select("id, workout_type, duration_minutes, calories_burned, started_at")
        .eq("user_id", userId)
        .gte("started_at", sevenDaysAgo),
      supabase
        .from("exercise_logs")
        .select("reps, form_score, created_at")
        .eq("user_id", userId)
        .gte("created_at", sevenDaysAgo),
    ]);

  if (sessionsError) {
    throw new Error(sessionsError.message);
  }

  if (logsError) {
    throw new Error(logsError.message);
  }

  const sessions = sessionsData ?? [];
  const logs = logsData ?? [];

  const caloriesBurned = sessions.reduce((total, session) => total + (session.calories_burned ?? 0), 0);
  const weeklyDurationMinutes = sessions.reduce(
    (total, session) => total + (session.duration_minutes ?? 0),
    0,
  );
  const totalReps = logs.reduce((total, log) => total + (log.reps ?? 0), 0);

  const formScores = logs
    .map((log) => log.form_score)
    .filter((score): score is number => typeof score === "number");
  const averageFormScore = formScores.length
    ? Math.round(formScores.reduce((total, score) => total + score, 0) / formScores.length)
    : 0;

  const daysTrained = new Set(
    sessions
      .map((session) => session.started_at)
      .filter((value): value is string => Boolean(value))
      .map((value) => new Date(value).toISOString().slice(0, 10)),
  ).size;

  const consistencyScore = Math.min(100, Math.round((daysTrained / 7) * 100));
  const workoutTypes = [...new Set(sessions.map((session) => session.workout_type).filter(Boolean))];
  const readiness = getReadiness(weeklyDurationMinutes);

  return {
    weeklySessions: sessions.length,
    consistencyScore,
    caloriesBurned,
    readiness,
    readinessHelper: getReadinessHelper(readiness),
    totalReps,
    averageFormScore,
    weeklyDurationMinutes,
    workoutTypes,
  };
}
