type SupabaseConfig = {
  url: string;
  anonKey: string;
};

export function getSupabaseConfig(): SupabaseConfig;
export function getSupabaseConfig(strict: true): SupabaseConfig;
export function getSupabaseConfig(strict: false): SupabaseConfig | null;
export function getSupabaseConfig(strict = true): SupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    if (strict) {
      throw new Error(
        "Missing Supabase env variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      );
    }

    return null;
  }

  return { url, anonKey };
}
