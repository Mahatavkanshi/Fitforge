import { getGoalLabel } from "@/lib/profile";
import { requireCompletedProfile } from "@/lib/auth-guards";
import { getDashboardMetrics } from "@/lib/dashboard";
import type { DashboardMetrics } from "@/lib/dashboard";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/sign-out-button";
import { AiCoachPanel } from "@/components/ai-coach-panel";

export default async function DashboardPage() {
  const { user, profile } = await requireCompletedProfile();
  const supabase = await createClient();

  let metricsError: string | null = null;
  let metrics: DashboardMetrics = {
    weeklySessions: 0,
    consistencyScore: 0,
    caloriesBurned: 0,
    readiness: "Fresh" as const,
    readinessHelper: "Add your first session",
    totalReps: 0,
    averageFormScore: 0,
    weeklyDurationMinutes: 0,
    workoutTypes: [] as string[],
  };

  try {
    metrics = await getDashboardMetrics(supabase, user.id);
  } catch (caughtError) {
    metricsError = caughtError instanceof Error ? caughtError.message : "Unable to load live metrics right now.";
  }

  const stats = [
    {
      label: "Weekly Sessions",
      value: String(metrics.weeklySessions).padStart(2, "0"),
      helper: `${metrics.weeklyDurationMinutes} mins tracked`,
    },
    {
      label: "Consistency Score",
      value: `${metrics.consistencyScore}%`,
      helper: `${metrics.totalReps} reps logged`,
    },
    {
      label: "Calories Burned",
      value: metrics.caloriesBurned.toLocaleString(),
      helper: "Live from workout_sessions",
    },
    {
      label: "Recovery Readiness",
      value: metrics.readiness,
      helper: metrics.readinessHelper,
    },
  ];

  const focusByGoal = {
    weight_loss: ["Circuit squat intervals", "Brisk cardio finisher", "Hydration target: 3L"],
    muscle_gain: ["Progressive overload sets", "Protein-rich post-workout", "Controlled tempo reps"],
    endurance: ["Longer interval blocks", "Breathing cadence drills", "Pacing consistency"],
    general_fitness: ["Mobility warm-up", "Strength + posture block", "5-minute cooldown"],
  };

  const goalKey = profile.goal ?? "general_fitness";
  const todayFocus = focusByGoal[goalKey];
  const goalLabel = profile.goal ? getGoalLabel(profile.goal) : "General Fitness";

  const workoutSummary = metrics.workoutTypes.length
    ? metrics.workoutTypes.map((type) => type.replaceAll("_", " ")).join(", ")
    : "No workouts saved yet";

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-line bg-surface p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-600">Dashboard</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Training control center
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted sm:text-base">
              Live metrics are now loaded from your Supabase workout tables.
            </p>
          </div>
          <SignOutButton
            label="Sign Out"
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 disabled:opacity-70"
          />
        </div>
        <div className="mt-4 rounded-xl border border-orange-100 bg-orange-50/70 p-3 text-sm text-orange-900">
          Signed in as {user.email}. Goal: {goalLabel}. Form score this week: {metrics.averageFormScore}/100.
        </div>
        {metricsError ? <p className="mt-3 text-sm text-rose-700">{metricsError}</p> : null}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article key={stat.label} className="rounded-2xl border border-line bg-surface p-5">
            <p className="text-sm text-muted">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{stat.value}</p>
            <p className="mt-2 text-xs font-medium text-orange-700">{stat.helper}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-line bg-surface p-5">
          <p className="text-sm font-semibold text-slate-800">Today&apos;s Focus</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {todayFocus.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-5">
          <p className="text-sm font-semibold text-slate-800">Weekly Workout Mix</p>
          <p className="mt-3 text-sm text-muted">Based on sessions from last 7 days</p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
            {workoutSummary}
          </p>
          <p className="mt-3 text-sm text-muted">Save sessions from Live Trainer to keep this panel updated.</p>
        </article>
      </section>

      <AiCoachPanel goalLabel={goalLabel} />
    </div>
  );
}
