type OpenRouterChatCompletion = {
  choices?: Array<{
    message?: { content?: string | null };
  }>;
  error?: { message?: string };
};

export async function generateContactReplySuggestion(input: {
  subject: string;
  message: string;
  fromName: string;
}) {
  if (process.env.OPENROUTER_ENABLED !== "true") {
    throw new Error("OpenRouter is disabled (set OPENROUTER_ENABLED=true)");
  }
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const model = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";
  const system = [
    "You write concise, friendly, professional email replies for a personal portfolio website.",
    "Keep it short, clear, and actionable.",
    "Do not mention AI. Do not include sensitive data.",
    "Output only the email body (no subject line).",
  ].join("\n");

  const user = [
    `Sender name: ${input.fromName}`,
    `Subject: ${input.subject}`,
    "Message:",
    input.message,
  ].join("\n");

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost",
      "X-Title": process.env.OPENROUTER_APP_TITLE || "Portfolio admin",
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  const json = (await res.json().catch(() => null)) as OpenRouterChatCompletion | null;
  if (!res.ok) {
    const msg = json?.error?.message || `OpenRouter error (${res.status})`;
    throw new Error(msg);
  }

  const content = json?.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("OpenRouter returned no content");

  return { reply: content, model };
}
