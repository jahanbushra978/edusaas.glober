import React, { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Globe,
  Users,
  Lock,
  Edit3,
  Trash2,
  Flag,
  CheckCircle,
  Send,
  CornerDownRight,
  Repeat,
} from "lucide-react";
import { toast } from "sonner";
import SocialReactionsModal from "./SocialReactionsModal";
import SocialShareModal from "./SocialShareModal";
import SocialReportModal from "./SocialReportModal";

const REACTION_CONFIG = {
  like: { emoji: "👍", label: "লাইক", color: "text-blue-600 dark:text-blue-400" },
  love: { emoji: "❤️", label: "লাভ", color: "text-red-600 dark:text-red-400" },
  care: { emoji: "🤗", label: "কেয়ার", color: "text-amber-600 dark:text-amber-400" },
  haha: { emoji: "😆", label: "হাহা", color: "text-yellow-600 dark:text-yellow-400" },
  wow: { emoji: "😮", label: "ওয়াও", color: "text-amber-500 dark:text-amber-300" },
  sad: { emoji: "😢", label: "স্যাড", color: "text-purple-600 dark:text-purple-400" },
  insightful: { emoji: "💡", label: "ইনসাইটফুল", color: "text-emerald-600 dark:text-emerald-400" },
};

function formatRelativeTime(dateString) {
  if (!dateString) return "এইমাত্র";
  const now = new Date();
  const past = new Date(dateString);
  const diffSec = Math.floor((now - past) / 1000);

  if (diffSec < 60) return "এইমাত্র";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60).toLocaleString("bn-BD")} মিনিট আগে`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600).toLocaleString("bn-BD")} ঘণ্টা আগে`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400).toLocaleString("bn-BD")} দিন আগে`;
  return past.toLocaleDateString("bn-BD");
}

export default function SocialPostCard({ post, currentUser, onPostDeleted, onPostUpdated, onAuthorClick }) {
  // Reaction states
  const [currentUserReaction, setCurrentUserReaction] = useState(post.current_user_reaction || null);
  const [reactionsSummary, setReactionsSummary] = useState(
    post.reactions_summary || { like: 0, love: 0, care: 0, haha: 0, wow: 0, sad: 0, insightful: 0 }
  );
  const [likesCount, setLikesCount] = useState(Number(post.likes_count) || 0);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const reactionPickerTimeoutRef = useRef(null);

  // Bookmark / Save state
  const [isSaved, setIsSaved] = useState(Boolean(post.is_saved_by_current_user));

  // Comments states
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsCount, setCommentsCount] = useState(Number(post.comments_count) || 0);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");
  const [replyingToCommentId, setReplyingToCommentId] = useState(null);
  const [replyText, setReplyText] = useState("");

  // Modals state
  const [showReactionsModal, setShowReactionsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(post.content_text || "");

  const isAuthor = currentUser && (currentUser.authUserId === post.author_user_id || currentUser.id === post.author_user_id || currentUser.role === "admin");

  // Load Comments
  const fetchComments = async () => {
    setIsLoadingComments(true);
    try {
      const res = await fetch(`/api/teacher-marketplace/social/comments?post_id=${post.id}`);
      const data = await res.json();
      if (data.ok) {
        setComments(data.comments || []);
      }
    } catch {
      // Quiet fail
    } finally {
      setIsLoadingComments(false);
    }
  };

  useEffect(() => {
    if (showComments && comments.length === 0) {
      fetchComments();
    }
  }, [showComments]);

  // Handle Reaction
  const handleSelectReaction = async (type) => {
    setShowReactionPicker(false);
    if (!currentUser) {
      toast.info("প্রতিক্রিয়া জানাতে অনুগ্রহ করে প্রথমে লগইন করুন।");
      return;
    }

    try {
      const res = await fetch("/api/teacher-marketplace/social/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: post.id, reaction_type: type }),
      });
      const data = await res.json();
      if (data.ok) {
        setCurrentUserReaction(data.reaction_type || null);
        setReactionsSummary(data.reactions_summary || reactionsSummary);
        setLikesCount(data.likes_count || 0);
      }
    } catch {
      toast.error("প্রতিক্রিয়া সংরক্ষণে সমস্যা হয়েছে।");
    }
  };

  // Toggle Save Post
  const handleToggleSave = async () => {
    if (!currentUser) {
      toast.info("পোস্ট সংরক্ষণ করতে প্রথমে লগইন করুন।");
      return;
    }

    try {
      const res = await fetch("/api/teacher-marketplace/social/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: post.id }),
      });
      const data = await res.json();
      if (data.ok) {
        setIsSaved(data.is_saved);
        toast.success(data.message);
      }
    } catch {
      toast.error("সংরক্ষণে ব্যর্থ হয়েছে।");
    }
    setShowMenu(false);
  };

  // Handle Add Comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast.info("মন্তব্য করতে অনুগ্রহ করে প্রথমে লগইন করুন।");
      return;
    }
    const trimmed = newCommentText.trim();
    if (!trimmed) return;

    try {
      const res = await fetch("/api/teacher-marketplace/social/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: post.id, comment_text: trimmed }),
      });
      const data = await res.json();
      if (data.ok && data.comment) {
        setComments((prev) => [...prev, { ...data.comment, replies: [] }]);
        setCommentsCount((prev) => prev + 1);
        setNewCommentText("");
        toast.success("মন্তব্য সফলভাবে যুক্ত হয়েছে!");
      }
    } catch {
      toast.error("মন্তব্য প্রকাশে ব্যর্থ হয়েছে।");
    }
  };

  // Handle Add Threaded Reply
  const handleAddReply = async (parentCommentId) => {
    if (!currentUser) {
      toast.info("উত্তর দিতে লগইন করুন।");
      return;
    }
    const trimmed = replyText.trim();
    if (!trimmed) return;

    try {
      const res = await fetch("/api/teacher-marketplace/social/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_id: post.id,
          parent_comment_id: parentCommentId,
          comment_text: trimmed,
        }),
      });
      const data = await res.json();
      if (data.ok && data.comment) {
        setComments((prev) =>
          prev.map((c) => {
            if (c.id === parentCommentId) {
              return { ...c, replies: [...(c.replies || []), data.comment] };
            }
            return c;
          })
        );
        setCommentsCount((prev) => prev + 1);
        setReplyText("");
        setReplyingToCommentId(null);
        toast.success("উত্তর যুক্ত হয়েছে!");
      }
    } catch {
      toast.error("উত্তর প্রকাশে ব্যর্থ হয়েছে।");
    }
  };

  // Handle Toggle Comment Like
  const handleToggleCommentLike = async (commentId) => {
    if (!currentUser) {
      toast.info("মন্তব্যে লাইক দিতে অনুগ্রহ করে প্রথমে লগইন করুন।");
      return;
    }
    try {
      const res = await fetch("/api/teacher-marketplace/social/comments/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment_id: commentId }),
      });
      const data = await res.json();
      if (data.ok) {
        setComments((prev) =>
          prev.map((c) => {
            if (c.id === commentId) {
              return {
                ...c,
                is_liked_by_current_user: data.is_liked,
                likes_count: data.likes_count,
              };
            }
            if (Array.isArray(c.replies)) {
              return {
                ...c,
                replies: c.replies.map((r) =>
                  r.id === commentId
                    ? {
                        ...r,
                        is_liked_by_current_user: data.is_liked,
                        likes_count: data.likes_count,
                      }
                    : r
                ),
              };
            }
            return c;
          })
        );
      }
    } catch {
      toast.error("লাইক প্রক্রিয়ায় সমস্যা হয়েছে।");
    }
  };

  // Handle Delete Post
  const handleDeletePost = async () => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই পোস্টটি মুছে ফেলতে চান?")) return;
    try {
      const res = await fetch(`/api/teacher-marketplace/social/posts/${post.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.ok) {
        toast.success("পোস্ট সফলভাবে মুছে ফেলা হয়েছে।");
        if (onPostDeleted) onPostDeleted(post.id);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      toast.error(err.message || "পোস্ট মুছতে ব্যর্থ হয়েছে।");
    }
    setShowMenu(false);
  };

  // Handle Edit Post
  const handleSaveEdit = async () => {
    try {
      const res = await fetch(`/api/teacher-marketplace/social/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content_text: editedText }),
      });
      const data = await res.json();
      if (data.ok && data.post) {
        toast.success("পোস্ট সম্পাদনা সম্পন্ন!");
        setIsEditing(false);
        if (onPostUpdated) onPostUpdated(data.post);
      }
    } catch {
      toast.error("পোস্ট সম্পাদনায় সমস্যা হয়েছে।");
    }
  };

  // Active reaction config
  const activeConfig = currentUserReaction ? REACTION_CONFIG[currentUserReaction] : null;

  return (
    <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-md overflow-hidden space-y-3.5 transition hover:shadow-lg">
      {/* ── POST HEADER BAR ── */}
      <div className="px-5 pt-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            onClick={() => onAuthorClick && onAuthorClick(post)}
            className="cursor-pointer transition active:scale-95 group relative"
            title={`${post.author_name}-এর ফেসবুক প্রোফাইল দেখুন`}
          >
            {post.author_avatar ? (
              <img
                src={post.author_avatar}
                alt={post.author_name}
                className="w-10 h-10 rounded-full object-cover border-2 border-emerald-600 shrink-0 group-hover:ring-2 group-hover:ring-emerald-400 transition"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shrink-0">
                {post.author_name?.charAt(0)}
              </div>
            )}
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white absolute -bottom-0.5 -right-0.5" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h4
                onClick={() => onAuthorClick && onAuthorClick(post)}
                className="text-xs sm:text-sm font-black text-slate-900 dark:text-white cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline transition"
                title={`${post.author_name}-এর প্রোফাইল দেখুন`}
              >
                {post.author_name}
              </h4>
              <CheckCircle className="w-3.5 h-3.5 fill-blue-600 text-white shrink-0" />
              {post.author_role === "teacher" || post.teacher_id ? (
                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-800">
                  উস্তাদ
                </span>
              ) : (
                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 font-bold border border-blue-300 dark:border-blue-800">
                  শিক্ষার্থী
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span>{formatRelativeTime(post.created_at)}</span>
              <span>•</span>
              <span className="flex items-center gap-0.5">
                {post.visibility === "public" ? (
                  <>
                    <Globe className="w-3 h-3" />
                    <span>সর্বজনীন</span>
                  </>
                ) : post.visibility === "followers" ? (
                  <>
                    <Users className="w-3 h-3 text-emerald-600" />
                    <span>অনুসারী</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3 text-amber-500" />
                    <span>ব্যক্তিগত</span>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Top Right Options Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-slate-500 transition cursor-pointer"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-8 w-48 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl py-1.5 z-20 text-xs font-semibold animate-fadeIn">
              <button
                onClick={handleToggleSave}
                className="w-full px-3.5 py-2 text-left hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-2 cursor-pointer text-slate-800 dark:text-stone-200"
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-emerald-600 text-emerald-600" : ""}`} />
                <span>{isSaved ? "সংরক্ষণ তালিকা থেকে সরান" : "পোস্টটি সংরক্ষণ করুন"}</span>
              </button>

              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowReportModal(true);
                }}
                className="w-full px-3.5 py-2 text-left hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-2 cursor-pointer text-slate-800 dark:text-stone-200"
              >
                <Flag className="w-3.5 h-3.5 text-red-500" />
                <span>আপত্তি জানান (Report)</span>
              </button>

              {isAuthor && (
                <>
                  <div className="border-t border-stone-100 dark:border-stone-800 my-1" />
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setIsEditing(true);
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-2 cursor-pointer text-slate-800 dark:text-stone-200"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-blue-500" />
                    <span>পোস্ট সম্পাদনা করুন</span>
                  </button>

                  <button
                    onClick={handleDeletePost}
                    className="w-full px-3.5 py-2 text-left hover:bg-red-50 dark:hover:bg-red-950/60 flex items-center gap-2 cursor-pointer text-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>পোস্টটি মুছে ফেলুন</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── POST BODY TEXT ── */}
      <div className="px-5">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              rows={3}
              className="w-full p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-slate-900 dark:text-white resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
              >
                বাতিল
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-1.5 rounded-xl bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                সংরক্ষণ
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-slate-800 dark:text-stone-200 font-medium leading-relaxed whitespace-pre-line">
            {post.content_text}
          </p>
        )}
      </div>

      {/* ── REPOST SNAPSHOT BANNER (IF REPOSTED) ── */}
      {post.original_post_data && (
        <div className="mx-5 p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80 space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <Repeat className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-bold text-slate-900 dark:text-white">
              {post.original_post_data.author_name}
            </span>
            <span className="text-[10px] text-slate-400">
              {formatRelativeTime(post.original_post_data.created_at)}
            </span>
          </div>
          <p className="text-slate-600 dark:text-stone-300 text-[11px] line-clamp-3">
            {post.original_post_data.content_text}
          </p>
        </div>
      )}

      {/* ── MEDIA GALLERY / CAROUSEL / VIDEO ── */}
      {Array.isArray(post.media_urls) && post.media_urls.length > 0 && (
        <div className="px-5 pt-1">
          {post.post_type === "video" || post.post_type === "clip" ? (
            <div className="rounded-2xl overflow-hidden bg-black relative max-h-[480px] flex items-center justify-center">
              <video
                src={post.media_urls[0]?.url}
                controls
                poster={post.video_metadata?.thumbnail || post.media_urls[0]?.thumbnail}
                className="w-full max-h-[480px] object-contain rounded-2xl"
              />
            </div>
          ) : post.media_urls.length === 1 ? (
            <div className="rounded-2xl overflow-hidden border border-stone-100 dark:border-stone-800 max-h-[450px]">
              <img
                src={post.media_urls[0]?.url}
                alt=""
                className="w-full h-full object-cover cursor-pointer hover:scale-101 transition duration-300"
              />
            </div>
          ) : post.media_urls.length === 2 ? (
            <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden max-h-[360px]">
              {post.media_urls.map((m, idx) => (
                <img
                  key={idx}
                  src={m.url}
                  alt=""
                  className="w-full h-full object-cover max-h-[360px] cursor-pointer"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 rounded-2xl overflow-hidden">
              {post.media_urls.slice(0, 3).map((m, idx) => (
                <div key={idx} className="relative h-44 overflow-hidden rounded-xl">
                  <img src={m.url} alt="" className="w-full h-full object-cover" />
                  {idx === 2 && post.media_urls.length > 3 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-black text-lg">
                      +{post.media_urls.length - 3}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── REACTIONS & COMMENTS SUMMARY BAR ── */}
      <div className="px-5 pt-2 flex items-center justify-between text-[11px] text-slate-500 border-b border-stone-100 dark:border-stone-800/80 pb-2.5">
        {/* Clickable Reactions Count */}
        <button
          onClick={() => setShowReactionsModal(true)}
          className="flex items-center gap-1.5 hover:underline cursor-pointer"
        >
          <div className="flex -space-x-1 items-center">
            <span className="text-xs">👍</span>
            <span className="text-xs">❤️</span>
            <span className="text-xs">🤗</span>
          </div>
          <span className="font-extrabold text-slate-800 dark:text-stone-200">
            {likesCount > 0 ? `${likesCount.toLocaleString("bn-BD")} জন` : "প্রথম প্রতিক্রিয়া দিন"}
          </span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowComments(!showComments)}
            className="hover:underline cursor-pointer"
          >
            {commentsCount.toLocaleString("bn-BD")}টি মন্তব্য
          </button>
          {post.shares_count > 0 && (
            <span>{post.shares_count.toLocaleString("bn-BD")}টি শেয়ার</span>
          )}
        </div>
      </div>

      {/* ── ACTION INTERACTION BAR (3 MAIN BUTTONS) ── */}
      <div className="px-4 py-1 flex items-center justify-between relative">
        {/* 1. React Button with 7-Reaction Hover Picker */}
        <div
          className="relative flex-1"
          onMouseEnter={() => {
            if (reactionPickerTimeoutRef.current) clearTimeout(reactionPickerTimeoutRef.current);
            setShowReactionPicker(true);
          }}
          onMouseLeave={() => {
            reactionPickerTimeoutRef.current = setTimeout(() => {
              setShowReactionPicker(false);
            }, 500);
          }}
        >
          {/* Reaction Popover (7 Facebook Reactions) */}
          {showReactionPicker && (
            <div className="absolute -top-12 left-0 z-30 flex items-center gap-2 p-1.5 px-3 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl animate-scaleUp">
              {Object.entries(REACTION_CONFIG).map(([key, item]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSelectReaction(key)}
                  className="text-2xl hover:scale-130 transition duration-150 cursor-pointer p-0.5"
                  title={item.label}
                >
                  {item.emoji}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => handleSelectReaction(currentUserReaction || "like")}
            className={`w-full py-2 rounded-2xl flex items-center justify-center gap-1.5 text-xs font-black transition cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-800 ${
              activeConfig ? activeConfig.color : "text-slate-600 dark:text-stone-300"
            }`}
          >
            <span className="text-base">{activeConfig ? activeConfig.emoji : "👍"}</span>
            <span>{activeConfig ? activeConfig.label : "লাইক"}</span>
          </button>
        </div>

        {/* 2. Comment Button */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex-1 py-2 rounded-2xl flex items-center justify-center gap-1.5 text-xs font-black text-slate-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
        >
          <MessageCircle className="w-4 h-4 text-emerald-600" />
          <span>মন্তব্য</span>
        </button>

        {/* 3. Share Button */}
        <button
          onClick={() => setShowShareModal(true)}
          className="flex-1 py-2 rounded-2xl flex items-center justify-center gap-1.5 text-xs font-black text-slate-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
        >
          <Share2 className="w-4 h-4 text-blue-600" />
          <span>শেয়ার</span>
        </button>
      </div>

      {/* ── INLINE COMMENTS SECTION (WHEN EXPANDED) ── */}
      {showComments && (
        <div className="px-5 pb-5 pt-2 border-t border-stone-100 dark:border-stone-800 space-y-3 animate-fadeIn">
          {/* Add Comment Input */}
          <form onSubmit={handleAddComment} className="flex items-center gap-2">
            <input
              type="text"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="একটি শালীন ও আদবসম্মত মন্তব্য লিখুন..."
              className="flex-1 px-4 py-2.5 rounded-full bg-stone-100 dark:bg-stone-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
            />
            <button
              type="submit"
              disabled={!newCommentText.trim()}
              className="p-2.5 rounded-full bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-40 transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Comments List */}
          {isLoadingComments ? (
            <p className="text-center text-xs text-slate-400 py-3 animate-pulse">মন্তব্য লোড হচ্ছে...</p>
          ) : comments.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-3 font-medium">
              এখনো কোনো মন্তব্য নেই। প্রথম মন্তব্যটি করুন।
            </p>
          ) : (
            <div className="space-y-3 pt-2">
              {comments.map((comment) => (
                <div key={comment.id} className="space-y-2">
                  <div className="flex items-start gap-2.5">
                    {comment.user_avatar ? (
                      <img src={comment.user_avatar} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-emerald-700 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                        {comment.user_name?.charAt(0)}
                      </div>
                    )}

                    <div className="flex-1 bg-stone-100 dark:bg-stone-800/80 rounded-2xl p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs text-slate-900 dark:text-white">
                          {comment.user_name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {formatRelativeTime(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-stone-300 font-medium">
                        {comment.comment_text}
                      </p>
                    </div>
                  </div>

                  {/* Comment Action Buttons (Like & Reply) */}
                  <div className="pl-10 flex items-center gap-4 text-[10px] font-bold text-slate-500">
                    <button
                      onClick={() => handleToggleCommentLike(comment.id)}
                      className={`flex items-center gap-1 cursor-pointer transition ${
                        comment.is_liked_by_current_user
                          ? "text-blue-600 font-black"
                          : "hover:text-blue-600"
                      }`}
                    >
                      <span>{comment.is_liked_by_current_user ? "👍 লাইকড" : "লাইক"}</span>
                      {(Number(comment.likes_count) || 0) > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 text-[9px]">
                          {comment.likes_count}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => setReplyingToCommentId(replyingToCommentId === comment.id ? null : comment.id)}
                      className="hover:underline text-emerald-700 dark:text-emerald-400 cursor-pointer"
                    >
                      উত্তর দিন (Reply)
                    </button>
                  </div>

                  {/* Threaded Replies */}
                  {Array.isArray(comment.replies) && comment.replies.length > 0 && (
                    <div className="pl-10 space-y-2 pt-1 border-l-2 border-stone-200 dark:border-stone-800 ml-4">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="space-y-1">
                          <div className="flex items-start gap-2">
                            <CornerDownRight className="w-3.5 h-3.5 text-slate-400 mt-1 shrink-0" />
                            <div className="flex-1 bg-stone-100/70 dark:bg-stone-800/60 rounded-xl p-2.5 space-y-0.5">
                              <span className="font-black text-[11px] text-slate-900 dark:text-white">
                                {reply.user_name}
                              </span>
                              <p className="text-[11px] text-slate-700 dark:text-stone-300">
                                {reply.comment_text}
                              </p>
                            </div>
                          </div>
                          <div className="pl-6 flex items-center gap-2 text-[9px] font-bold text-slate-500">
                            <button
                              onClick={() => handleToggleCommentLike(reply.id)}
                              className={`cursor-pointer transition ${
                                reply.is_liked_by_current_user
                                  ? "text-blue-600 font-black"
                                  : "hover:text-blue-600"
                              }`}
                            >
                              <span>{reply.is_liked_by_current_user ? "👍 লাইকড" : "লাইক"}</span>
                              {(Number(reply.likes_count) || 0) > 0 && (
                                <span className="ml-1 text-blue-600">({reply.likes_count})</span>
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Sub-reply input box */}
                  {replyingToCommentId === comment.id && (
                    <div className="pl-10 flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={`@${comment.user_name}-কে উত্তর লিখুন...`}
                        className="flex-1 px-3 py-1.5 rounded-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                      />
                      <button
                        onClick={() => handleAddReply(comment.id)}
                        disabled={!replyText.trim()}
                        className="px-3 py-1.5 rounded-full bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 disabled:opacity-40 cursor-pointer"
                      >
                        পাঠান
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── MODALS ── */}
      {showReactionsModal && (
        <SocialReactionsModal postId={post.id} onClose={() => setShowReactionsModal(false)} />
      )}
      {showShareModal && (
        <SocialShareModal
          post={post}
          currentUser={currentUser}
          onClose={() => setShowShareModal(false)}
          onRepostSuccess={() => {
            if (onPostUpdated) onPostUpdated();
          }}
        />
      )}
      {showReportModal && (
        <SocialReportModal
          targetType="post"
          targetId={post.id}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
}
