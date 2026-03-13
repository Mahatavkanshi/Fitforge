import { NextResponse } from "next/server";

type CoachRequestBody = {
  message?: string;
  goal?: string;
};

const fallbackReply =
  "Great consistency beats intensity. For your next session, do a 6-minute warmup, 3 controlled squat sets, and finish with 5 minutes of mobility.";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as CoachRequestBody;
  const message = body.message?.trim();

  if (!message) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  const groqKey = process.env.GROQ_API_KEY;

  if (!groqKey) {
    return NextResponse.json({ reply: fallbackReply, source: "fallback" });
  }

  try {
    const completionResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        temperature: 0.4,
        max_tokens: 280,
        messages: [
          {
            role: "system",
            content:
              "You are FitForge Coach. Give concise, practical fitness guidance with safe form cues. Avoid medical diagnosis. Keep response under 120 words.",
          },
          {
            role: "user",
            content: `User goal: ${body.goal ?? "general fitness"}. Question: ${message}`,
          },
        ],
      }),
    });

    if (!completionResponse.ok) {
      return NextResponse.json({ reply: fallbackReply, source: "fallback" });
    }

    const data = (await completionResponse.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const reply = data.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return NextResponse.json({ reply: fallbackReply, source: "fallback" });
    }

    return NextResponse.json({ reply, source: "groq" });
  } catch {
    return NextResponse.json({ reply: fallbackReply, source: "fallback" });
  }
}
