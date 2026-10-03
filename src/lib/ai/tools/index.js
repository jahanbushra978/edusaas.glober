import { getMyProfile, getMyAttendance, getMyResult, searchStudents, generateAcademicSummary } from "./studentTools";
import { getMyDueFees, collectStudentFee, reversePaymentLedger, requestStudentDeactivation } from "./feeTools";
import { markClassAttendance, draftNotice } from "./attendanceTools";

// 1. Tool Schemas with JSON Schema specifications
export const AI_TOOL_SCHEMAS = [
  {
    name: "get_my_profile",
    description: "Get profile information for the currently logged-in student or user.",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_my_attendance",
    description: "Get attendance statistics and recent attendance history for the logged-in student.",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_my_result",
    description: "Get recent exam results and subject scores for the logged-in student.",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_my_due_fees",
    description: "Check current due fees and payment status for the logged-in student.",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "search_students",
    description: "Search for students within authorized branch and class scope. Returns anonymized student references.",
    parameters: {
      type: "object",
      properties: {
        className: { type: "string", description: "Filter by class name (e.g., 'Hifz', 'Najera', 'Play')" },
        limit: { type: "number", description: "Max results to return (default 10)" },
      },
    },
  },
  {
    name: "generate_academic_summary",
    description: "Generate summary performance and attendance analytics for a branch or class.",
    parameters: {
      type: "object",
      properties: {
        branchId: { type: "string", description: "Optional branch ID" },
      },
    },
  },
  {
    name: "mark_class_attendance",
    description: "Mark attendance for a student (present, absent, late, leave). Requires teacher or admin privileges.",
    parameters: {
      type: "object",
      properties: {
        studentId: { type: "number", description: "The database ID of the student" },
        status: { type: "string", enum: ["present", "absent", "late", "leave"], description: "Attendance status" },
        date: { type: "string", description: "Attendance date in YYYY-MM-DD format (defaults to today)" },
        notes: { type: "string", description: "Optional notes" },
      },
      required: ["studentId", "status"],
    },
  },
  {
    name: "draft_notice",
    description: "Create a draft school notice or announcement.",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "Title of the notice" },
        content: { type: "string", description: "Content of the notice" },
        category: { type: "string", description: "Category (e.g., general, exam, holiday)" },
      },
      required: ["title", "content"],
    },
  },
  {
    name: "collect_student_fee",
    description: "Initiate fee collection for a student. Triggers a secure signed confirmation popup. Amount is derived deterministically from the database.",
    parameters: {
      type: "object",
      properties: {
        studentId: { type: "number", description: "The database ID of the student" },
        month: { type: "string", description: "Target billing month in YYYY-MM format (e.g., '2026-09')" },
      },
      required: ["studentId"],
    },
  },
  {
    name: "reverse_payment_ledger",
    description: "Request reversal for an erroneous payment entry. Requires interactive confirmation.",
    parameters: {
      type: "object",
      properties: {
        paymentId: { type: "number", description: "The ID of the payment transaction to reverse" },
      },
      required: ["paymentId"],
    },
  },
  {
    name: "request_student_deactivation",
    description: "Request archiving/deactivating a student account (Soft delete). Requires interactive confirmation.",
    parameters: {
      type: "object",
      properties: {
        studentId: { type: "number", description: "The ID of the student to deactivate" },
      },
      required: ["studentId"],
    },
  },
];

// Tool Implementation Dispatch Table
const TOOL_HANDLERS = {
  get_my_profile: getMyProfile,
  get_my_attendance: getMyAttendance,
  get_my_result: getMyResult,
  get_my_due_fees: getMyDueFees,
  search_students: searchStudents,
  generate_academic_summary: generateAcademicSummary,
  mark_class_attendance: markClassAttendance,
  draft_notice: draftNotice,
  collect_student_fee: collectStudentFee,
  reverse_payment_ledger: reversePaymentLedger,
  request_student_deactivation: requestStudentDeactivation,
};

/**
 * Returns available tool schemas filtered by caller's permissions
 */
export function getAvailableToolsForContext(context) {
  const allowed = context?.allowedTools || [];
  return AI_TOOL_SCHEMAS.filter((schema) => allowed.includes(schema.name));
}

/**
 * Executes a requested tool with zero-trust validation & pseudonymization
 */
export async function executeAITool(toolName, args, context, pseudonymMap) {
  const allowed = context?.allowedTools || [];

  if (!allowed.includes(toolName)) {
    return {
      ok: false,
      error: "PERMISSION_DENIED",
      message: `You do not have permission to execute the action '${toolName}'.`,
    };
  }

  const handler = TOOL_HANDLERS[toolName];
  if (!handler) {
    return {
      ok: false,
      error: "NOT_FOUND",
      message: `Unknown tool '${toolName}'.`,
    };
  }

  try {
    return await handler(args, context, pseudonymMap);
  } catch (err) {
    console.error(`AI Tool Execution Error [${toolName}]:`, err);
    return {
      ok: false,
      error: "EXECUTION_ERROR",
      message: err?.message || "An unexpected error occurred during tool execution.",
    };
  }
}
