import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "../../../../src/lib/supabase-admin";

// This route can be called by Vercel Cron Jobs (or any external cron service)
// to automatically clean up old security logs in the Supabase database.
export async function GET(request) {
  // Optional: Verify Vercel Cron Secret for security
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createSupabaseAdminClient();
    
    // Call the PostgreSQL function created in the migration
    const { error } = await supabase.rpc("cleanup_security_logs");
    
    if (error) throw error;
    
    // ── Auto-advance accounting period if calendar month is ahead ──
    try {
      const { data: periodSetting } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'current_accounting_period')
        .single();

      const currentPeriod = periodSetting?.value;
      const calendarPeriod = new Date().toISOString().substring(0, 7); // YYYY-MM

      if (currentPeriod && calendarPeriod > currentPeriod) {
        console.log(`[Cron] Auto-advancing period from ${currentPeriod} to ${calendarPeriod}`);
        
        // Archive old records for boarding_daily_reports and boarding_expenses
        const endOfPeriod = new Date(currentPeriod + '-01');
        endOfPeriod.setMonth(endOfPeriod.getMonth() + 1);
        endOfPeriod.setDate(0); // last day of the period month
        const archiveDate = endOfPeriod.toISOString().split('T')[0];
        const archiveReason = `Auto period closed: ${currentPeriod}`;
        const archiveTimestamp = new Date().toISOString();

        // Archive boarding_daily_reports
        await supabase
          .from('boarding_daily_reports')
          .update({ is_archived: true, archived_at: archiveTimestamp, archive_reason: archiveReason })
          .lte('date', archiveDate)
          .eq('is_archived', false);

        // Archive boarding_expenses  
        await supabase
          .from('boarding_expenses')
          .update({ is_archived: true, archived_at: archiveTimestamp, archive_reason: archiveReason })
          .lte('date', archiveDate)
          .eq('is_archived', false);

        // Update the accounting period
        await supabase
          .from('app_settings')
          .update({ value: calendarPeriod })
          .eq('key', 'current_accounting_period');

        console.log(`[Cron] Period advanced to ${calendarPeriod}, archived records up to ${archiveDate}`);
      }
    } catch (periodErr) {
      console.error('[Cron] Auto period advance failed:', periodErr?.message);
    }

    return NextResponse.json({ ok: true, message: "Security logs cleaned successfully, checked period." });
  } catch (err) {
    console.error("Cleanup cron failed:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
