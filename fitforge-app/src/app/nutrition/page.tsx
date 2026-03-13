import { NutritionSearch } from "@/components/nutrition-search";
import { requireCompletedProfile } from "@/lib/auth-guards";

const meals = [
  { name: "Breakfast", detail: "Oats, banana, peanut butter", kcal: 420 },
  { name: "Lunch", detail: "Rice, grilled chicken, mixed vegetables", kcal: 610 },
  { name: "Snack", detail: "Greek yogurt and berries", kcal: 220 },
  { name: "Dinner", detail: "Lentil bowl with paneer and salad", kcal: 540 },
];

function buildDailyTargets(goal: string | null, weightKg: number) {
  const protein = Math.round(weightKg * 1.8);

  if (goal === "weight_loss") {
    return { calories: 1900, protein, water: 3.2 };
  }

  if (goal === "muscle_gain") {
    return { calories: 2500, protein: Math.round(weightKg * 2), water: 3.4 };
  }

  if (goal === "endurance") {
    return { calories: 2300, protein: Math.round(weightKg * 1.7), water: 3.5 };
  }

  return { calories: 2100, protein, water: 3.0 };
}

export default async function NutritionPage() {
  const { profile } = await requireCompletedProfile();

  const targets = buildDailyTargets(profile.goal, profile.weight_kg ?? 70);
  const goalLabel = (profile.goal ?? "general_fitness").replaceAll("_", " ");

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-line bg-surface p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-600">Nutrition Planner</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Fuel your training with purpose
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted sm:text-base">
          Daily targets now adapt to your onboarding profile. Food lookup is connected to USDA FoodData API.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <article className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-lg font-semibold text-slate-900">Daily targets</p>
            <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold uppercase text-orange-700">
              Goal: {goalLabel}
            </span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-line bg-white p-4">
              <p className="text-xs uppercase tracking-[0.15em] text-muted">Calories</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{targets.calories.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-line bg-white p-4">
              <p className="text-xs uppercase tracking-[0.15em] text-muted">Protein</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{targets.protein} g</p>
            </div>
            <div className="rounded-xl border border-line bg-white p-4">
              <p className="text-xs uppercase tracking-[0.15em] text-muted">Water</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{targets.water.toFixed(1)} L</p>
            </div>
          </div>
        </article>

        <NutritionSearch />
      </section>

      <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <p className="text-lg font-semibold text-slate-900">Sample meal plan</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {meals.map((meal) => (
            <article key={meal.name} className="rounded-xl border border-line bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900">{meal.name}</p>
                <span className="text-xs font-semibold text-orange-700">{meal.kcal} kcal</span>
              </div>
              <p className="mt-1 text-sm text-muted">{meal.detail}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
