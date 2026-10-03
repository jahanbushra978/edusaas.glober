/**
 * OpenAI Provider Adapter with Function / Tool Calling Support
 */

import { sanitizeAIResponse } from "../sanitizer";

const DEFAULT_MODEL = "gpt-4o-mini";

export async function callOpenAI({
  apiKey,
  model = DEFAULT_MODEL,
  messages = [],
  tools = [],
  temperature = 0.2,
  baseUrl = "https://api.openai.com/v1",
}) {
  const rawKey = apiKey || process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY || process.env.DEEPSEEK_API_KEY;
  if (!rawKey) {
    throw new Error("API key is not configured. Please supply an API Key in Settings or set it in your environment.");
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

  let cleanBaseUrl = (baseUrl || "").trim();
  if (!cleanBaseUrl || (!cleanBaseUrl.startsWith("http://") && !cleanBaseUrl.startsWith("https://"))) {
    cleanBaseUrl = "https://api.openai.com/v1";
  }
  cleanBaseUrl = cleanBaseUrl.replace(/\/+$/, "");
  const endpoint = cleanBaseUrl.endsWith("/chat/completions") ? cleanBaseUrl : `${cleanBaseUrl}/chat/completions`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorJson;
    try {
      errorJson = JSON.parse(errorText);
    } catch {}
    throw new Error(errorJson?.error?.message || `OpenAI API returned ${response.status}: ${errorText.substring(0, 150)}`);
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
