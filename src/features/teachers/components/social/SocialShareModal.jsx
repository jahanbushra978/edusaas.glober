import React, { useState } from "react";
import { X, Share2, Copy, Check, Repeat, Globe } from "lucide-react";
import { toast } from "sonner";

export default function SocialShareModal({ post, currentUser, onClose, onRepostSuccess }) {
  const [copied, setCopied] = useState(false);
  const [commentary, setCommentary] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const postUrl = typeof window !== "undefined"
    ? `${window.location.origin}/quran-tutor/studio?tab=human_teachers&teacher_id=${post.teacher_id}&post_id=${post.id}`
    : "";

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(postUrl);
      setCopied(true);
      toast.success("পোস্টের লিঙ্ক সফলভাবে কপি করা হয়েছে!");
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${post.author_name} উস্তাদের শিক্ষণীয় পোস্ট`,
          text: post.content_text ? post.content_text.slice(0, 100) : "রহমানিয়া ইন্সটিটিউট সোশ্যাল ফিড",
          url: postUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopy();
    }
  };

  const handleRepost = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast.info("রিপোস্ট করতে অনুগ্রহ করে লগইন করুন।");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/teacher-marketplace/social/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content_text: commentary.trim(),
          post_type: "text",
          original_post_id: post.id,
          visibility: "public",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "রিপোস্ট করতে ব্যর্থ হয়েছে।");
      }

      toast.success("মাশাআল্লাহ! আপনার মতামত সহ পোস্টটি সফলভাবে শেয়ার হয়েছে।");
      if (onRepostSuccess) onRepostSuccess(data.post);
      onClose();
    } catch (err) {
      toast.error(err.message || "রিপোস্ট প্রক্রিয়ায় ত্রুটি ঘটেছে।");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Share2 className="w-4 h-4 text-emerald-600" />
            <span>পোস্ট শেয়ার করুন</span>
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-slate-600 dark:text-stone-300 flex items-center justify-center cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Quick Share Options */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleCopy}
              className="p-3 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800/80 text-slate-800 dark:text-stone-200 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "কপি সম্পন্ন" : "পোস্ট লিঙ্ক কপি"}</span>
            </button>

            <button
              onClick={handleNativeShare}
              className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Globe className="w-4 h-4" />
              <span>অন্য অ্যাপে শেয়ার</span>
            </button>
          </div>

          {/* Repost Form */}
          <form onSubmit={handleRepost} className="space-y-3 pt-2 border-t border-stone-100 dark:border-stone-800">
            <label className="text-xs font-extrabold text-slate-800 dark:text-stone-200 flex items-center gap-1.5">
              <Repeat className="w-4 h-4 text-emerald-600" />
              <span>আপনার বক্তব্য সহ রিপোস্ট করুন (উস্তাদ প্রোফাইল থেকে):</span>
            </label>

            <textarea
              value={commentary}
              onChange={(e) => setCommentary(e.target.value)}
              placeholder="এই পোস্ট সম্পর্কে আপনার মন্তব্য বা নসিহত লিখুন..."
              rows={3}
              className="w-full p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 resize-none font-medium"
            />

            {/* Original Post Preview Box */}
            <div className="p-3.5 rounded-2xl bg-stone-100/70 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700/80 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                {post.author_avatar ? (
                  <img src={post.author_avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold text-[10px] flex items-center justify-center">
                    {post.author_name?.charAt(0)}
                  </div>
                )}
                <span className="font-bold text-slate-900 dark:text-white">{post.author_name}</span>
                <span className="text-[10px] text-slate-400">
                  {new Date(post.created_at).toLocaleDateString("bn-BD")}
                </span>
              </div>
              <p className="text-slate-600 dark:text-stone-300 text-[11px] line-clamp-2">
                {post.content_text || "মিডিয়া পোস্ট"}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black shadow-md shadow-emerald-700/20 transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "শেয়ার হচ্ছে..." : "এখনই রিপোস্ট করুন"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

