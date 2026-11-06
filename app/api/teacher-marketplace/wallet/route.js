import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/auth-identity";
import { verifySessionToken } from "@/lib/auth-session";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Strict allowlist of transaction types that represent student-paid teacher earnings
const QUALIFYING_CREDIT_TYPES = Object.freeze(["hadia_payment", "monthly_fee"]);
const ALLOWED_GATEWAYS = Object.freeze(["bkash", "nagad", "sslcommerz", "upay"]);

/**
 * Validates whether a transaction possesses authoritative server-side gateway verification evidence
 */
export function isAuthoritativeGatewayEvidence(tx, trustedMerchantId) {
  if (!tx) return false;

  const status = String(tx.status || "").trim().toLowerCase();
  if (status !== "completed") return false;

  const type = String(tx.transaction_type || "").trim();
  if (!QUALIFYING_CREDIT_TYPES.includes(type)) return false;

  // Gateway reference must be present, non-empty, and at least 6 characters
  const ref = typeof tx.gateway_ref === "string" ? tx.gateway_ref.trim() : "";
  if (!ref || ref.length < 6) return false;

  // Reject simulated/mock references
  if (/^(TRX-SIM|SIM-|DEMO-|TEST-|tx-sim-)/i.test(ref)) return false;

  // Gateway provider must be in allowlist
  const gateway = String(tx.payment_gateway || "").trim().toLowerCase();
  if (!ALLOWED_GATEWAYS.includes(gateway)) return false;

  // Merchant Account ID must be non-empty string
  const merchantId = typeof tx.merchant_account_id === "string" ? tx.merchant_account_id.trim() : "";
  if (!merchantId) return false;

  // If trustedMerchantId is specified, merchant_account_id must strictly match
  if (trustedMerchantId && merchantId !== trustedMerchantId) {
    return false;
  }

  return true;
}

/**
 * Mask student identifier for teacher-facing privacy
 */
function maskStudentContact(str) {
  if (!str) return "গোপনীয় শিক্ষার্থী";
  const s = String(str).trim();
  if (/^\+?\d{8,}$/.test(s)) {
    return s.slice(0, 4) + "****" + s.slice(-3);
  }
  return s;
}

/**
 * Authenticated Teacher Wallet API
 * 
 * 5-Point Security Gate & Zero Trust Invariants:
 * 1. Cryptographically verified server session.
 * 2. Strict role authorization: teachers access only their own wallet; admins access with explicit audit.
 * 3. Anti-IDOR: teacher can NEVER query another teacher's wallet.
 * 4. Public directory API never exposes wallet data.
 * 5. Lifetime earnings calculated server-side from 100% of transactions (never truncated client slice).
 * 6. Strict allowlist validation of transaction types and authoritative gateway reference proof.
 * 7. Bidirectional reconciliation: handles both recorded > verified and verified > recorded.
 * 8. Explicit error handling: never silently returns zero balances on database query failures.
 */
