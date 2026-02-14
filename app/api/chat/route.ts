import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  const { message, mode } = await req.json();

  const systemPrompt =
    mode === "code"
      ? "You are a senior expert software engineer."
      : "You are a powerful AI assistant.";

  const fullMessage = `${systemPrompt}\n\n${message}`;

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return new Response("Missing GEMINI_API_KEY", { status: 500 });
  }

  const client = new GoogleGenAI({ apiKey });

  const result = await client.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [{ text: fullMessage }],
      },
    ],
  });

  const text =
    result?.candidates?.[0]?.content?.parts
      ?.map((p: any) => p.text ?? "")
      .join("") ?? "";

  return new Response(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
