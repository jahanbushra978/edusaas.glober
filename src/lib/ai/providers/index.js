import { callOpenRouter } from "./openrouter.js";
import { callOpenAI } from "./openai.js";
import { callGemini } from "./gemini.js";
import { callAnthropic } from "./anthropic.js";


export const SUPPORTED_PROVIDERS = [
  {
    id: "openrouter",
    name: "OpenRouter (Multi-Model Hub)",
    description: "Free & premium open-weights and commercial models (Llama, DeepSeek, Gemini, etc.)",
    requiresApiKey: false, // Can fall back to central server key
    models: [
      { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Llama 3.3 70B (Free)", isToolCapable: true, badge: "Recommended Free" },
      { id: "google/gemini-2.0-flash-exp:free", name: "Gemini 2.0 Flash (Free)", isToolCapable: true, badge: "Fast Free" },
      { id: "deepseek/deepseek-chat", name: "DeepSeek V3", isToolCapable: true, badge: "Popular" },
      { id: "deepseek/deepseek-r1", name: "DeepSeek R1", isToolCapable: true, badge: "Reasoning" },
      { id: "openai/gpt-4o-mini", name: "GPT-4o Mini", isToolCapable: true },
      { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet", isToolCapable: true },
    ],
  },
  {
    id: "gemini",
    name: "Google Gemini",
    description: "Google AI Direct Key (Gemini 2.5 / Flash Latest)",
    requiresApiKey: true,
    models: [
      { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", isToolCapable: true, badge: "Recommended Free" },
      { id: "gemini-flash-latest", name: "Gemini Flash Latest", isToolCapable: true, badge: "Ultra Fast" },
      { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", isToolCapable: true, badge: "Smart" },
      { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash", isToolCapable: true },
    ],
  },
  {
    id: "openai",
    name: "OpenAI",
    description: "Direct OpenAI API key (GPT-4o, GPT-4o-mini)",
    requiresApiKey: true,
    models: [
      { id: "gpt-4o-mini", name: "GPT-4o Mini", isToolCapable: true, badge: "Efficient" },
      { id: "gpt-4o", name: "GPT-4o", isToolCapable: true, badge: "Flagship" },
      { id: "o3-mini", name: "o3 Mini", isToolCapable: false },
    ],
  },
  {
    id: "groq",
    name: "Groq (Lightning Fast)",
    description: "Groq Cloud API Key with high-speed Llama & DeepSeek inference",
    requiresApiKey: true,
    models: [
      { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B Versatile", isToolCapable: true, badge: "Ultra Fast" },
      { id: "deepseek-r1-distill-llama-70b", name: "DeepSeek R1 Distill 70B", isToolCapable: true, badge: "Reasoning" },
      { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B", isToolCapable: true },
    ],
  },
  {
    id: "deepseek",
    name: "DeepSeek (Direct API)",
    description: "Direct DeepSeek API key (deepseek.com)",
    requiresApiKey: true,
    models: [
      { id: "deepseek-chat", name: "DeepSeek V3 (Chat)", isToolCapable: true, badge: "Popular" },
      { id: "deepseek-reasoner", name: "DeepSeek R1 (Reasoner)", isToolCapable: true, badge: "Smart" },
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic Claude",
    description: "Direct Anthropic Claude API key",
    requiresApiKey: true,
    models: [
      { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet", isToolCapable: true, badge: "Top Tier" },
      { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku", isToolCapable: true, badge: "Ultra Fast" },
    ],
  },
  {
    id: "custom",
    name: "Custom / Any OpenAI-Compatible API",
    description: "Connect to ANY AI provider, local Ollama, Together, Mistral, or custom proxy",
    requiresApiKey: true,
    allowsCustomUrl: true,
    models: [
      { id: "custom-model", name: "Custom Model (Type below)", isToolCapable: true },
    ],
  },
];

/**
 * AI Provider Factory
 */
export async function executeAICompletion({
  provider = "openrouter",
  apiKey,
  model,
  baseUrl,
  messages = [],
  tools = [],
  temperature = 0.2,
}) {
  switch (provider) {
    case "gemini":
      return callGemini({ apiKey, model, messages, tools, temperature });
    case "groq":
      return callOpenAI({
        apiKey,
        model: model || "llama-3.3-70b-versatile",
        messages,
        tools,
        temperature,
        baseUrl: "https://api.groq.com/openai/v1",
      });
    case "deepseek":
      return callOpenAI({
        apiKey,
        model: model || "deepseek-chat",
        messages,
        tools,
        temperature,
        baseUrl: "https://api.deepseek.com/v1",
      });
    case "custom":
      return callOpenAI({
        apiKey,
        model: model || "default",
        messages,
        tools,
        temperature,
        baseUrl: baseUrl || "https://api.openai.com/v1",
      });
    case "openai":
      return callOpenAI({ apiKey, model, messages, tools, temperature });
    case "anthropic":
      return callAnthropic({ apiKey, model, messages, tools, temperature });
    case "openrouter":
    default:
      return callOpenRouter({ apiKey, model, messages, tools, temperature });
  }
}
