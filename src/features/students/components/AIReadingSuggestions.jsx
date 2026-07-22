import React, { useState, useEffect } from "react";
import { appClient } from "@/api/appClient";
import { Loader2, Sparkles, BookOpen, Target, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AIReadingSuggestions({ student, logs, latestSubjects }) {
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const fetchSuggestions = async () => {
    setLoading(true);
    setSuggestions(null);

    // Build reading history context
    const recentSubjects = logs
      .slice(0, 20)
      .map(l => l.subjects)
      .filter(Boolean)
      .join(", ");

    const totalPages = student.total_pages_read || 0;

    const prompt = `
You are an Islamic academic advisor for students at Rahmania Institute (রহমানিয়া ইনস্টিটিউট), a Quran and Islamic studies institution in Bangladesh.

Student info:
- Name: ${student.full_name_bn || student.full_name_en}
- Total pages read so far: ${totalPages}
- Recent subjects studied: ${recentSubjects || "Not available"}
- Just logged reading on: ${latestSubjects || "general Islamic studies"}

Please respond ONLY in Bengali (বাংলা). Provide:

1. "suggestions": Array of 3 relevant books or topics to study next, each with:
   - "title": Book/topic name
   - "summary": 2-3 sentence description in Bengali
   - "relevance": Why it's relevant to what they've been studying (1 sentence)

2. "challenge": A specific, encouraging reading challenge for this week based on their progress. Should include a concrete page target.

3. "motivation": A short motivational message in Bengali (1-2 sentences) with an Islamic quote or Hadith reference.

Keep responses concise and appropriate for a young Islamic studies student.
`;

    try {
      const result = await appClient.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  summary: { type: "string" },
                  relevance: { type: "string" },
                }
              }
            },
            challenge: { type: "string" },
            motivation: { type: "string" },
          }
        }
      });
      setSuggestions(result);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  return (
    <div className="rounded-2xl overflow-hidden border border-yellow-400/30" style={{ background: "rgba(255,255,255,0.97)" }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer"
        style={{ background: "linear-gradient(135deg, #003d2b, #005a3e)" }}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-yellow-400" />
          <span className="text-sm font-bold text-white font-bengali">AI পাঠ পরামর্শ</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-bengali"
            style={{ background: "rgba(212,175,55,0.25)", color: "#D4AF37", border: "1px solid rgba(212,175,55,0.4)" }}>
            নতুন
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!loading && suggestions && (
            <button
              onClick={(e) => { e.stopPropagation(); fetchSuggestions(); }}
              className="text-white/50 hover:text-white transition-colors p-1"
              title="পুনরায় লোড করুন"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          )}
          {expanded ? <ChevronUp className="h-4 w-4 text-white/60" /> : <ChevronDown className="h-4 w-4 text-white/60" />}
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground font-bengali">AI পরামর্শ তৈরি হচ্ছে...</p>
            </div>
          )}

          {!loading && suggestions && (
            <>
              {/* Reading Challenge */}
              <div className="rounded-xl p-3.5" style={{ background: "linear-gradient(135deg, #fff9e6, #fffbf0)", border: "1px solid #D4AF37" }}>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-bold text-amber-800 font-bengali">সাপ্তাহিক চ্যালেঞ্জ</span>
                </div>
                <p className="text-sm text-amber-900 font-bengali leading-relaxed">{suggestions.challenge}</p>
              </div>

              {/* Book / Topic Suggestions */}
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold text-slate-700 font-bengali">প্রস্তাবিত বই ও বিষয়</span>
                </div>
                <div className="space-y-2.5">
                  {suggestions.suggestions?.map((s, i) => (
                    <div key={i} className="rounded-xl p-3.5 bg-slate-50 border border-slate-100">
                      <div className="flex items-start gap-2.5">
                        <div className="h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
                          style={{ background: "linear-gradient(135deg,#003d2b,#006241)" }}>
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 font-bengali">{s.title}</p>
                          <p className="text-xs text-slate-600 font-bengali mt-1 leading-relaxed">{s.summary}</p>
                          <p className="text-xs text-primary font-bengali mt-1.5 italic">→ {s.relevance}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Motivation */}
              {suggestions.motivation && (
                <div className="rounded-xl p-3.5 bg-primary/5 border border-primary/15">
                  <p className="text-xs text-primary/80 font-bengali leading-relaxed text-center italic">
                    ✨ {suggestions.motivation}
                  </p>
                </div>
              )}
            </>
          )}

          {!loading && !suggestions && (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground font-bengali mb-3">পরামর্শ লোড হয়নি</p>
              <Button size="sm" onClick={fetchSuggestions} variant="outline" className="gap-2 text-xs">
                <RefreshCw className="h-3.5 w-3.5" /> আবার চেষ্টা করুন
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}