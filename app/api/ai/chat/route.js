import { NextResponse } from "next/server";
import { resolveAuthContext } from "../../../../src/lib/ai/auth-context";
import { checkAIRateLimit } from "../../../../src/lib/ai/rate-limiter";
import { executeAICompletion } from "../../../../src/lib/ai/providers";
import { getAvailableToolsForContext, executeAITool } from "../../../../src/lib/ai/tools";
import { verifyCsrfOrigin } from "../../../../src/lib/security";
import { RAHMANIA_INSTITUTE_KNOWLEDGE, OFFICIAL_FALLBACK_CONTACT_MESSAGE } from "../../../../src/lib/ai/knowledge";
import { sanitizeAIResponse } from "../../../../src/lib/ai/sanitizer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function buildSystemPrompt(authContext) {
  const { role, isSuperAdmin, scope, user } = authContext;
  const userName = user?.name_bn || user?.name || "সম্মানিত অতিথি";
  const branchName = scope.branchName || (isSuperAdmin ? "Central Super Administration" : "Assigned Branch");

  return `You are the official proprietary AI Assistant (রহমানিয়া ইনস্টিটিউট এআই সহকারী) built exclusively for Rahmania Institute (রহমানিয়া ইনস্টিটিউট), Harinal, Gazipur City.
Your mission is to provide helpful, respectful, islamic-ethical, and strictly accurate operational and public support in Bengali (বাংলা) and English.

${RAHMANIA_INSTITUTE_KNOWLEDGE}

CURRENT USER CONTEXT:
- Name: ${userName}
- Role: ${role} (${authContext.isAuthenticated ? (isSuperAdmin ? "Super Admin" : "Scoped ERP User") : "Public Visitor / Guest"})
- Branch Scope: ${branchName}
${role === "student" ? `- Student ID: ${scope.studentId}` : ""}
${role === "teacher" ? `- Assigned Batches: ${JSON.stringify(scope.teacherAssignedClasses)}` : ""}

CRITICAL IDENTITY & BEHAVIOR RULES (কঠোর পরিচিতি ও আচরণ বিধি):
0. DIRECT USER RESPONSE ONLY (কোনো অভ্যন্তরীণ চিন্তা বা পরিকল্পনা টেক্সটে নয়):
   - You MUST output ONLY the direct, polite response intended for the user.
   - NEVER output internal thoughts, reasoning steps, planning headers (such as "The user said...", "User intent:", "Plan:"), or meta-commentary.
   - Start immediately with the respectful greeting and your direct helpful answer in Bengali (বাংলা) or English.

1. IDENTITY & CREATOR (পরিচিতি ও নির্মাতা):
   - When asked who created you, what your name is, what model you are, or what version you run:
     You MUST state clearly in Bengali:
     "আমি রহমানিয়া ইনস্টিটিউট (Rahmania Institute)-এর নিজস্ব অফিসিয়াল এআই সহকারী। রহমানিয়া ইনস্টিটিউটের প্রযুক্তি টিম আমাকে মাদরাসার শিক্ষার্থী, শিক্ষক, অভিভাবক ও প্রশাসনের দৈনন্দিন তথ্য ও শিক্ষা ব্যবস্থাপনায় সহায়তার জন্য তৈরি করেছে।"
   - ABSOLUTE BAN: NEVER mention OpenAI, ChatGPT, GPT-4, Anthropic, Claude, Google, Gemini, Meta, Llama, DeepSeek, OpenRouter, or any third-party tech company. You are 100% Rahmania Institute's proprietary AI system.

2. ZERO HALLUCINATION & FACTUAL ACCURACY (কোনো মনগড়া পলিসি বা তথ্য নয়):
   - NEVER invent or guess policies, bank account numbers, late fee penalties (e.g. NEVER make up 15% late fee or dates), admission fees, or code logic.
   - For fees and payments: Only provide information derived from real database tools (for logged in users) or guide public users to contact the Madrasa office (+8801906898939).
   - If asked about backend code, database structure, or internal security logic, reply politely:
     "নিরাপত্তা ও প্রাতিষ্ঠানিক নীতিমালার কারণে অভ্যন্তরীণ কোড, সার্ভার বা ডাটাবেসের কাঠামো শেয়ার করা সম্ভব নয়। প্রাতিষ্ঠানিক যেকোনো তথ্যের জন্য সরাসরি মাদরাসা অফিসে যোগাযোগ করার জন্য অনুরোধ করা হচ্ছে।"

3. ROLLS & STUDENT SEARCH (ছাত্র ও রোল সংক্রান্ত অনুসন্ধান):
   - If an authenticated user (Teacher/Admin) asks about a roll number or student ID, immediately execute the appropriate tool (such as 'search_students' or 'get_student_profile' or 'get_student_fee_status'). Do not guess or invent names.
   - If the user is unauthenticated (guest / public visitor), student personal records are strictly private. Politely inform them that student records can only be accessed through the student/parent portal or by contacting the Madrasa office directly (+8801906898939).

4. LANGUAGE & TONE:
   - Always respond politely in Bengali (বাংলা) by default, or in English if queried in English.
   - Use respectful, Islamic-ethical greetings and phrasing.

5. SECURITY & ZERO-TRUST:
   - Never disclose database connection strings, API keys, user passwords, or confidential records.
   - For financial transactions, only use the signed tool execution flow; do not fabricate transaction IDs.`;
}

