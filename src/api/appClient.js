import { setSupabaseToken } from "@/lib/supabase";
import { supabaseAdmin, setAdminSupabaseToken } from "@/lib/supabase-admin-client";
import { uploadToCloudinary } from "@/lib/cloudinary";
import {
  MANAGED_PASSWORD_PLACEHOLDER,
  getLoginRoute,
  normalizeLoginId,
  sanitizePasswordMarker,
} from "../lib/auth-identity.js";
import { hasPermission } from "@/lib/permissions";
import { getAccountingPeriod, getDateKey } from "@/lib/periods";

const ENTITY_TABLES = {
  AdmissionApplication: "admission_applications",
  AppSettings: "app_settings",
  Attendance: "attendances",
  Branch: "branches",
  ContactMessage: "contact_messages",
  DailyLesson: "daily_lessons",
  Exam: "exams",
  ExamInput: "exam_inputs",
  ExamResult: "exam_results",
  Expense: "expenses",
  Facility: "facilities",
  Fee: "student_fees",
  GalleryItem: "gallery_items",
  Hadiya: "hadiya",
  HeroSlide: "hero_slides",
  Notice: "notices",
  NavbarItem: "navbar_items",
  PageSection: "page_sections",
  ReadingLog: "reading_logs",
  Student: "students",
  Teacher: "teachers",
  TeacherAttendance: "teacher_attendance",
  TeacherHadiya: "teacher_hadiya",
  TeacherPayment: "teacher_payments",
  TeacherSalaryProfile: "teacher_salary_profiles",
  Course: "courses",
  Gallery: "gallery",
  GalleryCategory: "gallery_categories",
  VideoCategory: "video_categories",
  Video: "videos",
  Testimonial: "testimonials",
  SuccessStory: "success_stories",
  Event: "events",
  Blog: "blogs",
  Faq: "faqs",
  ContactInfo: "contact_info",
  Sponsor: "sponsors",
  BoardingDailyReport: "boarding_daily_reports",
  BoardingExpense: "boarding_expenses",
  Promotion: "promotions",
  PromotionStudent: "promotion_students",
  PromotionCertificate: "promotion_certificates",
  SecuritySetting: "security_settings",
  BlockedDevice: "blocked_devices",
  LoginAttempt: "login_attempts",
  ActiveSession: "active_sessions",
  TrustedDevice: "trusted_devices",
  SecurityEvent: "security_events",
};

const ENTITY_TO_PERMISSION_MODULE = {
  AdmissionApplication: "admissions",
  Attendance: "student-attendance",
  DailyLesson: "daily-lesson-tracker",
  Exam: "exams",
  ExamInput: "exams",
  ExamResult: "results",
  Expense: "expenses",
  Fee: "fees",
  Hadiya: "hadiya",
  Notice: "notices",
  ReadingLog: "daily-lesson-tracker",
  Student: "students",
  Teacher: "teachers",
  TeacherAttendance: "teacher-attendance",
  TeacherHadiya: "hadiya",
  TeacherPayment: "hadiya",
  TeacherSalaryProfile: "hadiya",
  Event: "events",
  GalleryItem: "gallery",
  Video: "videos",
  Testimonial: "testimonials",
  SuccessStory: "success-stories",
  Blog: "blogs",
  Faq: "faqs",
  ContactInfo: "contact-info",
  Sponsor: "sponsors",
  BoardingDailyReport: "boarding",
  BoardingExpense: "boarding",
  Promotion: "promotion",
  Period: "period",
};

const MANAGED_AUTH_ENTITIES = {
  Student: { role: "student", loginField: "roll_number" },
  Teacher: { role: "teacher", loginField: "teacher_id" },
};

const MONTHLY_PERIOD_ENTITIES = new Set([
  "Expense",
  "Fee",
  "Hadiya",
  "TeacherHadiya",
]);

const MONTH_YEAR_PERIOD_ENTITIES = new Set([
  "TeacherPayment",
]);

const DAILY_RECORD_ENTITIES = new Set([
  "Attendance",
  "BoardingDailyReport",
  "BoardingExpense",
  "DailyLesson",
  "ReadingLog",
  "TeacherAttendance",
]);

function withLifecycleDefaults(entityName, data = {}) {
  const payload = { ...data };

  if (MONTHLY_PERIOD_ENTITIES.has(entityName) && !payload.month) {
    payload.month = getAccountingPeriod().key;
  }

  if (MONTH_YEAR_PERIOD_ENTITIES.has(entityName)) {
    const period = getAccountingPeriod();
    if (!payload.month) payload.month = period.month;
    if (!payload.year) payload.year = period.year;
  }

  if (DAILY_RECORD_ENTITIES.has(entityName) && !payload.date) {
    payload.date = getDateKey();
  }

  return payload;
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || `Request failed with status ${response.status}`);
  }

  return data;
}

