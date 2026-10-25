/**
 * Anthropic Claude Provider Adapter with Tool Calling Support
 */

import { sanitizeAIResponse } from "../sanitizer.js";

const DEFAULT_MODEL = "claude-3-5-sonnet-20241022";

export async function callAnthropic({
  apiKey,
  model = DEFAULT_MODEL,
  messages = [],
  tools = [],
  temperature = 0.2,
}) {
  const key = apiKey || process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error("Anthropic API key is not configured. Please supply an Anthropic API Key in Settings or set ANTHROPIC_API_KEY in environment.");
  }

  // Extract system message
  let systemPrompt = "";
  const anthropicMessages = [];

  for (const msg of messages) {
    if (msg.role === "system") {
      systemPrompt += (systemPrompt ? "\n\n" : "") + msg.content;
    } else {
      anthropicMessages.push({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content || "",
      });
    }
  }

  const payload = {
    model: model || DEFAULT_MODEL,
    max_tokens: 2048,
    temperature,
    messages: anthropicMessages,
  };

  if (systemPrompt) {
    payload.system = systemPrompt;
  }

  if (tools && tools.length > 0) {
    payload.tools = tools.map((t) => ({
      name: t.name,
      description: t.description,
      input_schema: t.parameters || { type: "object", properties: {} },
    }));
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorJson;
    try {
      errorJson = JSON.parse(errorText);
    } catch {}
    throw new Error(errorJson?.error?.message || `Anthropic API returned ${response.status}: ${errorText.substring(0, 150)}`);
  }

  const data = await response.json();
  const contentBlocks = data.content || [];

  let textContent = "";
  const toolCalls = [];

  for (const block of contentBlocks) {
    if (block.type === "text") {
      textContent += block.text;
    } else if (block.type === "tool_use") {
      toolCalls.push({
        id: block.id,
        name: block.name,
        arguments: block.input || {},
      });
    }
  }

  return {
    content: sanitizeAIResponse(textContent),
    toolCalls,
    rawMessage: data,
    usage: data.usage,
    model: data.model,
  };
}
