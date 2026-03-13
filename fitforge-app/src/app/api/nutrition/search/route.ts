import { NextResponse } from "next/server";

type UsdaFood = {
  fdcId: number;
  description: string;
  brandOwner?: string;
  foodNutrients?: Array<{
    nutrientName?: string;
    value?: number;
    unitName?: string;
  }>;
};

function getNutrientValue(food: UsdaFood, nutrientKeywords: string[]) {
  const nutrient = food.foodNutrients?.find((entry) => {
    const name = entry.nutrientName?.toLowerCase() ?? "";
    return nutrientKeywords.some((keyword) => name.includes(keyword));
  });

  return Number.isFinite(nutrient?.value) ? Number(nutrient?.value) : null;
}

const fallbackFoods = [
  { id: 1, name: "Oats", calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9, brand: "Sample" },
  { id: 2, name: "Banana", calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, brand: "Sample" },
  { id: 3, name: "Greek Yogurt", calories: 59, protein: 10.0, carbs: 3.6, fat: 0.4, brand: "Sample" },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json({ foods: [] });
  }

  const usdaKey = process.env.USDA_API_KEY ?? "DEMO_KEY";

  try {
    const endpoint = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${encodeURIComponent(usdaKey)}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        pageSize: 8,
        dataType: ["Foundation", "SR Legacy", "Branded"],
        sortBy: "dataType.keyword",
        sortOrder: "asc",
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ foods: fallbackFoods, source: "fallback" });
    }

    const data = (await response.json()) as { foods?: UsdaFood[] };

    const foods =
      data.foods?.slice(0, 8).map((food) => ({
        id: food.fdcId,
        name: food.description,
        brand: food.brandOwner ?? "USDA",
        calories: getNutrientValue(food, ["energy"]),
        protein: getNutrientValue(food, ["protein"]),
        carbs: getNutrientValue(food, ["carbohydrate"]),
        fat: getNutrientValue(food, ["total lipid", "fat"]),
      })) ?? [];

    return NextResponse.json({ foods, source: "usda" });
  } catch {
    return NextResponse.json({ foods: fallbackFoods, source: "fallback" });
  }
}
