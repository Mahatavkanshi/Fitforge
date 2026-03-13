import { getGoalLabel } from "@/lib/profile";
import { requireCompletedProfile } from "@/lib/auth-guards";

const stats = [
  { label: "Weekly Sessions", value: "04", helper: "+1 from last week" },
  { label: "Consistency Score", value: "82%", helper: "Strong momentum" },
  { label: "Calories Burned", value: "1,980", helper: "Estimated total" },
  { label: "Recovery Readiness", value: "Good", helper: "Based on workout load" },
];

export default async function DashboardPage() {
  const { user, profile } = await requireCompletedProfile();

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-line bg-surface p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-600">
          Dashboard
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Training control center
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted sm:text-base">
          This page will become the user home after login. It summarizes activity,
          readiness, and workout recommendations.
        </p>
        <div className="mt-4 rounded-xl border border-orange-100 bg-orange-50/70 p-3 text-sm text-orange-900">
          Signed in as {user.email}. Goal: {profile.goal ? getGoalLabel(profile.goal) : "General Fitness"}.
        </div>
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
            <li>Mobility warm-up: 8 minutes</li>
            <li>Strength block: lower body + core</li>
            <li>Cooldown and breathing: 5 minutes</li>
          </ul>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-5">
          <p className="text-sm font-semibold text-slate-800">Upcoming Session</p>
          <p className="mt-3 text-sm text-muted">Saturday, 7:00 PM</p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
            AI Form Coaching - Full Body
          </p>
          <button className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-strong">
            Start Preview
          </button>
        </article>
      </section>
    </div>
  );
}
