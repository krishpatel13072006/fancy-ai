export const runtime = "nodejs";

import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.A4F_API_KEY!,
  baseURL: "https://api.a4f.co/v1",
});

const MODELS = [
  "provider-4/flux-2-klein-4b",
  "provider-4/sdxl-lite",
  "provider-2/nvidia-nemotron-3-nano-30b-a3b-bf16"
];

export async function POST(req: Request) {
  try {
    const { prompt, size = "1024x1024" } = await req.json();

    // Debug: Check if API key is loaded
    console.log("API KEY EXISTS:", !!process.env.A4F_API_KEY);
    console.log("API KEY VALUE:", process.env.A4F_API_KEY?.substring(0, 10) + "...");

    let lastError = null;
    
    // Try each model in order
    for (const model of MODELS) {
      console.log(`Trying model: ${model}`);
      
      try {
        const response = await fetch("https://api.a4f.co/v1/images/generations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.A4F_API_KEY}`,
          },
          body: JSON.stringify({
            model: model,
            prompt,
            size,
          }),
        });

        const data = await response.json();
        console.log(`Model ${model} response:`, JSON.stringify(data, null, 2));

        if (!response.ok) {
          lastError = data;
          console.log(`Model ${model} failed, trying next...`);
          continue;
        }

        const imageUrl = data?.data?.[0]?.url;

        if (!imageUrl) {
          lastError = data;
          console.log(`Model ${model} returned no image URL, trying next...`);
          continue;
        }

        // Success!
        return Response.json({ 
          imageUrl,
          model: model 
        });

      } catch (modelError) {
        console.log(`Model ${model} error:`, modelError);
        lastError = modelError;
        continue;
      }
    }

    // All models failed
    return Response.json(
      { error: "All models failed", details: lastError },
      { status: 500 }
    );

  } catch (error: any) {
    console.error("SERVER ERROR:", error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
