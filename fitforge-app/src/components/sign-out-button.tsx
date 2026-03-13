"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getSupabaseConfig } from "@/lib/supabase/config";

type SignOutButtonProps = {
  className?: string;
  label?: string;
};

export function SignOutButton({ className, label = "Sign Out" }: SignOutButtonProps) {
  const router = useRouter();
  const supabaseEnabled = Boolean(getSupabaseConfig(false));
  const supabase = useMemo(() => (supabaseEnabled ? createClient() : null), [supabaseEnabled]);
  const [loading, setLoading] = useState(false);

  if (!supabase) {
    return null;
  }

  async function handleSignOut() {
    setLoading(true);

    await supabase.auth.signOut();
    router.push("/auth");
    router.refresh();

    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className={className}
    >
      {loading ? "Signing out..." : label}
    </button>
  );
}
