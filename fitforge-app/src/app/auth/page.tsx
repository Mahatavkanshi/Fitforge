import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getProfileByUserId, isProfileComplete } from "@/lib/profile";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export default async function AuthPage() {
  const supabaseConfig = getSupabaseConfig(false);

  if (supabaseConfig) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const profile = await getProfileByUserId(supabase, user.id);
      redirect(isProfileComplete(profile) ? "/dashboard" : "/onboarding");
    }
  }

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
          Use email authentication to enter FitForge, then complete onboarding so
          your dashboard and trainer can personalize workouts.
        </p>

        <div className="rounded-2xl border border-orange-100 bg-orange-50/70 p-4 text-sm text-orange-900">
          Goal: keep signup simple so users can quickly move to onboarding and
          start their first guided workout.
        </div>

        {!supabaseConfig ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in
            .env.local to enable auth.
          </div>
        ) : null}
      </section>

      <AuthForm />
    </div>
  );
}
