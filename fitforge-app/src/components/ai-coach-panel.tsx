"use client";

import { useState } from "react";

type CoachMessage = {
  role: "user" | "assistant";
  content: string;
};

type AiCoachPanelProps = {
  goalLabel: string;
};

export function AiCoachPanel({ goalLabel }: AiCoachPanelProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<CoachMessage[]>([
    {
      role: "assistant",
      content: "I am your FitForge coach. Ask for workout tweaks, recovery tips, or form cues.",
    },
  ]);

  async function askCoach(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = input.trim();

    if (!trimmed || loading) {
      return;
    }

    setLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");

    try {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: trimmed, goal: goalLabel }),
      });

      const data = (await response.json()) as { reply?: string };

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply ?? "I could not generate a response just now. Try again.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Network issue right now. Retry in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-800">AI Coach</p>
        <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
          Goal: {goalLabel}
        </span>
      </div>

      <div className="mt-4 max-h-64 space-y-3 overflow-y-auto rounded-xl border border-line bg-white p-3">
        {messages.map((message, index) => (
          <article
            key={`${message.role}-${index}`}
            className={`rounded-lg px-3 py-2 text-sm ${
              message.role === "assistant" ? "bg-slate-100 text-slate-700" : "bg-orange-50 text-orange-900"
            }`}
          >
            {message.content}
          </article>
        ))}
      </div>

      <form className="mt-3 flex gap-2" onSubmit={askCoach}>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask: how should I improve squat form?"
          className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none transition focus:border-orange-300"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-strong disabled:opacity-70"
        >
          {loading ? "Sending" : "Ask"}
        </button>
      </form>
    </section>
  );
}
