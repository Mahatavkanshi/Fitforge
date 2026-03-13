const weeklyBars = [40, 68, 52, 80, 74, 88, 60];

export default function ProgressPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-line bg-surface p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-600">
          Progress Insights
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          See growth, not just numbers
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted sm:text-base">
          This module tracks consistency and training quality. It will later pull
          live stats from Supabase sessions and exercise logs.
        </p>
      </section>

      <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <p className="text-sm font-semibold text-slate-900">Weekly consistency chart</p>
        <div className="mt-6 grid grid-cols-7 items-end gap-3">
          {weeklyBars.map((value, index) => (
            <div key={index} className="space-y-2 text-center">
              <div
                className="mx-auto w-full rounded-t-xl bg-gradient-to-t from-orange-500 to-orange-300"
                style={{ height: `${value * 1.4}px` }}
              />
              <p className="text-xs text-muted">D{index + 1}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-line bg-surface p-5">
          <p className="text-sm font-semibold text-slate-800">Current streak</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">12 days</p>
          <p className="mt-2 text-sm text-muted">Longest streak: 21 days</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-5">
          <p className="text-sm font-semibold text-slate-800">Form quality score</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">87 / 100</p>
          <p className="mt-2 text-sm text-muted">+6 points this week</p>
        </article>
      </section>
    </div>
  );
}
