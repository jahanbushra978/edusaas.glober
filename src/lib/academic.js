// In-memory cache for memoizing dynamic display name resolutions.
// Keys are composite strings of classId, sessionId, classGroupId, and lang.
const displayNameCache = new Map();

/**
 * Centrally resolves the full academic display name of a student's class at runtime.
 * Format: Class Name (Session Name) (Group Name)
 * 
 * @param {string} classId - The base class ID.
 * @param {string} sessionId - The session/section ID.
 * @param {string} classGroupId - The class group ID.
 * @param {Array} academicStructure - The academic structure JSON array from Branch.
 * @param {string} lang - Language code ('bn', 'en', 'ar').
 * @returns {string} Fully formatted and localized display name.
 */
export function resolveAcademicDisplayName(classId, sessionId, classGroupId, academicStructure, lang = 'en') {
  if (!Array.isArray(academicStructure) || !classId) return "";

  // 1. Generate cache key
  const cacheKey = `${classId}:${sessionId || ""}:${classGroupId || ""}:${lang}`;
  if (displayNameCache.has(cacheKey)) {
    return displayNameCache.get(cacheKey);
  }

  // 2. Look up the class
  let cls = academicStructure.find(c => String(c.id) === String(classId));
  let resolvedSessionId = sessionId;

  // Fallback lookup: if classId matches a section/session ID, resolve the parent class
  if (!cls) {
    cls = academicStructure.find(c => 
      Array.isArray(c.sections) && c.sections.some(s => String(s.id) === String(classId))
    );
    if (cls) {
      resolvedSessionId = classId;
    }
  }

  if (!cls) return "";

  // 3. Localize Helper
  const getLocalizedValue = (obj) => {
    if (!obj) return "";
    if (typeof obj === "string") return obj;
    return obj[lang] || obj['bn'] || obj['en'] || obj['ar'] || Object.values(obj).find(v => v) || "";
  };

  const className = getLocalizedValue(cls.class_name);
  let sessionName = "";
  let groupName = "";

  // 4. Resolve session/section name
  if (resolvedSessionId && Array.isArray(cls.sections)) {
    const sec = cls.sections.find(s => String(s.id) === String(resolvedSessionId));
    if (sec) {
      sessionName = getLocalizedValue(sec.section_name) || getLocalizedValue(sec.section);
    }
  }

  // 5. Resolve group name
  if (classGroupId && Array.isArray(cls.groups)) {
    const grp = cls.groups.find(g => String(g.id) === String(classGroupId));
    if (grp) {
      groupName = getLocalizedValue(grp.group_name);
    }
  }

  // 6. Construct full name
  let parts = [className];
  if (sessionName) parts.push(`(${sessionName})`);
  if (groupName) parts.push(`(${groupName})`);

  const result = parts.filter(Boolean).join(" ");
  
  // 7. Store in cache
  displayNameCache.set(cacheKey, result);
  return result;
}

/**
 * Clears the display name resolution cache.
 * Useful when the academic structure is updated.
 */
export function clearAcademicCache() {
  displayNameCache.clear();
}

/**
 * Determines if a student belongs to a specific class option (which can be a class ID or section/session ID).
 * Handles both legacy formats (where section ID was stored in class_id) and new formats
 * (where class_id is the parent class ID and session_id is the section ID).
 * 
 * @param {Object} student - The student record.
 * @param {string} optionId - The selected class filter option ID.
 * @param {Array} academicStructure - The academic structure JSON array from Branch.
 * @returns {boolean} True if the student matches the option.
 */
export function isStudentInClassOption(student, optionId, academicStructure) {
  if (!optionId || optionId === "all" || optionId === "all_classes" || optionId === "all_branches") return true;
  if (!student) return false;

  // If there's no academic structure, perform fallback check
  if (!Array.isArray(academicStructure)) {
    return String(student.class_id) === String(optionId) || String(student.session_id) === String(optionId);
  }

  // 1. Check if optionId is a section ID in any class
  for (const c of academicStructure) {
    if (Array.isArray(c.sections)) {
      const sec = c.sections.find(s => String(s.id) === String(optionId));
      if (sec) {
        // optionId is a section ID.
        // Match student if:
        // - Legacy: student.class_id stores the section ID.
        // - New: student.class_id stores the parent class ID AND student.session_id stores the section ID.
        return String(student.class_id) === String(optionId) || 
               (String(student.class_id) === String(c.id) && String(student.session_id) === String(optionId));
      }
    }
  }

  // 2. Check if optionId is a parent class ID
  const cls = academicStructure.find(c => String(c.id) === String(optionId));
  if (cls) {
    // optionId is a class ID.
    // Match student if:
    // - student.class_id matches the class ID.
    // - Legacy: student.class_id matches one of the section IDs of this class.
    if (String(student.class_id) === String(optionId)) return true;
    if (Array.isArray(cls.sections)) {
      return cls.sections.some(sec => String(student.class_id) === String(sec.id));
    }
  }

  // 3. Last fallback: direct matches
  return String(student.class_id) === String(optionId) || String(student.session_id) === String(optionId);
}

