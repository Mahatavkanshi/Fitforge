const cues = [
  "Keep your chest up",
  "Align knees with toes",
  "Control the downward movement",
  "Breathe out while pushing up",
];

export default function TrainerPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
      <section className="rounded-3xl border border-line bg-surface p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-600">
            Live Trainer
          </p>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            Camera Ready
          </span>
        </div>

        <div className="mt-4 flex min-h-[22rem] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center">
          <div>
            <p className="text-lg font-semibold text-slate-800">Webcam preview zone</p>
            <p className="mt-2 text-sm text-muted">
              MediaPipe landmarks and rep counter will appear here in Phase 3.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-line bg-white p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-muted">Exercise</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">Squat</p>
          </div>
          <div className="rounded-xl border border-line bg-white p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-muted">Reps</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">00</p>
          </div>
          <div className="rounded-xl border border-line bg-white p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-muted">Set</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">1 / 3</p>
          </div>
        </div>
      </section>

      <aside className="space-y-4 rounded-3xl border border-line bg-surface p-5 sm:p-6">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">Form cues</h2>
        <ul className="space-y-2">
          {cues.map((cue) => (
            <li
              key={cue}
              className="rounded-xl border border-orange-100 bg-orange-50/70 px-4 py-3 text-sm text-orange-900"
            >
              {cue}
            </li>
          ))}
        </ul>
        <button className="w-full rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong">
          Begin Workout
        </button>
      </aside>
    </div>
  );
}
