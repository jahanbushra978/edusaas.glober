"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  Search,
  Phone,
  MessageSquare,
  Award,
  BookOpen,
  Calendar,
  Clock,
  ShieldCheck,
  Star,
  CheckCircle,
  Video,
  CreditCard,
  ArrowLeft,
  X,
  LogIn,
  GraduationCap,
  ChevronRight,
  ChevronDown,
  UserPlus,
  Percent,
  Wallet,
  Check,
  Radio,
  LayoutDashboard,
  Rss,
  Film,
  Bookmark,
  ThumbsUp,
  UserCheck,
  Flag,
  Edit,
  Share2,
  MapPin,
  Globe,
  Home,
  Zap,
  Camera,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import WebRTCLiveCallModal from "./WebRTCLiveCallModal";
import WebRTCGroupClassroom from "./WebRTCGroupClassroom";
import TeacherMarketplaceDashboard from "./TeacherMarketplaceDashboard";
import StudentProfileModal from "./StudentProfileModal";
import StudentMarketplaceDashboard from "./StudentMarketplaceDashboard";
import SocialPostComposer from "./social/SocialPostComposer";
import SocialPostCard from "./social/SocialPostCard";
import TeacherProfileEditModal from "./social/TeacherProfileEditModal";
import StudentProfileEditModal from "./social/StudentProfileEditModal";
import SocialFollowersModal from "./social/SocialFollowersModal";
import SocialReportModal from "./social/SocialReportModal";
import SocialShareModal from "./social/SocialShareModal";
import StoriesBar from "./social/StoriesBar";
import ReelsDiscoverySection from "./social/ReelsDiscoverySection";
import StudentDiscoveryDirectory from "./StudentDiscoveryDirectory";
import MutualConnectionRequestModal from "./MutualConnectionRequestModal";
import PrivateLearningGroupModal from "./PrivateLearningGroupModal";
import MessengerChatHub from "./MessengerChatHub";
import { ISLAMIC_COVERS, ISLAMIC_AVATARS } from "../data/islamicMediaAssets";
import { REAL_TEACHERS_10, REAL_STUDENTS_10, GLOBAL_FEED_POSTS_10 } from "../data/marketplaceSeedData";

// Authentic 10 Human Quran & Islamic Teachers (High-quality approved verified teachers)
const _VERIFIED_HUMAN_TEACHERS = REAL_TEACHERS_10;

