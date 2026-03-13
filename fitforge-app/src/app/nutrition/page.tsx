const meals = [
  { name: "Breakfast", detail: "Oats, banana, peanut butter", kcal: 420 },
  { name: "Lunch", detail: "Rice, grilled chicken, mixed vegetables", kcal: 610 },
  { name: "Snack", detail: "Greek yogurt and berries", kcal: 220 },
  { name: "Dinner", detail: "Lentil bowl with paneer and salad", kcal: 540 },
];

export default function NutritionPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-line bg-surface p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-600">
          Nutrition Planner
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Fuel your training with purpose
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted sm:text-base">
          This screen will connect with USDA FoodData API in Phase 5. It already
          provides the structure for goals, meal suggestions, and macro tracking.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <article className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-lg font-semibold text-slate-900">Daily targets</p>
            <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
              Goal: Lean Strength
            </span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-line bg-white p-4">
              <p className="text-xs uppercase tracking-[0.15em] text-muted">Calories</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">2,100</p>
            </div>
            <div className="rounded-xl border border-line bg-white p-4">
              <p className="text-xs uppercase tracking-[0.15em] text-muted">Protein</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">135 g</p>
            </div>
            <div className="rounded-xl border border-line bg-white p-4">
              <p className="text-xs uppercase tracking-[0.15em] text-muted">Water</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">3.0 L</p>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
          <p className="text-lg font-semibold text-slate-900">Food lookup</p>
          <input
            className="mt-4 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-300"
            placeholder="Search food item (API in Phase 5)"
          />
          <button className="mt-3 w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-strong">
            Search Nutrition
          </button>
        </article>
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
