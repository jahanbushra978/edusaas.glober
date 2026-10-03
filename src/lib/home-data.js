import "server-only";

import { unstable_cache } from "next/cache";
import { createSupabasePublicClient } from "./supabase-admin.js";

// Shared with app/api/public/home/route.js's revalidateTag(CACHE_TAG) call,
// so existing content-edit invalidation (EventManager/BlogManager) continues
// to invalidate this cache too, unchanged.
export const HOME_PAGE_CACHE_TAG = "home-page";

async function safeQuery(promise) {
  try {
    const res = await promise;
    if (res?.error) {
      console.warn("[Home Data] Query error:", res.error?.message);
    }
    return res;
  } catch (e) {
    console.warn("[Home Data] Query exception:", e.message);
    return { data: [], error: { message: e.message } };
  }
}

async function fetchEventsWithFallback(supabase) {
  // Query only columns that exist in the events table
  const res = await safeQuery(
    supabase.from("events")
      .select("id,title,description,event_date,banner_url,created_date")
      .order("event_date", { ascending: false })
      .limit(50)
  );
  if (res.error) return res;

  // Map to the multilingual object expected by the frontend
  const mapped = (res.data || []).map(e => ({
    id: e.id,
    title_bn: e.title || "",
    title_en: e.title || "",
    title_ar: e.title || "",
    description_bn: e.description || "",
    description_en: e.description || "",
    description_ar: e.description || "",
    event_date: e.event_date,
    banner_url: e.banner_url || "",
    is_active: true,
    created_date: e.created_date,
  }));

  return { data: mapped };
}

async function fetchBlogsWithFallback(supabase) {
  // Query only columns that exist in the blogs table
  const res = await safeQuery(
    supabase.from("blogs")
      .select("id,title,slug,content,featured_image,is_published,created_at,updated_date")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(50)
  );
  if (res.error) return res;

  // Map to the multilingual object expected by the frontend
  const mapped = (res.data || []).map(b => ({
    id: b.id,
    title: b.title || "",
    title_bn: b.title || "",
    title_en: b.title || "",
    title_ar: b.title || "",
    content: b.content || "",
    content_bn: b.content || "",
    content_en: b.content || "",
    content_ar: b.content || "",
    excerpt_bn: b.title ? b.title.substring(0, 100) : "",
    excerpt_en: b.title ? b.title.substring(0, 100) : "",
    excerpt_ar: b.title ? b.title.substring(0, 100) : "",
    featured_image: b.featured_image || "",
    author: "Admin",
    is_published: b.is_published,
    created_at: b.created_at,
    updated_at: b.updated_date,
    slug: b.slug,
  }));

  return { data: mapped };
}

