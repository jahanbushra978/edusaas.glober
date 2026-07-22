-- Migration: extend fn_get_live_feed to return the fields needed for the
-- live attendance display card (photo, roll/teacher id, class/designation).
--
-- WHY: The function already joins device_user_mappings for full_name, but
-- never touched students/teachers, so photo_url/roll_number/class_name were
-- never available to the frontend. This adds two LEFT JOINs on primary key
-- (id) — trivial, indexed lookups — inside the SAME single RPC call.
--
-- IMPACT ON SUPABASE USAGE:
--   - Client-side round-trips: unchanged (still exactly 1 RPC call per
--     realtime event, same as before).
--   - Server-side cost: two extra LEFT JOINs by primary key per row in the
--     result set (capped at p_limit, default 20-50) — negligible.
--   - No new tables, no new indexes required (id is already the primary key
--     on both students and teachers).
--
-- Run this in the Supabase SQL editor. It replaces the function in place;
-- no schema change, no downtime, callers are unaffected (same signature).

CREATE OR REPLACE FUNCTION public.fn_get_live_feed(p_branch_id bigint, p_limit integer DEFAULT 20)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_agg(sub ORDER BY sub.received_at DESC)
  INTO v_result
  FROM (
    SELECT l.id, l.device_serial, l.device_user_id,
           l.punch_time, l.punch_type, l.received_at,
           jsonb_build_object(
             'user_type', m.user_type,
             'user_id', m.user_id,
             'full_name', COALESCE(s.full_name_bn, s.full_name_en, t.full_name_bn, t.full_name_en, m.full_name),
             'photo_url', COALESCE(s.photo_url, t.photo_url),
             'identifier', COALESCE(s.roll_number, t.teacher_id),
             'group_label', COALESCE(s.class_name, s.batch, t.designation)
           ) AS user_info
    FROM attendance_logs l
    INNER JOIN device_user_mappings m
      ON m.device_serial = l.device_serial
     AND m.device_user_id = l.device_user_id
     AND m.is_active = true
    LEFT JOIN students s
      ON m.user_type = 'student' AND s.id = m.user_id
    LEFT JOIN teachers t
      ON m.user_type = 'teacher' AND t.id = m.user_id
    WHERE m.branch_id = p_branch_id
    ORDER BY l.received_at DESC
    LIMIT p_limit
  ) sub;

  RETURN COALESCE(v_result, '[]'::JSONB);
END;
$function$;
