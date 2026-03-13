type SupabaseConfig = {
  url: string;
  anonKey: string;
};

function isHttpUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function getSupabaseConfig(): SupabaseConfig;
export function getSupabaseConfig(strict: true): SupabaseConfig;
export function getSupabaseConfig(strict: false): SupabaseConfig | null;
export function getSupabaseConfig(strict = true): SupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey || !isHttpUrl(url)) {
    if (strict) {
      throw new Error(
        "Missing or invalid Supabase env variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      );
    }

    return null;
  }

  return { url, anonKey };
}
