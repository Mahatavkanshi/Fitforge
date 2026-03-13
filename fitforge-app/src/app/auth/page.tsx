export default function AuthPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="space-y-4 rounded-3xl border border-line bg-surface p-6 sm:p-8">
        <p className="inline-flex rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
          Auth Module
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Welcome to FitForge
        </h1>
        <p className="text-sm leading-6 text-muted sm:text-base">
          This screen will connect with Supabase Auth in Phase 2. For now, it
          shows the login and registration layout.
        </p>

        <div className="rounded-2xl border border-orange-100 bg-orange-50/70 p-4 text-sm text-orange-900">
          Goal: keep signup simple so users can quickly move to onboarding and
          start their first guided workout.
        </div>
      </section>

      <section className="space-y-6 rounded-3xl border border-line bg-surface p-6 sm:p-8">
        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-700" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-300"
            placeholder="you@example.com"
            type="email"
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-700" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-300"
            placeholder="At least 8 characters"
            type="password"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong">
            Sign In
          </button>
          <button className="rounded-xl border border-line bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300">
            Create Account
          </button>
        </div>
      </section>
    </div>
  );
}
