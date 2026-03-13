import { redirect } from "next/navigation";
import { getProfileByUserId, isProfileComplete } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";

export async function requireCompletedProfile() {
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

  return { user, profile };
}