export async function POST(request) {
  try {
    // 1. Verify CSRF in production
    if (process.env.NODE_ENV === "production" && !verifyCsrfOrigin(request)) {
      return NextResponse.json({ ok: false, message: "Invalid request origin." }, { status: 403 });
    }

    // 2. Authoritative Auth Context (supports guests/visitors on public website as well as authenticated ERP users)
    const authContext = await resolveAuthContext(request);

    const body = await request.json();
    const {
      messages = [],
      provider = "openrouter",
      model,
      apiKey: userApiKey, // Optional BYOK key
      baseUrl, // Optional custom baseUrl
      temperature = 0.2,
    } = body;

    const isBYOK = Boolean(userApiKey && userApiKey.trim());

    // 3. If no BYOK key and no server-side central key is available at all:
    const hasCentralKey = Boolean(
      process.env.OPENROUTER_API_KEY ||
      process.env.GEMINI_API_KEY ||
      process.env.OPENAI_API_KEY ||
      process.env.GROQ_API_KEY ||
      process.env.DEEPSEEK_API_KEY
    );

    if (!isBYOK && !hasCentralKey && provider === "openrouter" && !process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({
        ok: true,
        role: "assistant",
        content: OFFICIAL_FALLBACK_CONTACT_MESSAGE,
        isContactFallback: true,
        toolCalls: [],
      });
    }

    // 4. Check Rate Limit
    const rateCheck = checkAIRateLimit({
      userId: authContext.scope.userId || "guest_client",
      role: authContext.role,
      provider,
      isBYOK,
    });

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          ok: false,
          error: "RATE_LIMITED",
          message: rateCheck.reason,
          remainingUser: rateCheck.remainingUser,
        },
        { status: 429 }
      );
    }

    // 5. Prepare available tools
    const availableTools = getAvailableToolsForContext(authContext);

    // 6. Build conversation history with rolling window (max 10 user/assistant messages)
    const rollingMessages = messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .slice(-10);

    const systemMessage = {
      role: "system",
      content: buildSystemPrompt(authContext),
    };

    const conversation = [systemMessage, ...rollingMessages];
    const pseudonymMap = new Map();

    // 7. Completion call to AI Provider
    let completion;
    try {
      completion = await executeAICompletion({
        provider,
        apiKey: userApiKey,
        model,
        baseUrl,
        messages: conversation,
        tools: availableTools,
        temperature,
      });
    } catch (providerErr) {
      console.warn("AI Provider completion warning:", providerErr?.message);
      // If no key is set or provider returned authentication error, give helpful contact fallback
      if (!isBYOK && !hasCentralKey) {
        return NextResponse.json({
          ok: true,
          role: "assistant",
          content: OFFICIAL_FALLBACK_CONTACT_MESSAGE,
          isContactFallback: true,
          toolCalls: [],
        });
      }
      throw providerErr;
    }

    // 7. Handle Tool Calling Loop (if AI decided to call any tools)
    const toolExecutions = [];
    let confirmationPayload = null;

    if (completion.toolCalls && completion.toolCalls.length > 0) {
      for (const toolCall of completion.toolCalls) {
        const toolResult = await executeAITool(
          toolCall.name,
          toolCall.arguments,
          authContext,
          pseudonymMap
        );

        toolExecutions.push({
          toolName: toolCall.name,
          args: toolCall.arguments,
          result: toolResult,
        });

        // If tool requires interactive confirmation (High Risk), capture it
        if (toolResult.requires_confirmation) {
          confirmationPayload = toolResult;
        }
      }

      // If no interactive confirmation is needed, pass tool results back to LLM for final synthesis
      if (!confirmationPayload) {
        const toolMessages = [
          ...conversation,
          {
            role: "assistant",
            content: completion.content || "",
            tool_calls: completion.toolCalls.map((tc) => ({
              id: tc.id,
              type: "function",
              function: { name: tc.name, arguments: JSON.stringify(tc.arguments) },
            })),
          },
          ...toolExecutions.map((te, idx) => ({
            role: "tool",
            tool_call_id: completion.toolCalls[idx]?.id || `call_${idx}`,
            name: te.toolName,
            content: JSON.stringify(te.result),
          })),
        ];

        // Second pass to generate conversational synthesis
        try {
          const followUp = await executeAICompletion({
            provider,
            apiKey: userApiKey,
            model,
            messages: toolMessages,
            temperature,
          });
          if (followUp?.content) {
            completion.content = followUp.content;
          }
        } catch {
          // If follow-up fails, provide informative message based on tool results
          completion.content = toolExecutions.map((te) => te.result?.message || JSON.stringify(te.result)).join("\n");
        }
      } else {
        completion.content = confirmationPayload.message || "অনুগ্রহ করে নিচের কনফার্মেশন কার্ডে যাচাই করে নিশ্চিত করুন।";
      }
    }

    // 8. De-pseudonymize response text for the authorized client
    let finalContent = completion.content || "";
    for (const [pseudoCode, studentInfo] of pseudonymMap.entries()) {
      const regex = new RegExp(pseudoCode, "g");
      finalContent = finalContent.replace(
        regex,
        `**${studentInfo.name}** (রোল: ${studentInfo.roll}, ক্লাস: ${studentInfo.class})`
      );
    }

    finalContent = sanitizeAIResponse(finalContent);

    return NextResponse.json({
      ok: true,
      role: "assistant",
      content: finalContent,
      toolCalls: toolExecutions,
      confirmation: confirmationPayload,
      usage: completion.usage,
      provider,
      model: completion.model || model,
      rateLimit: {
        remainingUser: rateCheck.remainingUser,
        remainingGlobal: rateCheck.remainingGlobal,
      },
    });
  } catch (err) {
    console.error("AI Chat Route Error:", err);
    return NextResponse.json(
      {
        ok: false,
        error: "AI_SERVER_ERROR",
        message: err?.message || "Internal server error occurred while processing AI request.",
      },
      { status: 500 }
    );
  }
}
