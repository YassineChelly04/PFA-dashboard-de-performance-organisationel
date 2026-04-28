type GroqMessage = {
  role: "system" | "user";
  content: string;
};

type GroqChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
};

type GenerateGroqTextInput = {
  apiKey: string;
  model: string;
  messages: GroqMessage[];
  temperature?: number;
  maxTokens?: number;
};

export async function generateGroqText({
  apiKey,
  model,
  messages,
  temperature = 0.2,
  maxTokens = 1200,
}: GenerateGroqTextInput): Promise<string> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature,
      max_tokens: maxTokens,
      messages,
    }),
  });

  const payload = (await response.json()) as GroqChatCompletionResponse;

  if (!response.ok) {
    const errorMessage = payload.error?.message ?? "Unknown Groq API error";
    throw new Error(`Groq API error (${response.status}): ${errorMessage}`);
  }

  const content = payload.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("Groq API returned an empty report.");
  }

  return content;
}

