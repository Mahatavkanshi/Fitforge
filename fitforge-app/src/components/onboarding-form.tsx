"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  activityLevels,
  fitnessGoals,
  getActivityLabel,
  getGoalLabel,
  type ActivityLevel,
  type FitnessGoal,
  type OnboardingProfile,
} from "@/lib/profile";
import { createClient } from "@/lib/supabase/client";

type OnboardingFormProps = {
  initialProfile: OnboardingProfile | null;
};

export function OnboardingForm({ initialProfile }: OnboardingFormProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [goal, setGoal] = useState<FitnessGoal>(initialProfile?.goal ?? "general_fitness");
  const [age, setAge] = useState(initialProfile?.age?.toString() ?? "");
  const [heightCm, setHeightCm] = useState(initialProfile?.height_cm?.toString() ?? "");
  const [weightKg, setWeightKg] = useState(initialProfile?.weight_kg?.toString() ?? "");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(
    initialProfile?.activity_level ?? "moderate",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const parsedAge = Number.parseInt(age, 10);
    const parsedHeight = Number.parseFloat(heightCm);
    const parsedWeight = Number.parseFloat(weightKg);

    if (!Number.isFinite(parsedAge) || parsedAge < 13 || parsedAge > 100) {
      setError("Age should be between 13 and 100.");
      setLoading(false);
      return;
    }

    if (!Number.isFinite(parsedHeight) || parsedHeight < 100 || parsedHeight > 250) {
      setError("Height should be between 100 cm and 250 cm.");
      setLoading(false);
      return;
    }

    if (!Number.isFinite(parsedWeight) || parsedWeight < 30 || parsedWeight > 300) {
      setError("Weight should be between 30 kg and 300 kg.");
      setLoading(false);
      return;
    }

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("Your session expired. Please sign in again.");
        setLoading(false);
        router.push("/auth");
        return;
      }

      const { error: upsertError } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          goal,
          age: parsedAge,
          height_cm: parsedHeight,
          weight_kg: parsedWeight,
          activity_level: activityLevel,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );

      if (upsertError) {
        setError(upsertError.message);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Unable to save your profile right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-5 rounded-3xl border border-line bg-surface p-6 sm:p-8" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="goal">
          Fitness Goal
        </label>
        <select
          id="goal"
          value={goal}
          onChange={(event) => setGoal(event.target.value as FitnessGoal)}
          className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-300"
        >
          {fitnessGoals.map((goalOption) => (
            <option key={goalOption} value={goalOption}>
              {getGoalLabel(goalOption)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="age">
            Age
          </label>
          <input
            id="age"
            type="number"
            min={13}
            max={100}
            value={age}
            onChange={(event) => setAge(event.target.value)}
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-300"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="activity-level">
            Activity Level
          </label>
          <select
            id="activity-level"
            value={activityLevel}
            onChange={(event) => setActivityLevel(event.target.value as ActivityLevel)}
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-300"
          >
            {activityLevels.map((level) => (
              <option key={level} value={level}>
                {getActivityLabel(level)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="height">
            Height (cm)
          </label>
          <input
            id="height"
            type="number"
            step="0.1"
            min={100}
            max={250}
            value={heightCm}
            onChange={(event) => setHeightCm(event.target.value)}
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-300"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="weight">
            Weight (kg)
          </label>
          <input
            id="weight"
            type="number"
            step="0.1"
            min={30}
            max={300}
            value={weightKg}
            onChange={(event) => setWeightKg(event.target.value)}
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-300"
            required
          />
        </div>
      </div>

      {error ? <p className="text-sm text-rose-700">{error}</p> : null}

      <button
        className="w-full rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-70"
        type="submit"
        disabled={loading}
      >
        {loading ? "Saving profile..." : "Finish Onboarding"}
      </button>
    </form>
  );
}
