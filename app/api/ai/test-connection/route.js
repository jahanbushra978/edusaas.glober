import { NextResponse } from "next/server";
import { executeAICompletion } from "../../../../src/lib/ai/providers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const { provider = "openrouter", apiKey, model, baseUrl } = body;

    const testKey = apiKey || process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY || process.env.DEEPSEEK_API_KEY;

    if (!testKey) {
      return NextResponse.json({ ok: false, message: "API key is required for testing." }, { status: 400 });
    }

    // Ping the provider with a tiny test message
    const res = await executeAICompletion({
      provider,
      apiKey: testKey,
      model,
      baseUrl,
      messages: [{ role: "user", content: "Reply with exactly: 'OK'" }],
      temperature: 0.1,
    });

    return NextResponse.json({
      ok: true,
      message: `Connection successful with ${provider.toUpperCase()} (${res.model || model || "ready"}).`,
      model: res.model,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, message: err?.message || "Failed to connect to AI provider." },
      { status: 400 }
    );
  }
}
