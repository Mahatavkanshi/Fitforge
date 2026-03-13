"use client";

import { useEffect, useMemo, useState } from "react";
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
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        setHasSession(Boolean(data.session));
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(Boolean(session));
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  if (!supabase || !hasSession) {
    return null;
  }

  async function handleSignOut() {
    if (!supabase) {
      return;
    }

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