export async function GET(req) {
  try {
    // 1. Mandatory Server-Side Session Verification
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);

    if (!session || (!session.authUserId && !session.profileId && !session.id)) {
      return NextResponse.json(
        { 
          ok: false, 
          error: "অননুমোদিত অ্যাক্সেস। ওয়ালেট ও আয় দেখতে অনুগ্রহ করে উস্তাদ একাউন্টে লগইন করুন।",
          code: "UNAUTHORIZED_GUEST"
        },
        { status: 401 }
      );
    }

    const userRole = session.role;
    const isPlatformAdmin = userRole === "admin" || userRole === "platform_owner";
    const isTeacher = userRole === "teacher" || isPlatformAdmin;

    if (!isTeacher) {
      return NextResponse.json(
        { 
          ok: false, 
          error: "শুধুমাত্র অনুমোদিত শিক্ষক ও অ্যাডমিনগণ ওয়ালেট হিসাব দেখতে পারেন।",
          code: "FORBIDDEN_ROLE"
        },
        { status: 403 }
      );
    }

    const adminClient = createSupabaseAdminClient();
    const { searchParams } = new URL(req.url);
    const requestedTeacherId = searchParams.get("teacher_id");

    // 2. Resolve Authoritative Canonical Teacher ID
    let targetTeacherId = null;

    if (isPlatformAdmin && requestedTeacherId) {
      // Platform Admins may audit a specific requested teacher's wallet
      targetTeacherId = requestedTeacherId;
    } else {
      // Teachers are strictly bound to their own verified identity (Anti-IDOR)
      const sessionUserId = session.authUserId || session.id;
      const sessionProfileId = session.profileId || session.teacher_id;

      // Look up teacher profile mapped to this user session
      const { data: profile } = await adminClient
        .from("teacher_marketplace_profiles")
        .select("teacher_id")
        .or(`user_id.eq.${sessionUserId},teacher_id.eq.${sessionProfileId || sessionUserId}`)
        .maybeSingle();

      targetTeacherId = profile?.teacher_id || sessionProfileId || sessionUserId;

      // If a non-admin attempts to request someone else's teacher ID, reject immediately
      if (requestedTeacherId && requestedTeacherId !== targetTeacherId) {
        return NextResponse.json(
          { 
            ok: false, 
            error: "নিরাপত্তা লঙ্ঘন: অন্য শিক্ষকের ওয়ালেট তথ্য অ্যাক্সেস করা সম্পূর্ণ নিষিদ্ধ।",
            code: "FORBIDDEN_CROSS_TEACHER_ACCESS"
          },
          { status: 403 }
        );
      }
    }

    if (!targetTeacherId) {
      return NextResponse.json(
        { 
          ok: false, 
          error: "শিক্ষক প্রোফাইল পাওয়া যায়নি।",
          code: "TEACHER_PROFILE_NOT_FOUND" 
        },
        { status: 404 }
      );
    }

    // 3. Fetch Authoritative Wallet Row from Database
    const { data: wallet, error: walletError } = await adminClient
      .from("teacher_wallets")
      .select("teacher_id, balance, total_earned, total_withdrawn, currency, is_withdrawal_held, hold_reason, reconciliation_required, updated_at")
      .eq("teacher_id", targetTeacherId)
      .maybeSingle();

    if (walletError) {
      return NextResponse.json(
        { 
          ok: false, 
          error: "ওয়ালেট ডাটা লোড করতে ব্যর্থ হয়েছে।", 
          code: "WALLET_QUERY_FAILED",
          details: walletError.message 
        },
        { status: 500 }
      );
    }

    // 4. Fetch COMPLETE Lifetime Transaction Ledger using Iterative Pagination
    // Guarantees no silent truncation from Supabase 1,000-row limit
    const PAGE_SIZE = 1000;
    const allTransactions = [];
    let from = 0;
    let isCompleteLedger = false;
    let hasMore = true;

    while (hasMore) {
      const to = from + PAGE_SIZE - 1;
      const { data: pageData, error: pageError } = await adminClient
        .from("teacher_wallet_transactions")
        .select("id, transaction_type, amount_gross, platform_commission_amount, amount_net, payment_gateway, gateway_ref, merchant_account_id, status, created_at, student_name")
        .eq("teacher_id", targetTeacherId)
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .range(from, to);

      if (pageError) {
        return NextResponse.json(
          { 
            ok: false, 
            error: "লেনদেনের লেজার লোড করতে ব্যর্থ হয়েছে।", 
            code: "TRANSACTIONS_QUERY_FAILED",
            details: pageError.message,
            is_complete_ledger: false,
          },
          { status: 500 }
        );
      }

      const rows = pageData || [];
      allTransactions.push(...rows);

      if (rows.length < PAGE_SIZE) {
        hasMore = false;
        isCompleteLedger = true;
      } else {
        from += PAGE_SIZE;
      }
    }

    // 5. Server-Side Lifetime Financial Aggregation
    let lifetimeVerifiedCredits = 0;
    let unverifiedHistoricalCredits = 0;
    let lifetimeWithdrawals = 0;
    let lifetimeRefunds = 0;
    let lifetimeAdjustments = 0;

    const trustedMerchantId = process.env.OFFICIAL_MERCHANT_ACCOUNT_ID || "RAHMANIA_OFFICIAL_MERCHANT";

    for (const tx of allTransactions) {
      const type = String(tx.transaction_type || "").trim();
      const status = String(tx.status || "").trim().toLowerCase();
      const net = Number(tx.amount_net) || 0;
      const isCompleted = status === "completed";

      // Strict Allowlist Enforcement
      if (QUALIFYING_CREDIT_TYPES.includes(type)) {
        if (isAuthoritativeGatewayEvidence(tx, trustedMerchantId)) {
          lifetimeVerifiedCredits += net;
        } else if (isCompleted) {
          // Completed but lacking authoritative gateway proof (simulated ref, missing merchant, etc.)
          unverifiedHistoricalCredits += net;
        }
      } else if (type === "withdrawal" || type === "payout") {
        if (isCompleted) {
          lifetimeWithdrawals += net;
        }
      } else if (type === "refund") {
        if (isCompleted) {
          lifetimeRefunds += net;
        }
      } else if (type === "adjustment") {
        if (isCompleted) {
          lifetimeAdjustments += net;
        }
      }
      // Any missing, unknown or unverified transaction type is strictly ignored
    }

    const lifetimeVerifiedEarnings = lifetimeVerifiedCredits;
    const calculatedLedgerBalance = (lifetimeVerifiedCredits + lifetimeAdjustments) - (lifetimeWithdrawals + lifetimeRefunds);

    const safeWallet = wallet || {
      teacher_id: targetTeacherId,
      balance: 0.00,
      total_earned: 0.00,
      total_withdrawn: 0.00,
      currency: "BDT",
      is_withdrawal_held: false,
      hold_reason: null,
      reconciliation_required: false,
      updated_at: new Date().toISOString(),
    };

    const recordedBalance = Number(safeWallet.balance) || 0;
    const recordedTotalEarned = Number(safeWallet.total_earned) || 0;

    // 6. Bidirectional Reconciliation Difference Calculation
    // Difference = Recorded - Verified
    const earningsDiscrepancy = recordedTotalEarned - lifetimeVerifiedEarnings;
    const balanceDiscrepancy = recordedBalance - calculatedLedgerBalance;

    let reconciliationStatus = "BALANCED";
    let discrepancyDirection = "NONE";

    if (earningsDiscrepancy > 0) {
      reconciliationStatus = "RECORDED_EXCEEDS_VERIFIED";
      discrepancyDirection = "RECORDED_SURPLUS";
    } else if (earningsDiscrepancy < 0) {
      reconciliationStatus = "VERIFIED_EXCEEDS_RECORDED";
      discrepancyDirection = "VERIFIED_SURPLUS";
    } else {
      reconciliationStatus = "BALANCED";
      discrepancyDirection = "EXACT_MATCH";
    }

    // Limit to latest 50 transactions for frontend table view, with student privacy masking
    const safeTransactionsSlice = allTransactions.slice(0, 50).map((tx) => ({
      id: tx.id,
      date: new Date(tx.created_at).toLocaleDateString("bn-BD"),
      type: tx.transaction_type,
      gross: Number(tx.amount_gross) || 0,
      platformCut: Number(tx.platform_commission_amount) || 0,
      net: Number(tx.amount_net) || 0,
      gateway: tx.payment_gateway || "bKash",
      status: tx.status,
      isVerifiedGateway: isAuthoritativeGatewayEvidence(tx, trustedMerchantId),
      studentName: maskStudentContact(tx.student_name),
    }));

    return NextResponse.json({
      ok: true,
      wallet: {
        teacher_id: safeWallet.teacher_id,
        balance: recordedBalance,
        recorded_balance: recordedBalance,
        total_earned: recordedTotalEarned,
        recorded_total_earned: recordedTotalEarned,
        verified_earnings: lifetimeVerifiedEarnings,
        verified_payment_credits: lifetimeVerifiedCredits,
        unverified_historical_credits: unverifiedHistoricalCredits,
        calculated_ledger_balance: calculatedLedgerBalance,
        earnings_discrepancy: earningsDiscrepancy,
        balance_discrepancy: balanceDiscrepancy,
        reconciliation_status: reconciliationStatus,
        discrepancy_direction: discrepancyDirection,
        discrepancy_amount: Math.abs(earningsDiscrepancy),
        withdrawable_balance: 0.00, // Strictly 0: payout backend does not exist & unreconciled balance held
        total_withdrawn: Number(safeWallet.total_withdrawn) || 0,
        currency: safeWallet.currency || "BDT",
        is_withdrawal_held: Boolean(safeWallet.is_withdrawal_held || earningsDiscrepancy !== 0),
        hold_reason: safeWallet.hold_reason || (earningsDiscrepancy !== 0 ? "UNRECONCILED_LEDGER_DISCREPANCY_HOLD" : null),
        reconciliation_required: Boolean(safeWallet.reconciliation_required || earningsDiscrepancy !== 0),
        updated_at: safeWallet.updated_at,
      },
      ledger_summary: {
        total_transactions_count: allTransactions.length,
        is_complete_ledger: isCompleteLedger,
        verified_payment_credits: lifetimeVerifiedCredits,
        unverified_historical_credits: unverifiedHistoricalCredits,
        lifetime_withdrawals: lifetimeWithdrawals,
        lifetime_refunds: lifetimeRefunds,
        lifetime_adjustments: lifetimeAdjustments,
      },
      transactions: safeTransactionsSlice,
    });
  } catch (err) {
    return NextResponse.json(
      { 
        ok: false, 
        error: err.message || "সার্ভার এরর",
        code: "SERVER_ERROR" 
      },
      { status: 500 }
    );
  }
}
