import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  const { message, mode } = await req.json();

  const systemPrompt =
    mode === "code"
      ? "You are a senior expert software engineer."
      : "You are a powerful AI assistant.";

  const fullMessage = `${systemPrompt}\n\n${message}`;

  // Primary API: Gemini
  const primaryApiKey = process.env.GEMINI_API_KEY;
  
  // A4F API for backup
  const a4fApiKey = process.env.A4F_API_KEY;
  const a4fBaseUrl = "https://api.a4f.co/v1";
  
  // Backup models - NVIDIA as primary, then OpenRouter
  const backupModels = [
    "provider-2/nvidia-nemotron-3-nano-30b-a3b-bf16",
    "openrouter/aurora-alpha"
  ];

  // Try primary Gemini API first
  try {
    if (!primaryApiKey) {
      throw new Error("Missing GEMINI_API_KEY");
    }

    const client = new GoogleGenAI({ apiKey: primaryApiKey });

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
  } catch (primaryError) {
    console.log("Primary Gemini API failed, trying A4F NVIDIA model:", primaryError);
    
    // Try A4F API with NVIDIA model
    try {
      if (!a4fApiKey) {
        throw new Error("Missing A4F_API_KEY");
      }

      const response = await fetch(`${a4fBaseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${a4fApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": backupModels[0], // provider-2/nvidia-nemotron-3-nano-30b-a3b-bf16
          "messages": [
            {
              "role": "user",
              "content": fullMessage
            }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`A4F API error (${response.status}): ${errorText}`);
      }

      const result = await response.json();
      const assistantMessage = result.choices?.[0]?.message;
      
      if (!assistantMessage) {
        throw new Error("No message in A4F response");
      }

      return new Response(assistantMessage.content || "", {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    } catch (a4fError) {
      console.log("A4F NVIDIA model failed, trying OpenRouter:", a4fError);
      
      // Try OpenRouter as final backup
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer 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`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            "model": backupModels[1],
            "messages": [
              {
                "role": "user",
                "content": fullMessage
              }
            ],
            "reasoning": { "enabled": true }
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
        }

        const result = await response.json();
        const assistantMessage = result.choices?.[0]?.message;
        
        if (!assistantMessage) {
          throw new Error("No message in OpenRouter response");
        }

        // Include reasoning if available
        let text = assistantMessage.content || "";
        if (assistantMessage.reasoning_details) {
          text = `*[Reasoning] ${assistantMessage.reasoning_details}*\n\n${text}`;
        }

        return new Response(text, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
          },
        });
      } catch (backupError) {
        console.log("All backup APIs failed:", backupError);
        const errorMessage = primaryError instanceof Error ? primaryError.message : "Unknown error";
        return new Response(`Chat failed. Primary error: ${errorMessage}. All backups also failed.`, { 
          status: 500,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
          },
        });
      }
    }
  }
}
