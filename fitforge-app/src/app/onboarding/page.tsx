import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/onboarding-form";
import { getProfileByUserId, isProfileComplete } from "@/lib/profile";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export default async function OnboardingPage() {
  const supabaseConfig = getSupabaseConfig(false);

  if (!supabaseConfig) {
    return (
      <section className="space-y-4 rounded-3xl border border-rose-200 bg-rose-50 p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-700">
          Supabase Setup Required
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-rose-900 sm:text-4xl">
          Configure environment variables first
        </h1>
        <p className="text-sm leading-6 text-rose-800 sm:text-base">
          Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in
          .env.local, then restart the dev server.
        </p>
      </section>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const profile = await getProfileByUserId(supabase, user.id);

  if (isProfileComplete(profile)) {
    redirect("/dashboard");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="space-y-4 rounded-3xl border border-line bg-surface p-6 sm:p-8">
        <p className="inline-flex rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
          Onboarding
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Personalize your FitForge plan
        </h1>
        <p className="text-sm leading-6 text-muted sm:text-base">
          These details power calorie targets, workout intensity, and progress
          recommendations. You can update them later anytime.
        </p>
        <div className="rounded-2xl border border-orange-100 bg-orange-50/70 p-4 text-sm text-orange-900">
          Your profile is private and used only for your coaching experience.
        </div>
      </section>

      <OnboardingForm initialProfile={profile} />
    </div>
  );
}
