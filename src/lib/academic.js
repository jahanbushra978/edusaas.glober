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

/**
 * Centrally determines if a student is assigned to a specific teacher.
 * Checks assigned_teacher_id (id or teacher_id) and assigned_batches.
 *
 * Semantics (unified across admin + public ranking):
 *  1. If the student has an explicit assigned_teacher_id, that teacher is the
 *     ONLY owner — no batch fallthrough. Returns true only for that teacher.
 *  2. Otherwise, if the teacher's assigned_batches includes "all classes"/"all",
 *     every student belongs to them.
 *  3. Otherwise, fuzzy batch / department / class-name matching applies.
 *
 * @param {Object} student - The student record.
 * @param {Object} teacher - The teacher record.
 * @returns {boolean} True if assigned.
 */
export function isStudentAssignedToTeacher(student, teacher) {
  if (!student || !teacher) return false;

  const stId = student.assigned_teacher_id !== null && student.assigned_teacher_id !== undefined && student.assigned_teacher_id !== ""
    ? String(student.assigned_teacher_id).trim().toLowerCase()
    : "";
  const tPkId = String(teacher.id).trim().toLowerCase();
  const tEmpId = teacher.teacher_id ? String(teacher.teacher_id).trim().toLowerCase() : "";
  const tCode = teacher.employee_code ? String(teacher.employee_code).trim().toLowerCase() : "";

  // 1. Direct assigned_teacher_id match takes highest priority
  if (stId !== "") {
    return stId === tPkId || (tEmpId && stId === tEmpId) || (tCode && stId === tCode);
  }

  // 2. Batch / Department / Class matching via teacher.assigned_batches
  if (teacher.assigned_batches) {
    const teacherBatches = String(teacher.assigned_batches)
      .split(",")
      .map(b => b.trim().toLowerCase())
      .filter(Boolean);

    if (teacherBatches.length === 0) return false;
    if (teacherBatches.includes("all classes") || teacherBatches.includes("all")) return true;

    const studentBatch = (student.batch || "").toLowerCase().trim();
    const studentDept = (student.department || student.session || "").toLowerCase().trim();
    const studentClassName = (student.class_name || "").toLowerCase().trim();

    return teacherBatches.some(tb =>
      tb && (
        (studentBatch && (studentBatch === tb || studentBatch.includes(tb) || tb.includes(studentBatch))) ||
        (studentDept && (studentDept === tb || studentDept.includes(tb) || tb.includes(studentDept))) ||
        (studentClassName && (studentClassName === tb || studentClassName.includes(tb) || tb.includes(studentClassName)))
      )
    );
  }

  return false;
}

/**
 * Centrally resolves the assigned teacher object for a student from a list of teachers.
 * 
 * @param {Object} student - The student record.
 * @param {Array} teachers - List of teacher records.
 * @returns {Object|null} Matching teacher record or null.
 */
export function getStudentAssignedTeacher(student, teachers) {
  if (!student || !Array.isArray(teachers) || teachers.length === 0) return null;

  // Priority 1: Direct assigned_teacher_id match
  if (student.assigned_teacher_id !== null && student.assigned_teacher_id !== undefined && student.assigned_teacher_id !== "") {
    const stId = String(student.assigned_teacher_id).trim().toLowerCase();
    const directMatch = teachers.find(t => {
      const tPkId = String(t.id).trim().toLowerCase();
      const tEmpId = t.teacher_id ? String(t.teacher_id).trim().toLowerCase() : "";
      const tCode = t.employee_code ? String(t.employee_code).trim().toLowerCase() : "";
      return stId === tPkId || (tEmpId && stId === tEmpId) || (tCode && stId === tCode);
    });
    if (directMatch) return directMatch;
  }

  // Priority 2: Batch / Class assignment match via teacher.assigned_batches
  const batchMatch = teachers.find(t => {
    if (!t.assigned_batches) return false;
    const teacherBatches = String(t.assigned_batches)
      .split(",")
      .map(b => b.trim().toLowerCase())
      .filter(Boolean);

    if (teacherBatches.length === 0) return false;
    if (teacherBatches.includes("all classes") || teacherBatches.includes("all")) return false;

    const studentBatch = (student.batch || "").toLowerCase().trim();
    const studentDept = (student.department || student.session || "").toLowerCase().trim();
    const studentClassName = (student.class_name || "").toLowerCase().trim();

    return teacherBatches.some(tb => 
      tb && (
        (studentBatch && (studentBatch === tb || studentBatch.includes(tb) || tb.includes(studentBatch))) || 
        (studentDept && (studentDept === tb || studentDept.includes(tb) || tb.includes(studentDept))) || 
        (studentClassName && (studentClassName === tb || studentClassName.includes(tb) || tb.includes(studentClassName)))
      )
    );
  });

  return batchMatch || null;
}

