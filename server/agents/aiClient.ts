import OpenAI from "openai";

// ─── Configurable AI Backend ─────────────────────────────────────────────────
// Set AI_BASE_URL to point to Ollama, LocalAI, LM Studio, vLLM, etc.
// Defaults to OpenAI if not set.
//
// Examples:
//   Ollama:   AI_BASE_URL=http://localhost:11434/v1  AI_MODEL=llama3.2:3b
//   LocalAI:  AI_BASE_URL=http://localhost:8080/v1   AI_MODEL=mistral-7b-instruct
//   OpenAI:   (no AI_BASE_URL needed)                AI_MODEL=gpt-4o-mini
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";

/** Whether we're using a local/custom AI backend (Ollama, LocalAI, etc.) */
export const isLocalAI = !!process.env.AI_BASE_URL;

/** The model to use for completions */
export const aiModel: string = process.env.AI_MODEL || (isLocalAI ? "llama3.2:3b" : DEFAULT_OPENAI_MODEL);

/** Human-readable backend name for logging */
export const aiBackendName: string = isLocalAI
  ? `Local AI (${process.env.AI_BASE_URL})`
  : "OpenAI";

/** Create a configured OpenAI-compatible client */
export function createAIClient(): OpenAI {
  if (isLocalAI) {
    return new OpenAI({
      baseURL: process.env.AI_BASE_URL,
      apiKey: process.env.AI_API_KEY || "ollama", // Ollama doesn't need a real key
    });
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

/**
 * Extract JSON from a model response that may be wrapped in markdown fences
 * or contain extra text around the JSON.
 */
export function extractJSON(text: string): string {
  // Try to extract from markdown code fences first
  const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (fenceMatch) return fenceMatch[1].trim();

  // Try to find a JSON object or array
  const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (jsonMatch) return jsonMatch[1].trim();

  // Return as-is and let JSON.parse handle it
  return text.trim();
}

/**
 * Build chat completion options, adapting for local vs cloud models.
 * Local models: no response_format (unreliable), lower max_tokens, explicit JSON instructions.
 * Cloud models: use response_format: json_object for reliable structured output.
 */
export function completionOptions(opts: {
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
  json?: boolean;
  temperature?: number;
  maxTokens?: number;
}): OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming {
  const base: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming = {
    model: aiModel,
    messages: opts.messages,
    temperature: opts.temperature ?? (isLocalAI ? 0.3 : 0.7),
    max_tokens: opts.maxTokens ?? (isLocalAI ? 2000 : 1500),
  };

  // Only use response_format for OpenAI — local models often don't support it
  if (opts.json && !isLocalAI) {
    base.response_format = { type: "json_object" };
  }

  return base;
}
