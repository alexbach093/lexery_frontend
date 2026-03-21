/**
 * OpenRouter API client using the OpenAI SDK with custom baseURL.
 * Use this for server-side LLM calls (API routes, Server Components, Server Actions).
 *
 * @see https://openrouter.ai/docs
 */

import OpenAI from 'openai';

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const DEFAULT_MODEL = 'arcee-ai/trinity-large-preview:free';

function getApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key?.trim()) {
    throw new Error('OPENROUTER_API_KEY is not set. Add it to your .env file. See .env.example.');
  }
  return key.trim();
}

/**
 * Creates an OpenRouter client (OpenAI-compatible).
 * Use in API routes or server code only — OPENROUTER_API_KEY is server-side.
 */
export function createOpenRouterClient(options?: { apiKey?: string; baseURL?: string }): OpenAI {
  return new OpenAI({
    baseURL: options?.baseURL ?? OPENROUTER_BASE_URL,
    apiKey: options?.apiKey ?? getApiKey(),
  });
}

/** Default model for chat completions (free tier example). */
export const OPENROUTER_DEFAULT_MODEL = DEFAULT_MODEL;

/** Lazily-created default client. Use createOpenRouterClient() in tests or when you need a custom key/URL. */
let _defaultClient: OpenAI | null = null;

export function getOpenRouterClient(): OpenAI {
  if (!_defaultClient) _defaultClient = createOpenRouterClient();
  return _defaultClient;
}

/**
 * Helper: create a chat completion using the default model.
 * Override model via the second argument if needed.
 */
export async function createChatCompletion(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  options?: { model?: string }
) {
  const client = createOpenRouterClient();
  return client.chat.completions.create({
    model: options?.model ?? OPENROUTER_DEFAULT_MODEL,
    messages,
  });
}

/**
 * Streaming chat completion: returns an async iterable of content deltas.
 * Use in API route and yield each chunk to the client (SSE).
 */
export function createChatCompletionStream(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  options?: { model?: string; signal?: AbortSignal }
) {
  const client = createOpenRouterClient();
  return client.chat.completions.create(
    {
      model: options?.model ?? OPENROUTER_DEFAULT_MODEL,
      messages,
      stream: true,
    },
    {
      signal: options?.signal,
    }
  );
}
