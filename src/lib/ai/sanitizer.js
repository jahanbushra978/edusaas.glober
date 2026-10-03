/**
 * AI Response Sanitizer
 * Strips internal thoughts, CoT reasoning tags, planning echoes, and normalizes output across all LLMs.
 */

export function sanitizeAIResponse(rawText) {
  if (!rawText || typeof rawText !== "string") return "";

  let cleaned = rawText;

  // 1. Remove XML/HTML style reasoning & thought tags (DeepSeek R1, Qwen, Gemini, etc.)
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, "");
  cleaned = cleaned.replace(/<thought>[\s\S]*?<\/thought>/gi, "");
  cleaned = cleaned.replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, "");
  cleaned = cleaned.replace(/```thought[\s\S]*?```/gi, "");
  cleaned = cleaned.replace(/```thinking[\s\S]*?```/gi, "");

  // 2. Remove leaked chain-of-thought planning preambles
  cleaned = cleaned.replace(
    /^\s*(?:The user (?:said|asked|is|greeted)|User intent:|Context:|System instructions state:)[\s\S]*?(?:Plan:[\s\S]*?(?=\n(?:Assalamu|আসসালামু|হ্যালো|Hello|Hi|শুভ|স্বাগতম|শ্রদ্ধেয়|সম্মানিত|Rahmania|রহমানিয়া|বিসমিল্লাহ|Dear)|(?:\n\n|\r\n\r\n)))/i,
    ""
  );

  // 3. Remove standalone "Thinking Process: ..." or "Plan: ..." headers at the very start
  cleaned = cleaned.replace(/^\s*(?:Thinking Process|Reasoning|Internal Plan):\s*[\s\S]*?(?:\n\n|\r\n\r\n)/i, "");
  cleaned = cleaned.replace(/^\s*Plan:\s*(?:[^\n]+\n){1,6}(?:\n|\r\n)/i, "");

  return cleaned.trim();
}