/**
 * Resolves active subjects for a student based on branch academic structure.
 * Returns array of active subject objects or null if no structure is available.
 */
export function resolveActiveSubjectsForStudent(student, academicStructure) {
  if (!Array.isArray(academicStructure) || academicStructure.length === 0 || !student) {
    return null;
  }

  // 1. Locate the class
  let cls = null;
  const sClassId = String(student.class_id || "");
  const sSessionId = String(student.session_id || "");
  const sClassName = String(student.class_name || "").trim().toLowerCase();

  if (sClassId) {
    cls = academicStructure.find(c => String(c.id) === sClassId);
  }

  // Fallback: match by section ID
  if (!cls && (sSessionId || sClassId)) {
    const targetSecId = sSessionId || sClassId;
    cls = academicStructure.find(c => 
      Array.isArray(c.sections) && c.sections.some(s => String(s.id) === targetSecId)
    );
  }

  // Fallback: match by class name
  if (!cls && sClassName) {
    cls = academicStructure.find(c => {
      const bn = String(c.class_name?.bn || "").trim().toLowerCase();
      const en = String(c.class_name?.en || "").trim().toLowerCase();
      const ar = String(c.class_name?.ar || "").trim().toLowerCase();
      return bn === sClassName || en === sClassName || ar === sClassName ||
             sClassName.includes(bn) || sClassName.includes(en) || sClassName.includes(ar);
    });
  }

  if (!cls) return null;

  // 2. If group is specified, find group subjects
  const sGroupId = String(student.class_group_id || student.group_id || student.group || "");
  if (sGroupId && Array.isArray(cls.groups)) {
    const grp = cls.groups.find(g => 
      String(g.id) === sGroupId || 
      String(g.group_name?.bn || "").toLowerCase() === sGroupId.toLowerCase() ||
      String(g.group_name?.en || "").toLowerCase() === sGroupId.toLowerCase()
    );
    if (grp && Array.isArray(grp.subjects) && grp.subjects.length > 0) {
      return grp.subjects;
    }
  }

  // 3. Class subjects
  if (Array.isArray(cls.subjects) && cls.subjects.length > 0) {
    return cls.subjects;
  }

  // 4. Section subjects fallback
  if (Array.isArray(cls.sections)) {
    const sec = cls.sections.find(s => String(s.id) === sSessionId || String(s.id) === sClassId);
    if (sec && Array.isArray(sec.subjects) && sec.subjects.length > 0) {
      return sec.subjects;
    }
    const secWithSubj = cls.sections.find(s => Array.isArray(s.subjects) && s.subjects.length > 0);
    if (secWithSubj) return secWithSubj.subjects;
  }

  return null;
}

/**
 * Filters out deleted subjects from marks_details according to the branch academic structure.
 * Ensures deleted subjects with 0 or empty marks are NOT displayed and DO NOT cause failure or lower GPA.
 */
export function filterActiveMarksDetails(marksDetails, student, academicStructure) {
  const rawMarks = Array.isArray(marksDetails) ? marksDetails : [];
  if (rawMarks.length === 0) return [];

  const activeSubjects = resolveActiveSubjectsForStudent(student, academicStructure);

  if (activeSubjects && activeSubjects.length > 0) {
    const activeSubjectIds = new Set(activeSubjects.map(s => String(s.id || s.subject_id)));
    const activeSubjectNames = new Set();
    
    activeSubjects.forEach(s => {
      if (typeof s.subject_name === "object" && s.subject_name !== null) {
        Object.values(s.subject_name).forEach(v => {
          if (v) activeSubjectNames.add(String(v).trim().toLowerCase());
        });
      } else if (s.subject_name) {
        activeSubjectNames.add(String(s.subject_name).trim().toLowerCase());
      }
      if (s.name) activeSubjectNames.add(String(s.name).trim().toLowerCase());
    });

    return rawMarks.filter(m => {
      const subId = String(m.subject_id || m.id || "");
      if (subId && activeSubjectIds.has(subId)) return true;

      const subName = typeof m.subject_name === "object" && m.subject_name !== null
        ? Object.values(m.subject_name).find(v => v) || ""
        : String(m.subject_name || "");

      const normalizedName = String(subName).trim().toLowerCase();
      if (normalizedName && activeSubjectNames.has(normalizedName)) return true;

      // If it is NOT in active subjects:
      // It is a deleted subject! Filter it out.
      return false;
    });
  }

  // Fallback if academicStructure is not available: exclude empty unentered rows with no marks/pass_marks
  return rawMarks.filter(m => {
    if ((m.obtained_marks === "" || m.obtained_marks === null || m.obtained_marks === undefined) && (!m.pass_marks || !m.full_marks)) {
      return false;
    }
    return true;
  });
}



