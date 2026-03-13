import { redirect } from "next/navigation";
import {
  getProfileByUserId,
  isProfileComplete,
  type OnboardingProfile,
} from "@/lib/profile";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export async function requireCompletedProfile() {
  const supabaseConfig = getSupabaseConfig(false);

  if (!supabaseConfig) {
    redirect("/auth?setup=1");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const profile = await getProfileByUserId(supabase, user.id);

  if (!isProfileComplete(profile)) {
    redirect("/onboarding");
  }

  return { user, profile: profile as OnboardingProfile };
}
