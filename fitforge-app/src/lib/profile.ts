import { type SupabaseClient } from "@supabase/supabase-js";

export const fitnessGoals = [
  "weight_loss",
  "muscle_gain",
  "endurance",
  "general_fitness",
] as const;

export const activityLevels = ["sedentary", "light", "moderate", "active", "athlete"] as const;

export type FitnessGoal = (typeof fitnessGoals)[number];
export type ActivityLevel = (typeof activityLevels)[number];

export type OnboardingProfile = {
  goal: FitnessGoal | null;
  age: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  activity_level: ActivityLevel | null;
};

export function getGoalLabel(goal: FitnessGoal) {
  return goal
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export function getActivityLabel(level: ActivityLevel) {
  return level.charAt(0).toUpperCase() + level.slice(1);
}

export function isProfileComplete(profile: OnboardingProfile | null | undefined) {
  if (!profile) {
    return false;
  }

  return Boolean(
    profile.goal &&
      profile.activity_level &&
      typeof profile.age === "number" &&
      typeof profile.height_cm === "number" &&
      typeof profile.weight_kg === "number",
  );
}

export async function getProfileByUserId(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("goal, age, height_cm, weight_kg, activity_level")
    .eq("id", userId)
    .maybeSingle();

  return (data as OnboardingProfile | null) ?? null;
}
