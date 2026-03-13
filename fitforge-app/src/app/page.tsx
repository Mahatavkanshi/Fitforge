import Link from "next/link";

const quickActions = [
  {
    title: "Authentication",
    description: "Sign up and onboard users with their goals and activity level.",
    href: "/auth",
  },
  {
    title: "Dashboard",
    description: "Preview adherence scores, weekly load, and next workout.",
    href: "/dashboard",
  },
  {
    title: "Live Trainer",
    description: "Prepare the webcam module for real-time posture coaching.",
    href: "/trainer",
  },
  {
    title: "Progress",
    description: "Track streaks, reps, consistency, and recovery trend.",
    href: "/progress",
  },
  {
    title: "Nutrition",
    description: "Set calorie goals and explore macro-balanced meal ideas.",
    href: "/nutrition",
  },
];

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-3xl border border-line bg-surface">
        <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <div className="space-y-5">
            <p className="inline-flex rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-orange-700">
              Phase 1 Foundation
            </p>
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              FitForge builds your AI-powered fitness studio on the web.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted sm:text-lg">
              This first phase delivers the complete app skeleton with responsive pages,
              clean navigation, and a reusable visual system for upcoming AI modules.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/trainer"
                className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-strong"
              >
                Open Live Trainer
              </Link>
              <Link
                href="/dashboard"
                className="rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-slate-300"
              >
                View Dashboard
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-600">
              Build Sequence
            </p>
            <ol className="mt-4 space-y-3 text-sm text-slate-700">
              <li>1. Scaffolded Next.js with TypeScript and Tailwind.</li>
              <li>2. Added global navigation and route structure.</li>
              <li>3. Designed responsive layouts for each core screen.</li>
              <li>4. Prepared UI shell for AI, auth, and analytics integration.</li>
            </ol>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {quickActions.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-2xl border border-line bg-surface p-5 transition hover:-translate-y-1 hover:border-slate-300"
          >
            <p className="text-lg font-semibold tracking-tight text-slate-900">{item.title}</p>
            <p className="mt-2 text-sm leading-6 text-muted">{item.description}</p>
            <p className="mt-4 text-sm font-semibold text-orange-600 transition group-hover:text-orange-700">
              Explore module ->
            </p>
          </Link>
        ))}
      </section>
    </div>
  );
}
