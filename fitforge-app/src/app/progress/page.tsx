import { requireCompletedProfile } from "@/lib/auth-guards";
import { createClient } from "@/lib/supabase/server";
import { getProgressInsights } from "@/lib/progress";

export default async function ProgressPage() {
  const { user } = await requireCompletedProfile();
  const supabase = await createClient();

  let error: string | null = null;
  let insights = {
    weeklyBars: [
      { label: "M", value: 8 },
      { label: "T", value: 8 },
      { label: "W", value: 8 },
      { label: "T", value: 8 },
      { label: "F", value: 8 },
      { label: "S", value: 8 },
      { label: "S", value: 8 },
    ],
    currentStreak: 0,
    longestStreak: 0,
    averageFormScore: 0,
    weeklyFormDelta: 0,
  };

  try {
    insights = await getProgressInsights(supabase, user.id);
  } catch (caughtError) {
    error = caughtError instanceof Error ? caughtError.message : "Unable to load progress analytics.";
  }

  const deltaPrefix = insights.weeklyFormDelta >= 0 ? "+" : "";

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-line bg-surface p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-600">Progress Insights</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          See growth, not just numbers
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted sm:text-base">
          This page now reads live data from your sessions and exercise logs.
        </p>
        {error ? <p className="mt-3 text-sm text-rose-700">{error}</p> : null}
      </section>

      <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <p className="text-sm font-semibold text-slate-900">Weekly consistency chart</p>
        <div className="mt-6 grid grid-cols-7 items-end gap-3">
          {insights.weeklyBars.map((entry, index) => (
            <div key={`${entry.label}-${index}`} className="space-y-2 text-center">
              <div
                className="mx-auto w-full rounded-t-xl bg-gradient-to-t from-orange-500 to-orange-300"
                style={{ height: `${entry.value * 1.6}px` }}
              />
              <p className="text-xs text-muted">{entry.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-line bg-surface p-5">
          <p className="text-sm font-semibold text-slate-800">Current streak</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{insights.currentStreak} days</p>
          <p className="mt-2 text-sm text-muted">Longest streak: {insights.longestStreak} days</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-5">
          <p className="text-sm font-semibold text-slate-800">Form quality score</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{insights.averageFormScore} / 100</p>
          <p className="mt-2 text-sm text-muted">{deltaPrefix}{insights.weeklyFormDelta} points vs previous week</p>
        </article>
      </section>
    </div>
  );
}
