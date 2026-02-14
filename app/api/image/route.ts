export async function POST(req: Request) {
  let prompt: string;
  try {
    const body = await req.json();
    prompt = body?.prompt ?? body?.message ?? "";
  } catch {
    return Response.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  if (!prompt || typeof prompt !== "string") {
    return Response.json(
      { error: "Missing or invalid prompt" },
      { status: 400 }
    );
  }

  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return Response.json(
      { error: "Missing OPENROUTER_API_KEY environment variable" },
      { status: 500 }
    );
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_IMAGE_MODEL || "sourceful/riverflow-v2-fast-preview",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      modalities: ["image"],
    }),
  });

  const rawText = await response.text();
  let result: Record<string, unknown>;
  try {
    result = JSON.parse(rawText);
  } catch {
    return Response.json(
      { error: `OpenRouter API error (${response.status}): Invalid JSON response` },
      { status: 500 }
    );
  }

  if (!response.ok) {
    const errMsg =
      (result as { error?: { message?: string } })?.error?.message ?? rawText;
    return Response.json(
      { error: `OpenRouter API error (${response.status}): ${errMsg}` },
      { status: 500 }
    );
  }

  const msg = (result as { choices?: Array<{ message?: Record<string, unknown> }> })
    ?.choices?.[0]?.message;

  if (!msg) {
    return Response.json(
      { error: "No message in OpenRouter response" },
      { status: 500 }
    );
  }

  let imageUrl: string | undefined;

  const images = msg.images as Array<{ image_url?: { url?: string } | string }> | undefined;
  if (images?.length) {
    const first = images[0];
    if (typeof first?.image_url === "string") {
      imageUrl = first.image_url;
    } else if (first?.image_url?.url) {
      imageUrl = first.image_url.url;
    }
  }

  const content = msg.content as Array<{ type?: string; image_url?: { url?: string }; imageUrl?: { url?: string } }> | undefined;
  if (!imageUrl && Array.isArray(content)) {
    const imgPart = content.find(
      (p) => p?.type === "image_url" || p?.image_url || p?.imageUrl
    );
    if (imgPart) {
      imageUrl = imgPart?.image_url?.url ?? imgPart?.imageUrl?.url;
    }
  }

  if (!imageUrl || typeof imageUrl !== "string") {
    return Response.json(
      { error: "No image in response" },
      { status: 500 }
    );
  }

  return Response.json({
    image: imageUrl,
  });
}