async function fetchHomePageDataUncached() {
  const supabase = createSupabasePublicClient();

  // Try fetching using Supabase RPC for optimal performance (1 database query instead of 17)
  try {
    const [rpcRes, facilitiesRes] = await Promise.all([
      supabase.rpc("get_home_page_data"),
      safeQuery(supabase.from("facilities").select("id,title_bn,title_en,title_ar,description_bn,description_en,description_ar,icon_name,sort_order,is_active").not("is_active", "is", false).order("sort_order").limit(50))
    ]);

    const { data: rpcData, error: rpcErr } = rpcRes;
    const facilities = !facilitiesRes.error ? facilitiesRes.data || [] : [];

    if (rpcData && (!rpcErr || rpcErr.code !== "PGRST202")) {
      const [pinRes, branchImgRes] = await Promise.all([
        safeQuery(supabase.from("notices").select("id,pin_to_top").eq("is_active", true)),
        safeQuery(supabase.from("branches").select("id,logo,slider_images,image_url,card_image_url").not("is_active", "is", false))
      ]);

      const pinMap = new Map((pinRes?.data || []).map(n => [n.id, n.pin_to_top]));
      const branchImgMap = new Map((branchImgRes?.data || []).map(b => [b.id, b]));

      const enrichedNotices = (rpcData.notices || []).map(n => ({
        ...n,
        pin_to_top: n.pin_to_top ?? pinMap.get(n.id) ?? false,
      }));

      const enrichedBranches = (rpcData.branches || []).map(b => {
        const imgData = branchImgMap.get(b.id) || {};
        const sliderImgs = Array.isArray(imgData.slider_images) ? imgData.slider_images : (Array.isArray(b.slider_images) ? b.slider_images : []);
        const coverImg = imgData.card_image_url || imgData.image_url || b.card_image_url || b.image_url || (sliderImgs.length > 0 ? sliderImgs[0] : "") || imgData.logo || b.logo || "";
        return {
          ...b,
          logo: imgData.logo || b.logo || "",
          slider_images: sliderImgs,
          image_url: coverImg,
          card_image_url: imgData.card_image_url || b.card_image_url || coverImg,
        };
      });

      return {
        ...rpcData,
        facilities,
        notices: enrichedNotices,
        branches: enrichedBranches,
      };
    }
    if (rpcErr) {
      console.warn("[Home Data] RPC error, falling back to parallel queries:", rpcErr.message);
    }
  } catch (e) {
    console.warn("[Home Data] RPC failed, falling back to parallel queries:", e.message);
  }

  const [
    noticesRes, settingsRes, heroSlidesRes, eventsRes,
    galleryRes, branchesRes, blogsRes, pageSectionsRes,
    faqsRes, testimonialsRes, teachersRes, sponsorsRes,
    successStoriesRes, studentsRes, contactInfoRes, coursesRes,
    facilitiesRes,
  ] = await Promise.all([
    safeQuery(supabase.from("notices")
      .select("id,title,body,type,is_active,sort_order,image,description,file_url,is_published,created_date,pin_to_top")
      .eq("is_active", true).not("is_published", "is", false)
      .order("created_date", { ascending: false }).limit(50)),
    safeQuery(supabase.from("app_settings").select("key,value").not("key", "in", '("admin_login_password","admin_password","jwt_secret")')),
    safeQuery(supabase.from("hero_slides").select("id,title,subtitle,image_url,caption_en,caption_bn,is_active,sort_order,created_date").eq("is_active", true).order("sort_order").limit(100)),
    fetchEventsWithFallback(supabase),
    safeQuery(supabase.from("gallery").select("id,title,image_url,category,created_at").order("created_at", { ascending: false }).limit(200)),
    safeQuery(supabase.from("branches").select("id,name_bn,name_en,branch_name,address_bn,address_en,phone,head_teacher,established_year,is_active,sort_order,created_date,logo,image_url,card_image_url,slider_images").not("is_active", "is", false).order("sort_order").limit(50)),
    fetchBlogsWithFallback(supabase),
    safeQuery(supabase.from("page_sections").select("id,section_key,title_bn,title_en,subtitle_bn,subtitle_en,body_bn,body_en,is_visible,created_date,updated_date")),
    safeQuery(supabase.from("faqs").select("id,question,answer,sort_order,created_date").order("sort_order").limit(50)),
    safeQuery(supabase.from("testimonials").select("id,student_name,message,photo_url,rating,created_at").order("created_at", { ascending: false }).limit(50)),
    safeQuery(supabase.from("teachers").select("id,teacher_id,full_name_en,full_name_bn,full_name_ar,phone,photo_url,designation,designation_bn,designation_ar,bio,bio_bn,bio_ar,facebook,linkedin,is_active,employee_code,branch,department,website_showing_serial,featured_teacher,qualification,experience_years,special_skills,show_on_website,branch_id")
      .eq("status", "active").eq("is_active", true).eq("featured_teacher", true)
      .order("website_showing_serial", { ascending: true, nullsFirst: false }).limit(10)),
    safeQuery(supabase.from("sponsors").select("id,title,title_bn,title_en,title_ar,company_name,company_name_bn,company_name_en,company_name_ar,description,description_bn,description_en,description_ar,image_url,target_url,button_text,button_text_bn,button_text_en,button_text_ar,priority,start_date,end_date,is_active").eq("is_active", true).order("priority").limit(50)),
    safeQuery(supabase.from("success_stories").select("id,title,description,image_url,created_at").order("created_at", { ascending: false }).limit(50)),
    safeQuery(supabase.from("students").select("id,status,session").not("status", "eq", "graduated")),
    safeQuery(supabase.from("contact_info").select("phone,email,address,facebook,youtube,whatsapp").limit(1)),
    safeQuery(supabase.from("courses").select("id,name,description,image_url,fee,duration,is_active,created_date").not("is_active", "is", false).order("sort_order").limit(20)),
    safeQuery(supabase.from("facilities").select("id,title_bn,title_en,title_ar,description_bn,description_en,description_ar,icon_name,sort_order,is_active").not("is_active", "is", false).order("sort_order").limit(50)),
  ]);

  const getData = (res) => (!res?.error ? res?.data || [] : []);
  const settingsArr = getData(settingsRes);
  const pageSectionsArr = getData(pageSectionsRes);
  const contactInfoArr = getData(contactInfoRes);

  const contactObj = contactInfoArr[0] || {};
  const contactInfoMap = {
    phone: contactObj.phone || "",
    email: contactObj.email || "",
    address: contactObj.address || "",
    facebook: contactObj.facebook || "",
    youtube: contactObj.youtube || "",
    whatsapp: contactObj.whatsapp || "",
  };

  const mappedNotices = getData(noticesRes).map(n => ({
    id: n.id,
    title_bn: n.title || "",
    title_en: n.title || "",
    title_ar: n.title || "",
    summary_bn: n.description || "",
    summary_en: n.description || "",
    summary_ar: n.description || "",
    content_bn: n.body || "",
    content_en: n.body || "",
    content_ar: n.body || "",
    type: n.type || "notice",
    image_url: n.image || "",
    created_date: n.created_date,
    is_active: n.is_active,
  }));

  const mappedHeroSlides = getData(heroSlidesRes).map(h => ({
    id: h.id,
    title_bn: h.title || h.caption_bn || "",
    title_en: h.title || h.caption_en || "",
    title_ar: h.title || h.caption_en || "",
    subtitle_bn: h.subtitle || "",
    subtitle_en: h.subtitle || "",
    subtitle_ar: h.subtitle || "",
    image_url: h.image_url || "",
    sort_order: h.sort_order || 0,
    is_active: h.is_active,
    link_url: "",
    created_date: h.created_date,
  }));

  const mappedGallery = getData(galleryRes).map(g => ({
    id: g.id,
    title_bn: g.title || "",
    title_en: g.title || "",
    title_ar: g.title || "",
    description_bn: "",
    description_en: "",
    description_ar: "",
    image_url: g.image_url || "",
    department: g.category || "general",
    is_published: true,
    show_on_website: "Y",
    created_at: g.created_at,
  }));

  const mappedBranches = getData(branchesRes).map(b => ({
    id: b.id,
    name_bn: b.name_bn || b.branch_name || b.name_en || "",
    name_en: b.name_en || b.branch_name || b.name_bn || "",
    name_ar: b.name_en || b.branch_name || b.name_bn || "",
    slug: b.branch_name ? b.branch_name.toLowerCase().replace(/\s+/g, "-") : String(b.id),
    description_bn: "",
    description_en: "",
    description_ar: "",
    address_bn: b.address_bn || b.address_en || "",
    address_en: b.address_en || b.address_bn || "",
    phone: b.phone || "",
    email: "",
    image_url: "",
    sort_order: b.sort_order || 0,
    is_active: b.is_active,
    created_date: b.created_date,
    established_year: b.established_year || "",
    head_teacher: b.head_teacher || "",
  }));

  const mappedFaqs = getData(faqsRes).map(f => ({
    id: f.id,
    question_bn: f.question || "",
    question_en: f.question || "",
    question_ar: f.question || "",
    answer_bn: f.answer || "",
    answer_en: f.answer || "",
    answer_ar: f.answer || "",
    sort_order: f.sort_order || 0,
    is_active: true,
    created_date: f.created_date,
  }));

  const mappedTestimonials = getData(testimonialsRes).map(t => ({
    id: t.id,
    student_name_bn: t.student_name || "",
    student_name_en: t.student_name || "",
    student_name_ar: t.student_name || "",
    message_bn: t.message || "",
    message_en: t.message || "",
    message_ar: t.message || "",
    photo_url: t.photo_url || "",
    rating: t.rating || 5,
    is_active: true,
    created_at: t.created_at,
  }));

  const mappedSuccessStories = getData(successStoriesRes).map(ss => ({
    id: ss.id,
    title_bn: ss.title || "",
    title_en: ss.title || "",
    title_ar: ss.title || "",
    description_bn: ss.description || "",
    description_en: ss.description || "",
    description_ar: ss.description || "",
    image_url: ss.image_url || "",
    is_active: true,
    created_at: ss.created_at,
  }));

  const mappedCourses = getData(coursesRes).map(c => ({
    id: c.id,
    name_bn: c.name || "",
    name_en: c.name || "",
    name_ar: c.name || "",
    description_bn: c.description || "",
    description_en: c.description || "",
    description_ar: c.description || "",
    duration: c.duration || "",
    fee: c.fee || 0,
    sort_order: 0,
    is_active: c.is_active,
    created_date: c.created_date,
  }));

  return {
    notices: mappedNotices,
    appSettings: Object.fromEntries(settingsArr.map(s => [s.key, s.value])),
    heroSlides: mappedHeroSlides,
    events: getData(eventsRes),
    gallery: mappedGallery,
    branches: mappedBranches,
    blogs: getData(blogsRes),
    pageSections: Object.fromEntries(pageSectionsArr.map(ps => [ps.section_key, ps])),
    faqs: mappedFaqs,
    testimonials: mappedTestimonials,
    teachers: getData(teachersRes),
    sponsors: getData(sponsorsRes),
    successStories: mappedSuccessStories,
    students: getData(studentsRes),
    contactInfo: contactInfoMap,
    courses: mappedCourses,
    facilities: getData(facilitiesRes),
  };
}

// Cached wrapper: matches the API route's existing `revalidate = 7200` window
// and shares its cache tag, so calling this directly from the homepage
// Server Component (for SSR prefetch) does NOT add a new per-request
// Supabase hit — it's refreshed at most once per 2 hours, same as today,
// and is invalidated by the same revalidateTag("home-page") call the
// EventManager/BlogManager admin screens already trigger on content changes.
export const fetchHomePageData = unstable_cache(
  fetchHomePageDataUncached,
  ["home-page-data-v1"],
  { revalidate: 7200, tags: [HOME_PAGE_CACHE_TAG] }
);