async function syncManagedAuthUser(payload) {
  return requestJson("/api/auth/sync-user", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

function sanitizeManagedEntityRecord(entityName, record) {
  if (!record || !MANAGED_AUTH_ENTITIES[entityName]) {
    return record;
  }

  return {
    ...record,
    password: sanitizePasswordMarker(record.password),
  };
}

const PUBLIC_CACHE_TTL = 2 * 60 * 1000;
const publicCache = new Map();

const getCached = (key, ttl = PUBLIC_CACHE_TTL) => {
  const entry = publicCache.get(key);
  if (entry && Date.now() - entry.ts < ttl) return entry.data;
  return null;
};

const setCache = (key, data) => {
  publicCache.set(key, { data, ts: Date.now() });
};

const dedupMap = new Map();

const dedup = async (key, fn) => {
  if (dedupMap.has(key)) return dedupMap.get(key);
  const promise = fn().finally(() => dedupMap.delete(key));
  dedupMap.set(key, promise);
  return promise;
};

const withId = (item) => (item ? { id: item.id, ...item } : null);

let cachedUserPromise = null;
const getSessionUser = () => {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (!cachedUserPromise) {
    cachedUserPromise = appClient.auth.me().then(user => {
      if (!user) cachedUserPromise = null;
      return user;
    }).catch(() => {
      cachedUserPromise = null;
      return null;
    });
  }
  return cachedUserPromise;
};

const TABLES_WITH_BRANCH_ID = new Set([
  'success_stories',
  'teachers',
  'gallery',
  'exam_results',
  'videos',
  'notices',
  'admission_applications',
  'attendances',
  'students',
  'events',
  'boarding_expenses',
  'exams',
  'boarding_daily_reports',
  'gallery_items'
]);

const TABLES_WITH_STUDENT_ID = new Set([
  'student_fees',
  'daily_lessons',
  'reading_logs'
]);

const TABLES_WITH_TEACHER_ID_INT = new Set([
  'teacher_attendance'
]);

const TABLES_WITH_TEACHER_ID_STR = new Set([
  'teacher_payments',
  'teacher_hadiya',
  'teacher_salary_profiles'
]);

const cachedStudentIdsMap = new Map();
const cachedTeacherIdsMap = new Map();
const cachedTeacherStrIdsMap = new Map();

const getBranchStudentIds = (branchId) => {
  if (!cachedStudentIdsMap.has(branchId)) {
    const promise = supabaseAdmin
      .from("students")
      .select("id")
      .eq("branch_id", branchId)
      .then(({ data }) => (data || []).map(s => Number(s.id)))
      .catch(() => []);
    cachedStudentIdsMap.set(branchId, promise);
  }
  return cachedStudentIdsMap.get(branchId);
};

const getBranchTeacherIds = (branchId) => {
  if (!cachedTeacherIdsMap.has(branchId)) {
    const promise = supabaseAdmin
      .from("teachers")
      .select("id")
      .eq("branch_id", branchId)
      .then(({ data }) => (data || []).map(t => Number(t.id)))
      .catch(() => []);
    cachedTeacherIdsMap.set(branchId, promise);
  }
  return cachedTeacherIdsMap.get(branchId);
};

const getBranchTeacherStrIds = (branchId) => {
  if (!cachedTeacherStrIdsMap.has(branchId)) {
    const promise = supabaseAdmin
      .from("teachers")
      .select("teacher_id")
      .eq("branch_id", branchId)
      .then(({ data }) => (data || []).map(t => String(t.teacher_id)))
      .catch(() => []);
    cachedTeacherStrIdsMap.set(branchId, promise);
  }
  return cachedTeacherStrIdsMap.get(branchId);
};

async function getBranchFilterValue(tableName, user) {
  if (!user || user.role === "admin" || user.role === "student" || user.role === "teacher") return null;

  if (!user.branch_id) {
    console.error(`[getBranchFilterValue] Authentication Problem: User has role ${user.role} but branch_id is null/undefined.`);
    throw new Error("Authentication Problem: Your user account is not assigned to any branch.");
  }

  const targetBranchId = Number(user.branch_id);

  if (tableName === "branches") {
    return { type: "eq", field: "id", value: targetBranchId };
  }

  if (TABLES_WITH_BRANCH_ID.has(tableName)) {
    return { type: "eq", field: "branch_id", value: targetBranchId };
  }

  if (TABLES_WITH_STUDENT_ID.has(tableName)) {
    const studentIds = await getBranchStudentIds(targetBranchId);
    return { type: "in", field: "student_id", value: studentIds.length > 0 ? studentIds : [-1] };
  }

  if (TABLES_WITH_TEACHER_ID_INT.has(tableName)) {
    const teacherIds = await getBranchTeacherIds(targetBranchId);
    return { type: "in", field: "teacher_id", value: teacherIds.length > 0 ? teacherIds : [-1] };
  }

  if (TABLES_WITH_TEACHER_ID_STR.has(tableName)) {
    const teacherStrIds = await getBranchTeacherStrIds(targetBranchId);
    return { type: "in", field: "teacher_id", value: teacherStrIds.length > 0 ? teacherStrIds : ["__NONE__"] };
  }

  return null;
}

const TABLES_WITH_ARCHIVE = new Set([
  'student_fees', 'fees', 'hadiya', 'expenses', 'teacher_payments', 'teacher_hadiya',
  'attendances', 'teacher_attendance', 'daily_lessons', 'reading_logs',
  'boarding_daily_reports', 'boarding_expenses'
]);

const MAX_SAFE_RECORDS = 200;

const createEntityAPI = (entityName, tableName, isPublic = false) => ({
  list: async (sort = "id", maxRecords = 100, select = "*", rangeFrom, rangeTo, options = {}) => {
    const user = await getSessionUser();
    const cacheKey = `${tableName}:list:${JSON.stringify(sort)}:${maxRecords}:${select}:${rangeFrom}:${rangeTo}:${!!options?.includeArchived}`;
    if (isPublic) {
      const cached = getCached(cacheKey);
      if (cached) return cached;
    }
    const safeLimit = Math.min(maxRecords, MAX_SAFE_RECORDS);
    if (rangeFrom === undefined && maxRecords > MAX_SAFE_RECORDS && typeof console !== "undefined") {
      // C1 fix: MAX_SAFE_RECORDS is an intentional per-request cap (protects
      // Supabase from unbounded queries), but silently returning fewer rows
      // than asked for used to be invisible to callers. Surface it loudly so
      // any remaining under-fetching call site is easy to spot and, where a
      // full dataset is genuinely required, migrated to entities.X.listAll().
      console.warn(
        `[appClient] ${entityName}.list() requested ${maxRecords} records but is capped at ${MAX_SAFE_RECORDS}. ` +
        `If this view needs the complete dataset, use ${entityName}.listAll() instead.`
      );
    }
    const result = await dedup(cacheKey, async () => {
      let query = supabaseAdmin.from(tableName).select(select);
      const filterVal = isPublic ? null : await getBranchFilterValue(tableName, user);
      if (filterVal) {
        if (filterVal.type === "eq") {
          query = query.eq(filterVal.field, filterVal.value);
        } else if (filterVal.type === "in") {
          query = query.in(filterVal.field, filterVal.value);
        }
      }
      if (TABLES_WITH_ARCHIVE.has(tableName) && !options?.includeArchived && !isPublic) {
        query = query.eq("is_archived", false);
      }
      if (sort && sort !== "id") {
        const desc = sort.startsWith("-");
        const field = desc ? sort.slice(1) : sort;
        query = query.order(field, { ascending: !desc });
      }
      if (rangeFrom !== undefined && rangeTo !== undefined) {
        query = query.range(rangeFrom, rangeTo);
      } else {
        query = query.limit(safeLimit);
      }
      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(withId).map((item) => sanitizeManagedEntityRecord(entityName, item));
    });
    if (isPublic) setCache(cacheKey, result);
    return result;
  },

  listArchived: async (sort = "id", maxRecords = 100, select = "*", rangeFrom, rangeTo) => {
    return createEntityAPI(entityName, tableName, false).list(sort, maxRecords, select, rangeFrom, rangeTo, { includeArchived: true });
  },

  get: async (id, select = "*") => {
    const user = await getSessionUser();
    const cacheKey = `${tableName}:get:${id}:${select}`;
    if (isPublic) {
      const cached = getCached(cacheKey);
      if (cached) return cached;
    }
    const result = await dedup(cacheKey, async () => {
      let query = supabaseAdmin.from(tableName).select(select).eq("id", id);
      const filterVal = isPublic ? null : await getBranchFilterValue(tableName, user);
      if (filterVal) {
        if (filterVal.type === "eq") {
          query = query.eq(filterVal.field, filterVal.value);
        } else if (filterVal.type === "in") {
          query = query.in(filterVal.field, filterVal.value);
        }
      }
      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      return sanitizeManagedEntityRecord(entityName, withId(data));
    });
    if (isPublic) setCache(cacheKey, result);
    return result;
  },

  // Batch lookup: fetch multiple rows by id in a single request instead of
  // N separate .get() calls. Use whenever a page needs to resolve a known,
  // bounded set of IDs (e.g. the handful of students referenced by a
  // top-10 exam-results list) — one round trip instead of N.
  getByIds: async (ids, select = "*") => {
    const uniqueIds = Array.from(new Set((ids || []).filter((id) => id !== undefined && id !== null)));
    if (uniqueIds.length === 0) return [];
    const user = await getSessionUser();
    const cacheKey = `${tableName}:getByIds:${uniqueIds.slice().sort().join(",")}:${select}`;
    if (isPublic) {
      const cached = getCached(cacheKey);
      if (cached) return cached;
    }
    const result = await dedup(cacheKey, async () => {
      let query = supabaseAdmin.from(tableName).select(select).in("id", uniqueIds);
      const filterVal = isPublic ? null : await getBranchFilterValue(tableName, user);
      if (filterVal) {
        if (filterVal.type === "eq") {
          query = query.eq(filterVal.field, filterVal.value);
        } else if (filterVal.type === "in") {
          query = query.in(filterVal.field, filterVal.value);
        }
      }
      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(withId).map((item) => sanitizeManagedEntityRecord(entityName, item));
    });
    if (isPublic) setCache(cacheKey, result);
    return result;
  },

  create: async (data) => {
    let user = await getSessionUser();
    if (!user) {
      cachedUserPromise = null;
      user = await getSessionUser();
    }
    if (!user) {
      throw { status: 401, message: "Authentication required: User not found." };
    }
    if (user.role !== "admin") {
      const permModule = ENTITY_TO_PERMISSION_MODULE[entityName];
      if (permModule && !hasPermission(user, permModule, "create")) {
        throw { status: 403, message: `Access Denied: Insufficient permissions to create ${entityName}.` };
      }
    }
    const userBranchId = user.role === "admin" ? null : (user.branch_id ? Number(user.branch_id) : null);
    const targetBranchId = (data.branch_id || data.branch_id === 0) ? Number(data.branch_id) : userBranchId;
    if (userBranchId && targetBranchId && userBranchId !== targetBranchId) {
      throw { status: 403, message: "Access Denied: You can only create records in your assigned branch." };
    }
    const now = new Date().toISOString();
    const managedConfig = MANAGED_AUTH_ENTITIES[entityName];
    const rawPassword = data?.password?.trim?.() || "";
    const normalizedLoginId = managedConfig
      ? normalizeLoginId(data?.[managedConfig.loginField])
      : "";

    const isNoUpdatedDate = tableName === "teacher_hadiya" || tableName === "teacher_payments" || tableName === "contact_messages";
    const payload = {
      ...withLifecycleDefaults(entityName, data),
      ...(managedConfig
        ? {
            [managedConfig.loginField]: normalizedLoginId,
            password: rawPassword ? MANAGED_PASSWORD_PLACEHOLDER : sanitizePasswordMarker(data?.password),
          }
        : {}),
      ...(!isNoUpdatedDate
        ? {
            created_date: data?.created_date ?? now,
            updated_date: now,
          }
        : {}),
    };

    if (user && user.role !== "admin" && user.branch_id) {
      const targetBranchId = Number(user.branch_id);
      if (TABLES_WITH_BRANCH_ID.has(tableName)) {
        payload.branch_id = targetBranchId;
      }
      if (TABLES_WITH_STUDENT_ID.has(tableName) && payload.student_id) {
        const studentIds = await getBranchStudentIds(targetBranchId);
        if (!studentIds.includes(Number(payload.student_id))) {
          throw { status: 403, message: "Access Denied: Student belongs to another branch." };
        }
      }
      if (TABLES_WITH_TEACHER_ID_INT.has(tableName) && payload.teacher_id) {
        const teacherIds = await getBranchTeacherIds(targetBranchId);
        if (!teacherIds.includes(Number(payload.teacher_id))) {
          throw { status: 403, message: "Access Denied: Teacher belongs to another branch." };
        }
      }
      if (TABLES_WITH_TEACHER_ID_STR.has(tableName) && payload.teacher_id) {
        const teacherStrIds = await getBranchTeacherStrIds(targetBranchId);
        if (!teacherStrIds.includes(String(payload.teacher_id))) {
          throw { status: 403, message: "Access Denied: Teacher belongs to another branch." };
        }
      }
    }

    const nullifyFields = ["branch_id", "class_id", "assigned_teacher_id", "student_id", "recipient_id", "hadiya_amount", "paid_amount", "total_fee", "due_amount", "amount", "start_date", "end_date", "result_publish_date", "joining_date", "date_of_birth", "admission_date", "paid_date", "effective_date"];
    nullifyFields.forEach(field => {
      if (payload[field] === "") payload[field] = null;
    });

    const { data: inserted, error } = await supabaseAdmin.from(tableName).insert(payload).select();
    if (error) throw error;
    
    if (tableName === 'teachers') {
      cachedTeacherIdsMap.clear();
      cachedTeacherStrIdsMap.clear();
    }
    if (tableName === 'students') {
      cachedStudentIdsMap.clear();
    }
    const record = inserted?.[0] || payload;
    if (managedConfig) {
      await syncManagedAuthUser({
        action: "upsert",
        role: managedConfig.role,
        nextLoginId: normalizedLoginId,
        password: rawPassword,
        profileId: record.id,
        metadata: { fullName: record.full_name_en || "" },
      });
    }
    if (isPublic) publicCache.clear();
    return sanitizeManagedEntityRecord(entityName, withId(record));
  },

  update: async (id, data, select = "*") => {
    const user = await getSessionUser();
    if (!user) {
      cachedUserPromise = null;
      throw { status: 401, message: "Authentication required: User not found." };
    }
    if (user.role !== "admin") {
      const permModule = ENTITY_TO_PERMISSION_MODULE[entityName];
      if (permModule && !hasPermission(user, permModule, "edit")) {
        throw { status: 403, message: `Access Denied: Insufficient permissions to update ${entityName}.` };
      }
    }
    const managedConfig = MANAGED_AUTH_ENTITIES[entityName];
    const isNoUpdatedDate = tableName === "teacher_hadiya" || tableName === "teacher_payments" || tableName === "contact_messages";
    let payload = { 
      ...data, 
      ...(!isNoUpdatedDate ? { updated_date: new Date().toISOString() } : {})
    };

    if (managedConfig) {
      let existingQuery = supabaseAdmin.from(tableName).select("*").eq("id", id);
      if (user && user.role !== "admin" && user.branch_id) {
        existingQuery = existingQuery.eq("branch_id", Number(user.branch_id));
      }
      const { data: existing, error: existingError } = await existingQuery.maybeSingle();

      if (existingError) throw existingError;
      if (!existing) {
        throw { status: 403, message: "Access Denied: Record not found." };
      }

      const currentLoginId = normalizeLoginId(existing?.[managedConfig.loginField]);
      const nextLoginId = normalizeLoginId(
        data?.[managedConfig.loginField] ?? existing?.[managedConfig.loginField],
      );
      const rawPassword = data?.password?.trim?.() || "";

      await syncManagedAuthUser({
        action: "upsert",
        role: managedConfig.role,
        currentLoginId,
        nextLoginId,
        password: rawPassword,
        profileId: id,
        metadata: { fullName: data?.full_name_en || existing?.full_name_en || "" },
      });

      payload = {
        ...payload,
        [managedConfig.loginField]: nextLoginId,
      };

      if ("password" in data) {
        payload.password = rawPassword
          ? MANAGED_PASSWORD_PLACEHOLDER
          : sanitizePasswordMarker(existing?.password);
      }
    }

    const nullifyFields = ["branch_id", "class_id", "assigned_teacher_id", "student_id", "recipient_id", "hadiya_amount", "paid_amount", "total_fee", "due_amount", "amount", "start_date", "end_date", "result_publish_date", "joining_date", "date_of_birth", "admission_date", "paid_date", "effective_date"];
    nullifyFields.forEach(field => {
      if (payload[field] === "") payload[field] = null;
    });

    delete payload.id;

    let query = supabaseAdmin.from(tableName).update(payload).eq("id", id);
    const filterVal = await getBranchFilterValue(tableName, user);
    if (filterVal) {
      if (filterVal.type === "eq") {
        query = query.eq(filterVal.field, filterVal.value);
      } else if (filterVal.type === "in") {
        query = query.in(filterVal.field, filterVal.value);
      }
    }

    const { data: updated, error } = await query.select(select).maybeSingle();
    if (error) throw error;

    if (tableName === 'teachers') {
      cachedTeacherIdsMap.clear();
      cachedTeacherStrIdsMap.clear();
    }
    if (tableName === 'students') {
      cachedStudentIdsMap.clear();
    }

    if (!updated) {
      const { data: rawRecord } = await supabaseAdmin.from(tableName).select("id").eq("id", id).maybeSingle();
      if (rawRecord) {
        throw { status: 403, message: "Access Denied: You do not have permission to modify this record." };
      } else {
        throw { status: 404, message: "Record not found." };
      }
    }

    if (isPublic) publicCache.clear();
    return sanitizeManagedEntityRecord(entityName, withId(updated));
  },

  delete: async (id) => {
    const user = await getSessionUser();
    if (!user) {
      cachedUserPromise = null;
      throw { status: 401, message: "Authentication required: User not found." };
    }
    if (user.role !== "admin") {
      const permModule = ENTITY_TO_PERMISSION_MODULE[entityName];
      if (permModule && !hasPermission(user, permModule, "delete")) {
        throw { status: 403, message: `Access Denied: Insufficient permissions to delete ${entityName}.` };
      }
    }

    const managedConfig = MANAGED_AUTH_ENTITIES[entityName];
    if (managedConfig) {
      let existingQuery = supabaseAdmin.from(tableName).select("*").eq("id", id);
      if (user && user.role !== "admin" && user.branch_id) {
        existingQuery = existingQuery.eq("branch_id", Number(user.branch_id));
      }
      const { data: existing, error: existingError } = await existingQuery.maybeSingle();

      if (existingError) throw existingError;
      if (!existing) {
        throw { status: 403, message: "Access Denied: Record not found." };
      }

      await syncManagedAuthUser({
        action: "delete",
        role: managedConfig.role,
        currentLoginId: existing?.[managedConfig.loginField],
      });
    }

    let query = supabaseAdmin.from(tableName).delete().eq("id", id);
    const filterVal = await getBranchFilterValue(tableName, user);
    if (filterVal) {
      if (filterVal.type === "eq") {
        query = query.eq(filterVal.field, filterVal.value);
      } else if (filterVal.type === "in") {
        query = query.in(filterVal.field, filterVal.value);
      }
    }

    const { data: deleted, error } = await query.select("id").maybeSingle();
    if (error) throw error;

    if (tableName === 'teachers') {
      cachedTeacherIdsMap.clear();
      cachedTeacherStrIdsMap.clear();
    }
    if (tableName === 'students') {
      cachedStudentIdsMap.clear();
    }

    if (!deleted) {
      const { data: rawRecord } = await supabaseAdmin.from(tableName).select("id").eq("id", id).maybeSingle();
      if (rawRecord) {
        throw { status: 403, message: "Access Denied: You do not have permission to delete this record." };
      } else {
        throw { status: 404, message: "Record not found." };
      }
    }

    if (isPublic) publicCache.clear();
    return { id };
  },

  filter: async (filterObj = {}, sortOrLimit = 100, maxRecords, select = "*", rangeFrom, rangeTo, options = {}) => {
    const user = await getSessionUser();
    const cacheKey = `${tableName}:filter:${JSON.stringify(filterObj)}:${JSON.stringify(sortOrLimit)}:${maxRecords}:${select}:${rangeFrom}:${rangeTo}:${!!options?.includeArchived}`;
    if (isPublic) {
      const cached = getCached(cacheKey);
      if (cached) return cached;
    }
    const result = await dedup(cacheKey, async () => {
      let query = supabaseAdmin.from(tableName).select(select);
      const filterVal = isPublic ? null : await getBranchFilterValue(tableName, user);
      if (filterVal) {
        if (filterVal.type === "eq") {
          query = query.eq(filterVal.field, filterVal.value);
        } else if (filterVal.type === "in") {
          query = query.in(filterVal.field, filterVal.value);
        }
      }

      if (TABLES_WITH_ARCHIVE.has(tableName) && !options?.includeArchived && !isPublic) {
        query = query.eq("is_archived", false);
      }

      Object.entries(filterObj)
        .filter(([, value]) => value !== undefined && value !== null)
        .forEach(([key, value]) => {
          query = query.eq(key, value);
        });

      const resolvedSort = typeof sortOrLimit === "object" ? sortOrLimit : null;
      const resolvedLimit = typeof sortOrLimit === "number" ? sortOrLimit : maxRecords ?? 100;
      const safeLimit = Math.min(resolvedLimit, MAX_SAFE_RECORDS);
      if (rangeFrom === undefined && resolvedLimit > MAX_SAFE_RECORDS && typeof console !== "undefined") {
        console.warn(
          `[appClient] ${entityName}.filter() requested ${resolvedLimit} records but is capped at ${MAX_SAFE_RECORDS}. ` +
          `If this view needs the complete dataset, use ${entityName}.listAll() instead.`
        );
      }

      if (resolvedSort && resolvedSort.field) {
        query = query.order(resolvedSort.field, { ascending: resolvedSort.direction !== "desc" });
      }
      if (rangeFrom !== undefined && rangeTo !== undefined) {
        query = query.range(rangeFrom, rangeTo);
      } else {
        query = query.limit(safeLimit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(withId).map((item) => sanitizeManagedEntityRecord(entityName, item));
    });
    if (isPublic) setCache(cacheKey, result);
    return result;
  },

  count: async (filterObj = {}, options = {}) => {
    const user = await getSessionUser();
    let query = supabaseAdmin.from(tableName).select("*", { count: "exact", head: true });
    const filterVal = await getBranchFilterValue(tableName, user);
    if (filterVal) {
      if (filterVal.type === "eq") {
        query = query.eq(filterVal.field, filterVal.value);
      } else if (filterVal.type === "in") {
        query = query.in(filterVal.field, filterVal.value);
      }
    }
    if (TABLES_WITH_ARCHIVE.has(tableName) && !options?.includeArchived && !isPublic) {
      query = query.eq("is_archived", false);
    }
    Object.entries(filterObj)
      .filter(([, value]) => value !== undefined && value !== null)
      .forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    const { count, error } = await query;
    if (error) throw error;
    return count ?? 0;
  },

  updateAllFields: async (id, data, select = "*") => {
    delete data.id;
    const { data: updated, error } = await supabaseAdmin
      .from(tableName)
      .update(data)
      .eq("id", id)
      .select(select)
      .single();
    if (error) throw error;
    if (isPublic) publicCache.clear();
    return sanitizeManagedEntityRecord(entityName, withId(updated));
  },

  search: async ({ query, fields, sort = "id", page = 1, pageSize = 20, select = "*", options = {} }) => {
    const user = await getSessionUser();
    const safePage = Math.max(1, page);
    const safeSize = Math.min(Math.max(1, pageSize), MAX_SAFE_RECORDS);
    const from = (safePage - 1) * safeSize;
    const to = from + safeSize - 1;
    const cacheKey = `${tableName}:search:${query}:${fields?.join(",")}:${sort}:${safePage}:${safeSize}:${select}:${!!options?.includeArchived}`;
    if (isPublic) {
      const cached = getCached(cacheKey);
      if (cached) return cached;
    }
    const result = await dedup(cacheKey, async () => {
      const filterVal = isPublic ? null : await getBranchFilterValue(tableName, user);
      let countQuery = supabaseAdmin.from(tableName).select("*", { count: "exact", head: true });
      let dataQuery = supabaseAdmin.from(tableName).select(select, { count: "exact" });
      if (filterVal) {
        if (filterVal.type === "eq") {
          countQuery = countQuery.eq(filterVal.field, filterVal.value);
          dataQuery = dataQuery.eq(filterVal.field, filterVal.value);
        } else if (filterVal.type === "in") {
          countQuery = countQuery.in(filterVal.field, filterVal.value);
          dataQuery = dataQuery.in(filterVal.field, filterVal.value);
        }
      }
      if (TABLES_WITH_ARCHIVE.has(tableName) && !options?.includeArchived && !isPublic) {
        countQuery = countQuery.eq("is_archived", false);
        dataQuery = dataQuery.eq("is_archived", false);
      }
      if (query && Array.isArray(fields) && fields.length > 0) {
        const filterStr = fields.map(f => `${f}.ilike.%${query}%`).join(",");
        countQuery = countQuery.or(filterStr);
        dataQuery = dataQuery.or(filterStr);
      }
      const desc = sort.startsWith("-");
      const sortField = desc ? sort.slice(1) : sort;
      dataQuery = dataQuery.order(sortField, { ascending: !desc }).range(from, to);
      const [countResult, dataResult] = await Promise.all([countQuery, dataQuery]);
      if (dataResult.error) throw dataResult.error;
      const total = countResult.count ?? dataResult.count ?? 0;
      const rows = (dataResult.data || []).map(withId).map((item) => sanitizeManagedEntityRecord(entityName, item));
      return { rows, total, page: safePage, pageSize: safeSize, totalPages: Math.ceil(total / safeSize) };
    });
    if (isPublic) setCache(cacheKey, result);
    return result;
  },

  paginatedList: async ({ sort = "id", page = 1, pageSize = 100, select = "*", options = {} }) => {
    const user = await getSessionUser();
    const safePage = Math.max(1, page);
    const safeSize = Math.min(Math.max(1, pageSize), MAX_SAFE_RECORDS);
    const from = (safePage - 1) * safeSize;
    const to = from + safeSize - 1;
    const cacheKey = `${tableName}:paginatedList:${sort}:${safePage}:${safeSize}:${select}:${!!options?.includeArchived}`;
    if (isPublic) {
      const cached = getCached(cacheKey);
      if (cached) return cached;
    }
    const result = await dedup(cacheKey, async () => {
      const filterVal = isPublic ? null : await getBranchFilterValue(tableName, user);
      let countQuery = supabaseAdmin.from(tableName).select("*", { count: "exact", head: true });
      let dataQuery = supabaseAdmin.from(tableName).select(select, { count: "exact" });
      if (filterVal) {
        if (filterVal.type === "eq") {
          countQuery = countQuery.eq(filterVal.field, filterVal.value);
          dataQuery = dataQuery.eq(filterVal.field, filterVal.value);
        } else if (filterVal.type === "in") {
          countQuery = countQuery.in(filterVal.field, filterVal.value);
          dataQuery = dataQuery.in(filterVal.field, filterVal.value);
        }
      }
      if (TABLES_WITH_ARCHIVE.has(tableName) && !options?.includeArchived && !isPublic) {
        countQuery = countQuery.eq("is_archived", false);
        dataQuery = dataQuery.eq("is_archived", false);
      }
      const desc = sort.startsWith("-");
      const sortField = desc ? sort.slice(1) : sort;
      dataQuery = dataQuery.order(sortField, { ascending: !desc }).range(from, to);
      const [countResult, dataResult] = await Promise.all([countQuery, dataQuery]);
      if (dataResult.error) throw dataResult.error;
      const total = countResult.count ?? dataResult.count ?? 0;
      const rows = (dataResult.data || []).map(withId).map((item) => sanitizeManagedEntityRecord(entityName, item));
      return { rows, total, page: safePage, pageSize: safeSize, totalPages: Math.ceil(total / safeSize) };
    });
    if (isPublic) setCache(cacheKey, result);
    return result;
  },

  // C1 fix: for the handful of views that genuinely need the complete
  // dataset (financial totals, promotion/certificate eligibility, the
  // "assign students to teacher" picker, etc.), this loops paginatedList()
  // in MAX_SAFE_RECORDS-sized pages until every row has been fetched.
  // MAX_SAFE_RECORDS itself is untouched — this issues multiple bounded
  // requests instead of one unbounded one, so Supabase never sees a query
  // asking for more than MAX_SAFE_RECORDS rows at a time.
  listAll: async ({ sort = "id", select = "*", options = {}, hardCap = 20000 } = {}) => {
    const pageSize = MAX_SAFE_RECORDS;
    let page = 1;
    let all = [];
    while (true) {
      const { rows, total } = await createEntityAPI(entityName, tableName, isPublic).paginatedList({
        sort, page, pageSize, select, options,
      });
      all = all.concat(rows);
      if (all.length >= total || rows.length < pageSize || all.length >= hardCap) {
        break;
      }
      page += 1;
    }
    return all;
  },
});

const PUBLIC_ENTITIES = [
  "AppSettings",
  "Branch",
  "Course",
  "Event",
  "Facility",
  "Faq",
  "Gallery",
  "GalleryCategory",
  "GalleryItem",
  "HeroSlide",
  "Notice",
  "NavbarItem",
  "PageSection",
  "Sponsor",
  "SuccessStory",
  "Testimonial",
  "Video",
  "VideoCategory",
  "Blog",
  "ContactInfo",
  "Teacher",
];

const entities = Object.fromEntries(
  Object.entries(ENTITY_TABLES).map(([entityName, tableName]) => [
    entityName,
    createEntityAPI(entityName, tableName, PUBLIC_ENTITIES.includes(entityName)),
  ]),
);

export const appClient = {
  entities,

  auth: {
    me: async () => {
      const data = await requestJson(`/api/auth/session?t=${Date.now()}`, { method: "GET", cache: "no-store" }).catch(() => null);
      if (!data?.authenticated || !data.user) {
        throw { status: 401, message: "Not authenticated" };
      }
      if (data.supabaseToken) {
        setSupabaseToken(data.supabaseToken);
        setAdminSupabaseToken(data.supabaseToken);
      }
      return data.user;
    },

    login: async (email, password, turnstileToken) => {
      cachedUserPromise = null;
      cachedStudentIdsMap.clear();
      cachedTeacherIdsMap.clear();
      const data = await requestJson("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ role: "admin", loginId: email, password, turnstileToken }),
      });
      if (data.supabaseToken) {
        setSupabaseToken(data.supabaseToken);
        setAdminSupabaseToken(data.supabaseToken);
      }
      return data.user;
    },

    portalLogin: async (role, loginId, password, turnstileToken) => {
      cachedUserPromise = null;
      cachedStudentIdsMap.clear();
      cachedTeacherIdsMap.clear();
      const data = await requestJson("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ role, loginId, password, turnstileToken }),
      });
      if (data.supabaseToken) {
        setSupabaseToken(data.supabaseToken);
        setAdminSupabaseToken(data.supabaseToken);
      }
      return data;
    },

    logout: async () => {
      cachedUserPromise = null;
      cachedStudentIdsMap.clear();
      cachedTeacherIdsMap.clear();
      await requestJson("/api/auth/logout", { method: "POST" });
    },

    redirectToLogin: (role = "admin") => {
      window.location.href = getLoginRoute(role);
    },
  },

  clearCache: () => publicCache.clear(),

  integrations: {
    Core: {
      UploadFile: async ({ file, folder = "rahmania", label = "" }) => {
        return uploadToCloudinary({ file, folder, label });
      },

      InvokeLLM: async (payload) => {
        const endpoint =
          (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_AI_FUNCTION_URL) ||
          (typeof import.meta !== "undefined" && import.meta.env?.VITE_AI_FUNCTION_URL);
        if (!endpoint) {
          throw new Error(
            "AI endpoint is not configured. Set NEXT_PUBLIC_AI_FUNCTION_URL (Next) or VITE_AI_FUNCTION_URL (Vite) to enable AI features.",
          );
        }
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error(`AI request failed with status ${response.status}`);
        return response.json();
      },
    },
  },

  appLogs: {
    logUserInApp: async () => undefined,
  },
};

export default appClient;
