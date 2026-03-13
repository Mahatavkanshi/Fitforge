import { type SupabaseClient } from "@supabase/supabase-js";

export type ProgressBarPoint = {
  label: string;
  value: number;
};

export type ProgressInsights = {
  weeklyBars: ProgressBarPoint[];
  currentStreak: number;
  longestStreak: number;
  averageFormScore: number;
  weeklyFormDelta: number;
};

function startOfDay(date: Date) {
  const clone = new Date(date);
  clone.setHours(0, 0, 0, 0);
  return clone;
}

function isoDay(date: Date) {
  return startOfDay(date).toISOString().slice(0, 10);
}

function computeStreaks(trainingDays: Set<string>, daysToCheck = 30) {
  const today = startOfDay(new Date());

  let current = 0;

  for (let i = 0; i < daysToCheck; i += 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);

    if (trainingDays.has(isoDay(d))) {
      current += 1;
    } else {
      break;
    }
  }

  let longest = 0;
  let running = 0;

  for (let i = daysToCheck - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);

    if (trainingDays.has(isoDay(d))) {
      running += 1;
      longest = Math.max(longest, running);
    } else {
      running = 0;
    }
  }

  return { current, longest };
}

export async function getProgressInsights(
  supabase: SupabaseClient,
  userId: string,
): Promise<ProgressInsights> {
  const today = startOfDay(new Date());
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const [{ data: sessionsData, error: sessionsError }, { data: logsData, error: logsError }] =
    await Promise.all([
      supabase
        .from("workout_sessions")
        .select("started_at")
        .eq("user_id", userId)
        .gte("started_at", thirtyDaysAgo.toISOString()),
      supabase
        .from("exercise_logs")
        .select("reps, form_score, created_at")
        .eq("user_id", userId)
        .gte("created_at", thirtyDaysAgo.toISOString()),
    ]);

  if (sessionsError) {
    throw new Error(sessionsError.message);
  }

  if (logsError) {
    throw new Error(logsError.message);
  }

  const sessions = sessionsData ?? [];
  const logs = logsData ?? [];

  const trainingDays = new Set(
    sessions
      .map((session) => session.started_at)
      .filter((value): value is string => Boolean(value))
      .map((value) => value.slice(0, 10)),
  );

  const { current, longest } = computeStreaks(trainingDays);

  const formScores = logs
    .map((log) => log.form_score)
    .filter((score): score is number => typeof score === "number");

  const averageFormScore = formScores.length
    ? Math.round(formScores.reduce((total, score) => total + score, 0) / formScores.length)
    : 0;

  const currentWeekStart = new Date(today);
  currentWeekStart.setDate(today.getDate() - 6);
  const previousWeekStart = new Date(today);
  previousWeekStart.setDate(today.getDate() - 13);

  const currentWeekScores = logs
    .filter((log) => typeof log.form_score === "number")
    .filter((log) => {
      if (!log.created_at) {
        return false;
      }

      const day = new Date(log.created_at);
      return day >= currentWeekStart;
    })
    .map((log) => log.form_score as number);

  const previousWeekScores = logs
    .filter((log) => typeof log.form_score === "number")
    .filter((log) => {
      if (!log.created_at) {
        return false;
      }

      const day = new Date(log.created_at);
      return day >= previousWeekStart && day < currentWeekStart;
    })
    .map((log) => log.form_score as number);

  const currentWeekAvg = currentWeekScores.length
    ? currentWeekScores.reduce((total, score) => total + score, 0) / currentWeekScores.length
    : 0;
  const previousWeekAvg = previousWeekScores.length
    ? previousWeekScores.reduce((total, score) => total + score, 0) / previousWeekScores.length
    : 0;

  const repsByDay = new Map<string, number>();

  logs.forEach((log) => {
    if (!log.created_at) {
      return;
    }

    const day = log.created_at.slice(0, 10);
    repsByDay.set(day, (repsByDay.get(day) ?? 0) + (log.reps ?? 0));
  });

  const weeklyBars: ProgressBarPoint[] = [];

  for (let i = 6; i >= 0; i -= 1) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    const dayKey = isoDay(day);
    const dayLabel = day.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 1);
    const reps = repsByDay.get(dayKey) ?? 0;
    const normalized = Math.max(12, Math.min(100, Math.round(reps * 1.2)));

    weeklyBars.push({
      label: dayLabel,
      value: reps > 0 ? normalized : 8,
    });
  }

  return {
    weeklyBars,
    currentStreak: current,
    longestStreak: longest,
    averageFormScore,
    weeklyFormDelta: Math.round(currentWeekAvg - previousWeekAvg),
  };
}
