-- Fix home page data RPC function
-- Replaces get_home_page_data() with a version that matches the correct notices schema columns.
-- Run this script in the Supabase SQL Editor.

CREATE OR REPLACE FUNCTION public.get_home_page_data()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
  notices_json json;
  settings_json json;
  hero_slides_json json;
  events_json json;
  gallery_json json;
  branches_json json;
  blogs_json json;
  page_sections_json json;
  faqs_json json;
  testimonials_json json;
  teachers_json json;
  sponsors_json json;
  success_stories_json json;
  students_json json;
  contact_info_json json;
  courses_json json;
BEGIN
  -- 1. Notices (uses description column instead of non-existent summary_bn)
  SELECT COALESCE(json_agg(t), '[]'::json) INTO notices_json FROM (
    SELECT 
      id,
      title as title_bn,
      title as title_en,
      title as title_ar,
      description as summary_bn,
      description as summary_en,
      description as summary_ar,
      body as content_bn,
      body as content_en,
      body as content_ar,
      type,
      image as image_url,
      created_date,
      is_active
    FROM public.notices
    WHERE is_active = true AND is_published IS DISTINCT FROM false
    ORDER BY created_date DESC
    LIMIT 50
  ) t;

  -- 2. App Settings
  SELECT COALESCE(json_object_agg(key, value), '{}'::json) INTO settings_json FROM public.app_settings;

  -- 3. Hero Slides
  SELECT COALESCE(json_agg(t), '[]'::json) INTO hero_slides_json FROM (
    SELECT 
      id,
      COALESCE(title, caption_bn, '') as title_bn,
      COALESCE(title, caption_en, '') as title_en,
      COALESCE(title, caption_en, '') as title_ar,
      COALESCE(subtitle, '') as subtitle_bn,
      COALESCE(subtitle, '') as subtitle_en,
      COALESCE(subtitle, '') as subtitle_ar,
      COALESCE(image_url, '') as image_url,
      COALESCE(sort_order, 0) as sort_order,
      is_active,
      '' as link_url,
      created_date
    FROM public.hero_slides
    WHERE is_active = true
    ORDER BY sort_order
    LIMIT 100
  ) t;

  -- 4. Events
  SELECT COALESCE(json_agg(t), '[]'::json) INTO events_json FROM (
    SELECT 
      id,
      title as title_bn,
      title as title_en,
      title as title_ar,
      description as description_bn,
      description as description_en,
      description as description_ar,
      event_date,
      COALESCE(banner_url, '') as banner_url,
      true as is_active,
      created_date
    FROM public.events
    ORDER BY event_date DESC
    LIMIT 50
  ) t;

  -- 5. Gallery
  SELECT COALESCE(json_agg(t), '[]'::json) INTO gallery_json FROM (
    SELECT 
      id,
      title as title_bn,
      title as title_en,
      title as title_ar,
      '' as description_bn,
      '' as description_en,
      '' as description_ar,
      COALESCE(image_url, '') as image_url,
      COALESCE(category, 'general') as department,
      true as is_published,
      'Y' as show_on_website,
      created_at
    FROM public.gallery
    ORDER BY created_at DESC
    LIMIT 200
  ) t;

  -- 6. Branches
  SELECT COALESCE(json_agg(t), '[]'::json) INTO branches_json FROM (
    SELECT 
      id,
      COALESCE(name_bn, branch_name, name_en, '') as name_bn,
      COALESCE(name_en, branch_name, name_bn, '') as name_en,
      COALESCE(name_en, branch_name, name_bn, '') as name_ar,
      CASE 
        WHEN branch_name IS NOT NULL THEN LOWER(REGEXP_REPLACE(branch_name, '\s+', '-', 'g'))
        ELSE id::text
      END as slug,
      '' as description_bn,
      '' as description_en,
      '' as description_ar,
      COALESCE(address_bn, address_en, '') as address_bn,
      COALESCE(address_en, address_bn, '') as address_en,
      COALESCE(phone, '') as phone,
      '' as email,
      '' as image_url,
      COALESCE(sort_order, 0) as sort_order,
      is_active,
      created_date,
      COALESCE(established_year, '') as established_year,
      COALESCE(head_teacher, '') as head_teacher
    FROM public.branches
    WHERE is_active IS DISTINCT FROM false
    ORDER BY sort_order
    LIMIT 50
  ) t;

  -- 7. Blogs
  SELECT COALESCE(json_agg(t), '[]'::json) INTO blogs_json FROM (
    SELECT 
      id,
      title,
      title as title_bn,
      title as title_en,
      title as title_ar,
      content,
      content as content_bn,
      content as content_en,
      content as content_ar,
      CASE WHEN title IS NOT NULL THEN SUBSTRING(title FROM 1 FOR 100) ELSE '' END as excerpt_bn,
      CASE WHEN title IS NOT NULL THEN SUBSTRING(title FROM 1 FOR 100) ELSE '' END as excerpt_en,
      CASE WHEN title IS NOT NULL THEN SUBSTRING(title FROM 1 FOR 100) ELSE '' END as excerpt_ar,
      COALESCE(featured_image, '') as featured_image,
      'Admin' as author,
      is_published,
      created_at,
      updated_date as updated_at,
      slug
    FROM public.blogs
    WHERE is_published = true
    ORDER BY created_at DESC
    LIMIT 50
  ) t;

  -- 8. Page Sections
  SELECT COALESCE(json_object_agg(section_key, t), '{}'::json) INTO page_sections_json FROM (
    SELECT 
      id,
      section_key,
      title_bn,
      title_en,
      subtitle_bn,
      subtitle_en,
      body_bn,
      body_en,
      is_visible,
      created_date,
      updated_date
    FROM public.page_sections
  ) t;

  -- 9. FAQs
  SELECT COALESCE(json_agg(t), '[]'::json) INTO faqs_json FROM (
    SELECT 
      id,
      question as question_bn,
      question as question_en,
      question as question_ar,
      answer as answer_bn,
      answer as answer_en,
      answer as answer_ar,
      sort_order,
      true as is_active,
      created_date
    FROM public.faqs
    ORDER BY sort_order
    LIMIT 50
  ) t;

  -- 10. Testimonials
  SELECT COALESCE(json_agg(t), '[]'::json) INTO testimonials_json FROM (
    SELECT 
      id,
      student_name as student_name_bn,
      student_name as student_name_en,
      student_name as student_name_ar,
      message as message_bn,
      message as message_en,
      message as message_ar,
      COALESCE(photo_url, '') as photo_url,
      COALESCE(rating, 5) as rating,
      true as is_active,
      created_at
    FROM public.testimonials
    ORDER BY created_at DESC
    LIMIT 50
  ) t;

  -- 11. Teachers
  SELECT COALESCE(json_agg(t), '[]'::json) INTO teachers_json FROM (
    SELECT 
      id,
      teacher_id,
      full_name_en,
      full_name_bn,
      full_name_ar,
      phone,
      photo_url,
      designation,
      designation_bn,
      designation_ar,
      bio,
      bio_bn,
      bio_ar,
      facebook,
      linkedin,
      is_active,
      employee_code,
      branch,
      department,
      website_showing_serial,
      featured_teacher,
      qualification,
      experience_years,
      special_skills,
      show_on_website,
      branch_id
    FROM public.teachers
    WHERE status = 'active' AND is_active = true AND featured_teacher = true
    ORDER BY website_showing_serial ASC NULLS LAST
    LIMIT 10
  ) t;

  -- 12. Sponsors
  SELECT COALESCE(json_agg(t), '[]'::json) INTO sponsors_json FROM (
    SELECT 
      id,
      title,
      title_bn,
      title_en,
      title_ar,
      company_name,
      company_name_bn,
      company_name_en,
      company_name_ar,
      description,
      description_bn,
      description_en,
      description_ar,
      image_url,
      target_url,
      button_text,
      button_text_bn,
      button_text_en,
      button_text_ar,
      priority,
      start_date,
      end_date,
      is_active
    FROM public.sponsors
    WHERE is_active = true
    ORDER BY priority
    LIMIT 50
  ) t;

  -- 13. Success Stories
  SELECT COALESCE(json_agg(t), '[]'::json) INTO success_stories_json FROM (
    SELECT 
      id,
      title as title_bn,
      title as title_en,
      title as title_ar,
      description as description_bn,
      description as description_en,
      description as description_ar,
      image_url,
      true as is_active,
      created_at
    FROM public.success_stories
    ORDER BY created_at DESC
    LIMIT 50
  ) t;

  -- 14. Students (basic counts)
  SELECT COALESCE(json_agg(t), '[]'::json) INTO students_json FROM (
    SELECT 
      id,
      status,
      session
    FROM public.students
    WHERE status != 'graduated'
  ) t;

  -- 15. Contact Info
  SELECT COALESCE(json_object_agg('contact_info', t), '{}'::json) INTO contact_info_json FROM (
    SELECT 
      COALESCE(phone, '') as phone,
      COALESCE(email, '') as email,
      COALESCE(address, '') as address,
      COALESCE(facebook, '') as facebook,
      COALESCE(youtube, '') as youtube,
      COALESCE(whatsapp, '') as whatsapp
    FROM public.contact_info
    LIMIT 1
  ) t;

  -- 16. Courses
  SELECT COALESCE(json_agg(t), '[]'::json) INTO courses_json FROM (
    SELECT 
      id,
      name as name_bn,
      name as name_en,
      name as name_ar,
      description as description_bn,
      description as description_en,
      description as description_ar,
      COALESCE(duration, '') as duration,
      COALESCE(fee, 0) as fee,
      0 as sort_order,
      is_active,
      created_date
    FROM public.courses
    WHERE is_active IS DISTINCT FROM false
    ORDER BY sort_order
    LIMIT 20
  ) t;

  -- Build final aggregated JSON object
  result := json_build_object(
    'notices', notices_json,
    'appSettings', settings_json,
    'heroSlides', hero_slides_json,
    'events', events_json,
    'gallery', gallery_json,
    'branches', branches_json,
    'blogs', blogs_json,
    'pageSections', page_sections_json,
    'faqs', faqs_json,
    'testimonials', testimonials_json,
    'teachers', teachers_json,
    'sponsors', sponsors_json,
    'successStories', success_stories_json,
    'students', students_json,
    'contactInfo', COALESCE(contact_info_json->'contact_info', '{}'::json),
    'courses', courses_json
  );

  RETURN result;
END;
$$;
