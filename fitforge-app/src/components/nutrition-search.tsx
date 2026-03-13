"use client";

import { useState } from "react";

type NutritionItem = {
  id: number;
  name: string;
  brand: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
};

function formatNumber(value: number | null, suffix: string) {
  return value === null ? "-" : `${value.toFixed(1)} ${suffix}`;
}

export function NutritionSearch() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<"usda" | "fallback" | null>(null);
  const [results, setResults] = useState<NutritionItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function runSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = query.trim();

    if (!trimmed || loading) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/nutrition/search?q=${encodeURIComponent(trimmed)}`);

      if (!response.ok) {
        throw new Error("Search failed.");
      }

      const data = (await response.json()) as {
        foods?: NutritionItem[];
        source?: "usda" | "fallback";
      };

      setResults(data.foods ?? []);
      setSource(data.source ?? null);
    } catch {
      setError("Unable to search right now.");
      setResults([]);
      setSource(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <p className="text-lg font-semibold text-slate-900">Food lookup</p>

      <form className="mt-4 flex flex-col gap-3" onSubmit={runSearch}>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-300"
          placeholder="Search food item (example: chicken breast)"
        />
        <button
          type="submit"
          className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-strong disabled:opacity-70"
          disabled={loading}
        >
          {loading ? "Searching..." : "Search Nutrition"}
        </button>
      </form>

      {source ? (
        <p className="mt-3 text-xs text-muted">
          Source: {source === "usda" ? "USDA FoodData Central" : "Fallback sample dataset"}
        </p>
      ) : null}

      {error ? <p className="mt-3 text-sm text-rose-700">{error}</p> : null}

      <div className="mt-4 space-y-3">
        {results.map((item) => (
          <article key={item.id} className="rounded-xl border border-line bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-slate-900">{item.name}</p>
              <span className="text-xs text-muted">{item.brand}</span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-700 sm:grid-cols-4">
              <p>Cal: {formatNumber(item.calories, "kcal")}</p>
              <p>Protein: {formatNumber(item.protein, "g")}</p>
              <p>Carbs: {formatNumber(item.carbs, "g")}</p>
              <p>Fat: {formatNumber(item.fat, "g")}</p>
            </div>
          </article>
        ))}

        {!results.length && !loading ? (
          <p className="text-sm text-muted">Search any food to view calories and macros.</p>
        ) : null}
      </div>
    </section>
  );
}