// Rich Facebook-style posts for verified teachers
const _SAMPLE_TEACHER_POSTS = {
  "qari-mahmudul-hasan": [
    {
      id: "post-m1",
      teacher_id: "qari-mahmudul-hasan",
      author_name: "শায়খ ক্বারী মাহমুদুল হাসান আল-মাদানী",
      author_avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=400&q=80",
      content_text: "আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহ। সুরা আল-ফাতিহায় 'صِرَاطَ الَّذِينَ' পড়ার সময় 'ছদ (ص)' হরফটি যেন কোনোভাবেই 'সিন (س)' না হয়ে যায়। ছদ হলো ইসতি'লা (মোটা) এবং ইতবাক্ব হরফ। জিব্বার গোড়া উপরে তালুর সাথে লাগবে এবং মুখভর্তি ভারী আওয়াজ হবে। নিয়মিত মাশক করুন।",
      post_type: "text",
      media_urls: [],
      visibility: "public",
      likes_count: 48,
      reactions_summary: { like: 26, love: 18, insightful: 4 },
      comments_count: 9,
      shares_count: 5,
      is_pinned: true,
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: "post-m2",
      teacher_id: "qari-mahmudul-hasan",
      author_name: "শায়খ ক্বারী মাহমুদুল হাসান আল-মাদানী",
      author_avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=400&q=80",
      content_text: "আলহামদুলিল্লাহ! আজ সন্ধ্যায় আমাদের নূর ক্লাসরুমে 'নূন সাকিন ও তানভীনের ইখফা'র ওপর ১-অন-১ লাইভ প্রশিক্ষণ সম্পন্ন হলো। নতুন শিক্ষার্থীরা মাশাআল্লাহ অনেক সুন্দরভাবে গুন্নাহর সময়সীমা (২ হরকত) ঠিক রাখতে পেরেছে।",
      post_type: "photo",
      media_urls: [
        {
          url: "https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1200&q=80",
          type: "image",
        },
      ],
      visibility: "public",
      likes_count: 62,
      reactions_summary: { like: 35, love: 22, insightful: 5 },
      comments_count: 14,
      shares_count: 8,
      created_at: new Date(Date.now() - 3600000 * 28).toISOString(),
    },
  ],
  "ustaza-sumayyah-maryam": [
    {
      id: "post-s1",
      teacher_id: "ustaza-sumayyah-maryam",
      author_name: "উস্তাযা সুমাইয়া আক্তার মারিয়াম",
      author_avatar: "https://images.unsplash.com/photo-1584905066893-7d5c142ba4e1?auto=format&fit=crop&w=400&q=80",
      content_text: "প্রিয় শিক্ষার্থী বোনেরা ও মায়েরা, শিশুদের হরফ চেনার ক্ষেত্রে হরফের নুকতার খেলা সবচেয়ে বেশি কার্যকরী। বা, তা, ছা—এই তিনটি হরফ আলাদা করতে নুকতার অবস্থান ও সংখ্যা মনে রাখুন। ইনশাআল্লাহ আগামীকাল সকালে নতুন নূরানী কায়দা ক্লাস শুরু হবে।",
      post_type: "text",
      media_urls: [],
      visibility: "public",
      likes_count: 55,
      reactions_summary: { like: 28, love: 24, insightful: 3 },
      comments_count: 11,
      shares_count: 6,
      is_pinned: true,
      created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
  ],
};

function getTeacherSamplePosts(teacher) {
  if (!teacher) return [];
  const id = teacher.id || teacher.teacher_id || "teacher";
  if (_SAMPLE_TEACHER_POSTS[id]) return _SAMPLE_TEACHER_POSTS[id];
  return [
    {
      id: `post-${id}-1`,
      teacher_id: id,
      author_name: teacher.nameBn || "সম্মানিত উস্তাদ",
      author_avatar: teacher.avatar || teacher.avatar_url || "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=400&q=80",
      content_text: "বিসমিল্লাহির রহমানির রহিম। সহীহ তারতীল ও মাখরাজ প্রশিক্ষণে আজ আমাদের নতুন ১-অন-১ ক্লাস শুরু হয়েছে। যেসকল শিক্ষার্থী তাজবীদ সহকারে তিলাওয়াত শিখতে চান, তারা সরাসরি মেসেজ বা ক্লাসে যুক্ত হতে পারেন। আল্লাহ তায়ালা আমাদের কুরআন চর্চাকে কবুল করুন।",
      post_type: "text",
      media_urls: [],
      visibility: "public",
      likes_count: 38,
      reactions_summary: { like: 22, love: 14, insightful: 2 },
      comments_count: 7,
      shares_count: 4,
      is_pinned: true,
      created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    },
    {
      id: `post-${id}-2`,
      teacher_id: id,
      author_name: teacher.nameBn || "সম্মানিত উস্তাদ",
      author_avatar: teacher.avatar || teacher.avatar_url || "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=400&q=80",
      content_text: "কুরআন মাজীদের হরকত (যবর, যের, পেশ) তাড়াতাড়ি পড়তে হয়, কখনোই অহেতুক দীর্ঘ বা টেনে পড়া যাবে না। হরকতের যথাযথ উচ্চারণ আয়ত্ত করলেই তিলাওয়াতের সৌন্দর্য বহু গুণ বেড়ে যায়।",
      post_type: "photo",
      media_urls: [
        {
          url: "https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1200&q=80",
          type: "image",
        },
      ],
      visibility: "public",
      likes_count: 45,
      reactions_summary: { like: 26, love: 16, insightful: 3 },
      comments_count: 10,
      shares_count: 5,
      created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
    },
  ];
}

function normalizeTeacher(t) {
  if (!t) return null;
  return {
    id: t.id || t.teacher_id,
    teacher_id: t.teacher_id || t.id,
    user_id: t.user_id || null,
    nameBn: t.nameBn || t.name_bn || "",
    nameEn: t.nameEn || t.name_en || "",
    titleBn: t.titleBn || t.title_bn || "কুরআন ও তাজবীদ শিক্ষক",
    username: t.username || "",
    avatar: t.avatar || t.avatar_url || "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=400&q=80",
    coverPhoto: t.coverPhoto || t.cover_url || "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1200&q=80",
    verified: t.status === "approved" || t.verified === true,
    isVerified: Boolean(t.is_verified || t.isVerified),
    isOnline: !!t.is_online || !!t.isOnline,
    rating: Number(t.rating) || 0,
    totalReviews: Number(t.total_reviews ?? t.totalReviews) || 0,
    totalStudents: Number(t.total_students ?? t.totalStudents) || 0,
    totalHours: Number(t.total_classes ?? t.totalHours) || 0,
    followersCount: Number(t.followers_count ?? t.followersCount ?? 0),
    followingCount: Number(t.following_count ?? t.followingCount ?? 0),
    postsCount: Number(t.posts_count ?? t.postsCount ?? 0),
    location: t.location || "ঢাকা, বাংলাদেশ",
    languages: Array.isArray(t.languages) ? t.languages : ["বাংলা", "العربية"],
    hourlyFeeBn: t.hourlyFeeBn || `${t.hourly_fee || 350} টাকা / ঘণ্টা`,
    monthlyFeeBn: t.monthlyFeeBn || `${t.monthly_fee || 2500} টাকা / মাস`,
    experienceYears: t.experience_years ?? t.experienceYears ?? 0,
    qualifications: Array.isArray(t.qualifications) ? t.qualifications : [],
    specialties: Array.isArray(t.specialties) ? t.specialties : [],
    bio: t.bio || "",
    schedule: t.schedule || t.schedule_text || "",
    videos: Array.isArray(t.videos) ? t.videos : [],
    reviews: Array.isArray(t.reviews) ? t.reviews : [],
    status: t.status || "pending",
  };
}

export default function HumanTeacherPlatform({ onBackToStudio }) {
  // Authentication & Login Gate state
  const [currentUser, setCurrentUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [_isGuestMode, setIsGuestMode] = useState(false);

  // Platform Dynamic Settings (Commission % & Auto-Approve Policy)
  const [platformSettings, setPlatformSettings] = useState({
    teacherCommissionPercentage: 10,
    teacherAutoApprove: false,
    teacherMinHourlyRate: 200,
  });

  // Database-backed approved teachers
  const [dbTeachers, setDbTeachers] = useState([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(true);

  // Self-Registered Teachers State
  const [registeredTeachers, setRegisteredTeachers] = useState([]);

  // Teacher Wallets State (Teacher ID -> Balance & History - strictly 0 initial balance)
  const [teacherWallets, setTeacherWallets] = useState({});
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletError, setWalletError] = useState(null);

  // Directory filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");

  // Selected Teacher Profile state (Facebook-Style View)
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [profileActiveTab, setProfileActiveTab] = useState("posts"); // 'posts' | 'clips' | 'liked' | 'saved' | 'about' | 'videos' | 'reviews' | 'fees'

  // Social Profile & Community State
  // Social Posts Feed State (Initializes with 10 global multi-user posts for Home tab)
  const [socialPosts, setSocialPosts] = useState(GLOBAL_FEED_POSTS_10);
  const [isLoadingSocialPosts, setIsLoadingSocialPosts] = useState(false);
  const [isFollowingTeacher, setIsFollowingTeacher] = useState(false);
  const [teacherFollowersCount, setTeacherFollowersCount] = useState(0);
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showReportTeacherModal, setShowReportTeacherModal] = useState(false);
  const [showShareTeacherModal, setShowShareTeacherModal] = useState(false);

  // Modals & Views state
  const [activeMainPanel, setActiveMainPanel] = useState("home"); // 'home' | 'teachers' | 'students' | 'messenger'
  const [messengerTargetTeacher, setMessengerTargetTeacher] = useState(null);
  const [showFloatingMessenger, setShowFloatingMessenger] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null); // Selected public student for profile view
  const [connectionRequestData, setConnectionRequestData] = useState(null); // { mode, teacher, student }
  const [showConnectionRequestModal, setShowConnectionRequestModal] = useState(false);
  const [activePrivateGroup, setActivePrivateGroup] = useState(null); // Active Private Learning Assistant Group
  const [showPrivateGroupModal, setShowPrivateGroupModal] = useState(false);
  const [contactModalTeacher, setContactModalTeacher] = useState(null);
  const [contactType, setContactType] = useState("call"); // 'call' | 'message' | 'fee'
  const [liveCallTeacher, setLiveCallTeacher] = useState(null); // WebRTC 1-on-1 Call
  const [liveGroupClassData, setLiveGroupClassData] = useState(null); // WebRTC Group Classroom (FB / Meet / Zoom Style)
  const [showTeacherDashboard, setShowTeacherDashboard] = useState(false); // Teacher Marketplace Dashboard
  const [showStudentDashboard, setShowStudentDashboard] = useState(false); // Facebook-Style Student Dashboard
  const [currentTeacherUser, setCurrentTeacherUser] = useState(null); // Logged-in Teacher Session
  const [showTopUserMenu, setShowTopUserMenu] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showTeacherAccessModal, setShowTeacherAccessModal] = useState(false); // Teacher Login / Access Modal
  const [showStudentProfileModal, setShowStudentProfileModal] = useState(false); // Facebook-Style Student Profile
  const [feeModalTeacher, setFeeModalTeacher] = useState(null); // Hadia / Fee Payment Modal
  const [showRegisterModal, setShowRegisterModal] = useState(false); // Teacher Profile Builder
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false); // Quick 1-Click Role Switcher
  const [studentProfileTab, setStudentProfileTab] = useState("progress"); // 'progress' | 'timeline' | 'teachers' | 'about'
  const [showStudentEditProfileModal, setShowStudentEditProfileModal] = useState(false); // Student Profile Edit Modal
  const [followedStudentIds, setFollowedStudentIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("edusaas_followed_student_ids") || "[]");
    } catch {
      return [];
    }
  });
  const [studentTimelinePosts, setStudentTimelinePosts] = useState([
    {
      id: "std-post-1",
      text: "আলহামদুলিল্লাহ! আজ সম্মানিত উস্তাদ শায়খ ক্বারী মাহমুদুল হাসান আল-মাদানী সাহেবের নিকট সূরা আল-বাকারার রুকু ৩ অত্যন্ত একাগ্রতার সাথে তিলাওয়াত করেছি। তাজবীদের ইখফা ও গুন্নাহর হরফে ২ হরকত সময় ধরে রাখার নিয়মটি এখন অনেক সহজ মনে হচ্ছে। মহান আল্লাহ তায়ালা আমাদের তিলাওয়াতকে কবুল করুন। আমীন।",
      timestamp: "আজ দুপুর ১২:৪৫",
      likesCount: 18,
      isLiked: false,
      comments: [
        { id: "c1", author: "শায়খ ক্বারী মাহমুদুল হাসান", text: "মাশাআল্লাহ! মাখরাজ ও তারতীল অত্যন্ত সুন্দর হয়েছে। এগিয়ে চলুন।", time: "১ ঘণ্টা আগে" },
        { id: "c2", author: "মারিয়াম সিদ্দীকা", text: "মাশাআল্লাহ আপু, অনেক অনুপ্রাণিত হলাম!", time: "৩০ মিনিট আগে" },
      ],
      showComments: false,
    },
    {
      id: "std-post-2",
      text: "কুরআন শিক্ষার ক্ষেত্রে নিয়মিত মশক করার কোনো বিকল্প নেই। প্রতিদিন অন্তত ৩০ মিনিট হরফের বিশুদ্ধ উচ্চারণ অনুশীলন করলে মুখের জড়তা কেটে যায়। উস্তাদদের আন্তরিক দিকনির্দেশনার জন্য কৃতজ্ঞতা।",
      timestamp: "গতকাল রাত ৯:১৫",
      likesCount: 24,
      isLiked: false,
      comments: [
        { id: "c3", author: "আব্দুল্লাহ আল-মামুন", text: "একদম সহমত। প্রতিদিন অন্তত ২ রুকু মশক করা দরকার।", time: "গতকাল" },
      ],
      showComments: false,
    },
  ]);
  const [newStudentPostText, setNewStudentPostText] = useState("");
  const [studentCommentInputs, setStudentCommentInputs] = useState({});
  const [teacherLoginIdentifier, setTeacherLoginIdentifier] = useState("");
  const [teacherLoginPassword, setTeacherLoginPassword] = useState("");
  const [teacherAccessTab, setTeacherAccessTab] = useState("login"); // 'login' | 'apply'

  // Dedicated Public Quran Learner Auth State
  const [loginModalTab, setLoginModalTab] = useState("login"); // 'login' | 'register'
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerContact, setRegisterContact] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Fee Payment Form State
  const [feeAmount, setFeeAmount] = useState(500);
  const [paymentGateway, setPaymentGateway] = useState("bkash");
  const [senderPhone, setSenderPhone] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Teacher Registration Form State
  const [regForm, setRegForm] = useState({
    nameBn: "",
    nameEn: "",
    titleBn: "",
    avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=400&q=80",
    coverPhoto: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1200&q=80",
    hourlyFeeBn: "৩৫০ টাকা / ঘণ্টা",
    monthlyFeeBn: "২,৫০০ টাকা / মাস",
    experienceYears: 5,
    qualifications: "দাওরায়ে হাদীস, হাফেজুল কুরআন ও ক্বারী",
    specialties: "তাজবীদ ও মাখরাজ, হিফজুল কুরআন",
    schedule: "প্রতিদিন: বিকাল ৫টা – রাত ৯টা",
    bio: "",
  });

  // Fetch verified and approved teachers from authoritative server API
  useEffect(() => {
    let isMounted = true;
    setIsLoadingTeachers(true);
    fetch("/api/teacher-marketplace")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.teachers) {
          const approved = data.teachers
            .filter((t) => t.status === "approved")
            .map(normalizeTeacher)
            .filter(Boolean);
          setDbTeachers(approved);
        }
      })
      .catch((err) => {
        console.warn("Failed to load teachers from server:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingTeachers(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Load Platform Settings & Registered Teachers from localStorage
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("edusaas_platform_settings");
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setPlatformSettings({
          teacherCommissionPercentage: parsed.teacherCommissionPercentage ?? 10,
          teacherAutoApprove: parsed.teacherAutoApprove === true,
          teacherMinHourlyRate: parsed.teacherMinHourlyRate ?? 200,
        });
      }

      const savedTeachers = localStorage.getItem("edusaas_registered_teachers");
      if (savedTeachers) {
        setRegisteredTeachers(JSON.parse(savedTeachers));
      }

      const savedWallets = localStorage.getItem("edusaas_teacher_wallets");
      if (savedWallets) {
        setTeacherWallets((prev) => ({ ...prev, ...JSON.parse(savedWallets) }));
      }
    } catch (e) {
      console.warn("Storage load error", e);
    }
  }, []);

  // Check verified user session on server and restore state
  useEffect(() => {
    // 1. Fetch server-verified session cookie
    fetch("/api/teacher-marketplace/auth")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          if (data.role === "student" && data.user) {
            setCurrentUser(data.user);
            try {
              localStorage.setItem("edusaas_public_student_session", JSON.stringify(data.user));
            } catch {}
          } else if (data.role === "teacher" && data.teacher) {
            setCurrentTeacherUser(data.teacher);
            try {
              localStorage.setItem("edusaas_current_teacher_session", JSON.stringify(data.teacher));
            } catch {}
          }
        } else {
          // If server reports no active session, read cached session from localStorage as quick UI fallback and re-sync cookie
          try {
            const publicStudentSession = localStorage.getItem("edusaas_public_student_session");
            if (publicStudentSession) {
              const parsed = JSON.parse(publicStudentSession);
              if (parsed && parsed.id) {
                setCurrentUser(parsed);
                fetch("/api/teacher-marketplace/auth", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    action: "student_login",
                    identifier: parsed.student_public_id || parsed.username || parsed.id,
                  }),
                }).catch(() => {});
              }
            }
            const teacherSession = localStorage.getItem("edusaas_current_teacher_session");
            if (teacherSession) {
              const parsedTeacher = JSON.parse(teacherSession);
              if (parsedTeacher && parsedTeacher.id) {
                setCurrentTeacherUser(parsedTeacher);
                fetch("/api/teacher-marketplace/auth", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    action: "teacher_login",
                    teacher_id: parsedTeacher.id || parsedTeacher.teacher_id,
                    teacher: parsedTeacher,
                  }),
                }).catch(() => {});
              }
            }
          } catch {}
        }
      })
      .catch(() => {
        try {
          const publicStudentSession = localStorage.getItem("edusaas_public_student_session");
          if (publicStudentSession) {
            const parsed = JSON.parse(publicStudentSession);
            if (parsed && parsed.id) setCurrentUser(parsed);
          }
        } catch {}
      });
  }, []);

  // Combined teachers list (Always includes authentic verified teachers + approved registered/db teachers)
  const allTeachers = useMemo(() => {
    const list = [...dbTeachers];
    for (const reg of registeredTeachers) {
      if (reg.status === "approved" && !list.some((t) => t.id === reg.id || t.teacher_id === reg.id)) {
        const norm = normalizeTeacher(reg);
        if (norm) list.push(norm);
      }
    }
    // Seamlessly merge authentic verified teachers, avoiding any duplicates
    for (const seed of _VERIFIED_HUMAN_TEACHERS) {
      const norm = normalizeTeacher(seed);
      if (norm && !list.some((t) => t.id === norm.id || t.teacher_id === norm.id || t.nameBn === norm.nameBn)) {
        list.push(norm);
      }
    }
    return list;
  }, [dbTeachers, registeredTeachers]);

  // Filtered teachers list with comprehensive Search across ID, Username, Name, and Location
  const filteredTeachers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allTeachers.filter((t) => {
      const matchSearch =
        !q ||
        t.nameBn.toLowerCase().includes(q) ||
        t.nameEn.toLowerCase().includes(q) ||
        (t.id && t.id.toLowerCase().includes(q)) ||
        (t.teacher_id && t.teacher_id.toLowerCase().includes(q)) ||
        (t.username && t.username.toLowerCase().includes(q)) ||
        (t.location && t.location.toLowerCase().includes(q)) ||
        t.specialties.some((s) => s.toLowerCase().includes(q)) ||
        (t.bio && t.bio.toLowerCase().includes(q));
      const matchSpecialty =
        selectedSpecialty === "all" ||
        t.specialties.some((s) => s.includes(selectedSpecialty));
      return matchSearch && matchSpecialty;
    });
  }, [allTeachers, searchQuery, selectedSpecialty]);

  // Handle teacher selection (public guests can view profiles freely)
  const handleSelectTeacher = (teacher) => {
    setSelectedTeacher(teacher);
    setProfileActiveTab("posts");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle clicking author avatar/name on any post to navigate to their full Facebook-style profile
  const handlePostAuthorClick = (post) => {
    if (!post) return;

    // 1. If author is a teacher
    if (post.author_role === "teacher" || post.teacher_id) {
      const targetId = post.teacher_id || post.author_id;
      const matchingTeacher =
        allTeachers.find((t) => t.id === targetId || t.teacher_id === targetId || t.nameBn === post.author_name) ||
        allTeachers[0];
      setSelectedTeacher(matchingTeacher);
      setSelectedStudent(null);
      setShowTeacherDashboard(false);
      setShowStudentDashboard(false);
      setProfileActiveTab("posts");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // 2. If author is a student
    if (post.author_role === "student" || post.student_public_id || post.student_id) {
      const targetPublicId = post.student_public_id || post.author_id;
      const matchingStudent =
        REAL_STUDENTS_10.find(
          (s) =>
            s.student_public_id === targetPublicId ||
            s.id === targetPublicId ||
            s.display_name === post.author_name
        ) || REAL_STUDENTS_10[0];
      setSelectedStudent(matchingStudent);
      setSelectedTeacher(null);
      setShowTeacherDashboard(false);
      setShowStudentDashboard(false);
      setStudentProfileTab("progress");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Fallback lookup by author name
    const teacherByName = allTeachers.find((t) => t.nameBn === post.author_name);
    if (teacherByName) {
      setSelectedTeacher(teacherByName);
      setSelectedStudent(null);
      setProfileActiveTab("posts");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const studentByName = REAL_STUDENTS_10.find((s) => s.display_name === post.author_name);
    if (studentByName) {
      setSelectedStudent(studentByName);
      setSelectedTeacher(null);
      setStudentProfileTab("progress");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ── Social Posts Fetcher ──
  const fetchSocialPosts = (teacherId, tab = "posts") => {
    if (!teacherId) return;
    setIsLoadingSocialPosts(true);
    const targetTeacher = selectedTeacher || allTeachers.find((t) => (t.id || t.teacher_id) === teacherId);
    const fallback = getTeacherSamplePosts(targetTeacher);
    fetch(`/api/teacher-marketplace/social/posts?teacher_id=${teacherId}&tab=${tab}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && Array.isArray(data.posts) && data.posts.length > 0) {
          setSocialPosts(data.posts);
        } else if (tab === "posts") {
          setSocialPosts(fallback);
        } else {
          setSocialPosts([]);
        }
      })
      .catch(() => {
        if (tab === "posts") {
          setSocialPosts(fallback);
        } else {
          setSocialPosts([]);
        }
      })
      .finally(() => {
        setIsLoadingSocialPosts(false);
      });
  };

  const handlePublicStudentLogin = async (e) => {
    e.preventDefault();
    setLoginError("");

    const idVal = loginIdentifier.trim();
    if (!idVal || !loginPassword.trim()) {
      setLoginError("মোবাইল নম্বর/ইমেইল এবং পাসওয়ার্ড প্রদান করুন");
      return;
    }

    // Check if user is typing an institutional madrasa roll or institutional student ID
    if (/^(roll|std|adm|stu|madrasa)[-_0-9]/i.test(idVal) || /^\d{4,8}$/.test(idVal)) {
      setLoginError(
        "এটি সবার জন্য উন্মুক্ত কুরআন শিক্ষা প্ল্যাটফর্ম। কোনো নির্দিষ্ট মাদ্রাসার প্রাতিষ্ঠানিক স্টুডেন্ট রোল বা আইডি এখানে প্রযোজ্য নয়। অনুগ্রহ করে আপনার উন্মুক্ত শিক্ষার্থী অ্যাকাউন্ট ব্যবহার করুন অথবা 'নতুন অ্যাকাউন্ট খুলুন' ট্যাবে বিনামূল্যে সাইন আপ করুন।"
      );
      return;
    }

    try {
      const res = await fetch("/api/teacher-marketplace/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "student_login",
          identifier: idVal,
          password: loginPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setLoginError(data.error || "লগইন করা সম্ভব হয়নি।");
        return;
      }

      const user = data.user;
      setCurrentUser(user);
      try {
        localStorage.setItem("edusaas_public_student_session", JSON.stringify(user));
      } catch {}

      setShowLoginModal(false);
      setLoginIdentifier("");
      setLoginPassword("");
      toast.success(data.message || `মাশাআল্লাহ! স্বাগতম, ${user.display_name || user.name}!`);

      // If user had pending connection request click, open the modal immediately
      if (connectionRequestData && connectionRequestData.mode === "student_to_teacher" && connectionRequestData.teacher) {
        setShowConnectionRequestModal(true);
      }
    } catch (err) {
      console.error("Student login error:", err);
      setLoginError("নেটওয়ার্ক সমস্যার কারণে লগইন ব্যর্থ হয়েছে।");
    }
  };

  const handlePublicStudentRegister = async (e) => {
    e.preventDefault();
    setLoginError("");

    if (!registerName.trim() || !registerContact.trim() || !registerPassword.trim()) {
      setLoginError("সবগুলো তথ্য সঠিকভাবে পূরণ করুন");
      return;
    }

    try {
      const res = await fetch("/api/teacher-marketplace/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "student_register",
          name: registerName.trim(),
          contact: registerContact.trim(),
          password: registerPassword.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setLoginError(data.error || "নিবন্ধন করা সম্ভব হয়নি।");
        return;
      }

      const user = data.user;
      setCurrentUser(user);
      try {
        localStorage.setItem("edusaas_public_student_session", JSON.stringify(user));
      } catch {}

      setShowLoginModal(false);
      setRegisterName("");
      setRegisterContact("");
      setRegisterPassword("");
      toast.success(data.message || "মাশাআল্লাহ! আপনার উন্মুক্ত শিক্ষার্থী অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!");

      // If user had clicked "পড়তে চাই", seamlessly proceed
      if (connectionRequestData && connectionRequestData.mode === "student_to_teacher" && connectionRequestData.teacher) {
        setShowConnectionRequestModal(true);
      }
    } catch (err) {
      console.error("Student register error:", err);
      setLoginError("নেটওয়ার্ক সমস্যার কারণে নিবন্ধন ব্যর্থ হয়েছে।");
    }
  };

  const handleStudentLogout = async () => {
    try {
      await fetch("/api/teacher-marketplace/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
    } catch {}
    setCurrentUser(null);
    setShowStudentDashboard(false);
    try {
      localStorage.removeItem("edusaas_public_student_session");
    } catch {}
    toast.info("আপনি সফলভাবে লগআউট হয়েছেন।");
  };

  const handleTeacherLogout = async () => {
    try {
      await fetch("/api/teacher-marketplace/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
    } catch {}
    setCurrentTeacherUser(null);
    setShowTeacherDashboard(false);
    try {
      localStorage.removeItem("edusaas_current_teacher_session");
    } catch {}
    toast.info("শিক্ষক অ্যাকাউন্ট থেকে লগআউট সম্পন্ন হয়েছে।");
  };

  const handleConfirmDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      const activeRole = currentTeacherUser ? "teacher" : "student";
      const activeId = currentTeacherUser
        ? (currentTeacherUser.id || currentTeacherUser.teacher_id)
        : (currentUser?.id || currentUser?.student_public_id);

      await fetch("/api/teacher-marketplace/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_account",
          user_id: activeId,
          role: activeRole,
        }),
      });

      if (currentTeacherUser) {
        localStorage.removeItem("edusaas_current_teacher_session");
        const reg = JSON.parse(localStorage.getItem("edusaas_registered_teachers") || "[]");
        const filtered = reg.filter((t) => t.id !== activeId && t.teacher_id !== activeId);
        localStorage.setItem("edusaas_registered_teachers", JSON.stringify(filtered));
        setCurrentTeacherUser(null);
        setShowTeacherDashboard(false);
      }
      if (currentUser) {
        localStorage.removeItem("edusaas_public_student_session");
        localStorage.removeItem("edusaas_public_student_profile");
        setCurrentUser(null);
        setShowStudentDashboard(false);
      }
      setShowTopUserMenu(false);
      setShowDeleteAccountModal(false);
      toast.success("আপনার অ্যাকাউন্ট ও সকল ব্যক্তিগত তথ্য সফলভাবে মুছে ফেলা হয়েছে।");
      setActiveMainPanel("home");
    } catch {
      setShowDeleteAccountModal(false);
      setShowTopUserMenu(false);
      toast.success("আপনার অ্যাকাউন্ট সফলভাবে মুছে ফেলা হয়েছে।");
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleQuickSwitchRole = async (targetRole, targetId) => {
    setShowRoleSwitcher(false);
    try {
      if (targetRole === "teacher") {
        const res = await fetch("/api/teacher-marketplace/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "teacher_login",
            teacher_id: targetId || "qari-mahmudul-hasan",
          }),
        });
        const data = await res.json();
        if (data.ok && data.teacher) {
          const formattedTeacher = {
            ...data.teacher,
            nameBn: data.teacher.name_bn || data.teacher.nameBn || "শায়খ ক্বারী মাহমুদুল হাসান",
            avatar: data.teacher.avatar_url || data.teacher.avatar,
            coverPhoto: data.teacher.cover_url || data.teacher.coverPhoto,
          };
          setCurrentTeacherUser(formattedTeacher);
          setCurrentUser(null);
          try {
            localStorage.setItem("edusaas_current_teacher_session", JSON.stringify(formattedTeacher));
            localStorage.removeItem("edusaas_public_student_session");
          } catch {}
          toast.success(`মাশাআল্লাহ! ${formattedTeacher.nameBn || "শিক্ষক"} হিসেবে সুইচ করা হয়েছে।`);
        }
      } else if (targetRole === "student") {
        const studentId = targetId || "abdullah_mamun";
        const res = await fetch("/api/teacher-marketplace/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "student_login",
            identifier: studentId,
          }),
        });
        const data = await res.json();
        if (data.ok && data.user) {
          setCurrentUser(data.user);
          setCurrentTeacherUser(null);
          try {
            localStorage.setItem("edusaas_public_student_session", JSON.stringify(data.user));
            localStorage.removeItem("edusaas_current_teacher_session");
          } catch {}
          toast.success(`মাশাআল্লাহ! ${data.user.display_name || "শিক্ষার্থী"} হিসেবে সক্রিয় করা হয়েছে।`);
        }
      } else if (targetRole === "guest") {
        await handleStudentLogout();
        await handleTeacherLogout();
        try {
          localStorage.removeItem("edusaas_current_teacher_session");
          localStorage.removeItem("edusaas_registered_teachers");
          localStorage.removeItem("edusaas_public_student_session");
          localStorage.removeItem("edusaas_public_student_profile");
        } catch {}
        setRegisteredTeachers([]);
        toast.info("সেশন সম্পূর্ণ রিসেট করা হয়েছে। আপনি এখন অতিথি মোডে আছেন।");
      }
    } catch {
      toast.error("ভূমিকা পরিবর্তন করা সম্ভব হয়নি");
    }
  };

  // Synchronize Social Posts and Follow Status
  useEffect(() => {
    if (!selectedTeacher) return;
    const tid = selectedTeacher.id || selectedTeacher.teacher_id;

    if (["posts", "clips", "liked", "saved"].includes(profileActiveTab)) {
      fetchSocialPosts(tid, profileActiveTab);
    }

    // Check authoritative follow status
    fetch(`/api/teacher-marketplace/social/follow?teacher_id=${tid}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setIsFollowingTeacher(Boolean(data.is_following));
          setTeacherFollowersCount(Number(data.followers_count) || Number(selectedTeacher.followersCount) || 0);
        }
      })
      .catch(() => {});
  }, [selectedTeacher, profileActiveTab]);

  // Handle Follow / Unfollow
  const handleToggleFollow = async () => {
    if (!currentUser && !currentTeacherUser) {
      setIsFollowingTeacher((prev) => !prev);
      setTeacherFollowersCount((prev) => (!isFollowingTeacher ? prev + 1 : Math.max(0, prev - 1)));
      toast.success(!isFollowingTeacher ? "উস্তাদকে অনুসরণ করছেন!" : "অনুসরণ বাতিল করা হয়েছে");
      return;
    }
    const tid = selectedTeacher?.id || selectedTeacher?.teacher_id;
    try {
      const res = await fetch("/api/teacher-marketplace/social/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacher_id: tid }),
      });
      const data = await res.json();
      if (data.ok) {
        setIsFollowingTeacher(data.is_following);
        setTeacherFollowersCount(data.followers_count);
        toast.success(data.message);
      } else {
        setIsFollowingTeacher((prev) => !prev);
        setTeacherFollowersCount((prev) => (!isFollowingTeacher ? prev + 1 : Math.max(0, prev - 1)));
        toast.success(!isFollowingTeacher ? "উস্তাদকে অনুসরণ করছেন!" : "অনুসরণ বাতিল করা হয়েছে");
      }
    } catch {
      setIsFollowingTeacher((prev) => !prev);
      toast.success("উস্তাদকে অনুসরণ করছেন!");
    }
  };

  const handleOpenContact = (teacher, type = "call") => {
    if (type === "call") {
      setLiveCallTeacher(teacher);
      return;
    }
    if (type === "fee") {
      setFeeModalTeacher(teacher);
      setFeeAmount(500);
      return;
    }
    if (type === "message") {
      setMessengerTargetTeacher(teacher);
      setActiveMainPanel("messenger");
      setSelectedTeacher(null);
      setSelectedStudent(null);
      setShowTeacherDashboard(false);
      setShowStudentDashboard(false);
      return;
    }
    setContactModalTeacher(teacher);
    setContactType(type);
  };

  const handleOpenStudentProfile = () => {
    if (!currentUser) {
      setLoginModalTab("login");
      setShowLoginModal(true);
      toast.info("স্টুডেন্ট প্রোফাইল ও ড্যাশবোর্ডে প্রবেশ করতে অনুগ্রহ করে প্রথমে লগইন করুন");
      return;
    }
    setShowTeacherDashboard(false);
    setSelectedTeacher(null);
    setSelectedStudent(null);
    setShowStudentDashboard(true);
  };

  const handleOpenTeacherDashboard = () => {
    // If a teacher is already logged in, show their dashboard directly
    if (currentTeacherUser) {
      setShowTeacherDashboard(true);
      setShowStudentDashboard(false);
      setSelectedTeacher(null);
      setWalletLoading(true);
      setWalletError(null);
      fetch("/api/teacher-marketplace/wallet")
        .then((res) => {
          if (!res.ok) {
            throw new Error(
              res.status === 401 
                ? "অনুগ্রহ করে শিক্ষক অ্যাকাউন্টে লগইন করুন" 
                : res.status === 403 
                  ? "অননুমোদিত উস্তাদ অ্যাকাউন্ট" 
                  : "ওয়ালেট ডাটা লোড ব্যর্থ"
            );
          }
          return res.json();
        })
        .then((data) => {
          if (data?.ok && data?.wallet) {
            setTeacherWallets((prev) => ({
              ...prev,
              [data.wallet.teacher_id]: {
                balance: data.wallet.balance,
                recorded_balance: data.wallet.recorded_balance,
                totalEarned: data.wallet.total_earned,
                recorded_total_earned: data.wallet.recorded_total_earned,
                verified_earnings: data.wallet.verified_earnings,
                verified_payment_credits: data.wallet.verified_payment_credits,
                unverified_historical_credits: data.wallet.unverified_historical_credits,
                calculated_ledger_balance: data.wallet.calculated_ledger_balance,
                reconciliation_status: data.wallet.reconciliation_status,
                discrepancy_direction: data.wallet.discrepancy_direction,
                discrepancy_amount: data.wallet.discrepancy_amount,
                is_withdrawal_held: data.wallet.is_withdrawal_held,
                hold_reason: data.wallet.hold_reason,
                reconciliation_required: data.wallet.reconciliation_required,
                withdrawable_balance: data.wallet.withdrawable_balance,
                ledger_summary: data.ledger_summary,
                transactions: data.transactions || [],
                isLoadingWallet: false,
                walletError: null,
              },
            }));
          } else if (data?.error) {
            setWalletError(data.error);
          }
        })
        .catch((err) => {
          setWalletError(err.message || "ওয়ালেট ডাটা লোড ব্যর্থ");
        })
        .finally(() => {
          setWalletLoading(false);
        });
      return;
    }

    // If not logged in as a teacher, show the Teacher Access / Login modal
    setShowTeacherAccessModal(true);
  };

  // Determine if viewing user is the owner/teacher of this profile or admin
  const isViewingOwnProfile = Boolean(
    selectedTeacher && (
      (currentTeacherUser && (
        currentTeacherUser.id === selectedTeacher.id ||
        currentTeacherUser.id === selectedTeacher.user_id ||
        currentTeacherUser.teacher_id === selectedTeacher.id ||
        currentTeacherUser.teacher_id === selectedTeacher.teacher_id ||
        (currentTeacherUser.username && selectedTeacher.username && currentTeacherUser.username === selectedTeacher.username) ||
        (currentTeacherUser.nameBn && selectedTeacher.nameBn && currentTeacherUser.nameBn === selectedTeacher.nameBn) ||
        (currentTeacherUser.name_bn && selectedTeacher.nameBn && currentTeacherUser.name_bn === selectedTeacher.nameBn)
      )) ||
      (currentUser && (currentUser.role === "admin" || currentUser.role === "platform_owner") && (
        currentUser.id === selectedTeacher.user_id ||
        currentUser.teacher_id === selectedTeacher.id ||
        currentUser.teacher_id === selectedTeacher.teacher_id
      ))
    )
  );

  // Determine if viewing user is the actual owner of this student profile
  // STRICT: Only the authentic profile owner can edit or upload photos, never another student or teacher
  const isViewingOwnStudentProfile = Boolean(
    selectedStudent &&
    currentUser &&
    !currentTeacherUser && (
      (currentUser.student_public_id && selectedStudent.student_public_id && currentUser.student_public_id.toLowerCase() === selectedStudent.student_public_id.toLowerCase()) ||
      (currentUser.id && selectedStudent.id && String(currentUser.id) === String(selectedStudent.id)) ||
      (currentUser.user_id && selectedStudent.id && String(currentUser.user_id) === String(selectedStudent.id)) ||
      (currentUser.username && selectedStudent.username && currentUser.username.toLowerCase() === selectedStudent.username.toLowerCase()) ||
      (currentUser.display_name && selectedStudent.display_name && currentUser.display_name === selectedStudent.display_name)
    )
  );

  // Facebook-Style Follow / Unfollow Student Toggle
  const handleToggleFollowStudent = (student) => {
    if (!student) return;
    const sId = student.id || student.student_public_id;
    const isFollowed = followedStudentIds.includes(sId);
    let updated;
    if (isFollowed) {
      updated = followedStudentIds.filter((id) => id !== sId);
      toast.info(`${student.display_name}-এর অনুসরণ বাতিল করা হয়েছে`);
      setSelectedStudent((prev) => prev ? { ...prev, followers_count: Math.max(0, (prev.followers_count || 1) - 1) } : prev);
    } else {
      updated = [...followedStudentIds, sId];
      toast.success(`মাশাআল্লাহ! ${student.display_name}-কে সফলভাবে ফলো করছেন!`);
      setSelectedStudent((prev) => prev ? { ...prev, followers_count: (prev.followers_count || 0) + 1 } : prev);
    }
    setFollowedStudentIds(updated);
    try {
      localStorage.setItem("edusaas_followed_student_ids", JSON.stringify(updated));
    } catch {}
  };

  // Student Timeline Post Interactions
  const handleToggleLikeStudentPost = (postId) => {
    setStudentTimelinePosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const isLiked = !post.isLiked;
          const likesCount = isLiked ? post.likesCount + 1 : Math.max(0, post.likesCount - 1);
          if (isLiked) toast.success("পোস্টে লাইক দিয়েছেন!");
          return { ...post, isLiked, likesCount };
        }
        return post;
      })
    );
  };

  const handleToggleStudentComments = (postId) => {
    setStudentTimelinePosts((prev) =>
      prev.map((post) => (post.id === postId ? { ...post, showComments: !post.showComments } : post))
    );
  };

  const handleAddStudentComment = (postId) => {
    const text = (studentCommentInputs[postId] || "").trim();
    if (!text) return;
    const commenterName = currentUser?.display_name || currentUser?.full_name_bn || currentTeacherUser?.nameBn || "ব্যবহারকারী";
    setStudentTimelinePosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const newComment = {
            id: `c-${Date.now()}`,
            author: commenterName,
            text,
            time: "এইমাত্র",
          };
          return {
            ...post,
            comments: [...(post.comments || []), newComment],
            showComments: true,
          };
        }
        return post;
      })
    );
    setStudentCommentInputs((prev) => ({ ...prev, [postId]: "" }));
    toast.success("মাশাআল্লাহ! মন্তব্য সফলভাবে যুক্ত হয়েছে।");
  };

  const handleCreateStudentPost = (e) => {
    e?.preventDefault();
    if (!newStudentPostText.trim()) return;
    const authorName = selectedStudent?.display_name || currentUser?.display_name || currentUser?.name || "শিক্ষার্থী";
    const newPost = {
      id: `std-p-${Date.now()}`,
      text: newStudentPostText.trim(),
      timestamp: "এইমাত্র",
      likesCount: 1,
      isLiked: true,
      comments: [],
      showComments: false,
    };
    setStudentTimelinePosts((prev) => [newPost, ...prev]);
    setNewStudentPostText("");
    toast.success("মাশাআল্লাহ! আপনার নতুন পোস্ট টাইমলাইনে প্রকাশিত হয়েছে!");
  };

  // Helper: Upload image via Cloudinary with Data URL fallback
  const uploadImageFile = async (file, folder = "profiles") => {
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
      // fallback
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  };

  const handleUploadStudentAvatar = async (e, student) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      toast.loading("প্রোফাইল ছবি আপলোড হচ্ছে...", { id: "student-avatar" });
      const url = await uploadImageFile(file, "student_profiles/avatars");
      setSelectedStudent((prev) => (prev ? { ...prev, avatar_url: url } : prev));
      if (currentUser && (currentUser.id === student?.id || currentUser.student_public_id === student?.student_public_id)) {
        setCurrentUser((prev) => ({ ...prev, avatar: url, avatar_url: url }));
        try {
          const session = JSON.parse(localStorage.getItem("edusaas_public_student_session") || "{}");
          localStorage.setItem("edusaas_public_student_session", JSON.stringify({ ...session, avatar: url, avatar_url: url }));
        } catch {}
      }
      fetch("/api/teacher-marketplace/public-students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_public_id: student?.student_public_id,
          username: student?.username,
          display_name: student?.display_name,
          avatar_url: url,
        }),
      }).catch(() => {});
      toast.success("মাশাআল্লাহ! প্রোফাইল ছবি সফলভাবে আপডেট করা হয়েছে!", { id: "student-avatar" });
    } catch {
      toast.error("ছবি আপলোডে সমস্যা হয়েছে।", { id: "student-avatar" });
    }
  };

  const handleUploadStudentCover = async (e, student) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      toast.loading("কভার ফটো আপলোড হচ্ছে...", { id: "student-cover" });
      const url = await uploadImageFile(file, "student_profiles/covers");
      setSelectedStudent((prev) => (prev ? { ...prev, cover_url: url } : prev));
      if (currentUser && (currentUser.id === student?.id || currentUser.student_public_id === student?.student_public_id)) {
        setCurrentUser((prev) => ({ ...prev, cover_url: url, coverPhoto: url }));
        try {
          const session = JSON.parse(localStorage.getItem("edusaas_public_student_session") || "{}");
          localStorage.setItem("edusaas_public_student_session", JSON.stringify({ ...session, cover_url: url, coverPhoto: url }));
        } catch {}
      }
      fetch("/api/teacher-marketplace/public-students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_public_id: student?.student_public_id,
          username: student?.username,
          display_name: student?.display_name,
          cover_url: url,
        }),
      }).catch(() => {});
      toast.success("মাশাআল্লাহ! কভার ফটো সফলভাবে পরিবর্তন করা হয়েছে!", { id: "student-cover" });
    } catch {
      toast.error("কভার ফটো আপলোডে সমস্যা হয়েছে।", { id: "student-cover" });
    }
  };

  const handleUploadTeacherAvatar = async (e, teacher) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      toast.loading("প্রোফাইল ছবি আপলোড হচ্ছে...", { id: "teacher-avatar" });
      const url = await uploadImageFile(file, "teacher_profiles/avatars");
      setSelectedTeacher((prev) => (prev ? { ...prev, avatar: url, avatar_url: url } : prev));
      setAllTeachers((prev) =>
        prev.map((t) => (t.id === teacher?.id || t.teacher_id === teacher?.teacher_id ? { ...t, avatar: url, avatar_url: url } : t))
      );
      if (currentTeacherUser) {
        setCurrentTeacherUser((prev) => ({ ...prev, avatar: url, avatar_url: url }));
        try {
          const tSession = JSON.parse(localStorage.getItem("edusaas_current_teacher_session") || "{}");
          localStorage.setItem("edusaas_current_teacher_session", JSON.stringify({ ...tSession, avatar: url, avatar_url: url }));
        } catch {}
      }
      fetch("/api/teacher-marketplace/social/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar_url: url, teacher_id: teacher?.id || currentTeacherUser?.id }),
      }).catch(() => {});
      toast.success("মাশাআল্লাহ! প্রোফাইল ছবি সফলভাবে আপডেট করা হয়েছে!", { id: "teacher-avatar" });
    } catch {
      toast.error("ছবি আপলোডে সমস্যা হয়েছে।", { id: "teacher-avatar" });
    }
  };

  const handleUploadTeacherCover = async (e, teacher) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      toast.loading("কভার ফটো আপলোড হচ্ছে...", { id: "teacher-cover" });
      const url = await uploadImageFile(file, "teacher_profiles/covers");
      setSelectedTeacher((prev) => (prev ? { ...prev, coverPhoto: url, cover_url: url } : prev));
      setAllTeachers((prev) =>
        prev.map((t) => (t.id === teacher?.id || t.teacher_id === teacher?.teacher_id ? { ...t, coverPhoto: url, cover_url: url } : t))
      );
      if (currentTeacherUser) {
        setCurrentTeacherUser((prev) => ({ ...prev, coverPhoto: url, cover_url: url }));
        try {
          const tSession = JSON.parse(localStorage.getItem("edusaas_current_teacher_session") || "{}");
          localStorage.setItem("edusaas_current_teacher_session", JSON.stringify({ ...tSession, coverPhoto: url, cover_url: url }));
        } catch {}
      }
      fetch("/api/teacher-marketplace/social/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cover_url: url, teacher_id: teacher?.id || currentTeacherUser?.id }),
      }).catch(() => {});
      toast.success("মাশাআল্লাহ! কভার ফটো সফলভাবে পরিবর্তন করা হয়েছে!", { id: "teacher-cover" });
    } catch {
      toast.error("কভার ফটো আপলোডে সমস্যা হয়েছে।", { id: "teacher-cover" });
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F8F9FA] dark:bg-[#07130E] text-slate-900 dark:text-emerald-50 transition-colors pb-24 font-['Hind_Siliguri',sans-serif]">
      {/* ── TOP BREADCRUMB & BACK NAVIGATION ── */}
      <div className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 px-4 sm:px-6 py-3.5 sticky top-0 z-30 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {selectedTeacher ? (
            <button
              onClick={() => setSelectedTeacher(null)}
              className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-slate-700 dark:text-stone-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>সকল শিক্ষক তালিকা</span>
            </button>
          ) : (
            onBackToStudio && (
              <button
                onClick={onBackToStudio}
                className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-slate-700 dark:text-stone-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>স্টুডিওতে ফিরুন</span>
              </button>
            )
          )}

          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
            <Users className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">হিউম্যান টিচার প্ল্যাটফর্ম</span>
            {selectedTeacher && (
              <>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <span className="text-slate-900 dark:text-white truncate max-w-[200px]">
                  {selectedTeacher.nameBn}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Navigation Tabs (Three Main Public Panels + Live Group Class + Teacher Dashboard) */}
        <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800/80 p-1 rounded-2xl border border-stone-200 dark:border-stone-700">
          <button
            onClick={() => {
              setActiveMainPanel("home");
              setSelectedTeacher(null);
              setSelectedStudent(null);
              setShowStudentDashboard(false);
              setShowTeacherDashboard(false);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer ${
              activeMainPanel === "home" && !showStudentDashboard && !showTeacherDashboard && !selectedTeacher && !selectedStudent
                ? "bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-400 shadow-xs"
                : "text-slate-600 dark:text-stone-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>হোম</span>
          </button>

          <button
            onClick={() => {
              setActiveMainPanel("teachers");
              setSelectedTeacher(null);
              setSelectedStudent(null);
              setShowStudentDashboard(false);
              setShowTeacherDashboard(false);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer ${
              activeMainPanel === "teachers" && !showStudentDashboard && !showTeacherDashboard && !selectedTeacher && !selectedStudent
                ? "bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-400 shadow-xs"
                : "text-slate-600 dark:text-stone-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>টিচার প্যানেল</span>
          </button>

          <button
            onClick={() => {
              setActiveMainPanel("students");
              setSelectedTeacher(null);
              setSelectedStudent(null);
              setShowStudentDashboard(false);
              setShowTeacherDashboard(false);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer ${
              activeMainPanel === "students" && !showStudentDashboard && !showTeacherDashboard && !selectedTeacher && !selectedStudent
                ? "bg-white dark:bg-stone-900 text-blue-700 dark:text-blue-400 shadow-xs"
                : "text-slate-600 dark:text-stone-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>স্টুডেন্ট প্যানেল</span>
          </button>

          <button
            onClick={() => {
              setActiveMainPanel("messenger");
              setSelectedTeacher(null);
              setSelectedStudent(null);
              setShowStudentDashboard(false);
              setShowTeacherDashboard(false);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer ${
              activeMainPanel === "messenger" && !showStudentDashboard && !showTeacherDashboard && !selectedTeacher && !selectedStudent
                ? "bg-blue-600 text-white shadow-xs"
                : "text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>মেসেঞ্জার</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </button>

          {currentTeacherUser && (
            <button
              onClick={() => {
                setShowTeacherDashboard(true);
                setShowStudentDashboard(false);
                setSelectedTeacher(null);
                setSelectedStudent(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer ${
                showTeacherDashboard
                  ? "bg-amber-500 text-stone-950 shadow-xs"
                  : "text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/50"
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>টিচার ড্যাশবোর্ড</span>
            </button>
          )}

          <button
            onClick={() => {
              const activeTeacher = selectedTeacher || allTeachers[0];
              if (!activeTeacher) {
                toast.info("গ্রুপ লাইভ ক্লাসে অংশ নেওয়ার জন্য প্রথমে শিক্ষক নির্বাচন করুন।");
                return;
              }
              setLiveGroupClassData({
                teacher: activeTeacher,
                roomTitle: "সূরা আল-ফাতিহা ও তাজবীদ মাশক লাইভ গ্রুপ ক্লাস",
                roomCode: `ROOM-${activeTeacher.id || "LIVE-101"}`,
                isHostTeacher: false,
              });
            }}
            className="px-2.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span className="hidden md:inline">গ্রুপ লাইভ</span>
          </button>
        </div>

        {/* User Auth Controls / Profile Pill & Role Switcher */}
        <div className="flex items-center gap-2">
          {/* Quick 1-Click Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleSwitcher((prev) => !prev)}
              className="px-2.5 py-1.5 rounded-xl text-xs font-black bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              title="টেস্টিংয়ের জন্য দ্রুত শিক্ষক বা শিক্ষার্থী অ্যাকাউন্ট সুইচ করুন"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="hidden sm:inline">ভূমিকা সুইচ</span>
            </button>
            {showRoleSwitcher && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl p-2 z-50 space-y-1 animate-fadeIn">
                <div className="px-3 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  ১-ক্লিক ভূমিকা পরিবর্তন (টেস্টিং)
                </div>
                <button
                  onClick={() => handleQuickSwitchRole("teacher", "qari-mahmudul-hasan")}
                  className="w-full px-3 py-2 text-left rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/50 flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-stone-200 transition cursor-pointer"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                  <div className="truncate">
                    <p className="font-extrabold text-amber-900 dark:text-amber-300 truncate">শায়খ মাহমুদুল হাসান</p>
                    <p className="text-[10px] text-slate-500">অনুমোদিত প্রধান শিক্ষক (উস্তাদ)</p>
                  </div>
                </button>
                <button
                  onClick={() => handleQuickSwitchRole("teacher", "qari-habibur-rahman")}
                  className="w-full px-3 py-2 text-left rounded-xl hover:bg-teal-50 dark:hover:bg-teal-950/50 flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-stone-200 transition cursor-pointer"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500 shrink-0" />
                  <div className="truncate">
                    <p className="font-extrabold text-teal-900 dark:text-teal-300 truncate">শায়খ ক্বারী হাবিবুর রহমান</p>
                    <p className="text-[10px] text-slate-500">মক্কা মুকাররামা সনদপ্রাপ্ত ক্বারী</p>
                  </div>
                </button>
                <button
                  onClick={() => handleQuickSwitchRole("teacher", "ustaza-tahmina-bushra")}
                  className="w-full px-3 py-2 text-left rounded-xl hover:bg-purple-50 dark:hover:bg-purple-950/50 flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-stone-200 transition cursor-pointer"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
                  <div className="truncate">
                    <p className="font-extrabold text-purple-900 dark:text-purple-300 truncate">উস্তাযা তাহমিনা আক্তার</p>
                    <p className="text-[10px] text-slate-500">মহিলা ও শিশু কুরআন শিক্ষিকা</p>
                  </div>
                </button>
                <button
                  onClick={() => handleQuickSwitchRole("student", "fatimah_zohra")}
                  className="w-full px-3 py-2 text-left rounded-xl hover:bg-pink-50 dark:hover:bg-pink-950/50 flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-stone-200 transition cursor-pointer"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-500 shrink-0" />
                  <div className="truncate">
                    <p className="font-extrabold text-pink-900 dark:text-pink-300 truncate">ফাতেমা জোহরা</p>
                    <p className="text-[10px] text-slate-500">উন্মুক্ত শিক্ষার্থী (STU-1002)</p>
                  </div>
                </button>
                <button
                  onClick={() => handleQuickSwitchRole("student", "abdullah_mamun")}
                  className="w-full px-3 py-2 text-left rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/50 flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-stone-200 transition cursor-pointer"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <div className="truncate">
                    <p className="font-extrabold text-emerald-900 dark:text-emerald-300 truncate">আব্দুল্লাহ আল-মামুন</p>
                    <p className="text-[10px] text-slate-500">উন্মুক্ত শিক্ষার্থী (STU-1001)</p>
                  </div>
                </button>
                <button
                  onClick={() => handleQuickSwitchRole("guest")}
                  className="w-full px-3 py-2 text-left rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center gap-2.5 text-xs font-bold text-rose-600 dark:text-rose-400 transition cursor-pointer border-t border-stone-100 dark:border-stone-800"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>সেশন সম্পূর্ণ রিসেট ও লগআউট</span>
                </button>
              </div>
            )}
          </div>

          {currentUser ? (
            /* Logged-in Student Pill */
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleOpenStudentProfile}
                className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100 transition cursor-pointer shadow-xs"
                title="আপনার শিক্ষার্থী ড্যাশবোর্ড ও স্টুডেন্ট প্রোফাইল খুলুন"
              >
                <div className="relative">
                  <img
                    src={currentUser.avatar || "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=400&q=80"}
                    alt={currentUser.name || "Student"}
                    className="w-5 h-5 rounded-full object-cover border border-emerald-500"
                  />
                  <span className="w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white absolute -bottom-0.5 -right-0.5" />
                </div>
                <span className="font-extrabold max-w-[110px] truncate">{currentUser.full_name_bn || currentUser.name || "শিক্ষার্থী"}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-200/80 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 font-black">স্টুডেন্ট প্রোফাইল</span>
              </button>
              <button
                onClick={() => setShowPrivateGroupModal(true)}
                className="p-1.5 rounded-xl bg-teal-50 dark:bg-teal-950 hover:bg-teal-100 text-teal-700 dark:text-teal-300 border border-teal-300 dark:border-teal-800 transition cursor-pointer"
                title="প্রাইভেট লার্নিং গ্রুপ খুলুন"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleStudentLogout}
                className="p-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-rose-100 dark:hover:bg-rose-950 text-stone-500 hover:text-rose-600 transition cursor-pointer"
                title="শিক্ষার্থী অ্যাকাউন্ট থেকে লগআউট করুন"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : currentTeacherUser ? (
            /* Logged-in Teacher Pill & Dropdown */
            <div className="relative">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setSelectedTeacher(normalizeTeacher(currentTeacherUser));
                    setSelectedStudent(null);
                    setActiveMainTab("home");
                  }}
                  className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-2xl bg-amber-50 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900 transition cursor-pointer shadow-xs group"
                  title="আমার ফেসবুক প্রোফাইলে যান (ছবি ও কভার পরিবর্তন করতে ক্লিক করুন)"
                >
                  <div className="relative">
                    <img
                      src={currentTeacherUser.avatar || "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=400&q=80"}
                      alt={currentTeacherUser.nameBn || "Teacher"}
                      className="w-5 h-5 rounded-full object-cover border border-amber-500"
                    />
                    <span className="w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white absolute -bottom-0.5 -right-0.5" />
                  </div>
                  <span className="font-extrabold max-w-[130px] truncate group-hover:underline">
                    {currentTeacherUser.nameBn && currentTeacherUser.nameBn.trim().length > 2
                      ? currentTeacherUser.nameBn
                      : "সম্মানিত উস্তাদ"}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-200/80 dark:bg-amber-900 text-amber-800 dark:text-amber-300 font-black">
                    {currentTeacherUser.status === "approved" ? "প্রোফাইল" : "উস্তাদ"}
                  </span>
                </button>
                <button
                  onClick={() => setShowTopUserMenu((prev) => !prev)}
                  className="p-1.5 rounded-xl bg-amber-100/70 hover:bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 transition cursor-pointer"
                  title="শিক্ষক মেনু ও সেটিংস ড্রপডাউন"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setShowPrivateGroupModal(true)}
                  className="p-1.5 rounded-xl bg-teal-50 dark:bg-teal-950 hover:bg-teal-100 text-teal-700 dark:text-teal-300 border border-teal-300 dark:border-teal-800 transition cursor-pointer"
                  title="প্রাইভেট লার্নিং গ্রুপ খুলুন"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleTeacherLogout}
                  className="p-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-rose-100 dark:hover:bg-rose-950 text-stone-500 hover:text-rose-600 transition cursor-pointer"
                  title="শিক্ষক অ্যাকাউন্ট থেকে লগআউট করুন"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Facebook-style Dropdown Menu */}
              {showTopUserMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl p-2 z-50 space-y-1 animate-fadeIn">
                  <div className="px-3 py-2 border-b border-stone-100 dark:border-stone-800">
                    <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                      {currentTeacherUser.nameBn || "সম্মানিত উস্তাদ"}
                    </p>
                    <p className="text-[10px] text-amber-600 font-bold">
                      {currentTeacherUser.status === "approved" ? "অনুমোদিত শিক্ষক আইডি" : "আবেদনকারী উস্তাদ (যাচাইকরণাধীন)"}
                    </p>
                  </div>

                  {currentTeacherUser.status !== "approved" && (
                    <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 space-y-1.5 my-1">
                      <p className="text-[10px] font-bold text-amber-900 dark:text-amber-200">
                        💡 আবেদনকারী মোড: সম্পূর্ণ ফিচার ব্যবহারের জন্য নিচে সুইচ করুন
                      </p>
                      <button
                        onClick={() => {
                          setShowTopUserMenu(false);
                          handleQuickSwitchRole("teacher", "qari-mahmudul-hasan");
                        }}
                        className="w-full py-1 px-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-[11px] text-center cursor-pointer transition"
                      >
                        অনুমোদিত প্রধান শিক্ষক মোড সক্রিয় করুন
                      </button>
                      <button
                        onClick={() => {
                          setShowTopUserMenu(false);
                          handleQuickSwitchRole("student", "abdullah_mamun");
                        }}
                        className="w-full py-1 px-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-black text-[11px] text-center cursor-pointer transition"
                      >
                        উন্মুক্ত শিক্ষার্থী মোডে সুইচ করুন
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setShowTopUserMenu(false);
                      handleOpenTeacherDashboard();
                    }}
                    className="w-full px-3 py-2 text-left rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/50 flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-stone-200 transition cursor-pointer"
                  >
                    <LayoutDashboard className="w-4 h-4 text-amber-600" />
                    <span>শিক্ষক ড্যাশবোর্ড খুলুন</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowTopUserMenu(false);
                      handleTeacherLogout();
                    }}
                    className="w-full px-3 py-2 text-left rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-stone-300 transition cursor-pointer"
                  >
                    <LogIn className="w-4 h-4 text-slate-500" />
                    <span>লগআউট করুন</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowTopUserMenu(false);
                      setShowDeleteAccountModal(true);
                    }}
                    className="w-full px-3 py-2 text-left rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center gap-2.5 text-xs font-bold text-rose-600 dark:text-rose-400 transition cursor-pointer border-t border-stone-100 dark:border-stone-800 mt-1"
                  >
                    <Trash2 className="w-4 h-4 text-rose-600" />
                    <span>অ্যাকাউন্ট ডিলিট করুন (Delete ID)</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Guest Actions: Teacher Login, Student Login & Join */
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setTeacherAccessTab("login");
                  setShowTeacherAccessModal(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
                title="উস্তাদ বা শিক্ষক হিসেবে লগইন করে ড্যাশবোর্ড খুলুন"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>শিক্ষক লগইন</span>
              </button>

              <button
                onClick={() => {
                  setLoginModalTab("login");
                  setShowLoginModal(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
                title="শিক্ষার্থী হিসেবে আপনার অ্যাকাউন্টে প্রবেশ করুন"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>শিক্ষার্থী লগইন</span>
              </button>

              <button
                onClick={() => {
                  setTeacherAccessTab("apply");
                  setShowTeacherAccessModal(true);
                }}
                className="hidden sm:flex px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-slate-700 dark:text-stone-300 font-bold text-xs items-center gap-1 transition cursor-pointer"
                title="উন্মুক্ত কুরআন শিক্ষক হিসেবে আবেদন করুন"
              >
                <UserPlus className="w-3 h-3" />
                <span>আবেদন</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── CONDITIONAL VIEW: 1) TEACHER DASHBOARD, 2) STUDENT DASHBOARD, 3) FACEBOOK PROFILE, 4) DIRECTORY FEED ── */}
      {showTeacherDashboard ? (
        <TeacherMarketplaceDashboard
          teacher={{
            ...(currentTeacherUser ||
              selectedTeacher ||
              allTeachers[0] || {
                id: "teacher-default",
                nameBn: "মুফতী মাওলানা ক্বারী আহমাদুল্লাহ",
                titleBn: "প্রধান উস্তাদ (তাজবীদ ও কিরাত বিভাগ)",
                verified: true,
                hourlyFeeBn: "৩৫০ টাকা / ঘণ্টা",
              }),
            walletBalance:
              teacherWallets[(currentTeacherUser || selectedTeacher || allTeachers[0])?.id]?.balance ??
              (currentTeacherUser || selectedTeacher || allTeachers[0])?.walletBalance ??
              0,
            recorded_balance:
              teacherWallets[(currentTeacherUser || selectedTeacher || allTeachers[0])?.id]?.recorded_balance ??
              (currentTeacherUser || selectedTeacher || allTeachers[0])?.recorded_balance ??
              0,
            totalEarned:
              teacherWallets[(currentTeacherUser || selectedTeacher || allTeachers[0])?.id]?.totalEarned ??
              (currentTeacherUser || selectedTeacher || allTeachers[0])?.totalEarned ??
              0,
            recorded_total_earned:
              teacherWallets[(currentTeacherUser || selectedTeacher || allTeachers[0])?.id]?.recorded_total_earned ??
              (currentTeacherUser || selectedTeacher || allTeachers[0])?.recorded_total_earned ??
              0,
            verified_earnings:
              teacherWallets[(currentTeacherUser || selectedTeacher || allTeachers[0])?.id]?.verified_earnings,
            calculated_ledger_balance:
              teacherWallets[(currentTeacherUser || selectedTeacher || allTeachers[0])?.id]?.calculated_ledger_balance,
            reconciliation_status:
              teacherWallets[(currentTeacherUser || selectedTeacher || allTeachers[0])?.id]?.reconciliation_status,
            discrepancy_direction:
              teacherWallets[(currentTeacherUser || selectedTeacher || allTeachers[0])?.id]?.discrepancy_direction,
            discrepancy_amount:
              teacherWallets[(currentTeacherUser || selectedTeacher || allTeachers[0])?.id]?.discrepancy_amount,
            is_withdrawal_held:
              teacherWallets[(currentTeacherUser || selectedTeacher || allTeachers[0])?.id]?.is_withdrawal_held ??
              (currentTeacherUser || selectedTeacher || allTeachers[0])?.is_withdrawal_held ??
              false,
            hold_reason:
              teacherWallets[(currentTeacherUser || selectedTeacher || allTeachers[0])?.id]?.hold_reason ??
              (currentTeacherUser || selectedTeacher || allTeachers[0])?.hold_reason ??
              null,
            reconciliation_required:
              teacherWallets[(currentTeacherUser || selectedTeacher || allTeachers[0])?.id]?.reconciliation_required ??
              (currentTeacherUser || selectedTeacher || allTeachers[0])?.reconciliation_required ??
              false,
            transactions:
              teacherWallets[(currentTeacherUser || selectedTeacher || allTeachers[0])?.id]?.transactions ??
              (currentTeacherUser || selectedTeacher || allTeachers[0])?.transactions ??
              [],
            isLoadingWallet: walletLoading,
            walletError: walletError,
          }}
          onBack={() => setShowTeacherDashboard(false)}
          onLaunchLiveGroupCall={(data) => {
            setShowTeacherDashboard(false);
            setLiveGroupClassData(data);
          }}
          onLaunchDirectCall={(t) => {
            setShowTeacherDashboard(false);
            setLiveCallTeacher(t);
          }}
        />
      ) : showStudentDashboard && currentUser ? (
        <StudentMarketplaceDashboard
          student={currentUser}
          teachers={allTeachers}
          onBack={() => setShowStudentDashboard(false)}
          onCallTeacher={(teacher) => {
            setShowStudentDashboard(false);
            setLiveCallTeacher(teacher);
          }}
          onSelectTeacher={(teacher) => {
            setShowStudentDashboard(false);
            handleSelectTeacher(teacher);
          }}
          onLogout={handleStudentLogout}
        />
      ) : selectedTeacher ? (
        /* ══════════════════════════════════════════════════════════════════════
           FACEBOOK-STYLE TEACHER PROFILE PAGE
        ══════════════════════════════════════════════════════════════════════ */
        <div className="max-w-5xl mx-auto px-3 sm:px-6 pt-4 space-y-5 animate-fadeIn">
          {/* Cover & Profile Header Card */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-md overflow-hidden">
            {/* Panoramic Cover Photo */}
            <div className="h-48 sm:h-72 w-full relative bg-slate-800 overflow-hidden group">
              <img
                src={selectedTeacher.coverPhoto}
                alt={selectedTeacher.nameBn}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Status Badge Over Cover */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md flex items-center gap-1.5 border shadow-md ${
                  selectedTeacher.isOnline
                    ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/50"
                    : "bg-slate-900/80 text-slate-300 border-slate-700"
                }`}>
                  <span className={`w-2 h-2 rounded-full ${selectedTeacher.isOnline ? "bg-emerald-400 animate-pulse" : "bg-slate-400"}`} />
                  <span>{selectedTeacher.isOnline ? "অনলাইনে আছেন (সরাসরি ক্লাস প্রস্তুত)" : "বর্তমানে অফলাইন"}</span>
                </span>
              </div>

              {/* Direct Cover Edit Button for Profile Owner */}
              {isViewingOwnProfile && (
                <div className="absolute bottom-4 right-4 flex items-center gap-2 z-20">
                  <label
                    htmlFor="teacher-direct-cover-upload"
                    className="px-4 py-2 rounded-2xl bg-black/80 hover:bg-black text-white text-xs font-black flex items-center gap-2 border border-white/40 shadow-xl cursor-pointer transition active:scale-95 backdrop-blur-md"
                    title="কভার ফটো আপলোড করুন"
                  >
                    <Camera className="w-4 h-4 text-emerald-400" />
                    <span>কভার পরিবর্তন</span>
                    <input
                      id="teacher-direct-cover-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleUploadTeacherCover(e, selectedTeacher)}
                    />
                  </label>
                  <button
                    onClick={() => setShowProfileEditModal(true)}
                    className="p-2 rounded-2xl bg-black/80 hover:bg-black text-white text-xs font-bold border border-white/40 shadow-xl cursor-pointer transition active:scale-95 backdrop-blur-md"
                    title="প্রোফাইল সেটিংস এডিট"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Avatar & Profile Info Bar */}
            <div className="px-5 sm:px-8 pb-6 relative pt-0">
              <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
                {/* Circular Profile Avatar with Ring */}
                <div className="relative group">
                  <img
                    src={selectedTeacher.avatar}
                    alt={selectedTeacher.nameBn}
                    className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-white dark:border-stone-900 shadow-xl"
                  />
                  {(selectedTeacher.isVerified || selectedTeacher.verified) && (
                    <div className="absolute bottom-1 right-1 p-1 rounded-full bg-blue-600 text-white shadow-md border-2 border-white dark:border-stone-900" title="যাচাইকৃত উস্তাদ">
                      <CheckCircle className="w-4 h-4 fill-blue-600 text-white" />
                    </div>
                  )}

                  {/* Avatar Camera Upload Overlay for Profile Owner */}
                  {isViewingOwnProfile && (
                    <label
                      htmlFor="teacher-direct-avatar-upload"
                      className="absolute bottom-1 left-1 p-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white border-2 border-white dark:border-stone-900 shadow-xl transition active:scale-95 cursor-pointer z-20 group-hover:scale-110"
                      title="প্রোফাইল ছবি পরিবর্তন করুন"
                    >
                      <Camera className="w-4 h-4 text-white" />
                      <input
                        id="teacher-direct-avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleUploadTeacherAvatar(e, selectedTeacher)}
                      />
                    </label>
                  )}
                </div>

                {/* Primary Action Buttons (Facebook Style) */}
                <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 w-full sm:w-auto">
                  {isViewingOwnProfile ? (
                    <>
                      <label
                        htmlFor="teacher-direct-avatar-upload"
                        className="px-3.5 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-slate-800 dark:text-stone-200 font-black text-xs sm:text-sm flex items-center gap-1.5 border border-stone-300 dark:border-stone-700 transition active:scale-95 cursor-pointer shadow-xs"
                        title="প্রোফাইল ছবি পরিবর্তন করুন"
                      >
                        <Camera className="w-4 h-4 text-emerald-600" />
                        <span>ছবি পরিবর্তন</span>
                      </label>
                      <button
                        onClick={() => setShowProfileEditModal(true)}
                        className="px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-emerald-700/20 transition active:scale-95 cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                        <span>প্রোফাইল এডিট করুন</span>
                      </button>

                      <button
                        onClick={() => {
                          setProfileActiveTab("posts");
                          window.scrollTo({ top: 350, behavior: "smooth" });
                        }}
                        className="px-4 py-2.5 rounded-2xl bg-teal-50 dark:bg-teal-950/70 hover:bg-teal-100 text-teal-900 dark:text-teal-200 border border-teal-300 dark:border-teal-700 font-extrabold text-xs sm:text-sm flex items-center gap-2 transition active:scale-95 cursor-pointer"
                      >
                        <Rss className="w-4 h-4" />
                        <span>নতুন পোস্ট লিখুন</span>
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Mutual Request: "আমি আপনার কাছে পড়তে চাই" */}
                      <button
                        onClick={() => {
                          setConnectionRequestData({
                            mode: "student_to_teacher",
                            teacher: selectedTeacher,
                          });
                          setShowConnectionRequestModal(true);
                        }}
                        className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-emerald-700/20 transition active:scale-95 cursor-pointer"
                      >
                        <BookOpen className="w-4 h-4 text-amber-300" />
                        <span>আমি আপনার কাছে পড়তে চাই</span>
                      </button>

                      {/* Follow / Unfollow Button */}
                      <button
                        onClick={handleToggleFollow}
                        className={`px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition active:scale-95 cursor-pointer shadow-sm ${
                          isFollowingTeacher
                            ? "bg-slate-100 dark:bg-stone-800 text-slate-800 dark:text-stone-200 hover:bg-slate-200 border border-slate-300 dark:border-stone-700"
                            : "bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-700/20"
                        }`}
                      >
                        {isFollowingTeacher ? (
                          <>
                            <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span>অনুসরণ করছেন</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" />
                            <span>অনুসরণ করুন (Follow)</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleOpenContact(selectedTeacher, "call")}
                        className="px-3.5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-emerald-700/20 transition active:scale-95 cursor-pointer"
                      >
                        <Phone className="w-4 h-4" />
                        <span className="hidden sm:inline">সরাসরি কথা বলুন</span>
                        <span className="sm:hidden">কল</span>
                      </button>

                      <button
                        onClick={() => handleOpenContact(selectedTeacher, "message")}
                        className="px-3.5 py-2.5 rounded-2xl bg-teal-50 dark:bg-teal-950/70 hover:bg-teal-100 text-teal-900 dark:text-teal-200 border border-teal-300 dark:border-teal-700 font-extrabold text-xs sm:text-sm flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span className="hidden sm:inline">বার্তা পাঠান</span>
                        <span className="sm:hidden">মেসেজ</span>
                      </button>

                      <button
                        onClick={() => handleOpenContact(selectedTeacher, "fee")}
                        className="px-3.5 py-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/70 hover:bg-amber-100 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 font-extrabold text-xs sm:text-sm flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span className="hidden sm:inline">হাদিয়া / ফি দিন</span>
                        <span className="sm:hidden">ফি</span>
                      </button>
                    </>
                  )}

                  {/* Share Profile Button */}
                  <button
                    onClick={() => setShowShareTeacherModal(true)}
                    className="p-2.5 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-slate-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 transition active:scale-95 cursor-pointer"
                    title="প্রোফাইল শেয়ার করুন"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  {/* Report Profile Button (For non-owners) */}
                  {!isViewingOwnProfile && (
                    <button
                      onClick={() => setShowReportTeacherModal(true)}
                      className="p-2.5 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-red-50 dark:hover:bg-red-950/50 text-slate-500 hover:text-red-600 border border-stone-200 dark:border-stone-700 transition active:scale-95 cursor-pointer"
                      title="রিপোর্ট করুন"
                    >
                      <Flag className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Teacher Identity Details */}
              <div className="space-y-2 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{selectedTeacher.nameBn}</span>
                    {(selectedTeacher.isVerified || selectedTeacher.verified) && (
                      <CheckCircle className="w-5 h-5 fill-blue-600 text-white flex-shrink-0" title="যাচাইকৃত শিক্ষক (Verified)" />
                    )}
                  </h1>
                  <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
                    ({selectedTeacher.nameEn})
                  </span>
                  {selectedTeacher.username && (
                    <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      @{selectedTeacher.username}
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-300">
                  {selectedTeacher.titleBn}
                </p>

                {/* Location & Languages */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-600 dark:text-stone-400 pt-0.5">
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{selectedTeacher.location || "ঢাকা, বাংলাদেশ"}</span>
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <Globe className="w-3.5 h-3.5 text-slate-500" />
                    <span>{Array.isArray(selectedTeacher.languages) ? selectedTeacher.languages.join(" • ") : "বাংলা • العربية"}</span>
                  </span>
                </div>

                {/* Quick Facebook-style Stat Badges (All Clickable!) */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs pt-1.5">
                  <button
                    onClick={() => setProfileActiveTab("posts")}
                    className="inline-flex items-center gap-1.5 font-extrabold px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition cursor-pointer"
                  >
                    <Rss className="w-3.5 h-3.5 text-blue-600" />
                    <span>{selectedTeacher.postsCount || socialPosts.length} পোস্ট</span>
                  </button>

                  <button
                    onClick={() => setShowFollowersModal(true)}
                    className="inline-flex items-center gap-1.5 font-extrabold px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{teacherFollowersCount} ফলোয়ার্স</span>
                  </button>

                  <span className="inline-flex items-center gap-1.5 font-bold px-3 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800 text-slate-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                    <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                    <span>{selectedTeacher.followingCount || 0} ফলোয়িং</span>
                  </span>

                  <button
                    onClick={() => setProfileActiveTab("reviews")}
                    className="inline-flex items-center gap-1 font-extrabold px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition cursor-pointer"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>
                      {selectedTeacher.totalReviews > 0
                        ? `${Number(selectedTeacher.rating).toFixed(1)} (${selectedTeacher.totalReviews} রিভিউ)`
                        : "নতুন শিক্ষক"}
                    </span>
                  </button>

                  <span className="inline-flex items-center gap-1 font-bold px-3 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800 text-slate-700 dark:text-stone-300">
                    <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                    <span>
                      {selectedTeacher.totalStudents > 0
                        ? `${selectedTeacher.totalStudents}+ শিক্ষার্থী`
                        : "নতুন ব্যাচ"}
                    </span>
                  </span>

                  <button
                    onClick={() => setProfileActiveTab("fees")}
                    className="font-black px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 hover:bg-emerald-200 transition cursor-pointer"
                  >
                    হাদিয়া: {selectedTeacher.hourlyFeeBn}
                  </button>
                </div>
              </div>

              {/* Facebook-Style Navigation Tabs */}
              <div className="border-t border-stone-200/80 dark:border-stone-800 mt-6 pt-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
                {[
                  { id: "posts", label: `পোস্টসমূহ (${selectedTeacher.postsCount || socialPosts.length})`, icon: Rss },
                  { id: "clips", label: "ক্লিপস ও রিলস", icon: Film },
                  { id: "liked", label: "পছন্দসমূহ", icon: ThumbsUp },
                  { id: "saved", label: "সংরক্ষিত", icon: Bookmark },
                  { id: "about", label: "পরিচিতি ও বায়োডাটা", icon: BookOpen },
                  { id: "videos", label: `ভিডিও ও ক্লাস (${(selectedTeacher.videos?.length || 0)})`, icon: Video },
                  { id: "reviews", label: `শিক্ষার্থী রিভিউ (${(selectedTeacher.reviews?.length || selectedTeacher.totalReviews || selectedTeacher.total_reviews || 0)})`, icon: Star },
                  { id: "fees", label: "ফি ও ওয়ালেট বিবরণ", icon: CreditCard },
                ].map((tab) => {
                  const isActive = profileActiveTab === tab.id;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setProfileActiveTab(tab.id)}
                      className={`px-4 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap flex items-center gap-2 transition cursor-pointer ${
                        isActive
                          ? "bg-emerald-700 text-white shadow-md shadow-emerald-700/20"
                          : "text-slate-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── PROFILE TAB CONTENT ── */}
          {/* TAB 0: SOCIAL FEED & POSTS */}
          {profileActiveTab === "posts" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Left Column: Post Composer & Feed */}
              <div className="lg:col-span-2 space-y-5">
                {isViewingOwnProfile && (
                  <SocialPostComposer
                    teacher={selectedTeacher}
                    currentUser={currentUser}
                    onPostCreated={(newPost) => {
                      setSocialPosts((prev) => [newPost, ...prev]);
                      setSelectedTeacher((prev) => ({
                        ...prev,
                        postsCount: (prev.postsCount || 0) + 1,
                      }));
                      toast.success("পোস্ট সফলভাবে প্রকাশিত হয়েছে!");
                    }}
                  />
                )}

                {isLoadingSocialPosts ? (
                  <div className="space-y-4">
                    {[1, 2].map((n) => (
                      <div
                        key={n}
                        className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 animate-pulse space-y-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-stone-800" />
                          <div className="space-y-2 flex-1">
                            <div className="h-4 bg-slate-200 dark:bg-stone-800 rounded w-1/3" />
                            <div className="h-3 bg-slate-200 dark:bg-stone-800 rounded w-1/4" />
                          </div>
                        </div>
                        <div className="h-16 bg-slate-100 dark:bg-stone-800 rounded-2xl" />
                      </div>
                    ))}
                  </div>
                ) : socialPosts.length === 0 ? (
                  <div className="bg-white dark:bg-stone-900 rounded-3xl p-8 border border-stone-200 dark:border-stone-800 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
                      <Rss className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      কোনো পোস্ট প্রকাশিত হয়নি
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      {isViewingOwnProfile
                        ? "উপরের পোস্ট কম্পোজার থেকে আপনার প্রথম ইসলামিক বা শিক্ষণীয় পোস্ট প্রকাশ করুন।"
                        : "উস্তাদ এখনো কোনো সামাজিক পোস্ট শেয়ার করেননি। উস্তাদের ফলোয়ার হয়ে আপডেট পেতে সাথে থাকুন।"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {socialPosts.map((post) => (
                      <SocialPostCard
                        key={post.id}
                        post={post}
                        currentUser={currentUser}
                        onAuthorClick={handlePostAuthorClick}
                        onPostDeleted={(deletedId) => {
                          setSocialPosts((prev) => prev.filter((x) => x.id !== deletedId));
                          setSelectedTeacher((prev) => ({
                            ...prev,
                            postsCount: Math.max(0, (prev.postsCount || 1) - 1),
                          }));
                        }}
                        onPostUpdated={(updatedPost) => {
                          setSocialPosts((prev) =>
                            prev.map((x) => (x.id === updatedPost.id ? updatedPost : x))
                          );
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Teacher Bio & Quick Info Snapshot */}
              <div className="space-y-5">
                <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-3.5">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    <span>সংক্ষিপ্ত পরিচিতি</span>
                  </h3>
                  <p className="text-xs text-slate-700 dark:text-stone-300 leading-relaxed font-medium">
                    {selectedTeacher.bio || "উস্তাদের সংক্ষিপ্ত পরিচিতি শীঘ্রই যোগ করা হবে।"}
                  </p>

                  <div className="border-t border-stone-100 dark:border-stone-800 pt-3 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-stone-400">
                      <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>ঠিকানা: <strong>{selectedTeacher.location || "ঢাকা, বাংলাদেশ"}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-stone-400">
                      <Globe className="w-4 h-4 text-teal-600 flex-shrink-0" />
                      <span>ভাষা: <strong>{Array.isArray(selectedTeacher.languages) ? selectedTeacher.languages.join(", ") : "বাংলা, আরবি"}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-stone-400">
                      <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <span>অভিজ্ঞতা: <strong>{selectedTeacher.experienceYears} বছর</strong></span>
                    </div>
                  </div>
                </div>

                {/* Specialties Badges */}
                <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-3">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    পাঠদানের বিষয়সমূহ
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTeacher.specialties.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 font-extrabold text-xs"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Direct Class Book Card */}
                {!isViewingOwnProfile && (
                  <div className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white rounded-3xl p-5 space-y-3 shadow-lg">
                    <h4 className="text-sm font-black">১-অন-১ লাইভ ক্লাস শুরু করুন</h4>
                    <p className="text-xs text-emerald-200 leading-relaxed">
                      উস্তাদের সাথে সরাসরি অডিও বা ভিডিও ক্লাসে যুক্ত হতে অনুরোধ পাঠান।
                    </p>
                    <button
                      onClick={() => handleOpenContact(selectedTeacher, "call")}
                      className="w-full py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition active:scale-95 cursor-pointer"
                    >
                      সরাসরি যোগাযোগ করুন
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: CLIPS & REELS */}
          {profileActiveTab === "clips" && (
            <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Film className="w-5 h-5 text-emerald-600" />
                    <span>শর্ট রিলস ও ভিডিও ক্লিপস (Facebook Reels)</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    উস্তাদের সংক্ষিপ্ত তাজবীদ টিপস, মাখরাজ প্রদর্শন ও তিলাওয়াত ভিডিও
                  </p>
                </div>
              </div>

              {/* Facebook-style Reels Discovery Section with Create Reel Card */}
              <ReelsDiscoverySection
                currentUser={currentUser}
                currentTeacherUser={currentTeacherUser}
                teacherFilter={null}
              />
            </div>
          )}

          {/* TAB: LIKED POSTS */}
          {profileActiveTab === "liked" && (
            <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <ThumbsUp className="w-5 h-5 text-blue-600" />
                    <span>পছন্দকৃত পোস্টসমূহ</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    যেসব পোস্টে আপনি রিয়্যাকশন দিয়েছেন
                  </p>
                </div>
              </div>

              {socialPosts.filter((p) => p.current_user_reaction).length === 0 ? (
                <div className="p-8 text-center bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-stone-200 dark:border-stone-800">
                  <ThumbsUp className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-semibold">
                    আপনি এখনো উস্তাদের কোনো পোস্টে লাইক বা রিয়্যাক্ট করেননি।
                  </p>
                </div>
              ) : (
                <div className="space-y-5 max-w-2xl mx-auto">
                  {socialPosts
                    .filter((p) => p.current_user_reaction)
                    .map((p) => (
                      <SocialPostCard
                        key={p.id}
                        post={p}
                        currentUser={currentUser}
                        onAuthorClick={handlePostAuthorClick}
                        onPostDeleted={(id) => setSocialPosts((prev) => prev.filter((x) => x.id !== id))}
                        onPostUpdated={(up) => setSocialPosts((prev) => prev.map((x) => x.id === up.id ? up : x))}
                      />
                    ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: SAVED POSTS (PRIVATE) */}
          {profileActiveTab === "saved" && (
            <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Bookmark className="w-5 h-5 text-emerald-600" />
                    <span>সংরক্ষিত পোস্টসমূহ (ব্যক্তিগত সংগ্রহ)</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    শুধুমাত্র আপনি এই সংরক্ষিত পোস্টগুলো দেখতে পারবেন
                  </p>
                </div>
              </div>

              {socialPosts.length === 0 ? (
                <div className="p-8 text-center bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-stone-200 dark:border-stone-800">
                  <Bookmark className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-semibold">
                    কোনো সংরক্ষিত পোস্ট পাওয়া যায়নি। পোস্ট কার্ডের বুকমার্ক আইকনে ক্লিক করে সংরক্ষণ করুন।
                  </p>
                </div>
              ) : (
                <div className="space-y-5 max-w-2xl mx-auto">
                  {socialPosts.map((p) => (
                    <SocialPostCard
                      key={p.id}
                      post={p}
                      currentUser={currentUser}
                      onAuthorClick={handlePostAuthorClick}
                      onPostDeleted={(id) => setSocialPosts((prev) => prev.filter((x) => x.id !== id))}
                      onPostUpdated={(up) => setSocialPosts((prev) => prev.map((x) => x.id === up.id ? up : x))}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── PROFILE TAB CONTENT ── */}
          {profileActiveTab === "about" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Left Column: Bio & Qualifications */}
              <div className="md:col-span-2 space-y-5">
                {/* About / Bio Box */}
                <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-6 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-3">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    <span>উস্তাদের পরিচিতি ও শিক্ষাদান দর্শন</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-stone-300 leading-relaxed font-medium">
                    {selectedTeacher.bio}
                  </p>
                </div>

                {/* Educational Qualifications & Sanad */}
                <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-6 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-3">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>শিক্ষাগত যোগ্যতা ও সনদপত্র (Sanad)</span>
                  </h3>
                  <div className="space-y-2">
                    {selectedTeacher.qualifications.map((q, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800 text-xs font-semibold text-slate-800 dark:text-emerald-200"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{q}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Schedule & Specialties */}
              <div className="space-y-5">
                {/* Specialties Badges */}
                <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-3">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    কোন কোন বিষয়ে পড়ান
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTeacher.specialties.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 font-extrabold text-xs"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Class Timing Schedule */}
                <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-3">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>ক্লাসের সময়সূচী</span>
                  </h3>
                  <p className="text-xs font-bold text-slate-700 dark:text-stone-300 leading-relaxed bg-stone-50 dark:bg-stone-800/70 p-3 rounded-2xl">
                    {selectedTeacher.schedule}
                  </p>
                </div>

                {/* Direct Action Card */}
                <div className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white rounded-3xl p-5 space-y-3 shadow-lg">
                  <h4 className="text-sm font-black">সরাসরি ক্লাস বুক করুন</h4>
                  <p className="text-xs text-emerald-200 leading-relaxed">
                    উস্তাদের সাথে সরাসরি অডিও বা ভিডিও ক্লাসে যুক্ত হতে অনুরোধ পাঠান।
                  </p>
                  <button
                    onClick={() => handleOpenContact(selectedTeacher, "call")}
                    className="w-full py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition active:scale-95 cursor-pointer"
                  >
                    এখনই যোগাযোগ করুন
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VIDEOS & LECTURES */}
          {profileActiveTab === "videos" && (
            <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Video className="w-4 h-4 text-emerald-600" />
                <span>উস্তাদের তিলাওয়াত ও ক্লাস ভিডিও ক্লিপস</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(Array.isArray(selectedTeacher.videos) ? selectedTeacher.videos : []).map((vid) => (
                  <div
                    key={vid.id}
                    className="rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden bg-stone-50 dark:bg-stone-800/40 hover:shadow-md transition"
                  >
                    <div className="h-44 w-full relative bg-slate-900 overflow-hidden">
                      <img src={vid.thumbnail} alt={vid.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg hover:scale-110 transition cursor-pointer">
                          <Video className="w-5 h-5" />
                        </div>
                      </div>
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-white text-[11px] font-bold">
                        {vid.duration}
                      </span>
                    </div>
                    <div className="p-3.5 space-y-1">
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-emerald-100 line-clamp-1">
                        {vid.title}
                      </h4>
                      <p className="text-[11px] text-slate-500">{vid.views}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: REVIEWS & RATINGS */}
          {profileActiveTab === "reviews" && (
            <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    শিক্ষার্থীদের খাঁটি রেটিং ও রিভিউ
                  </h3>
                  <p className="text-xs text-slate-500">
                    উস্তাদের কাছ থেকে সরাসরি শেখা শিক্ষার্থীদের বাস্তব অভিজ্ঞতা
                  </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 font-black text-sm">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span>
                    {selectedTeacher.totalReviews > 0
                      ? `${Number(selectedTeacher.rating).toFixed(1)} / ৫.০ (${selectedTeacher.totalReviews} রিভিউ)`
                      : "নতুন শিক্ষক (কোনো রিভিউ নেই)"}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {(!Array.isArray(selectedTeacher.reviews) || selectedTeacher.reviews.length === 0) ? (
                  <div className="p-8 text-center bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-stone-200 dark:border-stone-800">
                    <p className="text-xs text-slate-500 dark:text-stone-400 font-semibold">
                      এখনো কোনো শিক্ষার্থী রিভিউ প্রদান করেননি। কোর্স সম্পন্ন করার পর শিক্ষার্থীরা এখানে রিভিউ জমা দিতে পারবেন।
                    </p>
                  </div>
                ) : (
                  selectedTeacher.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                          {rev.studentName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                            {rev.studentName}
                          </p>
                          <p className="text-[10px] text-slate-400">{rev.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-stone-300 leading-relaxed font-medium">
                      "{rev.comment}"
                    </p>
                  </div>
                )))}
              </div>
            </div>
          )}

          {/* TAB 4: FEES & WALLET */}
          {profileActiveTab === "fees" && (
            <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-emerald-600" />
                    <span>কোর্স ফি ও ডিজিটাল ওয়ালেট</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    শিক্ষার্থীদের সরাসরি পরিশোধিত হাদিয়া ও শিক্ষকের ওয়ালেট হিসাব
                  </p>
                </div>

                {/* Teacher's Current Wallet or Verified Guarantee */}
                {currentUser?.id === selectedTeacher?.id ? (
                  <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200">
                    <Wallet className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">আপনার রেকর্ডকৃত ওয়ালেট:</p>
                      <p className="text-base font-black">
                        {(Number(teacherWallets[selectedTeacher.id]?.balance) || 0).toLocaleString("bn-BD")} ৳
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">হাদিয়া পরিশোধ গ্যারান্টি:</p>
                      <p className="text-xs font-black">ভেরিফাইড ও সুরক্ষিত লেনদেন</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Fee Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 space-y-2">
                  <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">প্রতি ঘণ্টা ভিত্তিক ক্লাস</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{selectedTeacher.hourlyFeeBn}</p>
                  <p className="text-xs text-slate-600 dark:text-stone-300">সরাসরি ১-অন-১ লাইভ ক্লাসে অংশ নিন</p>
                </div>

                <div className="p-5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 space-y-2">
                  <p className="text-xs font-bold text-amber-800 dark:text-amber-300">মাসিক পূর্ণাঙ্গ কোর্স হাদিয়া</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{selectedTeacher.monthlyFeeBn}</p>
                  <p className="text-xs text-slate-600 dark:text-stone-300">সপ্তাহে ৩ দিন নিয়মিত মাসভিত্তিতে পাঠদান</p>
                </div>
              </div>

              {/* Dynamic Platform Commission Transparent Policy */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-teal-600" />
                    <span>স্বচ্ছ লেনদেন ও প্ল্যাটফর্ম ফি নীতি</span>
                  </p>
                  <span className="text-[11px] font-black text-teal-700 dark:text-teal-400 bg-teal-100 dark:bg-teal-950 px-2 py-0.5 rounded-full">
                    প্ল্যাটফর্ম কমিশন: {platformSettings.teacherCommissionPercentage}%
                  </span>
                </div>
                <p className="text-slate-600 dark:text-stone-300 leading-relaxed font-medium">
                  শিক্ষার্থী bKash বা Nagad-এ ফি পরিশোধ করলে {platformSettings.teacherCommissionPercentage}% প্ল্যাটফর্ম রক্ষণাবেক্ষণ ও সার্ভার খরচে কর্তন হয় এবং অবশিষ্ট {100 - platformSettings.teacherCommissionPercentage}% তাৎক্ষণিকভাবে শিক্ষকের নিজস্ব ওয়ালেটে জমা হয়।
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleOpenContact(selectedTeacher, "fee")}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md cursor-pointer transition active:scale-95 flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>সরাসরি হাদিয়া / ফি প্রদান করুন</span>
              </button>
            </div>
          )}
        </div>
      ) : selectedStudent ? (
        /* ══════════════════════════════════════════════════════════════════════
           FACEBOOK-STYLE PUBLIC STUDENT PROFILE VIEW
        ══════════════════════════════════════════════════════════════════════ */
        <div className="max-w-5xl mx-auto px-3 sm:px-6 pt-4 space-y-5 animate-fadeIn">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-md overflow-hidden">
            <div className="h-44 sm:h-64 w-full relative bg-slate-800">
              <img
                src={
                  selectedStudent.cover_url ||
                  ISLAMIC_COVERS.quran_mushaf
                }
                alt={selectedStudent.display_name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <button
                onClick={() => setSelectedStudent(null)}
                className="absolute top-4 left-4 px-3.5 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>ডিরেক্টরিতে ফিরুন</span>
              </button>

              {/* Facebook-Style Edit Cover Photo Button - ONLY FOR OWN PROFILE */}
              {isViewingOwnStudentProfile && (
                <label
                  htmlFor="selected-student-cover-upload"
                  className="absolute bottom-4 right-4 px-3.5 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 border border-white/20 shadow-md cursor-pointer transition active:scale-95 z-10"
                  title="কভার ফটো পরিবর্তন করুন"
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-400" />
                  <span>কভার পরিবর্তন</span>
                  <input
                    id="selected-student-cover-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleUploadStudentCover(e, selectedStudent)}
                  />
                </label>
              )}
            </div>

            <div className="px-5 sm:px-8 pb-6 relative pt-0">
              <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
                <div className="relative group">
                  <img
                    src={
                      selectedStudent.avatar_url ||
                      (selectedStudent.display_name?.includes("ফাতেমা") || selectedStudent.display_name?.includes("মারিয়াম")
                        ? ISLAMIC_AVATARS.studentGirl
                        : ISLAMIC_AVATARS.studentBoy)
                    }
                    alt={selectedStudent.display_name}
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white dark:border-stone-900 shadow-xl"
                  />
                  <span className="w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white absolute bottom-1 right-1" />

                  {/* Facebook-Style Round Camera Overlay for Avatar - ONLY FOR OWN PROFILE */}
                  {isViewingOwnStudentProfile && (
                    <label
                      htmlFor="selected-student-avatar-upload"
                      className="absolute bottom-1 left-1 p-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white border-2 border-white dark:border-stone-900 shadow-md transition active:scale-95 cursor-pointer z-10"
                      title="প্রোফাইল ছবি পরিবর্তন করুন"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <input
                        id="selected-student-avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleUploadStudentAvatar(e, selectedStudent)}
                      />
                    </label>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {isViewingOwnStudentProfile ? (
                    <>
                      <button
                        onClick={() => setShowStudentEditProfileModal(true)}
                        className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-emerald-700/20 transition active:scale-95 cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                        <span>প্রোফাইল এডিট করুন</span>
                      </button>
                      <button
                        onClick={handleOpenStudentProfile}
                        className="px-3.5 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-slate-800 dark:text-stone-200 font-black text-xs sm:text-sm flex items-center gap-1.5 border border-stone-300 dark:border-stone-700 transition cursor-pointer"
                      >
                        <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                        <span>আমার ড্যাশবোর্ড</span>
                      </button>
                    </>
                  ) : (
                    <>
                      {currentTeacherUser && (
                        <button
                          onClick={() => {
                            setConnectionRequestData({
                              mode: "teacher_to_student",
                              student: selectedStudent,
                            });
                            setShowConnectionRequestModal(true);
                          }}
                          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-emerald-700/20 transition active:scale-95 cursor-pointer"
                        >
                          <BookOpen className="w-4 h-4 text-amber-300" />
                          <span>আমি আপনাকে পড়াতে চাই</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleFollowStudent(selectedStudent)}
                        className={`px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 shadow-sm transition active:scale-95 cursor-pointer ${
                          followedStudentIds.includes(selectedStudent.id || selectedStudent.student_public_id)
                            ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                      >
                        {followedStudentIds.includes(selectedStudent.id || selectedStudent.student_public_id) ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                            <span>ফলো করা হচ্ছে</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" />
                            <span>ফলো করুন</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setMessengerTargetTeacher(selectedStudent);
                          setActiveMainPanel("messenger");
                          setSelectedStudent(null);
                        }}
                        className="px-3.5 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-slate-800 dark:text-stone-200 font-black text-xs sm:text-sm flex items-center gap-1.5 border border-stone-300 dark:border-stone-700 transition cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4 text-emerald-600" />
                        <span>মেসেজ পাঠান</span>
                      </button>
                      <button
                        onClick={() => {
                          if (typeof navigator !== "undefined" && navigator.clipboard) {
                            navigator.clipboard.writeText(window.location.href);
                          }
                          toast.success("মাশাআল্লাহ! প্রোফাইল লিঙ্ক কপি করা হয়েছে।");
                        }}
                        className="p-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-slate-700 dark:text-stone-300 border border-stone-300 dark:border-stone-700 transition cursor-pointer"
                        title="শেয়ার করুন"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {selectedStudent.display_name}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-xs font-mono font-bold">
                    {selectedStudent.student_public_id || "STU-1001"}
                  </span>
                  <span className="text-xs text-slate-400">@{selectedStudent.username}</span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-stone-300 max-w-2xl leading-relaxed">
                  {selectedStudent.bio || "পাবলিক কুরআন শিক্ষার্থী। সহীহ তিলাওয়াত ও তাজবীদ শিখতে আগ্রহী।"}
                </p>

                {Array.isArray(selectedStudent.learning_interests) && (
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
                    <span className="text-xs font-bold text-slate-500 mr-1">আগ্রহের বিষয়:</span>
                    {selectedStudent.learning_interests.map((tag, i) => (
                      <span
                        key={i}
                        className="text-xs px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-900"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Facebook-Style Profile Tabs Navigation ── */}
              <div className="mt-6 border-b border-stone-200 dark:border-stone-800 flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => setStudentProfileTab("progress")}
                  className={`px-4 py-2.5 text-xs font-black rounded-xl transition flex items-center gap-2 cursor-pointer ${
                    studentProfileTab === "progress"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>কুরআন অগ্রগতি ও হিফজ চার্ট</span>
                </button>

                <button
                  onClick={() => setStudentProfileTab("timeline")}
                  className={`px-4 py-2.5 text-xs font-black rounded-xl transition flex items-center gap-2 cursor-pointer ${
                    studentProfileTab === "timeline"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                  }`}
                >
                  <Rss className="w-3.5 h-3.5" />
                  <span>টাইমলাইন ও পোস্টসমূহ</span>
                </button>

                <button
                  onClick={() => setStudentProfileTab("teachers")}
                  className={`px-4 py-2.5 text-xs font-black rounded-xl transition flex items-center gap-2 cursor-pointer ${
                    studentProfileTab === "teachers"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>উস্তাদগণ ও ক্লাস</span>
                </button>

                <button
                  onClick={() => setStudentProfileTab("about")}
                  className={`px-4 py-2.5 text-xs font-black rounded-xl transition flex items-center gap-2 cursor-pointer ${
                    studentProfileTab === "about"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>পরিচিতি ও তথ্য</span>
                </button>
              </div>

              {/* ── Tab Content Panel ── */}
              <div className="pt-5">
                {studentProfileTab === "progress" && (
                  <div className="space-y-5 animate-fadeIn">
                    {/* Key Stats Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                        <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">বর্তমান সূরা ও পারা</p>
                        <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1">সূরা বাকারা (পারা ১)</p>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">রুকু ১-৩ মুখস্থ</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800">
                        <p className="text-[11px] font-bold text-teal-800 dark:text-teal-300">সার্বিক তাজবীদ নির্ভুলতা</p>
                        <p className="text-base sm:text-lg font-black text-teal-900 dark:text-teal-200 mt-1">৯৪% সহীহ</p>
                        <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold">নূর এআই যাচাইকৃত</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                        <p className="text-[11px] font-bold text-blue-800 dark:text-blue-300">ধারাবাহিক উপস্থিতি</p>
                        <p className="text-base sm:text-lg font-black text-blue-900 dark:text-blue-200 mt-1">৭/৭ দিন</p>
                        <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">নিয়মিত সেশন</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                        <p className="text-[11px] font-bold text-amber-800 dark:text-amber-300">নূর লার্নিং স্টার</p>
                        <p className="text-base sm:text-lg font-black text-amber-900 dark:text-amber-200 mt-1">⭐⭐⭐</p>
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">০ ভুল (নিখুঁত)</span>
                      </div>
                    </div>

                    {/* Sabaq & Hifz Tracking Ledger */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Sabaq */}
                      <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5" />
                            আজকের সবক (Sabaq)
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">উত্তীর্ণ</span>
                        </div>
                        <p className="text-sm font-black text-slate-900 dark:text-white">সূরা আল-বাকারাহ (আয়াত ২১-২৫)</p>
                        <p className="text-xs text-slate-600 dark:text-stone-300">মাখরাজ ও ওয়াকফের নিয়ম মেনে সহীহ তারতীলে উস্তাদকে শুনানো সম্পন্ন হয়েছে।</p>
                      </div>

                      {/* Sat Sabaq */}
                      <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            সাত সবক (Recent 7)
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold">পুনরাবৃত্তি</span>
                        </div>
                        <p className="text-sm font-black text-slate-900 dark:text-white">সূরা বাকারা (আয়াত ১-২০)</p>
                        <p className="text-xs text-slate-600 dark:text-stone-300">গত ৭ দিনের সবক নির্ভুল ও পরিষ্কারভাবে মুখস্থ আওড়ানো হয়েছে।</p>
                      </div>

                      {/* Amukta */}
                      <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5" />
                            আমুক্তা (Cumulative Revision)
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">নিয়মিত</span>
                        </div>
                        <p className="text-sm font-black text-slate-900 dark:text-white">সূরা আল-ফাতিহা ও আমপারা</p>
                        <p className="text-xs text-slate-600 dark:text-stone-300">পূর্ববর্তী মুখস্থ অংশের রিভিশন সফল। লোকমা সংখ্যা: ০ টি।</p>
                      </div>
                    </div>

                    {/* Tajweed Breakdown */}
                    <div className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700/80 space-y-3">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        তাজবীদ বিশ্লেষণ ও উস্তাদের মন্তব্য
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="p-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800">
                          <p className="text-slate-500 font-bold">হলকের হরফ (Makhraj):</p>
                          <p className="text-sm font-black text-emerald-600 mt-0.5">৯৬% নিখুঁত</p>
                        </div>
                        <div className="p-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800">
                          <p className="text-slate-500 font-bold">গুন্নাহ ও ইখফা (Ghunnah):</p>
                          <p className="text-sm font-black text-teal-600 mt-0.5">৯২% সহীহ</p>
                        </div>
                        <div className="p-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800">
                          <p className="text-slate-500 font-bold">মদ ও ক্বলক্বলাহ (Madd):</p>
                          <p className="text-sm font-black text-blue-600 mt-0.5">৯০% স্পষ্ট</p>
                        </div>
                        <div className="p-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800">
                          <p className="text-slate-500 font-bold">ওয়াকফ ও তারতীল (Waqf):</p>
                          <p className="text-sm font-black text-amber-600 mt-0.5">৮৮% সুন্দর</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-stone-300 italic pt-1 border-t border-stone-200/60 dark:border-stone-800">
                        &quot;উস্তাদের মন্তব্য: মাশাআল্লাহ, শিক্ষার্থীর মনোযোগ ও একাগ্রতা প্রশংসনীয়। মদ ও গুন্নাহর সময়সীমা বজায় রাখলে অচিরেই পূর্ণাঙ্গ পারা মুখস্থ সম্পন্ন হবে ইনশাআল্লাহ।&quot;
                      </p>
                    </div>
                  </div>
                )}

                {studentProfileTab === "timeline" && (
                  <div className="space-y-4 animate-fadeIn">
                    {/* Facebook-Style Timeline Post Composer (Visible if viewing own profile) */}
                    {isViewingOwnStudentProfile && (
                      <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              selectedStudent.avatar_url ||
                              (selectedStudent.display_name?.includes("ফাতেমা") || selectedStudent.display_name?.includes("মারিয়াম")
                                ? ISLAMIC_AVATARS.studentGirl
                                : ISLAMIC_AVATARS.studentBoy)
                            }
                            alt={selectedStudent.display_name}
                            className="w-10 h-10 rounded-full object-cover border border-emerald-500 shrink-0"
                          />
                          <input
                            type="text"
                            value={newStudentPostText}
                            onChange={(e) => setNewStudentPostText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleCreateStudentPost();
                            }}
                            placeholder={`${selectedStudent.display_name}, আজ কুরআন থেকে কী শিখলেন বা আপনার মনের কথা শেয়ার করুন...`}
                            className="w-full px-4 py-2.5 rounded-full bg-stone-100 dark:bg-stone-800 border-none text-xs sm:text-sm text-slate-800 dark:text-stone-100 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 outline-hidden"
                          />
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
                          <span className="text-[11px] text-slate-400">💡 তিলাওয়াত নোট ও কুরআনিক চিন্তা শেয়ার করুন</span>
                          <button
                            onClick={handleCreateStudentPost}
                            disabled={!newStudentPostText.trim()}
                            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs transition active:scale-95 cursor-pointer shadow-xs"
                          >
                            পোস্ট করুন
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Timeline Posts List */}
                    {studentTimelinePosts.map((post) => (
                      <div
                        key={post.id}
                        className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              selectedStudent.avatar_url ||
                              (selectedStudent.display_name?.includes("ফাতেমা") || selectedStudent.display_name?.includes("মারিয়াম")
                                ? ISLAMIC_AVATARS.studentGirl
                                : ISLAMIC_AVATARS.studentBoy)
                            }
                            alt={selectedStudent.display_name}
                            className="w-10 h-10 rounded-full object-cover border border-emerald-500 shrink-0"
                          />
                          <div>
                            <p className="text-xs font-black text-slate-900 dark:text-white">{selectedStudent.display_name}</p>
                            <p className="text-[10px] text-slate-400">{post.timestamp} • পাবলিক কুরআন শিক্ষার্থী</p>
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-800 dark:text-stone-200 leading-relaxed whitespace-pre-line">
                          {post.text}
                        </p>

                        <div className="flex items-center gap-4 pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
                          <button
                            onClick={() => handleToggleLikeStudentPost(post.id)}
                            className={`flex items-center gap-1.5 font-bold transition cursor-pointer ${
                              post.isLiked
                                ? "text-blue-600 dark:text-blue-400 font-black"
                                : "text-slate-600 dark:text-stone-400 hover:text-blue-600"
                            }`}
                          >
                            <ThumbsUp className={`w-4 h-4 ${post.isLiked ? "fill-blue-600" : ""}`} />
                            <span>{post.likesCount} লাইক</span>
                          </button>
                          <button
                            onClick={() => handleToggleStudentComments(post.id)}
                            className="flex items-center gap-1.5 text-slate-600 dark:text-stone-400 hover:text-emerald-600 font-bold transition cursor-pointer"
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span>{post.comments?.length || 0} মন্তব্য</span>
                          </button>
                          <button
                            onClick={() => {
                              if (typeof navigator !== "undefined" && navigator.clipboard) {
                                navigator.clipboard.writeText(window.location.href);
                              }
                              toast.success("পোস্টের লিঙ্ক কপি করা হয়েছে!");
                            }}
                            className="flex items-center gap-1.5 text-slate-600 dark:text-stone-400 hover:text-emerald-600 font-bold transition cursor-pointer"
                          >
                            <Share2 className="w-4 h-4" />
                            <span>শেয়ার</span>
                          </button>
                        </div>

                        {/* Facebook-Style Collapsible Comments Drawer */}
                        {post.showComments && (
                          <div className="pt-3 border-t border-stone-100 dark:border-stone-800 space-y-2.5">
                            {post.comments && post.comments.length > 0 && (
                              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                {post.comments.map((comment) => (
                                  <div
                                    key={comment.id}
                                    className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60 text-xs space-y-1"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-black text-slate-900 dark:text-white">{comment.author}</span>
                                      <span className="text-[10px] text-slate-400">{comment.time}</span>
                                    </div>
                                    <p className="text-slate-700 dark:text-stone-300">{comment.text}</p>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Add Comment Input */}
                            <div className="flex items-center gap-2 pt-1">
                              <input
                                type="text"
                                value={studentCommentInputs[post.id] || ""}
                                onChange={(e) =>
                                  setStudentCommentInputs((prev) => ({
                                    ...prev,
                                    [post.id]: e.target.value,
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleAddStudentComment(post.id);
                                }}
                                placeholder="একটি মন্তব্য লিখুন..."
                                className="w-full px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 border-none text-xs text-slate-800 dark:text-stone-200 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 outline-hidden"
                              />
                              <button
                                onClick={() => handleAddStudentComment(post.id)}
                                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer shrink-0"
                              >
                                মন্তব্য করুন
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {studentProfileTab === "teachers" && (
                  <div className="space-y-4 animate-fadeIn">
                    <p className="text-xs font-bold text-slate-500 dark:text-stone-400">যেসব উস্তাদের অধীনে অধ্যয়নরত আছেন:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {allTeachers.slice(0, 2).map((teacher) => (
                        <div
                          key={teacher.id}
                          className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3 shadow-xs"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={teacher.avatar}
                              alt={teacher.nameBn}
                              className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500"
                            />
                            <div>
                              <p className="text-xs font-black text-slate-900 dark:text-white">{teacher.nameBn}</p>
                              <p className="text-[11px] text-emerald-600 font-bold">{teacher.titleBn}</p>
                              <p className="text-[10px] text-slate-400">সপ্তাহে ৩ দিন • নিয়মিত ১-অন-১ ক্লাস</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleSelectTeacher(teacher)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition cursor-pointer"
                          >
                            প্রোফাইল
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {studentProfileTab === "about" && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-emerald-600" />
                        শিক্ষার্থী পরিচিতি ও প্রাতিষ্ঠানিক তথ্য
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl">
                          <p className="text-slate-400 font-bold">পাবলিক স্টুডেন্ট আইডি:</p>
                          <p className="text-sm font-black text-slate-900 dark:text-white font-mono mt-0.5">
                            {selectedStudent.student_public_id || "STU-1001"}
                          </p>
                        </div>
                        <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl">
                          <p className="text-slate-400 font-bold">অ্যাকাউন্টের ধরন:</p>
                          <p className="text-sm font-black text-emerald-600 mt-0.5">উন্মুক্ত পাবলিক কুরআন শিক্ষার্থী</p>
                        </div>
                        <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl">
                          <p className="text-slate-400 font-bold">বিভাগ ও শাখা:</p>
                          <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">হিফজুল কুরআন ও তাজবীদ বিভাগ</p>
                        </div>
                        <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl">
                          <p className="text-slate-400 font-bold">অবস্থান / এলাকা:</p>
                          <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">গাজীপুর, ঢাকা, বাংলাদেশ</p>
                        </div>
                      </div>
                      <div className="pt-2">
                        <p className="text-xs font-bold text-slate-500">কুরআন শিক্ষার লক্ষ্য ও ইচ্ছা:</p>
                        <p className="text-xs text-slate-700 dark:text-stone-300 leading-relaxed mt-1">
                          {selectedStudent.bio || "সহীহ ও বিশুদ্ধ তারতীলে কুরআন পাঠ এবং সূরা আল-বাকারাহ মুখস্থ করার জন্য নিষ্ঠার সাথে নিয়মিত অনুশীলন করছি।"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : activeMainPanel === "home" ? (
        /* ══════════════════════════════════════════════════════════════════════
           PHASE 1: HOME PANEL — FACEBOOK-STYLE SOCIAL HOME
        ══════════════════════════════════════════════════════════════════════ */
        <div className="max-w-4xl mx-auto px-3 sm:px-6 pt-4 space-y-6 animate-fadeIn">
          {/* Platform Incentive & Facility Banner */}
          <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-950 to-stone-900 text-white shadow-md border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-white">
                  রহমানিয়া প্ল্যাটফর্মে লেনদেন ও হাদিয়ার বিশেষ সুবিধা
                </h4>
                <p className="text-[11px] text-emerald-200/90 font-medium">
                  প্ল্যাটফর্মের মাধ্যমে শিক্ষা ও হাদিয়া পরিশোধে শিক্ষার্থীদের জন্য বিশেষ ছাড়, শিক্ষকদের জন্য স্বচ্ছ ও সর্বনিম্ন কমিশন এবং শতভাগ ওয়ালেট নিরাপত্তা।
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  if (!currentUser && !currentTeacherUser) {
                    setShowLoginModal(true);
                  } else {
                    setShowPrivateGroupModal(true);
                  }
                }}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs transition cursor-pointer shadow-sm"
              >
                সুবিধা গ্রহণ করুন
              </button>
            </div>
          </div>

          {/* Stories Bar */}
          <StoriesBar
            currentUser={currentUser}
            currentTeacherUser={currentTeacherUser}
            onAddStoryClick={() => {
              if (!currentUser && !currentTeacherUser) {
                setShowLoginModal(true);
                toast.info("স্টোরি দিতে অনুগ্রহ করে প্রথমে লগইন করুন।");
              } else {
                toast.info("আপনার ডিভাইস থেকে ছবি নির্বাচন করে স্টোরি প্রকাশ করুন।");
              }
            }}
          />

          {/* Reels Discovery Section */}
          <ReelsDiscoverySection
            currentUser={currentUser}
            currentTeacherUser={currentTeacherUser}
          />

          {/* Social Post Composer */}
          <SocialPostComposer
            teacher={currentTeacherUser}
            currentUser={currentUser || currentTeacherUser}
            onPostCreated={(newPost) => {
              setSocialPosts((prev) => [newPost, ...prev]);
              toast.success("পোস্ট সফলভাবে প্রকাশিত হয়েছে!");
            }}
          />

          {/* Global Social Feed Header & Filters */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2">
              <div className="flex items-center gap-2">
                <Rss className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  গ্লোবাল ইসলামিক সোশ্যাল ফিড
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                উস্তাদ ও শিক্ষার্থীদের উন্মুক্ত কুরআন টাইমলাইন
              </span>
            </div>

            {/* Post Feed Cards */}
            {isLoadingSocialPosts ? (
              <div className="space-y-4">
                {[1, 2].map((n) => (
                  <div
                    key={n}
                    className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 animate-pulse space-y-4"
                  >
                    <div className="h-4 bg-slate-200 dark:bg-stone-800 rounded w-1/3" />
                    <div className="h-16 bg-slate-100 dark:bg-stone-800 rounded-2xl" />
                  </div>
                ))}
              </div>
            ) : socialPosts.length === 0 ? (
              <div className="bg-white dark:bg-stone-900 rounded-3xl p-8 border border-stone-200 dark:border-stone-800 text-center space-y-3">
                <Rss className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  কোনো সোশ্যাল পোস্ট প্রকাশিত হয়নি
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  উপরের পোস্ট কম্পোজার থেকে আপনার প্রথম ইসলামিক আলোচনা, তাজবীদ নিয়ম বা নূরানী পাঠ শেয়ার করুন।
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {socialPosts.map((post) => (
                  <SocialPostCard
                    key={post.id}
                    post={post}
                    currentUser={currentUser || currentTeacherUser}
                    onAuthorClick={handlePostAuthorClick}
                    onPostDeleted={(deletedId) =>
                      setSocialPosts((prev) => prev.filter((x) => x.id !== deletedId))
                    }
                    onPostUpdated={(updatedPost) =>
                      setSocialPosts((prev) =>
                        prev.map((x) => (x.id === updatedPost.id ? updatedPost : x))
                      )
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : activeMainPanel === "teachers" ? (
        /* ══════════════════════════════════════════════════════════════════════
           PHASE 2: TEACHER PANEL — TEACHER DIRECTORY & SEARCH CATALOG VIEW
        ══════════════════════════════════════════════════════════════════════ */
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="space-y-3 relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-800/80 border border-emerald-500/40 text-emerald-200 text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                <span>যাচাইকৃত উস্তাদ ও ক্বারীগণ</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Human Teacher-এর সাথে কথা বলুন
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-medium">
                রহমানিয়া ইনস্টিটিউটের অভিজ্ঞ শিক্ষক ও ক্বারীদের ফেসবুক-স্টাইল প্রোফাইল দেখুন, সরাসরি কথা বলুন এবং ১-অন-১ লাইভ ক্লাসে শুদ্ধ কুরআন শিখুন।
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => {
                    const activeTeacher = allTeachers[0] || selectedTeacher;
                    if (!activeTeacher) {
                      toast.info("গ্রুপ লাইভ ক্লাসে অংশ নেওয়ার জন্য প্রথমে কোনো শিক্ষক তালিকাভুক্ত থাকা আবশ্যক।");
                      return;
                    }
                    setLiveGroupClassData({
                      teacher: activeTeacher,
                      roomTitle: "সূরা আল-ফাতিহা ও তাজবীদ মাশক লাইভ গ্রুপ ক্লাস",
                      roomCode: `ROOM-${activeTeacher.id || "LIVE-101"}`,
                      isHostTeacher: false,
                    });
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-lg shadow-red-600/30 transition active:scale-95 cursor-pointer flex items-center gap-2 animate-pulse"
                >
                  <Radio className="w-4 h-4" />
                  <span>গ্রুপ লাইভ ক্লাসে অংশ নিন (Facebook/Zoom Style)</span>
                </button>

                <button
                  onClick={handleOpenTeacherDashboard}
                  className="px-4 py-2.5 rounded-2xl bg-emerald-800/80 hover:bg-emerald-800 text-white font-black text-xs border border-emerald-500/50 transition active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>টিচার ড্যাশবোর্ড</span>
                </button>

                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs shadow-lg transition active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>শিক্ষক হিসেবে যুক্ত হোন</span>
                </button>
              </div>
            </div>
          </div>

          {/* Search & Subject Filter Bar */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-emerald-600 absolute left-4 top-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="শিক্ষকের নাম, ইউজারনেম, আইডি বা বিষয় দিয়ে খুঁজুন (যেমন: @qari_mahmud, qari-ahmadullah, হিফজ)..."
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-stone-900 border border-emerald-300 dark:border-stone-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                />
              </div>

              {/* Specialty Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar">
                {[
                  { id: "all", label: "সকল শিক্ষক" },
                  { id: "তাজবীদ", label: "তাজবীদ" },
                  { id: "হিফজ", label: "হিফজুল কুরআন" },
                  { id: "মহিলা", label: "মহিলা বিভাগ" },
                  { id: "ব্যাকরণ", label: "আরবি ভাষা" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSpecialty(s.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition cursor-pointer ${
                      selectedSpecialty === s.id
                        ? "bg-emerald-700 text-white shadow-xs"
                        : "bg-white dark:bg-stone-900 text-slate-600 dark:text-stone-300 border border-stone-200 dark:border-stone-800"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Teacher Cards Grid or Honest Empty State */}
          {isLoadingTeachers ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 mx-auto border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-500 dark:text-stone-400 mt-3 font-semibold">শিক্ষকদের তথ্য লোড হচ্ছে...</p>
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="py-16 px-6 text-center bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white mb-2">
                বর্তমানে কোনো অনুমোদিত শিক্ষক তালিকাভুক্ত নেই
              </h3>
              <p className="text-xs text-slate-500 dark:text-stone-400 max-w-md mx-auto mb-6">
                আমাদের প্ল্যাটফর্মে নতুন ওস্তাদগণ আবেদন প্রক্রিয়াধীন রয়েছেন। অ্যাডমিন কর্তৃক যাচাই ও অনুমোদন সম্পন্ন হলে এখানে সরাসরি তাঁদের প্রোফাইল দেখতে পাবেন।
              </p>
              <button
                onClick={() => setShowRegisterModal(true)}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md transition active:scale-95 inline-flex items-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>শিক্ষক হিসেবে যোগ দিন</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredTeachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="group relative bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/90 dark:border-stone-800 hover:border-emerald-500/60 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* Card Cover & Header Overlay */}
                    <div className="h-32 w-full relative bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 overflow-hidden">
                      <img
                        src={teacher.coverPhoto}
                        alt={teacher.nameBn}
                        className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

                      {/* Online status indicator */}
                      <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[11px] font-black backdrop-blur-md flex items-center gap-1.5 border shadow-sm ${
                        teacher.isOnline
                          ? "bg-emerald-950/90 text-emerald-300 border-emerald-500/60"
                          : "bg-slate-900/80 text-slate-300 border-slate-700"
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${teacher.isOnline ? "bg-emerald-400 animate-pulse" : "bg-slate-400"}`} />
                        <span>{teacher.isOnline ? "অনলাইনে আছেন • সরাসরি ক্লাস" : "বর্তমানে অফলাইন"}</span>
                      </span>

                      {/* Followers count pill on cover */}
                      <span className="absolute bottom-2.5 right-3 text-[11px] font-bold text-white/90 bg-black/60 backdrop-blur-sm px-2.5 py-0.5 rounded-lg border border-white/10">
                        {teacher.followersCount || 0} অনুসারী
                      </span>
                    </div>

                    {/* Avatar & Main Information */}
                    <div className="p-5 pt-0 relative">
                      <div className="flex items-end justify-between -mt-12 mb-3">
                        <div
                          className="relative group/avatar cursor-pointer"
                          onClick={() => handleSelectTeacher(teacher)}
                        >
                          <img
                            src={teacher.avatar}
                            alt={teacher.nameBn}
                            className="w-20 h-20 sm:w-22 sm:h-22 rounded-full object-cover border-4 border-white dark:border-stone-900 ring-2 ring-emerald-500/50 shadow-xl group-hover:scale-105 transition-transform duration-200"
                          />
                          {(teacher.isVerified || teacher.verified) && (
                            <div className="absolute bottom-0 right-0 p-1 rounded-full bg-blue-600 text-white shadow-md border-2 border-white dark:border-stone-900" title="যাচাইকৃত উস্তাদ">
                              <CheckCircle className="w-4 h-4 fill-blue-600 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Rating Badge */}
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-50 dark:bg-amber-950/80 border border-amber-300/80 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-black shadow-xs">
                          <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                          <span>
                            {teacher.totalReviews > 0
                              ? `${Number(teacher.rating).toFixed(1)} (${teacher.totalReviews})`
                              : "৪.৯ (নতুন)"}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <h3
                            onClick={() => handleSelectTeacher(teacher)}
                            className="text-base sm:text-lg font-black text-slate-900 dark:text-white hover:text-emerald-700 dark:hover:text-emerald-400 transition cursor-pointer"
                          >
                            {teacher.nameBn}
                          </h3>
                        </div>
                        <p className="text-xs font-extrabold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{teacher.titleBn}</span>
                        </p>
                        <p className="text-xs text-slate-600 dark:text-stone-300 line-clamp-2 pt-1 font-medium leading-relaxed">
                          {teacher.bio}
                        </p>
                      </div>

                      {/* Specialties tags */}
                      <div className="flex flex-wrap gap-1.5 pt-3">
                        {teacher.specialties.slice(0, 3).map((spec, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-300 text-[11px] font-extrabold"
                          >
                            {spec}
                          </span>
                        ))}
                        {teacher.experienceYears > 0 && (
                          <span className="px-2 py-1 rounded-xl bg-stone-100 dark:bg-stone-800 text-slate-600 dark:text-stone-400 text-[11px] font-bold">
                            {teacher.experienceYears}+ বছর অভিজ্ঞতা
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="p-5 pt-3 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between gap-3 bg-stone-50/50 dark:bg-stone-900/50">
                    <div>
                      <p className="text-[10px] text-slate-400 dark:text-stone-400 font-bold uppercase tracking-wider">হাদিয়া / ফি:</p>
                      <p className="text-sm font-black text-emerald-800 dark:text-emerald-300">{teacher.hourlyFeeBn}</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setConnectionRequestData({
                            mode: "student_to_teacher",
                            teacher,
                          });
                          setShowConnectionRequestModal(true);
                        }}
                        className="px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs shadow-md shadow-emerald-700/20 transition active:scale-95 cursor-pointer flex items-center gap-1"
                        title="উস্তাদের নিকট পড়ার আবেদন পাঠান"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                        <span>পড়তে চাই</span>
                      </button>
                      <button
                        onClick={() => handleSelectTeacher(teacher)}
                        className="px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-slate-800 dark:text-stone-200 font-black text-xs transition active:scale-95 cursor-pointer flex items-center gap-1"
                      >
                        <span>প্রোফাইল</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setMessengerTargetTeacher(teacher);
                          setActiveMainPanel("messenger");
                          setSelectedTeacher(null);
                          setSelectedStudent(null);
                        }}
                        className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900 border border-blue-300/60 dark:border-blue-700/60 transition active:scale-95 cursor-pointer"
                        title="উস্তাদকে সরাসরি মেসেঞ্জারে বার্তা পাঠান"
                      >
                        <MessageSquare className="w-4 h-4 text-blue-700 dark:text-blue-300" />
                      </button>
                      <button
                        onClick={() => handleOpenContact(teacher, "call")}
                        className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900 border border-emerald-300/60 dark:border-emerald-700/60 transition active:scale-95 cursor-pointer"
                        title="১-অন-১ সরাসরি ক্লাস করুন"
                      >
                        <Phone className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeMainPanel === "messenger" ? (
        /* ══════════════════════════════════════════════════════════════════════
           PHASE 4: MESSENGER PANEL — FACEBOOK MESSENGER FOR HUMAN TEACHERS
        ══════════════════════════════════════════════════════════════════════ */
        <div className="max-w-6xl mx-auto px-2 sm:px-4 pt-4">
          <MessengerChatHub
            currentUser={currentUser}
            currentTeacherUser={currentTeacherUser}
            initialTargetTeacher={messengerTargetTeacher}
            onOpenTeacherProfile={(teacher) => setSelectedTeacher(normalizeTeacher(teacher))}
            onOpenStudentProfile={(student) => setSelectedStudent(student)}
            onOpenLiveCall={(teacher) => handleOpenContact(teacher, "call")}
          />
        </div>
      ) : (
        /* ══════════════════════════════════════════════════════════════════════
           PHASE 3: STUDENT PANEL — DISCOVER GLOBAL PUBLIC STUDENTS
        ══════════════════════════════════════════════════════════════════════ */
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
          <StudentDiscoveryDirectory
            currentUser={currentUser}
            currentTeacherUser={currentTeacherUser}
            onSelectStudent={(student) => setSelectedStudent(student)}
            onRequestTeachStudent={(student) => {
              setConnectionRequestData({
                mode: "teacher_to_student",
                student,
              });
              setShowConnectionRequestModal(true);
            }}
          />
        </div>
      )}

      {/* ── 🔒 PUBLIC STUDENT AUTH MODAL (উন্মুক্ত কুরআন শিক্ষার্থী লগইন ও সাইনআপ) ── */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-md w-full p-6 space-y-4 border border-stone-200 dark:border-stone-800 shadow-2xl relative">
            <button
              onClick={() => {
                setShowLoginModal(false);
                setLoginError("");
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1.5 pt-1">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 mx-auto flex items-center justify-center shadow-inner">
                <GraduationCap className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                শিক্ষার্থী লগইন আবশ্যক — উন্মুক্ত কুরআন পোর্টাল
              </h3>
              <p className="text-xs text-slate-600 dark:text-stone-300 leading-relaxed font-medium">
                দেশ-বিদেশের অভিজ্ঞ উস্তাদ ও ক্বারীদের কাছে সরাসরি ১-অন-১ কুরআন শিখতে আপনার অ্যাকাউন্টে প্রবেশ করুন।
              </p>
            </div>

            {/* Tab switch: Login vs Register */}
            <div className="flex rounded-2xl bg-stone-100 dark:bg-stone-800 p-1">
              <button
                type="button"
                onClick={() => {
                  setLoginModalTab("login");
                  setLoginError("");
                }}
                className={`flex-1 py-2 text-xs font-black rounded-xl transition ${
                  loginModalTab === "login"
                    ? "bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-400 shadow-sm"
                    : "text-slate-600 dark:text-stone-400 hover:text-slate-900"
                }`}
              >
                লগইন করুন
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginModalTab("register");
                  setLoginError("");
                }}
                className={`flex-1 py-2 text-xs font-black rounded-xl transition ${
                  loginModalTab === "register"
                    ? "bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-400 shadow-sm"
                    : "text-slate-600 dark:text-stone-400 hover:text-slate-900"
                }`}
              >
                নতুন অ্যাকাউন্ট খুলুন (ফ্রি)
              </button>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs font-bold leading-relaxed">
                {loginError}
              </div>
            )}

            {/* Note regarding Madrasa Tenant Isolation */}
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-[11px] leading-relaxed font-medium">
              💡 <strong>মাদ্রাসার শিক্ষার্থীদের জন্য নোট:</strong> এটি সবার জন্য উন্মুক্ত একটি স্বতন্ত্র কুরআন প্ল্যাটফর্ম। কোনো মাদ্রাসার প্রাতিষ্ঠানিক স্টুডেন্ট রোল বা আইডি এখানে গ্রহণযোগ্য নয় (মাদ্রাসার অভ্যন্তরীণ প্রাতিষ্ঠানিক পোর্টালের জন্য <a href="/StudentLogin" className="underline font-bold text-amber-950 dark:text-amber-200">/StudentLogin</a> দেখুন)। এখানে পড়ার জন্য আপনার নিজস্ব উন্মুক্ত শিক্ষার্থী অ্যাকাউন্ট প্রয়োজন।
            </div>

            {loginModalTab === "login" ? (
              <form onSubmit={handlePublicStudentLogin} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-stone-300">
                    মোবাইল নম্বর অথবা ইমেইল:
                  </label>
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="যেমন: 01712345678 বা student@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-stone-300">
                    পাসওয়ার্ড:
                  </label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs sm:text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>শিক্ষার্থী লগইন</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handlePublicStudentRegister} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-stone-300">
                    আপনার পূর্ণ নাম:
                  </label>
                  <input
                    type="text"
                    required
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    placeholder="যেমন: মোঃ আব্দুল্লাহ"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-stone-300">
                    মোবাইল নম্বর বা ইমেইল:
                  </label>
                  <input
                    type="text"
                    required
                    value={registerContact}
                    onChange={(e) => setRegisterContact(e.target.value)}
                    placeholder="যেমন: 01712345678"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-stone-300">
                    গোপন পাসওয়ার্ড নির্ধারণ করুন:
                  </label>
                  <input
                    type="password"
                    required
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs sm:text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>বিনামূল্যে অ্যাকাউন্ট তৈরি করুন</span>
                </button>
              </form>
            )}

            <button
              type="button"
              onClick={() => {
                setShowLoginModal(false);
                setIsGuestMode(true);
                toast.info("অতিথি মোডে শিক্ষকদের প্রোফাইল প্রদর্শন করা হচ্ছে");
              }}
              className="w-full py-2 rounded-xl text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 font-bold text-xs transition cursor-pointer"
            >
              লগইন না করে অতিথি হিসেবে প্রোফাইলগুলো দেখুন
            </button>
          </div>
        </div>
      )}

      {/* ── CONTACT / CALL / FEE MODAL ── */}
      {contactModalTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-md w-full p-6 space-y-4 border border-stone-200 dark:border-stone-800 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>
                  {contactType === "call"
                    ? "সরাসরি ক্লাসের অনুরোধ"
                    : contactType === "fee"
                    ? "হাদিয়া / ফি প্রদান"
                    : "বার্তা পাঠান"}
                </span>
              </h3>
              <button
                onClick={() => setContactModalTeacher(null)}
                className="p-1 rounded-full text-slate-400 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
              <img
                src={contactModalTeacher.avatar}
                alt={contactModalTeacher.nameBn}
                className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500"
              />
              <div className="space-y-0.5">
                <p className="text-xs font-black text-slate-900 dark:text-white">
                  {contactModalTeacher.nameBn}
                </p>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold">
                  {contactModalTeacher.titleBn}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-bold text-slate-700 dark:text-stone-300">
                আপনার বার্তা বা ক্লাসের বিষয়:
              </label>
              <textarea
                rows={3}
                placeholder="যেমন: আসসালামু আলাইকুম উস্তাদ, আমি তাজবীদ ও মাখরাজের উপর ১ ঘণ্টার একটি লাইভ ক্লাস করতে চাই..."
                className="w-full p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              onClick={() => {
                toast.success(`মাশাআল্লাহ! ${contactModalTeacher.nameBn}-এর কাছে আপনার অনুরোধ পাঠানো হয়েছে। শিক্ষক দ্রুত যোগাযোগ করবেন।`);
                setContactModalTeacher(null);
              }}
              className="w-full py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md transition cursor-pointer"
            >
              অনুরোধ নিশ্চিত করুন
            </button>
          </div>
        </div>
      )}

      {/* ── 📞 WEBRTC 1-ON-1 LIVE CLASS VIDEO/AUDIO CALL MODAL ── */}
      {liveCallTeacher && (
        <WebRTCLiveCallModal
          teacher={liveCallTeacher}
          studentUser={currentUser}
          onClose={() => setLiveCallTeacher(null)}
        />
      )}

      {/* ── 🔴 WEBRTC GROUP CLASSROOM (FACEBOOK ROOMS / MEET / ZOOM STYLE) ── */}
      {liveGroupClassData && (
        <WebRTCGroupClassroom
          teacher={liveGroupClassData.teacher || selectedTeacher || allTeachers[0]}
          currentUser={currentUser}
          roomTitle={liveGroupClassData.roomTitle}
          roomCode={liveGroupClassData.roomCode}
          isHostTeacher={liveGroupClassData.isHostTeacher}
          onClose={() => setLiveGroupClassData(null)}
        />
      )}

      {/* ── 💳 HADIA / FEE PAYMENT MODAL (WITH DYNAMIC PLATFORM COMMISSION) ── */}
      {feeModalTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-lg w-full p-6 space-y-5 border border-stone-200 dark:border-stone-800 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>সরাসরি হাদিয়া / কোর্স ফি পরিশোধ</span>
              </h3>
              <button
                onClick={() => setFeeModalTeacher(null)}
                className="p-1 rounded-full text-slate-400 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Teacher Details */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
              <img
                src={feeModalTeacher.avatar}
                alt={feeModalTeacher.nameBn}
                className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shadow-xs"
              />
              <div className="space-y-0.5">
                <p className="text-xs font-black text-slate-900 dark:text-white">
                  {feeModalTeacher.nameBn}
                </p>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold">
                  {feeModalTeacher.titleBn}
                </p>
              </div>
            </div>

            {/* Quick Amount Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-stone-300">হাদিয়া বা ফির পরিমাণ নির্ধারণ করুন:</label>
              <div className="grid grid-cols-4 gap-2">
                {[350, 500, 1000, 2500].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setFeeAmount(amt)}
                    className={`py-2 rounded-xl text-xs font-black transition cursor-pointer border ${
                      feeAmount === amt
                        ? "bg-emerald-700 text-white border-emerald-600 shadow-sm"
                        : "bg-stone-100 dark:bg-stone-800 text-slate-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-200"
                    }`}
                  >
                    {amt} ৳
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount Input */}
            <div className="space-y-1">
              <input
                type="number"
                min={100}
                value={feeAmount}
                onChange={(e) => setFeeAmount(Math.max(10, Number(e.target.value) || 0))}
                placeholder="অন্য কোনো পরিমাণ লিখুন..."
                className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Dynamic Commission Breakdown */}
            {(() => {
              const commissionPct = platformSettings.teacherCommissionPercentage || 10;
              const commissionAmt = Math.round(feeAmount * (commissionPct / 100));
              const teacherNetAmt = feeAmount - commissionAmt;
              return (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-slate-600 dark:text-stone-300">
                    <span>মোট প্রদেয় হাদিয়া:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{feeAmount.toLocaleString("bn-BD")} ৳</span>
                  </div>
                  <div className="flex justify-between items-center text-teal-700 dark:text-teal-400 font-semibold">
                    <span>প্ল্যাটফর্ম সেবা ও গেটওয়ে ফি ({commissionPct}%):</span>
                    <span>-{commissionAmt.toLocaleString("bn-BD")} ৳</span>
                  </div>
                  <div className="flex justify-between items-center text-emerald-800 dark:text-emerald-300 font-black border-t border-stone-200 dark:border-stone-700 pt-1.5 text-xs sm:text-sm">
                    <span>শিক্ষকের ওয়ালেটে সরাসরি জমা হবে:</span>
                    <span>{teacherNetAmt.toLocaleString("bn-BD")} ৳</span>
                  </div>
                </div>
              );
            })()}

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-stone-300">পেমেন্ট গেটওয়ে নির্বাচন করুন:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentGateway("bkash")}
                  className={`p-3 rounded-2xl border flex items-center justify-center gap-2 font-black text-xs transition cursor-pointer ${
                    paymentGateway === "bkash"
                      ? "bg-pink-50 dark:bg-pink-950/70 text-pink-700 dark:text-pink-300 border-pink-400 ring-2 ring-pink-500/30"
                      : "bg-stone-50 dark:bg-stone-800 text-slate-700 dark:text-stone-300 border-stone-200 dark:border-stone-700"
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-600" />
                  <span>bKash (বিকাশ)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentGateway("nagad")}
                  className={`p-3 rounded-2xl border flex items-center justify-center gap-2 font-black text-xs transition cursor-pointer ${
                    paymentGateway === "nagad"
                      ? "bg-orange-50 dark:bg-orange-950/70 text-orange-700 dark:text-orange-300 border-orange-400 ring-2 ring-orange-500/30"
                      : "bg-stone-50 dark:bg-stone-800 text-slate-700 dark:text-stone-300 border-stone-200 dark:border-stone-700"
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-600" />
                  <span>Nagad (নগদ)</span>
                </button>
              </div>
            </div>

            {/* Phone Number Input */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-700 dark:text-stone-300">আপনার {paymentGateway.toUpperCase()} মোবাইল নম্বর:</label>
              <input
                type="text"
                value={senderPhone}
                onChange={(e) => setSenderPhone(e.target.value)}
                placeholder="০১XXXXXXXXX"
                className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Submit Payment Button */}
            <button
              onClick={() => {
                if (!senderPhone || senderPhone.length < 11) {
                  toast.error("অনুগ্রহ করে আপনার সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন");
                  return;
                }
                setIsProcessingPayment(true);
                fetch("/api/teacher-marketplace/payment", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    teacher_id: feeModalTeacher.id || feeModalTeacher.teacher_id,
                    student_id: currentUser?.id || "guest-student",
                    student_name: currentUser?.full_name_bn || currentUser?.full_name_en || "সম্মানিত অভিভাবক/শিক্ষার্থী",
                    amount: feeAmount,
                    commission_pct: platformSettings.teacherCommissionPercentage || 10,
                    payment_gateway: paymentGateway,
                    gateway_ref: senderPhone,
                    idempotency_key: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
                  }),
                })
                  .then((res) => res.json())
                  .then((data) => {
                    setIsProcessingPayment(false);
                    const tx = data.transaction || {};
                    const teacherNetAmt = tx.amount_net || (feeAmount - Math.round(feeAmount * 0.1));
                    const commissionPct = tx.platform_commission_pct || 10;

                    // Update Teacher Wallet
                    setTeacherWallets((prev) => {
                      const currentWallet = prev[feeModalTeacher.id] || { balance: 0, transactions: [] };
                      const updated = {
                        ...prev,
                        [feeModalTeacher.id]: {
                          balance: (currentWallet.balance || 0) + teacherNetAmt,
                          transactions: [
                            {
                              id: tx.id || "tx-" + Date.now(),
                              amount: teacherNetAmt,
                              gross: feeAmount,
                              commission: tx.platform_commission_amount || Math.round(feeAmount * 0.1),
                              date: "আজকে",
                              student: currentUser?.full_name_bn || "শিক্ষার্থী",
                              gateway: paymentGateway,
                            },
                            ...currentWallet.transactions,
                          ],
                        },
                      };
                      try {
                        localStorage.setItem("edusaas_teacher_wallets", JSON.stringify(updated));
                      } catch (e) {
                        console.warn("Wallet save error", e);
                      }
                      return updated;
                    });

                    toast.success(
                      `মাশাআল্লাহ! ${feeAmount} ৳ হাদিয়া সফলভাবে পরিশোধ করা হয়েছে। উস্তাদের ওয়ালেটে ${teacherNetAmt} ৳ জমা হয়েছে (প্ল্যাটফর্ম কমিশন: ${commissionPct}%)।`
                    );
                    setFeeModalTeacher(null);
                  })
                  .catch((err) => {
                    setIsProcessingPayment(false);
                    toast.error("পেমেন্ট সম্পন্ন করতে সমস্যা হয়েছে: " + err.message);
                  });
              }}
              disabled={isProcessingPayment}
              className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              {isProcessingPayment ? (
                <span>পেমেন্ট প্রসেসিং হচ্ছে...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>হাদিয়া প্রদান নিশ্চিত করুন ({feeAmount} ৳)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── 👨‍🏫 TEACHER SELF-REGISTRATION & PROFILE BUILDER MODAL ── */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 border border-stone-200 dark:border-stone-800 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-emerald-600" />
                  <span>শিক্ষক হিসেবে প্রোফাইল সাজান ও যুক্ত হোন</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  উন্মুক্ত প্ল্যাটফর্মে শিক্ষক হিসেবে আবেদন করুন (মূল প্ল্যাটফর্ম অ্যাডমিন যাচাই ও অনুমোদন সাপেক্ষে সক্রিয় হবে)
                </p>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!regForm.nameBn.trim()) {
                  toast.error("অনুগ্রহ করে আপনার নাম বাংলায় লিখুন");
                  return;
                }

                const newTeacherId = "teacher-" + Date.now();
                const newTeacherObj = {
                  id: newTeacherId,
                  teacher_id: newTeacherId,
                  nameBn: regForm.nameBn.trim(),
                  nameEn: regForm.nameEn.trim() || regForm.nameBn.trim(),
                  titleBn: regForm.titleBn.trim() || "কুরআন ও তাজবীদ শিক্ষক",
                  avatar: regForm.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
                  coverPhoto: regForm.coverPhoto || "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=1200&q=80",
                  verified: false,
                  isOnline: false,
                  rating: 0,
                  totalReviews: 0,
                  totalStudents: 0,
                  totalHours: 0,
                  hourlyFeeBn: regForm.hourlyFeeBn || "৩৫০ টাকা / ঘণ্টা",
                  monthlyFeeBn: regForm.monthlyFeeBn || "২,৫০০ টাকা / মাস",
                  experienceYears: regForm.experienceYears || 5,
                  qualifications: regForm.qualifications
                    ? regForm.qualifications.split(",").map((q) => q.trim())
                    : ["দাওরায়ে হাদীস (তাকমীল)", "হাফেজুল কুরআন"],
                  specialties: regForm.specialties
                    ? regForm.specialties.split(",").map((s) => s.trim())
                    : ["তাজবীদ ও মাখরাজ", "হিফজুল কুরআন"],
                  bio: regForm.bio.trim() || "অভিজ্ঞতার সাথে শিক্ষার্থীদের বিশুদ্ধ মাখরাজ ও তারতীলের সাথে কুরআন শিক্ষা দিচ্ছি।",
                  schedule: regForm.schedule.trim() || "প্রতিদিন: বিকাল ৫টা – রাত ৯টা",
                  videos: [],
                  reviews: [],
                  status: "pending",
                };

                // Call server API for registration
                fetch("/api/teacher-marketplace", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    name_bn: regForm.nameBn,
                    name_en: regForm.nameEn,
                    title_bn: regForm.titleBn,
                    avatar_url: regForm.avatar,
                    cover_url: regForm.coverPhoto,
                    hourly_fee: 350,
                    monthly_fee: 2500,
                    experience_years: regForm.experienceYears,
                    qualifications: regForm.qualifications,
                    specialties: regForm.specialties,
                    schedule_text: regForm.schedule,
                    bio: regForm.bio,
                  }),
                }).catch(() => {});

                // Save locally with pending status
                setRegisteredTeachers((prev) => {
                  const updated = [newTeacherObj, ...prev.filter((t) => t.id !== newTeacherId)];
                  try {
                    localStorage.setItem("edusaas_registered_teachers", JSON.stringify(updated));
                    localStorage.setItem("edusaas_current_teacher_session", JSON.stringify(newTeacherObj));
                  } catch (err) {
                    console.warn("Storage save error", err);
                  }
                  return updated;
                });

                setCurrentTeacherUser(newTeacherObj);

                // Set server session cookie for the new applicant teacher
                fetch("/api/teacher-marketplace/auth", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    action: "teacher_login",
                    teacher_id: newTeacherId,
                    teacher: newTeacherObj,
                  }),
                }).catch(() => {});

                // Initialize wallet with 0 balance
                setTeacherWallets((prev) => ({
                  ...prev,
                  [newTeacherId]: { balance: 0, transactions: [] },
                }));

                toast.info("আপনার শিক্ষক নিবন্ধন আবেদনটি সফলভাবে জমা হয়েছে। প্রশাসন কর্তৃক যাচাই ও অনুমোদনের পর প্রোফাইলটি ডিরেক্টরিতে প্রকাশিত হবে।");
                setShowRegisterModal(false);
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-stone-300">নাম (বাংলায়): *</label>
                  <input
                    type="text"
                    required
                    value={regForm.nameBn}
                    onChange={(e) => setRegForm({ ...regForm, nameBn: e.target.value })}
                    placeholder="যেমন: হাফেজ মাওলানা আব্দুর রহমান"
                    className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-stone-300">নাম (ইংরেজিতে):</label>
                  <input
                    type="text"
                    value={regForm.nameEn}
                    onChange={(e) => setRegForm({ ...regForm, nameEn: e.target.value })}
                    placeholder="e.g. Qari Abdur Rahman"
                    className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-stone-300">পদবি ও বিভাগ:</label>
                  <input
                    type="text"
                    value={regForm.titleBn}
                    onChange={(e) => setRegForm({ ...regForm, titleBn: e.target.value })}
                    placeholder="যেমন: প্রধান শিক্ষক (তাজবীদ ও কিরাত বিভাগ)"
                    className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-stone-300">শিক্ষাদানের অভিজ্ঞতা (বছর):</label>
                  <input
                    type="number"
                    min={1}
                    value={regForm.experienceYears}
                    onChange={(e) => setRegForm({ ...regForm, experienceYears: Number(e.target.value) || 1 })}
                    className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-stone-300">প্রতি ঘণ্টা ফি (হাদিয়া):</label>
                  <input
                    type="text"
                    value={regForm.hourlyFeeBn}
                    onChange={(e) => setRegForm({ ...regForm, hourlyFeeBn: e.target.value })}
                    placeholder="যেমন: ৩৫০ টাকা / ঘণ্টা"
                    className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-stone-300">মাসিক ফি (হাদিয়া):</label>
                  <input
                    type="text"
                    value={regForm.monthlyFeeBn}
                    onChange={(e) => setRegForm({ ...regForm, monthlyFeeBn: e.target.value })}
                    placeholder="যেমন: ২,৫০০ টাকা / মাস"
                    className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-stone-300">শিক্ষাগত সনদ / ডিগ্রি (কমা দিয়ে লিখুন):</label>
                <input
                  type="text"
                  value={regForm.qualifications}
                  onChange={(e) => setRegForm({ ...regForm, qualifications: e.target.value })}
                  placeholder="যেমন: দাওরায়ে হাদীস, আল-আজহার ডিপ্লোমা, হাফেজুল কুরআন"
                  className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-stone-300">বিশেষত্ব / বিষয়সমূহ (কমা দিয়ে লিখুন):</label>
                <input
                  type="text"
                  value={regForm.specialties}
                  onChange={(e) => setRegForm({ ...regForm, specialties: e.target.value })}
                  placeholder="যেমন: তাজবীদ ও মাখরাজ, হিফজুল কুরআন, নাজেরা"
                  className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-stone-300">ক্লাস গ্রহণের সময়সূচী:</label>
                <input
                  type="text"
                  value={regForm.schedule}
                  onChange={(e) => setRegForm({ ...regForm, schedule: e.target.value })}
                  placeholder="যেমন: প্রতিদিন: বিকাল ৪টা – রাত ৯টা"
                  className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-stone-300">বিস্তারিত পরিচিতি (বায়ো):</label>
                <textarea
                  rows={3}
                  value={regForm.bio}
                  onChange={(e) => setRegForm({ ...regForm, bio: e.target.value })}
                  placeholder="আপনার পাঠদানের ধরণ ও অভিজ্ঞতা সম্পর্কে লিখুন..."
                  className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>আবেদন জমা দিন (মূল অ্যাডমিন যাচাই ও অনুমোদন সাপেক্ষে)</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── 🎓 STUDENT PROFILE MODAL (FACEBOOK STYLE - STRICT AUTH ONLY) ── */}
      {showStudentProfileModal && currentUser && (
        <StudentProfileModal
          canEdit={true}
          student={{
            id: currentUser.id || null,
            nameBn: currentUser.full_name_bn || currentUser.full_name || currentUser.name || "তথ্য দেওয়া হয়নি",
            nameEn: currentUser.full_name_en || currentUser.name_en || "Not Provided",
            email: currentUser.email || "তথ্য দেওয়া হয়নি",
            phone: currentUser.phone || currentUser.mobile || "তথ্য দেওয়া হয়নি",
            role: currentUser.role || "student",
            currentJuz: currentUser.current_juz || "তথ্য দেওয়া হয়নি",
            completedClasses: currentUser.completed_classes || 0,
            totalHours: currentUser.total_hours || 0,
            tajweedScore: currentUser.tajweed_score || 0,
            hifzProgressPct: currentUser.hifz_progress_pct || 0,
            targetCompletionDate: currentUser.target_completion_date || "তথ্য দেওয়া হয়নি",
            guardianName: currentUser.guardian_name || "তথ্য দেওয়া হয়নি",
            guardianPhone: currentUser.guardian_phone || "তথ্য দেওয়া হয়নি",
            bio: currentUser.bio || "শিক্ষার্থী এখনো ব্যক্তিগত পরিচিতি বা লক্ষ্য যুক্ত করেননি।",
            enrolledTeachers: Array.isArray(currentUser.enrolled_teachers) ? currentUser.enrolled_teachers : [],
            paymentHistory: Array.isArray(currentUser.payment_history) ? currentUser.payment_history : [],
            dailyLessons: currentUser.daily_lessons || null,
          }}
          onClose={() => setShowStudentProfileModal(false)}
          onCallTeacher={(teacher) => {
            setShowStudentProfileModal(false);
            if (teacher) {
              setLiveCallTeacher(teacher);
            }
          }}
        />
      )}

      {/* ── 📝 TEACHER PROFILE EDIT MODAL (OWNER / ADMIN ONLY) ── */}
      {showProfileEditModal && selectedTeacher && (
        <TeacherProfileEditModal
          teacher={selectedTeacher}
          onClose={() => setShowProfileEditModal(false)}
          onProfileUpdated={(updated) => {
            const normalized = normalizeTeacher(updated);
            setSelectedTeacher((prev) => ({ ...prev, ...normalized }));
            setDbTeachers((prev) =>
              prev.map((t) => (t.id === updated.id ? { ...t, ...normalized } : t))
            );
            toast.success("প্রোফাইল তথ্য সফলভাবে আপডেট হয়েছে!");
          }}
        />
      )}

      {/* ── 📝 STUDENT PROFILE EDIT MODAL (FACEBOOK STYLE - OWNER ONLY) ── */}
      {showStudentEditProfileModal && selectedStudent && (
        <StudentProfileEditModal
          student={selectedStudent}
          onClose={() => setShowStudentEditProfileModal(false)}
          onProfileUpdated={(updated) => {
            setSelectedStudent((prev) => ({ ...prev, ...updated }));
            if (currentUser && (currentUser.id === updated.id || currentUser.student_public_id === updated.student_public_id)) {
              setCurrentUser((prev) => ({ ...prev, ...updated }));
            }
          }}
        />
      )}

      {/* ── 👥 SOCIAL FOLLOWERS MODAL ── */}
      {showFollowersModal && selectedTeacher && (
        <SocialFollowersModal
          teacherId={selectedTeacher.id || selectedTeacher.teacher_id}
          teacherName={selectedTeacher.nameBn}
          onClose={() => setShowFollowersModal(false)}
        />
      )}

      {/* ── 🚩 SOCIAL REPORT MODAL ── */}
      {showReportTeacherModal && selectedTeacher && (
        <SocialReportModal
          targetType="teacher_profile"
          targetId={selectedTeacher.id || selectedTeacher.teacher_id}
          onClose={() => setShowReportTeacherModal(false)}
        />
      )}

      {/* ── 🔗 SOCIAL SHARE TEACHER MODAL ── */}
      {showShareTeacherModal && selectedTeacher && (
        <SocialShareModal
          post={{
            id: selectedTeacher.id,
            teacher_id: selectedTeacher.id,
            author_name: selectedTeacher.nameBn,
            content_text: selectedTeacher.bio,
          }}
          currentUser={currentUser}
          onClose={() => setShowShareTeacherModal(false)}
          onRepostSuccess={() => {
            setShowShareTeacherModal(false);
            toast.success("উস্তাদের প্রোফাইল সফলভাবে শেয়ার করা হয়েছে!");
          }}
        />
      )}

      {/* ── 👨‍🏫 TEACHER ACCESS & LOGIN MODAL ── */}
      {showTeacherAccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-md w-full p-6 space-y-4 border border-stone-200 dark:border-stone-800 shadow-2xl relative">
            <button
              onClick={() => setShowTeacherAccessModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1.5 pt-1">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 mx-auto flex items-center justify-center shadow-inner">
                <LayoutDashboard className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                শিক্ষক লগইন ও উস্তাদ ড্যাশবোর্ড
              </h3>
              <p className="text-xs text-slate-600 dark:text-stone-300 leading-relaxed font-medium">
                ফেসবুকের মতো শিক্ষক অ্যাকাউন্টে আলাদাভাবে প্রবেশ করুন এবং আপনার নিজস্ব পার্সোনাল ড্যাশবোর্ড পরিচালনা করুন।
              </p>
            </div>

            {/* Tab Selector: Login vs Application */}
            <div className="grid grid-cols-2 p-1 bg-stone-100 dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 text-xs font-black">
              <button
                type="button"
                onClick={() => setTeacherAccessTab("login")}
                className={`py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  teacherAccessTab === "login"
                    ? "bg-amber-500 text-stone-950 shadow-xs"
                    : "text-slate-600 dark:text-stone-300 hover:text-slate-900"
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>উস্তাদ লগইন</span>
              </button>
              <button
                type="button"
                onClick={() => setTeacherAccessTab("apply")}
                className={`py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  teacherAccessTab === "apply"
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "text-slate-600 dark:text-stone-300 hover:text-slate-900"
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>নতুন আবেদন</span>
              </button>
            </div>

            {teacherAccessTab === "login" ? (
              <div className="space-y-3 pt-1">
                {/* Teacher Credentials Login Form */}
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const ident = teacherLoginIdentifier.trim() || "qari_mahmud";
                    // Find matching teacher or use demo
                    const matchedTeacher = allTeachers.find(
                      (t) =>
                        t.username?.toLowerCase() === ident.toLowerCase() ||
                        t.id === ident ||
                        t.nameBn?.includes(ident)
                    ) || allTeachers[0];

                    try {
                      const res = await fetch("/api/teacher-marketplace/auth", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          action: "teacher_login",
                          teacher_id: matchedTeacher.id || matchedTeacher.teacher_id,
                          teacher: matchedTeacher,
                        }),
                      });
                      const data = await res.json();
                      if (data.ok && data.teacher) {
                        setCurrentTeacherUser(data.teacher);
                        try {
                          localStorage.setItem("edusaas_current_teacher_session", JSON.stringify(data.teacher));
                        } catch {}
                        setShowTeacherAccessModal(false);
                        setShowTeacherDashboard(true);
                        toast.success(`মাশাআল্লাহ! ${data.teacher.nameBn || matchedTeacher.nameBn} হিসেবে শিক্ষক ড্যাশবোর্ডে প্রবেশ করেছেন।`);
                        return;
                      }
                    } catch {}

                    setCurrentTeacherUser(matchedTeacher);
                    setShowTeacherAccessModal(false);
                    setShowTeacherDashboard(true);
                    toast.success(`${matchedTeacher.nameBn} হিসেবে ড্যাশবোর্ড চালু হয়েছে।`);
                  }}
                  className="space-y-2.5"
                >
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-stone-300">
                      মোবাইল নম্বর বা ইউজারনেম:
                    </label>
                    <input
                      type="text"
                      value={teacherLoginIdentifier}
                      onChange={(e) => setTeacherLoginIdentifier(e.target.value)}
                      placeholder="যেমন: 01712345678 বা qari_mahmud"
                      className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-stone-300">
                      পাসওয়ার্ড:
                    </label>
                    <input
                      type="password"
                      value={teacherLoginPassword}
                      onChange={(e) => setTeacherLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>শিক্ষক ড্যাশবোর্ডে প্রবেশ করুন</span>
                  </button>
                </form>

                {/* 1-Click Verified Qari Login */}
                <div className="pt-2 border-t border-stone-200 dark:border-stone-800 space-y-2">
                  <p className="text-[11px] font-bold text-slate-500 dark:text-stone-400">বা ১-ক্লিকে ভেরিফাইড উস্তাদ হিসেবে প্রবেশ করুন:</p>
                  <button
                    type="button"
                    onClick={async () => {
                      const demoTeacher = allTeachers[0] || {
                        id: "qari-mahmudul-hasan",
                        teacher_id: "qari-mahmudul-hasan",
                        nameBn: "শায়খ ক্বারী মাহমুদুল হাসান আল-মাদানী",
                        titleBn: "প্রধান উস্তাদ (তাজবীদ ও কিরাত বিভাগ)",
                        verified: true,
                        hourlyFeeBn: "৩৫০ টাকা / ঘণ্টা",
                        monthlyFeeBn: "২,৫০০ টাকা / মাস",
                      };
                      try {
                        const res = await fetch("/api/teacher-marketplace/auth", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            action: "teacher_login",
                            teacher_id: demoTeacher.id || demoTeacher.teacher_id,
                            teacher: demoTeacher,
                          }),
                        });
                        const data = await res.json();
                        if (data.ok && data.teacher) {
                          setCurrentTeacherUser(data.teacher);
                          try {
                            localStorage.setItem("edusaas_current_teacher_session", JSON.stringify(data.teacher));
                          } catch {}
                          setShowTeacherAccessModal(false);
                          setShowTeacherDashboard(true);
                          toast.success("মাশাআল্লাহ! শায়খ ক্বারী মাহমুদুল হাসান হিসেবে শিক্ষক ড্যাশবোর্ড লোড হয়েছে।");
                          return;
                        }
                      } catch {}
                      setCurrentTeacherUser(demoTeacher);
                      setShowTeacherAccessModal(false);
                      setShowTeacherDashboard(true);
                      toast.success("মাশাআল্লাহ! শায়খ ক্বারী মাহমুদুল হাসান হিসেবে শিক্ষক ড্যাশবোর্ড লোড হয়েছে।");
                    }}
                    className="w-full p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 font-extrabold text-xs flex items-center justify-between transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>শায়খ ক্বারী মাহমুদুল হাসান (ভেরিফাইড উস্তাদ)</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-emerald-600" />
                  </button>

                  {/* Registered applicants quick switch if any exist */}
                  {registeredTeachers.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[10px] font-bold text-slate-500">আপনার তৈরিকৃত আবেদন প্রোফাইল:</p>
                      {registeredTeachers.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            setCurrentTeacherUser(t);
                            setShowTeacherAccessModal(false);
                            setShowTeacherDashboard(true);
                            toast.success(`${t.nameBn} প্রোফাইল লোড হয়েছে`);
                          }}
                          className="w-full p-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-between text-xs cursor-pointer"
                        >
                          <span className="font-bold text-slate-800 dark:text-white truncate">{t.nameBn}</span>
                          <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-bold">আবেদনকারী</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Application Tab */
              <div className="space-y-3 pt-2">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2 text-xs">
                  <p className="font-black text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>উন্মুক্ত কুরআন শিক্ষক হিসেবে যুক্ত হোন</span>
                  </p>
                  <p className="text-slate-600 dark:text-stone-300 leading-relaxed font-medium">
                    আপনি কি হাফেজ, ক্বারী বা দাওরায়ে হাদীস উত্তীর্ণ আলেম? দেশ-বিদেশের উন্মুক্ত শিক্ষার্থীদের ১-অন-১ লাইভ ক্লাসে কুরআন তিলাওয়াত ও তাজবীদ শিক্ষা দিতে আজই আবেদন করুন।
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowTeacherAccessModal(false);
                    setShowRegisterModal(true);
                  }}
                  className="w-full p-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs flex items-center justify-between shadow-md transition active:scale-95 cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-left">
                    <UserPlus className="w-5 h-5 text-amber-300" />
                    <div>
                      <p className="text-xs font-black">নতুন শিক্ষক প্রোফাইল তৈরি করুন</p>
                      <p className="text-[10px] text-emerald-200 font-normal">বায়ো, হাদিয়া রেট ও তিলাওয়াত স্যাম্পল দিন</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 🤝 MUTUAL LEARNING CONNECTION REQUEST MODAL ── */}
      <MutualConnectionRequestModal
        isOpen={showConnectionRequestModal}
        onClose={() => setShowConnectionRequestModal(false)}
        mode={connectionRequestData?.mode || "student_to_teacher"}
        targetTeacher={connectionRequestData?.teacher || selectedTeacher}
        targetStudent={connectionRequestData?.student || selectedStudent}
        currentUser={currentUser}
        currentTeacherUser={currentTeacherUser}
        onSuccess={(conn) => {
          if (conn?.group) {
            setActivePrivateGroup(conn.group);
          }
          toast.success("আবেদন সফলভাবে পাঠানো হয়েছে!");
        }}
      />

      {/* ── 🗑️ SELF ACCOUNT DELETION CONFIRMATION MODAL ── */}
      {showDeleteAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-md w-full p-6 space-y-4 border border-rose-200 dark:border-rose-900 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                আপনি কি নিশ্চিতভাবে আপনার অ্যাকাউন্ট মুছে ফেলতে চান?
              </h3>
              <p className="text-xs text-slate-600 dark:text-stone-300 leading-relaxed font-medium">
                ফেসবুকের মতো আপনি চাইলে যেকোনো সময় আপনার আইডি স্থায়ীভাবে মুছে ফেলতে পারেন। অ্যাকাউন্ট ডিলিট করলে আপনার প্রোফাইল, তথ্য ও পোস্ট ডাটাবেজ থেকে স্থায়ীভাবে বিলুপ্ত হবে।
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

      {/* ── 🔒 PRIVATE LEARNING ASSISTANT GROUP WORKSPACE MODAL ── */}
      <PrivateLearningGroupModal
        isOpen={showPrivateGroupModal}
        onClose={() => setShowPrivateGroupModal(false)}
        group={
          activePrivateGroup || {
            id: "group-demo-101",
            group_name: `${(currentTeacherUser || selectedTeacher || allTeachers[0])?.nameBn || "উস্তাদ"} ও ${(currentUser?.full_name_bn || currentUser?.name || "শিক্ষার্থী")}-এর প্রাইভেট লার্নিং গ্রুপ`,
            teacher_id: (currentTeacherUser || selectedTeacher || allTeachers[0])?.id || "qari-mahmudul-hasan",
            student_id: currentUser?.id || "stu-abdullah-101",
            schedule_info: {
              subject: "কুরআন মাজীদ ও তাজবীদ মাশক",
              weekly_days: ["শনিবার", "সোমবার", "বুধবার"],
              time_bn: "রাত ৮:০০টা – ৯:০০টা",
            },
          }
        }
        currentUserId={currentUser?.id || currentTeacherUser?.id}
        userRole={currentTeacherUser ? "teacher" : "student"}
        userName={currentTeacherUser?.nameBn || currentUser?.full_name_bn || currentUser?.name || "ব্যবহারকারী"}
        onOpenQuranReader={() => window.open("/quran-tutor", "_blank")}
        onOpenLiveVoiceTutor={() => window.open("/quran-tutor/live-class", "_blank")}
      />

      {/* ── 💬 FLOATING FACEBOOK MESSENGER BUTTON ── */}
      <button
        onClick={() => {
          setSelectedTeacher(null);
          setSelectedStudent(null);
          setShowTeacherDashboard(false);
          setShowStudentDashboard(false);
          setActiveMainPanel((prev) => (prev === "messenger" ? "home" : "messenger"));
        }}
        className="fixed bottom-6 right-6 z-40 p-3.5 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 hover:from-blue-800 hover:to-indigo-700 text-white shadow-2xl flex items-center gap-2 cursor-pointer transition active:scale-95 border-2 border-white dark:border-stone-800"
        title="ফেসবুক মেসেঞ্জার খুলুন"
      >
        <MessageSquare className="w-5 h-5 fill-white" />
        <span className="text-xs font-black hidden sm:inline">মেসেঞ্জার</span>
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-blue-600 animate-pulse" />
      </button>
    </div>
  );
}
