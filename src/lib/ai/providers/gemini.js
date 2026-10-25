/**
 * Google Gemini Provider Adapter with Automatic Dynamic Model Discovery & Multi-Version Fallback
 */

import { sanitizeAIResponse } from "../sanitizer.js";

let cachedWorkingModel = null;

async function listGeminiModels(apiKey) {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (res.ok) {
      const data = await res.json();
      const models = (data.models || [])
        .filter((m) => (m.supportedGenerationMethods || []).includes("generateContent"))
        .map((m) => m.name.replace(/^models\//, ""));
      return models;
    }
  } catch {}

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
    if (res.ok) {
      const data = await res.json();
      const models = (data.models || [])
        .filter((m) => (m.supportedGenerationMethods || []).includes("generateContent"))
        .map((m) => m.name.replace(/^models\//, ""));
      return models;
    }
  } catch {}

  return [];
}

async function doGeminiFetch({ apiKey, cleanModel, payload, apiVersion = "v1beta" }) {
  const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${cleanModel}:generateContent?key=${apiKey}`;
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function callGemini({
  apiKey,
  model = "gemini-2.5-flash",
  messages = [],
  tools = [],
  temperature = 0.2,
}) {
  const rawKey = apiKey || process.env.GEMINI_API_KEY;
  if (!rawKey) {
    throw new Error("Gemini API key is not configured. Please supply a Gemini API Key in Settings or set GEMINI_API_KEY in environment.");
  }
  const key = rawKey.trim();

  // Convert standard chat messages to Gemini contents format
  let systemInstruction = null;
  const contents = [];

  for (const msg of messages) {
    if (msg.role === "system") {
      systemInstruction = {
        parts: [{ text: msg.content }],
      };
    } else if (msg.role === "user") {
      contents.push({
        role: "user",
        parts: [{ text: msg.content }],
      });
    } else if (msg.role === "assistant") {
      contents.push({
        role: "model",
        parts: [{ text: msg.content || "" }],
      });
    }
  }

  const payload = {
    contents,
    generationConfig: {
      temperature,
    },
  };

  if (systemInstruction) {
    payload.systemInstruction = systemInstruction;
  }

  if (tools && tools.length > 0) {
    payload.tools = [
      {
        functionDeclarations: tools.map((t) => ({
          name: t.name,
          description: t.description,
          parameters: t.parameters || { type: "OBJECT", properties: {} },
        })),
      },
    ];
  }

  // Candidate models to try in order
  const userRequested = (model || "").replace(/^google\//, "").trim();
  const candidateModels = [
    cachedWorkingModel,
    userRequested,
    "gemini-2.5-flash",
    "gemini-flash-latest",
    "gemini-2.5-pro",
    "gemini-3.5-flash",
    "gemini-pro-latest",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
  ].filter(Boolean);

  // Remove duplicates while preserving order
  const uniqueCandidates = Array.from(new Set(candidateModels));

  let response = null;
  let activeModelUsed = uniqueCandidates[0];
  let lastErrorText = "";

  // 1. Try candidate list across v1beta and v1
  for (const candidate of uniqueCandidates) {
    for (const version of ["v1beta", "v1"]) {
      try {
        const res = await doGeminiFetch({ apiKey: key, cleanModel: candidate, payload, apiVersion: version });
        if (res.ok) {
          response = res;
          activeModelUsed = candidate;
          cachedWorkingModel = candidate;
          break;
        } else {
          lastErrorText = await res.text();
        }
      } catch (fetchErr) {
        lastErrorText = fetchErr.message;
      }
    }
    if (response) break;
  }

  // 2. If all static candidates failed, query the user's API Key ModelService for actual active models
  if (!response) {
    const liveAvailableModels = await listGeminiModels(key);
    if (liveAvailableModels.length > 0) {
      for (const liveModel of liveAvailableModels) {
        try {
          const res = await doGeminiFetch({ apiKey: key, cleanModel: liveModel, payload, apiVersion: "v1beta" });
          if (res.ok) {
            response = res;
            activeModelUsed = liveModel;
            cachedWorkingModel = liveModel;
            break;
          }
        } catch {}
      }
    }
  }

  if (!response || !response.ok) {
    let errorJson;
    try {
      errorJson = JSON.parse(lastErrorText);
    } catch {}
    throw new Error(errorJson?.error?.message || `Gemini API returned error: ${lastErrorText.substring(0, 200)}`);
  }

  const data = await response.json();
  const candidate = data.candidates?.[0];
  const parts = candidate?.content?.parts || [];

  let textContent = "";
  const toolCalls = [];

  for (const part of parts) {
    // Ignore internal thinking parts from Gemini 2.0 / 2.5 thinking models
    if (part.text && !part.thought) {
      textContent += part.text;
    }
    if (part.functionCall) {
      toolCalls.push({
        id: `call_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: part.functionCall.name,
        arguments: part.functionCall.args || {},
      });
    }
  }

  // Sanitize text content to remove any leaked reasoning or tags
  const sanitizedContent = sanitizeAIResponse(textContent);

  return {
    content: sanitizedContent,
    toolCalls,
    rawMessage: candidate?.content,
    usage: data.usageMetadata,
    model: activeModelUsed,
  };
}


