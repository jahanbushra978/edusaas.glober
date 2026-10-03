-- ====================================================================
-- MIGRATION / RPC FUNCTION: get_entity_performance_ranking
-- Description: Aggregates performance percentage and student count
-- for Branch, Class, and Session ranking with server-side limit/offset.
--
-- HOW TO USE:
--   1. Copy this whole script and run it in the Supabase Dashboard SQL Editor.
--   2. The Ranking Center UI calls this function automatically (with a
--      client-side fallback, so the app still works if you don't run this).
--   3. Teacher & Group ranking are computed in the browser because they rely
--      on fuzzy "assigned_batches" matching.
--
-- This keeps heavy aggregation on the database (scales with data size and
-- stays well within Supabase free-plan per-request limits).
-- ====================================================================

CREATE OR REPLACE FUNCTION get_entity_performance_ranking(
  p_ranking_type TEXT,
  p_branch_id BIGINT DEFAULT NULL,
  p_class_id BIGINT DEFAULT NULL,
  p_session TEXT DEFAULT NULL,
  p_exam_id BIGINT DEFAULT NULL,
  p_teacher_id BIGINT DEFAULT NULL,
  p_limit INT DEFAULT 10,
  p_offset INT DEFAULT 0,
  p_organization_id UUID DEFAULT NULL
)
RETURNS TABLE (
  entity_id TEXT,
  entity_name TEXT,
  teacher_name TEXT,
  student_count BIGINT,
  total_obtained DOUBLE PRECISION,
  total_full DOUBLE PRECISION,
  performance_pct DOUBLE PRECISION,
  pass_count BIGINT,
  pass_pct DOUBLE PRECISION
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- ================= BRANCH RANKING =================
  IF p_ranking_type = 'branch' THEN
    RETURN QUERY
    WITH filtered_students AS (
      SELECT s.id, s.branch_id
      FROM students s
      WHERE s.status = 'active'
        AND (p_organization_id IS NULL OR s.organization_id = p_organization_id)
        AND (p_branch_id IS NULL OR s.branch_id = p_branch_id)
        AND (p_class_id IS NULL OR s.class_id = p_class_id)
        AND (p_session IS NULL OR s.session = p_session)
    ),
    result_stats AS (
      SELECT 
        fs.branch_id,
        COUNT(DISTINCT er.student_id) as total_students,
        SUM(COALESCE(er.obtained_marks, 0)) as sum_obtained,
        SUM(COALESCE(e.total_marks, 100)) as sum_full,
        COUNT(CASE WHEN LOWER(COALESCE(er.grade, '')) != 'f' AND COALESCE(er.obtained_marks, 0) >= COALESCE(e.pass_marks, 0) THEN 1 END) as pass_students
      FROM exam_results er
      JOIN filtered_students fs ON fs.id = er.student_id
      JOIN exams e ON e.id = er.exam_id
      WHERE (p_exam_id IS NULL OR er.exam_id = p_exam_id)
      GROUP BY fs.branch_id
    )
    SELECT 
      b.id::TEXT as entity_id,
      COALESCE(b.name, 'Branch ' || b.id::TEXT) as entity_name,
      ''::TEXT as teacher_name,
      COALESCE(rs.total_students, 0) as student_count,
      COALESCE(rs.sum_obtained, 0) as total_obtained,
      COALESCE(rs.sum_full, 0) as total_full,
      CASE WHEN COALESCE(rs.sum_full, 0) > 0 THEN ROUND(((rs.sum_obtained / rs.sum_full) * 100)::numeric, 2)::DOUBLE PRECISION ELSE 0 END as performance_pct,
      COALESCE(rs.pass_students, 0) as pass_count,
      CASE WHEN COALESCE(rs.total_students, 0) > 0 THEN ROUND(((rs.pass_students::DOUBLE PRECISION / rs.total_students) * 100)::numeric, 2)::DOUBLE PRECISION ELSE 0 END as pass_pct
    FROM branches b
    JOIN result_stats rs ON rs.branch_id = b.id
    ORDER BY performance_pct DESC, rs.total_students DESC
    LIMIT p_limit OFFSET p_offset;

  -- ================= CLASS RANKING =================
  ELSIF p_ranking_type = 'class' THEN
    RETURN QUERY
    WITH filtered_students AS (
      SELECT s.id, s.class_id
      FROM students s
      WHERE s.status = 'active'
        AND (p_organization_id IS NULL OR s.organization_id = p_organization_id)
        AND (p_branch_id IS NULL OR s.branch_id = p_branch_id)
        AND (p_class_id IS NULL OR s.class_id = p_class_id)
        AND (p_session IS NULL OR s.session = p_session)
    ),
    result_stats AS (
      SELECT 
        fs.class_id,
        COUNT(DISTINCT er.student_id) as total_students,
        SUM(COALESCE(er.obtained_marks, 0)) as sum_obtained,
        SUM(COALESCE(e.total_marks, 100)) as sum_full,
        COUNT(CASE WHEN LOWER(COALESCE(er.grade, '')) != 'f' AND COALESCE(er.obtained_marks, 0) >= COALESCE(e.pass_marks, 0) THEN 1 END) as pass_students
      FROM exam_results er
      JOIN filtered_students fs ON fs.id = er.student_id
      JOIN exams e ON e.id = er.exam_id
      WHERE (p_exam_id IS NULL OR er.exam_id = p_exam_id)
      GROUP BY fs.class_id
    )
    SELECT 
      COALESCE(rs.class_id::TEXT, 'general') as entity_id,
      COALESCE('Class ' || rs.class_id::TEXT, 'General') as entity_name,
      ''::TEXT as teacher_name,
      COALESCE(rs.total_students, 0) as student_count,
      COALESCE(rs.sum_obtained, 0) as total_obtained,
      COALESCE(rs.sum_full, 0) as total_full,
      CASE WHEN COALESCE(rs.sum_full, 0) > 0 THEN ROUND(((rs.sum_obtained / rs.sum_full) * 100)::numeric, 2)::DOUBLE PRECISION ELSE 0 END as performance_pct,
      COALESCE(rs.pass_students, 0) as pass_count,
      CASE WHEN COALESCE(rs.total_students, 0) > 0 THEN ROUND(((rs.pass_students::DOUBLE PRECISION / rs.total_students) * 100)::numeric, 2)::DOUBLE PRECISION ELSE 0 END as pass_pct
    FROM result_stats rs
    ORDER BY performance_pct DESC, rs.total_students DESC
    LIMIT p_limit OFFSET p_offset;

  -- ================= SESSION RANKING =================
  ELSIF p_ranking_type = 'session' THEN
    RETURN QUERY
    WITH filtered_students AS (
      SELECT s.id, s.session
      FROM students s
      WHERE s.status = 'active'
        AND (p_organization_id IS NULL OR s.organization_id = p_organization_id)
        AND (p_branch_id IS NULL OR s.branch_id = p_branch_id)
        AND (p_class_id IS NULL OR s.class_id = p_class_id)
        AND (p_session IS NULL OR s.session = p_session)
    ),
    result_stats AS (
      SELECT 
        fs.session,
        COUNT(DISTINCT er.student_id) as total_students,
        SUM(COALESCE(er.obtained_marks, 0)) as sum_obtained,
        SUM(COALESCE(e.total_marks, 100)) as sum_full,
        COUNT(CASE WHEN LOWER(COALESCE(er.grade, '')) != 'f' AND COALESCE(er.obtained_marks, 0) >= COALESCE(e.pass_marks, 0) THEN 1 END) as pass_students
      FROM exam_results er
      JOIN filtered_students fs ON fs.id = er.student_id
      JOIN exams e ON e.id = er.exam_id
      WHERE (p_exam_id IS NULL OR er.exam_id = p_exam_id)
      GROUP BY fs.session
    )
    SELECT 
      COALESCE(rs.session, 'Default') as entity_id,
      COALESCE('Session ' || rs.session, 'Default') as entity_name,
      ''::TEXT as teacher_name,
      COALESCE(rs.total_students, 0) as student_count,
      COALESCE(rs.sum_obtained, 0) as total_obtained,
      COALESCE(rs.sum_full, 0) as total_full,
      CASE WHEN COALESCE(rs.sum_full, 0) > 0 THEN ROUND(((rs.sum_obtained / rs.sum_full) * 100)::numeric, 2)::DOUBLE PRECISION ELSE 0 END as performance_pct,
      COALESCE(rs.pass_students, 0) as pass_count,
      CASE WHEN COALESCE(rs.total_students, 0) > 0 THEN ROUND(((rs.pass_students::DOUBLE PRECISION / rs.total_students) * 100)::numeric, 2)::DOUBLE PRECISION ELSE 0 END as pass_pct
    FROM result_stats rs
    ORDER BY performance_pct DESC, rs.total_students DESC
    LIMIT p_limit OFFSET p_offset;

  ELSE
    -- Teacher & Group ranking are computed client-side (fuzzy batch matching)
    RETURN;
  END IF;
END;
$$;