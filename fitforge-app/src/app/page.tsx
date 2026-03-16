import Image from "next/image";
import Link from "next/link";
import heroWorkoutImage from "../../image/Screenshot 2026-03-16 182729.png";

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
            <div className="relative overflow-hidden rounded-[2rem] border border-cyan-200/40 bg-[#071822] shadow-[0_28px_70px_rgba(8,145,178,0.18)]">
              <Image
                src={heroWorkoutImage}
                alt="Athlete doing a squat with AI pose estimation overlay"
                className="h-auto w-full object-cover"
                priority
              />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(8,23,33,0.08),rgba(6,182,212,0.1),rgba(249,115,22,0.08))]" />
            </div>

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

          <div className="relative overflow-hidden rounded-[2rem] border border-orange-100 bg-[radial-gradient(circle_at_top,#fff8f1_0%,#fff_48%,#fff8f3_100%)] p-5 sm:p-6">
            <div className="absolute inset-x-6 top-5 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              <span>Live Motion</span>
              <span className="rounded-full bg-white/80 px-3 py-1 text-orange-600 shadow-sm">Form Focus</span>
            </div>

            <div className="relative mt-10 overflow-hidden rounded-[1.75rem] border border-white/70 bg-[linear-gradient(160deg,#fff_0%,#fffaf5_45%,#fff1e8_100%)] p-4 shadow-[0_24px_80px_rgba(249,115,22,0.14)] sm:p-5">
              <div className="pointer-events-none absolute -left-10 top-10 h-28 w-28 rounded-full bg-orange-200/50 blur-3xl" />
              <div className="pointer-events-none absolute -right-10 bottom-0 h-32 w-32 rounded-full bg-emerald-100/70 blur-3xl" />

              <div className="relative grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4 lg:block">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-600">
                        Athlete Preview
                      </p>
                      <p className="mt-2 max-w-[14rem] text-sm leading-6 text-slate-600">
                        A strong visual cue for guided sessions, posture tracking, and high-energy coaching.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-orange-200 bg-white/85 px-3 py-2 text-right shadow-sm backdrop-blur lg:mt-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Studio Mood</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">Focused + energetic</p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                    <div className="rounded-2xl border border-orange-100 bg-white/90 px-4 py-3 shadow-sm">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Pose Quality</p>
                      <p className="mt-1 text-lg font-semibold tracking-tight text-slate-900">Real-time form cues</p>
                    </div>
                    <div className="rounded-2xl border border-orange-100 bg-white/90 px-4 py-3 shadow-sm">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Energy</p>
                      <p className="mt-1 text-lg font-semibold tracking-tight text-slate-900">Studio-grade intensity</p>
                    </div>
                    <div className="rounded-2xl border border-orange-100 bg-white/90 px-4 py-3 shadow-sm">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Tracking</p>
                      <p className="mt-1 text-lg font-semibold tracking-tight text-slate-900">Sessions update instantly</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.65rem] border border-orange-100 bg-white p-4 shadow-[0_28px_50px_rgba(15,23,42,0.08)] sm:p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Tracking Stack</p>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Pose Estimation</p>
                      <p className="mt-1 text-lg font-semibold tracking-tight text-slate-900">AI landmarks in motion</p>
                    </div>
                    <div className="rounded-2xl border border-orange-100 bg-orange-50/70 px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-orange-700">AI-Guided Workout</p>
                      <p className="mt-1 text-lg font-semibold tracking-tight text-slate-900">Live cues while you train</p>
                    </div>
                    <div className="rounded-2xl border border-cyan-100 bg-cyan-50/80 px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-700">Motion Tracking</p>
                      <p className="mt-1 text-lg font-semibold tracking-tight text-slate-900">Sessions update instantly</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
              Explore module
            </p>
          </Link>
        ))}
      </section>
    </div>
  );
}
