"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type FormMode = "signin" | "signup";

export function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);

  const [mode, setMode] = useState<FormMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const safeNextPath = searchParams.get("next")?.startsWith("/")
    ? searchParams.get("next")
    : "/dashboard";

  const actionLabel = mode === "signin" ? "Sign In" : "Create Account";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      if (mode === "signin") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message);
          return;
        }

        router.push(safeNextPath ?? "/dashboard");
        router.refresh();
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (!data.session) {
        setMessage("Account created. Check your email to confirm before signing in.");
        return;
      }

      router.push("/onboarding");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-6 rounded-3xl border border-line bg-surface p-6 sm:p-8">
      <div className="flex gap-2 rounded-xl border border-line bg-white p-1">
        <button
          className={`w-1/2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
            mode === "signin" ? "bg-slate-900 text-white" : "text-slate-600"
          }`}
          type="button"
          onClick={() => setMode("signin")}
        >
          Sign In
        </button>
        <button
          className={`w-1/2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
            mode === "signup" ? "bg-slate-900 text-white" : "text-slate-600"
          }`}
          type="button"
          onClick={() => setMode("signup")}
        >
          Create Account
        </button>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-300"
            placeholder="you@example.com"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-300"
            placeholder="At least 8 characters"
            type="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
          />
        </div>

        {error ? <p className="text-sm text-rose-700">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-700">{message}</p> : null}

        <button
          className="w-full rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-70"
          type="submit"
          disabled={loading}
        >
          {loading ? "Please wait..." : actionLabel}
        </button>
      </form>
    </section>
  );
}
