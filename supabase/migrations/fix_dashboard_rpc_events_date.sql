-- Fix get_dashboard_data RPC: replace events.date with events.event_date
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION public.get_dashboard_data(
  p_period_key text,
  p_today date,
  p_thirty_days_ago date,
  p_six_months_ago date,
  p_branch_id integer default null,
  p_is_super_admin boolean default false,
  p_is_boarding_manager boolean default false
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
  events_json json;
BEGIN
  -- Events: use event_date instead of date
  SELECT COALESCE(json_agg(t), '[]'::json) INTO events_json FROM (
    SELECT
      id,
      title,
      event_date,
      time
    FROM public.events
    WHERE event_date >= p_today
    ORDER BY event_date ASC
    LIMIT 3
  ) t;

  result := json_build_object(
    'events', events_json
  );

  RETURN result;
END;
$$;
