import React, { useState, useEffect } from "react";
import { X, Users } from "lucide-react";

const REACTION_EMOJIS = {
  like: "👍",
  love: "❤️",
  care: "🤗",
  haha: "😆",
  wow: "😮",
  sad: "😢",
  insightful: "💡",
};

const REACTION_LABELS = {
  all: "সকল",
  like: "লাইক",
  love: "লাভ",
  care: "কেয়ার",
  haha: "হাহা",
  wow: "ওয়াও",
  sad: "স্যাড",
  insightful: "ইনসাইটফুল",
};

export default function SocialReactionsModal({ postId, onClose }) {
  const [activeTab, setActiveTab] = useState("all");
  const [reactions, setReactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const url = `/api/teacher-marketplace/social/reactions?post_id=${postId}${
      activeTab !== "all" ? `&reaction_type=${activeTab}` : ""
    }`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.ok) {
          setReactions(data.reactions || []);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [postId, activeTab]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>প্রতিক্রিয়াকারী ব্যক্তিবৃন্দ</span>
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-slate-600 dark:text-stone-300 flex items-center justify-center cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Reaction Filter Tabs */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-stone-100 dark:border-stone-800 overflow-x-auto no-scrollbar bg-stone-50/50 dark:bg-stone-900/50">
          {["all", "like", "love", "care", "haha", "wow", "sad", "insightful"].map((type) => {
            const isActive = activeTab === type;
            const emoji = type === "all" ? "🌟" : REACTION_EMOJIS[type];
            return (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1 transition cursor-pointer ${
                  isActive
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "text-slate-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800"
                }`}
              >
                <span>{emoji}</span>
                <span>{REACTION_LABELS[type]}</span>
              </button>
            );
          })}
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400 font-bold animate-pulse">
              রিঅ্যাকশন লোড হচ্ছে...
            </div>
          ) : reactions.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 font-medium">
              এই ক্যাটাগরিতে এখনো কোনো প্রতিক্রিয়া পাওয়া যায়নি।
            </div>
          ) : (
            reactions.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-stone-50 dark:hover:bg-stone-800/50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {r.user_avatar ? (
                      <img
                        src={r.user_avatar}
                        alt={r.user_name}
                        className="w-10 h-10 rounded-full object-cover border border-stone-200 dark:border-stone-700"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-sm">
                        {r.user_name.charAt(0)}
                      </div>
                    )}
                    <span className="absolute -bottom-1 -right-1 text-sm">
                      {REACTION_EMOJIS[r.reaction_type] || "👍"}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">
                      {r.user_name}
                    </h4>
                    <span className="text-[10px] text-slate-400 capitalize">
                      {r.user_role === "teacher"
                        ? "উস্তাদ"
                        : r.user_role === "admin"
                        ? "অ্যাডমিন"
                        : "শিক্ষার্থী"}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] text-slate-400 font-medium">
                  {new Date(r.created_at).toLocaleDateString("bn-BD")}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

