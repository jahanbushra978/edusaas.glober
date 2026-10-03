/**
 * OpenRouter AI Provider Adapter with Tool Calling Support
 */

import { sanitizeAIResponse } from "../sanitizer";

const DEFAULT_MODEL = "meta-llama/llama-3.3-70b-instruct:free";

export async function callOpenRouter({
  apiKey,
  model = DEFAULT_MODEL,
  messages = [],
  tools = [],
  temperature = 0.2,
}) {
  const rawKey = apiKey || process.env.OPENROUTER_API_KEY;
  if (!rawKey) {
    throw new Error("OpenRouter API key is not configured. Please add OPENROUTER_API_KEY to environment or configure BYOK in AI Settings.");
  }
  const key = rawKey.trim();

  const payload = {
    model: model || DEFAULT_MODEL,
    messages,
    temperature,
  };

  if (tools && tools.length > 0) {
    payload.tools = tools.map((t) => ({
      type: "function",
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters || { type: "object", properties: {} },
      },
    }));
    payload.tool_choice = "auto";
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      "HTTP-Referer": "https://rahmaniainstitute.org",
      "X-Title": "Rahmania ERP AI Assistant",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorJson;
    try {
      errorJson = JSON.parse(errorText);
    } catch {}
    throw new Error(errorJson?.error?.message || `OpenRouter API returned ${response.status}: ${errorText.substring(0, 150)}`);
  }

  const data = await response.json();
  const choice = data.choices?.[0];
  const message = choice?.message || {};

  return {
    content: sanitizeAIResponse(message.content || ""),
    toolCalls: (message.tool_calls || []).map((tc) => ({
      id: tc.id,
      name: tc.function?.name,
      arguments: typeof tc.function?.arguments === "string" ? JSON.parse(tc.function?.arguments || "{}") : tc.function?.arguments,
    })),
    rawMessage: message,
    usage: data.usage,
    model: data.model,
  };
}
