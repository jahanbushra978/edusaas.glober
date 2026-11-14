import { bnX, enX } from "./i18n.extra";

export type Lang = "bn" | "en";

const enBase = {
  home: "Home", months: "Months", members: "Members", account: "My account",
  system: "System", light: "Normal", night: "Night", logout: "Sign out",
  loading: "Loading…", retry: "Try again", empty: "Nothing here yet", error: "Something went wrong",
  signIn: "Sign in", createAccount: "Create account", mosque: "Mosque", chooseMosque: "Choose your mosque",
  fullName: "Full name", loginId: "Your ID", password: "Password", passwordHint: "At least 8 characters",
  haveAccount: "Already have an account?", noAccount: "New here?",
  pendingTitle: "Waiting for verification", pendingBody: "Your account is created. A committee member will verify you soon. After that you can see your account here.",
  assalamu: "Assalamu Alaikum", available: "Available balance (verified)", income: "Total income", expense: "Total expense",
  pendingApproval: "Pending approval", funds: "Funds", restricted: "Restricted", thisMonth: "This month",
  trend: "Last 6 months", myAccount: "My account", youOwe: "You owe", youPaid: "You paid", of: "of",
  collected: "Collected", remaining: "Remaining", expected: "Expected", paidMembers: "members paid",
  year: "Year", all: "All", paid: "Paid", partial: "Partial", unpaid: "Unpaid",
  restrictedList: "The mosque keeps the list of contributors private. Only totals are shown.",
  pledge: "Monthly Infaq", due: "Due", status: "Status", receipt: "Receipt", method: "Method",
  recordPayment: "Record Infaq", month: "Month", amount: "Amount", save: "Save Infaq", saved: "Infaq saved",
  memberSettings: "Manage member", verify: "Verify member", suspend: "Suspend", reactivate: "Reactivate",
  savePledge: "Save Infaq rate", updated: "Updated", search: "Search by name", noPayments: "No Infaq for this month",
  CASH: "Cash", BKASH: "bKash", NAGAD: "Nagad", BANK: "Bank", PENDING: "Pending", ACTIVE: "Active", SUSPENDED: "Suspended",
  PAID: "Paid", PARTIAL: "Partial", UNPAID: "Unpaid",
  INVALID_CREDENTIALS: "ID, password or mosque is wrong", LOGIN_ID_TAKEN: "This ID is already taken",
  MOSQUE_NOT_FOUND: "Mosque not found", TOO_MANY_REQUESTS: "Too many attempts. Please wait a few minutes.",
  INVALID_INPUT: "Please check the form", FORBIDDEN: "You don't have permission", SERVER_ERROR: "Server error. Try again.",
  UNAUTHENTICATED: "Please sign in", INVALID_PERIOD: "This month is not allowed", NOT_FOUND: "Not found",
};

const bnBase: typeof enBase = {
  home: "হোম", months: "মাস", members: "সদস্য", account: "আমার হিসাব",
  system: "সিস্টেম", light: "নরমাল", night: "নাইট", logout: "লগআউট",
  loading: "লোড হচ্ছে…", retry: "আবার চেষ্টা করুন", empty: "এখনো কিছু নেই", error: "কিছু একটা ভুল হয়েছে",
  signIn: "লগইন", createAccount: "অ্যাকাউন্ট খুলুন", mosque: "মসজিদ", chooseMosque: "আপনার মসজিদ বেছে নিন",
  fullName: "পুরো নাম", loginId: "আপনার আইডি", password: "পাসওয়ার্ড", passwordHint: "কমপক্ষে ৮ অক্ষর",
  haveAccount: "আগে থেকেই অ্যাকাউন্ট আছে?", noAccount: "নতুন সদস্য?",
  pendingTitle: "যাচাইয়ের অপেক্ষায়", pendingBody: "আপনার অ্যাকাউন্ট খোলা হয়েছে। কমিটির একজন সদস্য শীঘ্রই যাচাই করবেন। তারপর এখানে আপনার হিসাব দেখতে পারবেন।",
  assalamu: "আসসালামু আলাইকুম", available: "উপলব্ধ ব্যালেন্স (যাচাইকৃত)", income: "মোট আয়", expense: "মোট ব্যয়",
  pendingApproval: "অনুমোদনের অপেক্ষায়", funds: "ফান্ডসমূহ", restricted: "সংরক্ষিত", thisMonth: "এই মাস",
  trend: "গত ৬ মাস", myAccount: "আমার হিসাব", youOwe: "আপনার বাকি", youPaid: "আপনি দিয়েছেন", of: "মধ্যে",
  collected: "আদায়", remaining: "বাকি", expected: "প্রত্যাশিত", paidMembers: "জন দিয়েছেন",
  year: "বছর", all: "সব", paid: "দিয়েছেন", partial: "আংশিক", unpaid: "বাকি",
  restrictedList: "মসজিদ কমিটি দাতাদের তালিকা গোপন রেখেছে। শুধু মোট হিসাব দেখানো হচ্ছে।",
  pledge: "মাসিক ইনফাক", due: "প্রাপ্য", status: "অবস্থা", receipt: "রসিদ", method: "মাধ্যম",
  recordPayment: "ইনফাক জমা নিন", month: "মাস", amount: "পরিমাণ", save: "ইনফাক সংরক্ষণ", saved: "ইনফাক সংরক্ষিত হয়েছে",
  memberSettings: "সদস্য ব্যবস্থাপনা", verify: "সদস্য যাচাই করুন", suspend: "স্থগিত করুন", reactivate: "আবার চালু করুন",
  savePledge: "ইনফাকের অঙ্ক সংরক্ষণ", updated: "হালনাগাদ হয়েছে", search: "নাম দিয়ে খুঁজুন", noPayments: "এই মাসে কোনো ইনফাক জমা নেই",
  CASH: "নগদ", BKASH: "বিকাশ", NAGAD: "নগদ (অ্যাপ)", BANK: "ব্যাংক", PENDING: "অপেক্ষমাণ", ACTIVE: "সক্রিয়", SUSPENDED: "স্থগিত",
  PAID: "দিয়েছেন", PARTIAL: "আংশিক", UNPAID: "বাকি",
  INVALID_CREDENTIALS: "আইডি, পাসওয়ার্ড বা মসজিদ ভুল", LOGIN_ID_TAKEN: "এই আইডি আগেই নেওয়া হয়েছে",
  MOSQUE_NOT_FOUND: "মসজিদ পাওয়া যায়নি", TOO_MANY_REQUESTS: "অনেকবার চেষ্টা হয়েছে। কিছুক্ষণ অপেক্ষা করুন।",
  INVALID_INPUT: "ফর্মটি আবার দেখুন", FORBIDDEN: "আপনার অনুমতি নেই", SERVER_ERROR: "সার্ভারে সমস্যা। আবার চেষ্টা করুন।",
  UNAUTHENTICATED: "অনুগ্রহ করে লগইন করুন", INVALID_PERIOD: "এই মাস অনুমোদিত নয়", NOT_FOUND: "পাওয়া যায়নি",
};

const en = { ...enBase, ...enX };
const bn: typeof en = { ...bnBase, ...bnX };

export type Key = keyof typeof en;
export const DICT: Record<Lang, typeof en> = { en, bn };
