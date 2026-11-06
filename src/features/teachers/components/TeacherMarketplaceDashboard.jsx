"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Users,
  Wallet,
  Video,
  BookOpen,
  ShieldCheck,
  ShieldAlert,
  Star,
  ArrowLeft,
  X,
  CreditCard,
  UserCheck,
  Save,
  Radio,
  Share2,
  Camera,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import StudentProfileModal from "./StudentProfileModal";
import SocialPostComposer from "./social/SocialPostComposer";
import SocialPostCard from "./social/SocialPostCard";

export default function TeacherMarketplaceDashboard({
  teacher,
  onBack,
  onLaunchLiveGroupCall,
  onLaunchDirectCall,
}) {
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'students' | 'live' | 'profile'
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState(null);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Teacher Profile State
  const [profileData, setProfileData] = useState({
    nameBn: teacher?.name_bn || teacher?.nameBn || "মুফতী মাওলানা ক্বারী আহমাদুল্লাহ",
    titleBn: teacher?.title_bn || teacher?.titleBn || "প্রধান উস্তাদ (তাজবীদ ও কিরাত বিভাগ)",
    avatar: teacher?.avatar || teacher?.avatar_url || "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=400&q=80",
    coverPhoto: teacher?.coverPhoto || teacher?.cover_url || "https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1200&q=80",
    hourlyFee: teacher?.hourly_fee || 350,
    monthlyFee: teacher?.monthly_fee || 2500,
    schedule: teacher?.schedule_text || teacher?.schedule || "প্রতিদিন: বিকাল ৪টা – রাত ১০টা",
    bio: teacher?.bio || "বিগত ১২ বছর ধরে শিশু, কিশোর ও বয়স্কদের বিশুদ্ধ তাজবীদ ও সুললিত সুরের সাথে কুরআন শিক্ষা দিচ্ছি।",
    isOnline: teacher?.is_online !== false,
  });

  // Teacher Social Posts State
  const [teacherPosts, setTeacherPosts] = useState(() => {
    try {
      const stored = localStorage.getItem("edusaas_teacher_posts_" + (teacher?.id || "default"));
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return [
      {
        id: "post_t_1",
        content: "মাশাআল্লাহ! আজকের লাইভ ক্লাসে সূরা আল-ফাতিহার মাখরাজ ও সিফাত অনুশীলন চমৎকার হয়েছে। সকল শিক্ষার্থীকে মোবারকবাদ।",
        created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
        author_name: profileData.nameBn,
        author_avatar: profileData.avatar,
        likes_count: 14,
        comments_count: 3,
        media_urls: [],
      },
    ];
  });

  const handleCreatePost = (newPost) => {
    const postWithAuthor = {
      ...newPost,
      id: "post_t_" + Date.now(),
      author_name: profileData.nameBn,
      author_avatar: profileData.avatar,
      author_role: "teacher",
      created_at: new Date().toISOString(),
      likes_count: 0,
      comments_count: 0,
    };
    const updated = [postWithAuthor, ...teacherPosts];
    setTeacherPosts(updated);
    try {
      localStorage.setItem("edusaas_teacher_posts_" + (teacher?.id || "default"), JSON.stringify(updated));
    } catch {
      // ignore
    }
    toast.success("মাশাআল্লাহ! নতুন পোস্ট সফলভাবে প্রকাশিত হয়েছে।");
  };

  const handleDeletePost = (postId) => {
    const updated = teacherPosts.filter((p) => p.id !== postId);
    setTeacherPosts(updated);
    try {
      localStorage.setItem("edusaas_teacher_posts_" + (teacher?.id || "default"), JSON.stringify(updated));
    } catch {
      // ignore
    }
    toast.info("পোস্টটি মুছে ফেলা হয়েছে।");
  };

  // ── Derived Financial & Ledger State (Preserved & Reconciled) ──
  // 1. Recorded Balance: Preserved historical ledger balance stored in database
  const recordedBalance = Number(teacher?.balance ?? teacher?.walletBalance ?? teacher?.recorded_balance ?? 0);

  // 2. Administrative Hold & Reconciliation Flags
  const isWithdrawalHeld = Boolean(teacher?.is_withdrawal_held ?? teacher?.isWithdrawalHeld ?? false);
  const reconciliationRequired = Boolean(teacher?.reconciliation_required ?? teacher?.reconciliationRequired ?? false);
  const holdReason =
    teacher?.hold_reason ||
    teacher?.holdReason ||
    (isWithdrawalHeld
      ? "SEED_WALLET_UNRECONCILED_HOLD: Preserved historical balance pending authorized finance review"
      : null);

  // 3. Withdrawable Balance:
  // INVARIANT: If withdrawal is held or reconciliation is required, Withdrawable Balance MUST be 0.
  // In addition, online withdrawals remain disabled platform-wide (no payout gateway backend exists).
  const withdrawableBalance = isWithdrawalHeld || reconciliationRequired ? 0 : 0;

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // Transactions Ledger (Loaded dynamically from authenticated wallet API; empty by default)
  const transactions = useMemo(() => {
    return Array.isArray(teacher?.transactions) ? teacher.transactions : [];
  }, [teacher?.transactions]);

  // Real Database Connections & Assistant Groups
  const [connections, setConnections] = useState([]);
  const [groups, setGroups] = useState([]);
  const [_isLoadingConnections, setIsLoadingConnections] = useState(false);

  const fetchConnections = async () => {
    setIsLoadingConnections(true);
    try {
      const res = await fetch("/api/teacher-marketplace/connections");
      const data = await res.json();
      if (data.ok) {
        const all = Array.isArray(data.connections)
          ? data.connections
          : [...(data.requests || []), ...(data.acceptedConnections || [])];
        setConnections(all);
        setGroups(data.groups || []);
      }
    } catch (e) {
      console.warn("Could not load connections:", e);
    } finally {
      setIsLoadingConnections(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const handleUpdateConnection = async (connectionId, action) => {
    try {
      const res = await fetch("/api/teacher-marketplace/connections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connection_id: connectionId, action }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        toast.error(data.error || "অনুরোধ হালনাগাদ করা যায়নি।");
        return;
      }
      toast.success(
        action === "accept"
          ? "মাশাআল্লাহ! শিক্ষার্থীর পড়ার আবেদন সফলভাবে গ্রহণ করা হয়েছে ও প্রাইভেট লার্নিং গ্রুপ সক্রিয় হয়েছে!"
          : "আবেদনটি বাতিল করা হয়েছে।"
      );
      fetchConnections();
    } catch (err) {
      console.error("Connection update error:", err);
      toast.error("নেটওয়ার্ক সমস্যার কারণে সম্পন্ন করা যায়নি।");
    }
  };

  // Enrolled Students (Loaded dynamically; empty by default)
  const [students] = useState(
    Array.isArray(teacher?.students) ? teacher.students : []
  );

  const isLoadingWallet = Boolean(teacher?.isLoadingWallet);
  const walletError = teacher?.walletError || null;

  // Strict allowlist: Only authentic student-paid credit transaction types qualify
  const QUALIFYING_CREDIT_TYPES = useMemo(() => new Set(["hadia_payment", "monthly_fee"]), []);

  // 4. Server-Side Lifetime Verified Earnings (or exact fallback calculation)
  // INVARIANT: Do NOT classify raw total_earned as verified earnings merely because a wallet is not held.
  // Calculate verified earnings ONLY from qualifying completed, verified ledger transactions.
  const verifiedEarnings = useMemo(() => {
    if (typeof teacher?.verified_earnings === "number") {
      return teacher.verified_earnings;
    }
    if (typeof teacher?.wallet?.verified_earnings === "number") {
      return teacher.wallet.verified_earnings;
    }
    if (!Array.isArray(transactions) || transactions.length === 0) return 0;
    return transactions
      .filter((tx) => {
        const isCompleted = tx.status === "completed" || tx.status === "সফল";
        const txType = String(tx.type || tx.transaction_type || "").trim();
        // Exact allowlist match only (no substring, no !txType)
        const isExactQualifying = QUALIFYING_CREDIT_TYPES.has(txType);
        // Authoritative gateway verification required
        const isVerifiedGateway = tx.isVerifiedGateway !== false && Boolean(tx.gateway_ref || tx.isVerifiedGateway);
        return isCompleted && isExactQualifying && isVerifiedGateway;
      })
      .reduce((sum, tx) => sum + (Number(tx.net || tx.amount_net || tx.amount) || 0), 0);
  }, [teacher, transactions, QUALIFYING_CREDIT_TYPES]);

  // Recorded Total Earned: Preserved historical recorded value from database
  const recordedTotalEarned = Number(teacher?.total_earned ?? teacher?.recorded_total_earned ?? teacher?.totalEarned ?? 0);

  // Unverified Historical Credits & Calculated Ledger Balance from server
  const unverifiedHistoricalCredits = Number(
    teacher?.unverified_historical_credits ?? 
    teacher?.wallet?.unverified_historical_credits ?? 
    0
  );
  const calculatedLedgerBalance = Number(
    teacher?.calculated_ledger_balance ?? 
    teacher?.wallet?.calculated_ledger_balance ?? 
    0
  );
  const isCompleteLedger = teacher?.ledger_summary?.is_complete_ledger ?? true;
  const lifetimeWithdrawals = Number(
    teacher?.ledger_summary?.lifetime_withdrawals ?? 
    teacher?.wallet?.total_withdrawn ?? 
    0
  );
  const lifetimeRefunds = Number(
    teacher?.ledger_summary?.lifetime_refunds ?? 0
  );
  const lifetimeAdjustments = Number(
    teacher?.ledger_summary?.lifetime_adjustments ?? 0
  );

  // 5. Bidirectional Reconciliation Difference Calculation
  // Discrepancy = Recorded - Verified
  const discrepancy = recordedTotalEarned - verifiedEarnings;
  const reconciliationStatus = teacher?.reconciliation_status || (
    discrepancy > 0 
      ? "RECORDED_EXCEEDS_VERIFIED"
      : discrepancy < 0 
        ? "VERIFIED_EXCEEDS_RECORDED"
        : "BALANCED"
  );
  const discrepancyAmount = Math.abs(discrepancy);

  // Helper: Upload image via Cloudinary with Data URL fallback
  const uploadImageFile = async (file, folder = "teacher_profiles") => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);
      formData.append("image_type", "avatar");

      const res = await fetch("/api/uploads/cloudinary", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.ok && (data.file_url || data.secure_url)) {
        return data.file_url || data.secure_url;
      }
    } catch {
      // Cloudinary unreachable / unconfigured, gracefully fallback
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      toast.loading("প্রোফাইল ছবি আপলোড হচ্ছে...", { id: "teacher-avatar-upload" });
      const url = await uploadImageFile(file, "teacher_profiles/avatars");
      setProfileData((prev) => ({ ...prev, avatar: url }));

      const updatedTeacher = { ...(teacher || {}), avatar: url, avatar_url: url };
      try {
        localStorage.setItem("edusaas_current_teacher_session", JSON.stringify(updatedTeacher));
      } catch {}

      fetch("/api/teacher-marketplace/social/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar_url: url, teacher_id: teacher?.id }),
      }).catch(() => {});

      toast.success("মাশাআল্লাহ! প্রোফাইল ছবি সফলভাবে আপডেট করা হয়েছে!", { id: "teacher-avatar-upload" });
    } catch {
      toast.error("ছবি আপলোডে ত্রুটি হয়েছে।", { id: "teacher-avatar-upload" });
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      toast.loading("কভার ফটো আপলোড হচ্ছে...", { id: "teacher-cover-upload" });
      const url = await uploadImageFile(file, "teacher_profiles/covers");
      setProfileData((prev) => ({ ...prev, coverPhoto: url }));

      const updatedTeacher = { ...(teacher || {}), coverPhoto: url, cover_url: url };
      try {
        localStorage.setItem("edusaas_current_teacher_session", JSON.stringify(updatedTeacher));
      } catch {}

      fetch("/api/teacher-marketplace/social/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cover_url: url, teacher_id: teacher?.id }),
      }).catch(() => {});

      toast.success("মাশাআল্লাহ! কভার ফটো সফলভাবে পরিবর্তন করা হয়েছে!", { id: "teacher-cover-upload" });
    } catch {
      toast.error("কভার ফটো আপলোডে ত্রুটি হয়েছে।", { id: "teacher-cover-upload" });
    }
  };

  // Save Profile Changes
  const handleSaveProfile = (e) => {
    e.preventDefault();
    try {
      const updatedTeacher = {
        ...(teacher || {}),
        nameBn: profileData.nameBn,
        name_bn: profileData.nameBn,
        titleBn: profileData.titleBn,
        title_bn: profileData.titleBn,
        avatar: profileData.avatar,
        avatar_url: profileData.avatar,
        coverPhoto: profileData.coverPhoto,
        cover_url: profileData.coverPhoto,
        hourlyFeeBn: `${profileData.hourlyFee} টাকা / ঘণ্টা`,
        hourly_fee: profileData.hourlyFee,
        monthlyFeeBn: `${profileData.monthlyFee} টাকা / মাস`,
        monthly_fee: profileData.monthlyFee,
        schedule: profileData.schedule,
        schedule_text: profileData.schedule,
        bio: profileData.bio,
        isOnline: profileData.isOnline,
        is_online: profileData.isOnline,
      };
      localStorage.setItem("edusaas_current_teacher_session", JSON.stringify(updatedTeacher));

      // Update registered teachers array if present
      const registered = JSON.parse(localStorage.getItem("edusaas_registered_teachers") || "[]");
      const idx = registered.findIndex((t) => t.id === teacher?.id);
      if (idx !== -1) {
        registered[idx] = { ...registered[idx], ...updatedTeacher };
        localStorage.setItem("edusaas_registered_teachers", JSON.stringify(registered));
      }
    } catch {
      // ignore
    }
    toast.success("মাশাআল্লাহ! আপনার শিক্ষক প্রোফাইল ও ক্লাসের সেটিংস সংরক্ষিত হয়েছে।");
  };

  // Submit Payout Request (Disabled: Payout backend does not exist; no simulated balances or fake transactions)
  const handleWithdrawSubmit = (e) => {
    e.preventDefault();
    toast.info("স্বয়ংক্রিয় অনলাইন হাদিয়া উত্তোলন ব্যবস্থা বর্তমানে বিকাশ/নগদ পেআউট গেটওয়ে সংযোজন সাপেক্ষে স্থগিত রয়েছে। কোনো প্রকার কাল্পনিক লেনদেন বা ব্যালেন্স পরিবর্তন করা হবে না। হিসাব সংক্রান্ত সহায়তার জন্য একাডেমি হিসাব বিভাগের সাথে যোগাযোগ করুন।");
    setShowWithdrawModal(false);
  };

  // Self Account Deletion
  const handleConfirmDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      await fetch("/api/teacher-marketplace/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_account",
          user_id: teacher?.id || teacher?.teacher_id,
          role: "teacher",
        }),
      });
      localStorage.removeItem("edusaas_current_teacher_session");
      const reg = JSON.parse(localStorage.getItem("edusaas_registered_teachers") || "[]");
      const filtered = reg.filter((t) => t.id !== teacher?.id && t.teacher_id !== teacher?.teacher_id);
      localStorage.setItem("edusaas_registered_teachers", JSON.stringify(filtered));
      toast.success("আপনার শিক্ষক অ্যাকাউন্ট সফলভাবে মুছে ফেলা হয়েছে।");
      setShowDeleteAccountModal(false);
      if (onBack) onBack();
      else window.location.href = "/quran-tutor/studio?feature=human-teacher";
    } catch {
      localStorage.removeItem("edusaas_current_teacher_session");
      toast.success("আপনার শিক্ষক অ্যাকাউন্ট সফলভাবে মুছে ফেলা হয়েছে।");
      setShowDeleteAccountModal(false);
      if (onBack) onBack();
      else window.location.href = "/quran-tutor/studio?feature=human-teacher";
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F8F9FA] dark:bg-[#07130E] text-slate-900 dark:text-emerald-50 pb-24 animate-fadeIn font-['Hind_Siliguri',sans-serif]">
      {/* ── TOP HEADER BAR ── */}
      <div className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 px-4 sm:px-8 py-4 sticky top-0 z-30 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-slate-700 dark:text-stone-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">মার্কেটপ্লেসে ফিরুন</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                টিচার পার্সোনাল ড্যাশবোর্ড
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>ভেরিফাইড উস্তাদ</span>
              </span>
            </div>
            <p className="text-xs text-slate-500">{profileData.nameBn}</p>
          </div>
        </div>

        {/* Action: Fast Launch Live Group Call */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              if (onLaunchLiveGroupCall) {
                onLaunchLiveGroupCall({
                  teacher,
                  roomTitle: "সূরা আল-ফাতিহা ও তাজবীদ মাশক লাইভ গ্রুপ ক্লাস",
                  roomCode: `ROOM-${teacher?.id || "LIVE-101"}`,
                  isHostTeacher: true,
                });
              } else {
                toast.success("লাইভ গ্রুপ ক্লাসরুম চালু হচ্ছে...");
              }
            }}
            className="px-4 py-2 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs flex items-center gap-2 shadow-md shadow-red-600/20 transition active:scale-95 cursor-pointer animate-pulse"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>গ্রুপ লাইভ ক্লাস শুরু করুন</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* ── PENDING APPROVAL NOTICE IF APPLICANT ── */}
        {teacher?.status === "pending" && (
          <div className="p-4 sm:p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200 space-y-1">
            <div className="flex items-center gap-2 font-black text-sm text-amber-900 dark:text-amber-100">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              <span>আপনার শিক্ষক আবেদনটি পর্যালোচনায় রয়েছে</span>
            </div>
            <p className="text-xs leading-relaxed">
              মূল প্ল্যাটফর্ম অ্যাডমিন কর্তৃক সনদ ও যোগ্যতা যাচাইয়ের পর আপনার প্রোফাইলটি সাধারণ শিক্ষার্থী ও উন্মুক্ত ডিরেক্টরিতে সক্রিয়ভাবে প্রদর্শিত হবে। আপনি ড্যাশবোর্ড থেকে আপনার প্রোফাইল, হাদিয়া রেট ও পোস্ট এখনই সাজিয়ে রাখতে পারেন।
            </p>
          </div>
        )}

        {/* ── 4 KEY METRICS OVERVIEW CARDS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Recorded Ledger Balance & Withdrawable Status */}
          <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-stone-400">রেকর্ডকৃত লেজার ব্যালেন্স (উত্তোলনযোগ্য ওয়ালেট স্ট্যাটাস)</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            {walletError ? (
              <div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {recordedBalance.toLocaleString("bn-BD")} ৳
                </p>
                <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400 mt-1">
                  🔒 ওয়ালেট প্রিভিউ (অফিশিয়াল পেআউট অ্যাক্সেস যাচাই সাপেক্ষে সক্রিয়)
                </p>
              </div>
            ) : isLoadingWallet ? (
              <p className="text-lg font-bold text-slate-400 animate-pulse">
                ওয়ালেট লোড হচ্ছে...
              </p>
            ) : (
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {recordedBalance.toLocaleString("bn-BD")} ৳
              </p>
            )}

            {isWithdrawalHeld ? (
              <div className="space-y-1">
                <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-black inline-flex items-center gap-1 border border-amber-300 dark:border-amber-800">
                  <ShieldAlert className="w-3 h-3 text-amber-600" />
                  <span>প্রশাসনিক হোল্ড (উত্তোলনযোগ্য: ০ ৳)</span>
                </span>
                <p className="text-[10px] text-slate-500">
                  যাচাইকৃত উপার্জন: <strong className="text-slate-900 dark:text-white">{verifiedEarnings.toLocaleString("bn-BD")} ৳</strong>
                </p>
                {reconciliationStatus === "RECORDED_EXCEEDS_VERIFIED" && (
                  <p className="text-[10px] text-amber-700 dark:text-amber-300">
                    অযাচাইকৃত রেকর্ডকৃত উদ্বৃত্ত: {discrepancyAmount.toLocaleString("bn-BD")} ৳
                  </p>
                )}
                {reconciliationStatus === "VERIFIED_EXCEEDS_RECORDED" && (
                  <p className="text-[10px] text-blue-700 dark:text-blue-300">
                    লেজার উদ্বৃত্ত: {discrepancyAmount.toLocaleString("bn-BD")} ৳ (অজমা কৃত আয়)
                  </p>
                )}
                {reconciliationStatus === "BALANCED" && (
                  <p className="text-[10px] text-emerald-700 dark:text-emerald-300">
                    ✓ লেজার শতভাগ সামঞ্জস্যপূর্ণ
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-[11px] text-slate-500">
                  উত্তোলনযোগ্য: <span className="font-bold text-emerald-700 dark:text-emerald-400">{withdrawableBalance.toLocaleString("bn-BD")} ৳</span>
                </p>
                <p className="text-[10px] text-slate-500">
                  যাচাইকৃত উপার্জন: <strong className="text-slate-900 dark:text-white">{verifiedEarnings.toLocaleString("bn-BD")} ৳</strong>
                </p>
                {reconciliationStatus === "RECORDED_EXCEEDS_VERIFIED" && (
                  <p className="text-[10px] text-amber-700 dark:text-amber-300">
                    অযাচাইকৃত উদ্বৃত্ত: {discrepancyAmount.toLocaleString("bn-BD")} ৳
                  </p>
                )}
                {reconciliationStatus === "VERIFIED_EXCEEDS_RECORDED" && (
                  <p className="text-[10px] text-blue-700 dark:text-blue-300">
                    লেজার উদ্বৃত্ত: {discrepancyAmount.toLocaleString("bn-BD")} ৳
                  </p>
                )}
                {reconciliationStatus === "BALANCED" && (
                  <p className="text-[10px] text-emerald-700 dark:text-emerald-300">
                    ✓ লেজার শতভাগ সামঞ্জস্যপূর্ণ
                  </p>
                )}
              </div>
            )}
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="text-[11px] font-black text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer pt-1"
            >
              উত্তোলনের স্ট্যাটাস ও তথ্য →
            </button>
          </div>

          {/* Card 2: Total Students */}
          <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-stone-400">নিবন্ধিত শিক্ষার্থী</span>
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {(Number(teacher?.total_students ?? teacher?.totalStudents) || students.length).toLocaleString("bn-BD")} জন
            </p>
            <p className="text-[11px] text-emerald-600 font-bold">
              ✓ {students.length > 0 ? `${students.length.toLocaleString("bn-BD")} জন নথিভুক্ত` : "০ জন নথিভুক্ত"}
            </p>
          </div>

          {/* Card 3: Total Completed Classes */}
          <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-stone-400">সম্পন্ন ক্লাস সংখ্যা</span>
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {(Number(teacher?.total_classes ?? teacher?.totalClasses ?? teacher?.totalHours) || 0).toLocaleString("bn-BD")}টি
            </p>
            <p className="text-[11px] text-slate-500 font-medium">১-অন-১ ও গ্রুপ ক্লাস</p>
          </div>

          {/* Card 4: Overall Rating */}
          <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-stone-400">রেটিং ও সুনাম</span>
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {Number(teacher?.rating || 0) > 0 ? Number(teacher?.rating).toFixed(1) : "০.০"} / ৫.০
            </p>
            <p className="text-[11px] text-amber-700 dark:text-amber-400 font-bold">
              {(Number(teacher?.total_reviews ?? teacher?.totalReviews) || 0).toLocaleString("bn-BD")}টি ভেরিফাইড রিভিউ
            </p>
          </div>
        </div>

        {/* ── TABS NAVIGATION ── */}
        <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-2 overflow-x-auto no-scrollbar">
          {[
            { id: "overview", label: "ওয়ালেট ও লেনদেনের লেজার", icon: Wallet },
            { id: "posts", label: "পোস্ট ও কন্টেন্ট স্টুডিও", icon: Share2 },
            { id: "students", label: `আমার শিক্ষার্থীগণ (${students.length})`, icon: Users },
            { id: "live", label: "গ্রুপ লাইভ ক্লাসরুম পরিচালনা", icon: Video },
            { id: "profile", label: "প্রোফাইল ও হাদিয়া সম্পাদনা", icon: UserCheck },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap flex items-center gap-2 transition cursor-pointer ${
                  isActive
                    ? "bg-emerald-700 text-white shadow-md shadow-emerald-700/20"
                    : "bg-white dark:bg-stone-900 text-slate-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── TAB 1: WALLET & FINANCIAL LEDGER ── */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Ledger Table */}
            <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    <span>হাদিয়া ও ওয়ালেট লেনদেনের হিসাব (ডাবল-এন্ট্রি লেজার)</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    শিক্ষার্থীদের পরিশোধিত মোট ফি, প্ল্যাটফর্ম কমিশন এবং আপনার নিট আয়ের পুঙ্খানুপুঙ্খ বিবরণ
                  </p>
                </div>
                <button
                  onClick={() => setShowWithdrawModal(true)}
                  className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-slate-800 dark:text-stone-200 font-extrabold text-xs shadow-sm transition active:scale-95 cursor-pointer border border-stone-300 dark:border-stone-700 flex items-center gap-1.5"
                >
                  <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>উত্তোলনের স্ট্যাটাস ও নিয়মাবলী</span>
                </button>
              </div>

              {/* ⚠️ Administrative Withdrawal Hold Banner (If Active) */}
              {isWithdrawalHeld && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs space-y-1">
                  <div className="flex items-center gap-2 font-black text-amber-800 dark:text-amber-300">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>অ্যাকাউন্টে প্রশাসনিক রিকনসিলিয়েশন হোল্ড সক্রিয় রয়েছে</span>
                  </div>
                  <p className="text-[11px] text-slate-700 dark:text-stone-300">
                    <strong className="text-amber-900 dark:text-amber-200">হোল্ডের কারণ:</strong> {holdReason}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-stone-400">
                    * আপনার পূর্বে রেকর্ডকৃত লেজার ব্যালেন্স ({recordedBalance.toLocaleString("bn-BD")} ৳) অপরিবর্তিত ও সুরক্ষিত রয়েছে। ডাবল-এন্ট্রি লেজার অডিট ও গেটওয়ে যাচাই সম্পন্ন হওয়ার পূর্বে কোনো অর্থ উত্তোলনযোগ্য হিসেবে প্রদর্শন বা ছাড় করা হবে না।
                  </p>
                </div>
              )}

              {/* ── Strict Double-Entry Financial Accounting Summary Grid ── */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">ভেরিফাইড পেমেন্ট ক্রেডিট</span>
                  <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                    {verifiedEarnings.toLocaleString("bn-BD")} ৳
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">অযাচাইকৃত ঐতিহাসিক ক্রেডিট</span>
                  <span className="text-sm font-black text-amber-700 dark:text-amber-400">
                    {unverifiedHistoricalCredits.toLocaleString("bn-BD")} ৳
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">উত্তোলন ও রিফান্ড</span>
                  <span className="text-sm font-black text-slate-700 dark:text-stone-300">
                    {(lifetimeWithdrawals + lifetimeRefunds).toLocaleString("bn-BD")} ৳
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">হিসাবকৃত লেজার ব্যালেন্স</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {calculatedLedgerBalance.toLocaleString("bn-BD")} ৳
                    {lifetimeAdjustments !== 0 && (
                      <span className="text-[9px] text-slate-400 ml-1">
                        (সমন্বয়: {lifetimeAdjustments > 0 ? `+${lifetimeAdjustments}` : lifetimeAdjustments} ৳)
                      </span>
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">লেজার সম্পূর্ণতা অডিট</span>
                  <span className={`text-xs font-black inline-flex items-center gap-1 ${
                    isCompleteLedger ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"
                  }`}>
                    {isCompleteLedger ? "✓ সম্পূর্ণ লাইফটাইম অডিট" : "⚠️ অসম্পূর্ণ লেজার"}
                  </span>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 dark:bg-stone-800/60 text-slate-700 dark:text-stone-300 font-extrabold uppercase text-[10px] tracking-wider border-b border-stone-200 dark:border-stone-700">
                    <tr>
                      <th className="p-3.5">লেনদেন আইডি ও তারিখ</th>
                      <th className="p-3.5">শিক্ষার্থী / বিবরণ</th>
                      <th className="p-3.5">মোট হাদিয়া</th>
                      <th className="p-3.5">প্ল্যাটফর্ম ফি (১০%)</th>
                      <th className="p-3.5">আপনার নিট জমা</th>
                      <th className="p-3.5">গেটওয়ে</th>
                      <th className="p-3.5">অবস্থা ও গেটওয়ে যাচাই</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800 font-medium">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400 font-semibold text-xs">
                          এখনো কোনো আর্থিক লেনদেন বা হাদিয়া জমার রেকর্ড নেই।
                        </td>
                      </tr>
                    ) : (
                      transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40 transition">
                          <td className="p-3.5 font-mono">
                            <p className="font-bold text-slate-900 dark:text-white">{tx.id}</p>
                            <p className="text-[10px] text-slate-400">{tx.date}</p>
                          </td>
                          <td className="p-3.5">
                            <p className="font-bold text-slate-900 dark:text-white">{tx.studentName}</p>
                            <p className="text-[10px] text-emerald-700 dark:text-emerald-400">{tx.type}</p>
                          </td>
                          <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                            {tx.gross.toLocaleString("bn-BD")} ৳
                          </td>
                          <td className="p-3.5 font-bold text-teal-700 dark:text-teal-400">
                            {tx.platformCut > 0 ? `-${tx.platformCut.toLocaleString("bn-BD")} ৳` : "০ ৳"}
                          </td>
                          <td className="p-3.5 font-black text-emerald-800 dark:text-emerald-300">
                            {tx.net > 0 ? `+${tx.net.toLocaleString("bn-BD")} ৳` : `${tx.net.toLocaleString("bn-BD")} ৳`}
                          </td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 font-mono text-[10px] font-bold">
                              {tx.gateway}
                            </span>
                          </td>
                          <td className="p-3.5">
                            {tx.isVerifiedGateway ? (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold inline-flex items-center gap-1">
                                ✓ ভেরিফাইড ({tx.status})
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-extrabold inline-flex items-center gap-1">
                                ⚠️ প্রমাণহীন ({tx.status})
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: POSTS & CONTENT STUDIO ── */}
        {activeTab === "posts" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
              <div className="border-b border-stone-100 dark:border-stone-800 pb-3">
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-emerald-600" />
                  <span>শিক্ষক পোস্ট ও কন্টেন্ট স্টুডিও</span>
                </h3>
                <p className="text-xs text-slate-500">
                  শিক্ষার্থীদের জন্য নতুন তাজবীদ নসিহত, ক্লাস আপডেট বা অডিও/ভিডিও পোস্ট প্রকাশ করুন
                </p>
              </div>

              {/* Post Composer */}
              <SocialPostComposer
                currentUser={{
                  id: teacher?.id || "teacher-current",
                  name: profileData.nameBn,
                  avatar: profileData.avatar,
                  role: "teacher",
                }}
                onPostCreated={handleCreatePost}
              />
            </div>

            {/* My Posts List */}
            <div className="space-y-4">
              <h4 className="text-sm font-black text-slate-800 dark:text-stone-200">
                আপনার প্রকাশিত পোস্টসমূহ ({teacherPosts.length})
              </h4>
              {teacherPosts.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 text-xs text-slate-400 font-semibold">
                  এখনো কোনো পোস্ট প্রকাশিত হয়নি। উপরের বক্স থেকে আপনার প্রথম পোস্ট লিখুন!
                </div>
              ) : (
                teacherPosts.map((post) => (
                  <div key={post.id} className="relative group">
                    <SocialPostCard
                      post={post}
                      currentUser={{
                        id: teacher?.id || "teacher-current",
                        name: profileData.nameBn,
                        avatar: profileData.avatar,
                        role: "teacher",
                      }}
                      onCommentAdded={() => {}}
                      onReactionToggled={() => {}}
                    />
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="absolute top-4 right-14 px-2 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 text-[10px] font-bold transition cursor-pointer"
                      title="পোস্ট মুছুন"
                    >
                      মুছুন
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── TAB 2: MY STUDENTS ── */}
        {activeTab === "students" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Real Pending Learning Requests from Students */}
            {connections.filter((c) => c.status === "pending" && c.initiated_by === "student").length > 0 && (
              <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-amber-300 dark:border-amber-700/60 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-amber-100 dark:border-amber-800/40 pb-3">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-500" />
                    <span>পড়ার নতুন আবেদনসমূহ ({connections.filter((c) => c.status === "pending" && c.initiated_by === "student").length})</span>
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    অপেক্ষমান
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {connections
                    .filter((c) => c.status === "pending" && c.initiated_by === "student")
                    .map((req) => (
                      <div
                        key={req.id}
                        className="p-5 rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/40 dark:bg-amber-950/20 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-black text-slate-900 dark:text-white">
                              {req.student_name || "সম্মানিত শিক্ষার্থী"}
                            </h4>
                            <p className="text-xs text-amber-800 dark:text-amber-300 font-bold">
                              {req.subject || "কুরআন ও তাজবীদ শিক্ষা"}
                            </p>
                          </div>
                          <span className="px-2.5 py-1 rounded-full bg-amber-200 text-amber-900 text-[10px] font-mono font-bold">
                            {req.student_public_id || "STU-NEW"}
                          </span>
                        </div>

                        {req.request_message && (
                          <p className="text-xs text-slate-700 dark:text-stone-300 italic bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-amber-100 dark:border-stone-800">
                            &ldquo;{req.request_message}&rdquo;
                          </p>
                        )}

                        <div className="pt-2 flex items-center justify-end gap-2 border-t border-amber-200/60 dark:border-amber-800/40">
                          <button
                            onClick={() => handleUpdateConnection(req.id, "reject")}
                            className="px-3 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 text-slate-700 dark:text-stone-300 font-bold text-xs transition cursor-pointer"
                          >
                            প্রত্যাখ্যান
                          </button>
                          <button
                            onClick={() => handleUpdateConnection(req.id, "accept")}
                            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs transition active:scale-95 cursor-pointer"
                          >
                            আবেদন গ্রহণ করুন
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Real Active Connected Students */}
            {connections.filter((c) => c.status === "accepted").length > 0 && (
              <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-emerald-300 dark:border-emerald-800/60 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-emerald-100 dark:border-emerald-800/40 pb-3">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>সক্রিয় সংযুক্ত শিক্ষার্থীগণ ({connections.filter((c) => c.status === "accepted").length})</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {connections
                    .filter((c) => c.status === "accepted")
                    .map((conn) => (
                      <div
                        key={conn.id}
                        className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-black text-slate-900 dark:text-white">{conn.student_name}</h4>
                            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">{conn.subject || "কুরআন ও তাজবীদ শিক্ষা"}</p>
                          </div>
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                            সক্রিয় শিক্ষার্থী
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-stone-200 dark:border-stone-700">
                          <span className="font-mono text-[11px]">{conn.student_public_id}</span>
                          <span className="text-emerald-600 font-bold">প্রাইভেট গ্রুপ সংযুক্ত</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Legacy Enrolled Students or Empty State */}
            {connections.length === 0 && students.length === 0 && (
              <div className="bg-white dark:bg-stone-900 rounded-3xl p-10 border border-stone-200 dark:border-stone-800 text-center space-y-2">
                <Users className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-sm font-black text-slate-800 dark:text-stone-200">কোনো সক্রিয় শিক্ষার্থী বা আবেদন নেই</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  শিক্ষার্থীরা আপনার প্রোফাইল থেকে &ldquo;পড়তে চাই&rdquo; আবেদন পাঠালে তা এখানে প্রদর্শিত হবে এবং আপনি তা অনুমোদন করতে পারবেন।
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: GROUP LIVE ROOM MANAGEMENT ── */}
        {activeTab === "live" && (
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Radio className="w-4 h-4 text-red-600 animate-pulse" />
                  <span>গ্রুপ লাইভ ক্লাসরুম পরিচালনা (Facebook / Meet / Zoom Style)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  একক উস্তাদের সাথে বহু শিক্ষার্থীর একসাথে যুক্ত হয়ে লাইভ মাশক ও কুরআন তিলাওয়াত ক্লাসরুম
                </p>
              </div>

              <button
                onClick={() => {
                  if (onLaunchLiveGroupCall) {
                    onLaunchLiveGroupCall({
                      teacher,
                      roomTitle: "সূরা আল-ফাতিহা ও তাজবীদ মাশক লাইভ গ্রুপ ক্লাস",
                      roomCode: `ROOM-${teacher?.id || "LIVE-101"}`,
                      isHostTeacher: true,
                    });
                  }
                }}
                className="px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 transition active:scale-95 cursor-pointer"
              >
                <Video className="w-4 h-4" />
                <span>লাইভ রুমে প্রবেশ করুন</span>
              </button>
            </div>

            {/* Room Parameters Card */}
            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-[11px] text-slate-500 font-bold">স্থায়ী রুম কোড:</p>
                  <p className="text-base font-mono font-black text-emerald-800 dark:text-emerald-300">
                    ROOM-{teacher?.id || "LIVE-101"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] text-slate-500 font-bold">সর্বোচ্চ ধারণক্ষমতা:</p>
                  <p className="text-base font-black text-slate-900 dark:text-white">৫০ জন শিক্ষার্থী</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] text-slate-500 font-bold">ক্লাসরুম এনক্রিপশন:</p>
                  <p className="text-base font-bold text-teal-700 dark:text-teal-400">WebRTC P2P সুরক্ষিত</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-stone-900 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-stone-300">
                  ক্লাস লিঙ্ক শেয়ার করুন: <span className="font-mono text-emerald-600 font-bold">http://localhost:3000/quran-tutor/studio?feature=human-teacher&room=ROOM-101</span>
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText("http://localhost:3000/quran-tutor/studio?feature=human-teacher&room=ROOM-101");
                    toast.success("ক্লাসরুম লিঙ্ক কপি করা হয়েছে!");
                  }}
                  className="px-3 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold cursor-pointer"
                >
                  লিঙ্ক কপি
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: PROFILE & FEE EDITING ── */}
        {activeTab === "profile" && (
          <form
            onSubmit={handleSaveProfile}
            className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-6"
          >
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>মার্কেটপ্লেস প্রোফাইল ও ফেসবুক-স্টাইল কভার-ছবি সেটিংস</span>
              </h3>
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                ক্যামেরা আইকনে ক্লিক করে সরাসরি ছবি আপলোড করুন
              </span>
            </div>

            {/* Facebook-Style Visual Cover & Avatar Preview with Direct Camera Upload Buttons */}
            <div className="rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden bg-slate-900 relative">
              {/* Cover Banner */}
              <div className="h-44 sm:h-56 w-full relative">
                <img
                  src={profileData.coverPhoto}
                  alt="Teacher Cover"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <label
                  htmlFor="teacher-cover-file-input"
                  className="absolute bottom-3 right-3 px-3.5 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition active:scale-95 z-10"
                >
                  <Camera className="w-4 h-4 text-emerald-400" />
                  <span>কভার ফটো পরিবর্তন করুন</span>
                  <input
                    id="teacher-cover-file-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverUpload}
                  />
                </label>
              </div>

              {/* Avatar Section */}
              <div className="px-6 pb-4 pt-0 relative bg-white dark:bg-stone-900">
                <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-3 -mt-14 sm:-mt-16 mb-2">
                  <div className="relative group">
                    <img
                      src={profileData.avatar}
                      alt={profileData.nameBn}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white dark:border-stone-900 shadow-xl ring-2 ring-emerald-500/40"
                    />
                    <label
                      htmlFor="teacher-avatar-file-input"
                      className="absolute bottom-0 right-0 p-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg border-2 border-white dark:border-stone-900 cursor-pointer transition active:scale-95 z-10"
                      title="প্রোফাইল ছবি পরিবর্তন করুন"
                    >
                      <Camera className="w-4 h-4" />
                      <input
                        id="teacher-avatar-file-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                    </label>
                  </div>

                  <div className="text-center sm:text-left flex-1 sm:ml-4">
                    <h4 className="text-base font-black text-slate-900 dark:text-white">
                      {profileData.nameBn}
                    </h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                      {profileData.titleBn}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-stone-300">আপনার নাম (বাংলায়):</label>
                <input
                  type="text"
                  value={profileData.nameBn}
                  onChange={(e) => setProfileData({ ...profileData, nameBn: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-stone-300">পদবি ও বিভাগ:</label>
                <input
                  type="text"
                  value={profileData.titleBn}
                  onChange={(e) => setProfileData({ ...profileData, titleBn: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-stone-300">প্রতি ঘণ্টা হাদিয়া (টাকা):</label>
                <input
                  type="number"
                  min={100}
                  value={profileData.hourlyFee}
                  onChange={(e) => setProfileData({ ...profileData, hourlyFee: Number(e.target.value) || 0 })}
                  className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-stone-300">মাসিক পূর্ণাঙ্গ কোর্স হাদিয়া (টাকা):</label>
                <input
                  type="number"
                  min={500}
                  value={profileData.monthlyFee}
                  onChange={(e) => setProfileData({ ...profileData, monthlyFee: Number(e.target.value) || 0 })}
                  className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-slate-700 dark:text-stone-300">পাঠদানের সময়সূচী:</label>
                <input
                  type="text"
                  value={profileData.schedule}
                  onChange={(e) => setProfileData({ ...profileData, schedule: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-slate-700 dark:text-stone-300">প্রোফাইল ছবি URL (Avatar):</label>
                <input
                  type="text"
                  value={profileData.avatar}
                  onChange={(e) => setProfileData({ ...profileData, avatar: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-slate-700 dark:text-stone-300">কভার ফটো URL (Cover Photo):</label>
                <input
                  type="text"
                  value={profileData.coverPhoto}
                  onChange={(e) => setProfileData({ ...profileData, coverPhoto: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-slate-700 dark:text-stone-300">বিস্তারিত পরিচিতি (বায়ো):</label>
                <textarea
                  rows={3}
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs shadow-md transition active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>পরিবর্তন সংরক্ষণ করুন</span>
              </button>
            </div>

            {/* ── ⚠️ DANGER ZONE: ACCOUNT DELETION ── */}
            <div className="mt-8 pt-6 border-t border-rose-200 dark:border-rose-900/60 p-5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 space-y-3">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-black text-sm">
                <Trash2 className="w-4 h-4" />
                <span>বিপদজনক জোন — শিক্ষক অ্যাকাউন্ট ডিলিট করুন</span>
              </div>
              <p className="text-xs text-rose-800/80 dark:text-rose-300/80 leading-relaxed font-medium">
                ফেসবুকের মতো আপনি চাইলে যেকোনো সময় আপনার আইডি ও সম্পূর্ণ শিক্ষক প্রোফাইল স্থায়ীভাবে মুছে ফেলতে পারেন। অ্যাকাউন্ট ডিলিট করলে আপনার প্রোফাইল, বায়ো ও সকল তথ্য প্ল্যাটফর্ম থেকে স্থায়ীভাবে মুছে যাবে।
              </p>
              <button
                type="button"
                onClick={() => setShowDeleteAccountModal(true)}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center gap-2 shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>আমার শিক্ষক অ্যাকাউন্ট মুছে ফেলুন (Delete Account)</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── WITHDRAWAL MODAL ── */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-md w-full p-6 space-y-4 border border-stone-200 dark:border-stone-800 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <span>হাদিয়া উত্তোলন আবেদন</span>
              </h3>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>অনলাইন হাদিয়া উত্তোলন সাময়িকভাবে স্থগিত</span>
              </div>
              <p className="text-slate-600 dark:text-stone-300 leading-relaxed text-[11px]">
                অফিসিয়াল পেমেন্ট পেআউট গেটওয়ে সংযোগ বর্তমানে প্রক্রিয়াধীন রয়েছে। আর্থিক সুরক্ষা ও দ্বৈত-হিসাবরক্ষণ নিশ্চিত করার স্বার্থে এই মুহূর্তে স্বয়ংক্রিয় অনলাইন উত্তোলন সক্রিয় নয়। কোনো প্রকার কাল্পনিক উইথড্রয়াল এন্ট্রি বা অনুমিত ব্যালেন্স কর্তন করা হবে না। হিসাব সংক্রান্ত সহায়তার জন্য একাডেমি হিসাব বিভাগে যোগাযোগ করুন।
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-600 dark:text-stone-300">
                <span>রেকর্ডকৃত লেজার ব্যালেন্স:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{recordedBalance.toLocaleString("bn-BD")} ৳</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 dark:text-stone-300">
                <span>যাচাইকৃত উপার্জন (লেজার-ব্যাকড):</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{verifiedEarnings.toLocaleString("bn-BD")} ৳</span>
              </div>
              {reconciliationStatus === "RECORDED_EXCEEDS_VERIFIED" && (
                <div className="flex justify-between items-center text-amber-700 dark:text-amber-400">
                  <span>অযাচাইকৃত রেকর্ডকৃত উদ্বৃত্ত:</span>
                  <span className="font-mono font-bold">+{discrepancyAmount.toLocaleString("bn-BD")} ৳</span>
                </div>
              )}
              {reconciliationStatus === "VERIFIED_EXCEEDS_RECORDED" && (
                <div className="flex justify-between items-center text-blue-700 dark:text-blue-400">
                  <span>লেজার উদ্বৃত্ত (অজমা কৃত আয়):</span>
                  <span className="font-mono font-bold">+{discrepancyAmount.toLocaleString("bn-BD")} ৳</span>
                </div>
              )}
              {reconciliationStatus === "BALANCED" && (
                <div className="flex justify-between items-center text-emerald-700 dark:text-emerald-400">
                  <span>লেজার সামঞ্জস্য অবস্থা:</span>
                  <span className="font-mono font-bold">✓ শতভাগ নির্ভুল</span>
                </div>
              )}
              <div className="flex justify-between items-center text-slate-600 dark:text-stone-300">
                <span>উত্তোলনযোগ্য ব্যালেন্স:</span>
                <span className={`font-mono font-bold ${isWithdrawalHeld ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                  {withdrawableBalance.toLocaleString("bn-BD")} ৳
                </span>
              </div>
              {isWithdrawalHeld && (
                <div className="p-2 rounded-xl bg-amber-100/70 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 text-[11px] font-semibold space-y-0.5 border border-amber-300 dark:border-amber-800">
                  <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>প্রশাসনিক উত্তোলন হোল্ড কার্যকর</span>
                  </div>
                  <p className="text-[10px] text-slate-600 dark:text-stone-300 leading-tight">
                    {holdReason}
                  </p>
                </div>
              )}
              <p className="text-[10px] text-slate-400 pt-1 border-t border-stone-200 dark:border-stone-700">
                স্ট্যাটাস: দ্বৈত-লেজার অডিট ও পেআউট গেটওয়ে ব্যাকএন্ড অপেক্ষমাণ (অনলাইন উত্তোলন বন্ধ)
              </p>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-3 text-xs">
              <button
                type="submit"
                className="w-full py-2.5 rounded-2xl bg-stone-200 dark:bg-stone-800 text-slate-700 dark:text-stone-300 font-extrabold text-xs transition cursor-pointer mt-2 hover:bg-stone-300 dark:hover:bg-stone-700"
              >
                অনলাইন উত্তোলন স্থগিত (বন্ধ করুন)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── 🗑️ DELETE ACCOUNT CONFIRMATION MODAL ── */}
      {showDeleteAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-md w-full p-6 space-y-4 border border-rose-200 dark:border-rose-900 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                আপনি কি নিশ্চিতভাবে অ্যাকাউন্ট মুছে ফেলতে চান?
              </h3>
              <p className="text-xs text-slate-600 dark:text-stone-300 leading-relaxed font-medium">
                অ্যাকাউন্ট মুছে ফেললে আপনার শিক্ষক পরিচিতি, সেটিংস ও প্রোফাইল ডাটাবেজ থেকে স্থায়ীভাবে বিলুপ্ত হবে। এই কাজটি আর পূর্বাবস্থায় ফিরিয়ে আনা সম্ভব নয়।
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isDeletingAccount}
                onClick={() => setShowDeleteAccountModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-slate-700 dark:text-stone-300 font-bold text-xs transition cursor-pointer"
              >
                বাতিল করুন
              </button>
              <button
                type="button"
                disabled={isDeletingAccount}
                onClick={handleConfirmDeleteAccount}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/30 transition cursor-pointer"
              >
                {isDeletingAccount ? (
                  <span>মুছে ফেলা হচ্ছে...</span>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>হ্যাঁ, অ্যাকাউন্ট ডিলিট করুন</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 🎓 STUDENT FACEBOOK-STYLE PROFILE MODAL ── */}
      {selectedStudentForProfile && (
        <StudentProfileModal
          student={{
            ...selectedStudentForProfile,
            nameBn: selectedStudentForProfile.name,
            department: selectedStudentForProfile.department,
          }}
          onClose={() => setSelectedStudentForProfile(null)}
          onCallTeacher={(t) => {
            setSelectedStudentForProfile(null);
            if (onLaunchDirectCall) onLaunchDirectCall(t);
          }}
        />
      )}
    </div>
  );
}
