export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { jsonBody, route } from "@/lib/http";
import { z } from "zod";

const studentSchema = z.object({
  name: z.string().trim().min(2),
  guardianName: z.string().trim().min(2),
  guardianPhone: z.string().trim().min(5),
  batch: z.string().default("Morning"),
  progressLevel: z.string().default("Qaida"),
  rollNo: z.string().optional(),
  photoUrl: z.string().optional(),
  currentLesson: z.string().optional(),
});

const attendanceSchema = z.object({
  studentId: z.string().min(1),
  date: z.string().min(10),
  status: z.enum(["PRESENT", "ABSENT", "EXCUSED"]),
  sabaqRating: z.string().optional(),
  notes: z.string().optional(),
});

const DEFAULT_SAMPLE_STUDENTS = [
  {
    name: "মুহাম্মদ আব্দুল্লাহ",
    guardianName: "হাজী রফিকুল ইসলাম",
    guardianPhone: "01711223344",
    batch: "Morning",
    progressLevel: "Qaida",
    rollNo: "০১",
    photoUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80",
    currentLesson: "কায়দা পৃষ্ঠা ১৪ (হরকতের মাশ্‌ক)",
  },
  {
    name: "আয়েশা সিদ্দীকা",
    guardianName: "মাও: মাহবুবুর রহমান",
    guardianPhone: "01812345678",
    batch: "Morning",
    progressLevel: "Ampara",
    rollNo: "০২",
    photoUrl: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=200&auto=format&fit=crop&q=80",
    currentLesson: "সূরা নাবা (১ম রুকু মুখস্থ)",
  },
  {
    name: "আব্দুর রহমান",
    guardianName: "মোঃ কামাল হোসেন",
    guardianPhone: "01911987654",
    batch: "Morning",
    progressLevel: "Nazera",
    rollNo: "০৩",
    photoUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=200&auto=format&fit=crop&q=80",
    currentLesson: "সূরা কাহাফ (পৃষ্ঠা ২৯৩)",
  },
  {
    name: "ফাতেমা আক্তার",
    guardianName: "মোঃ আনোয়ারুল হক",
    guardianPhone: "01722112233",
    batch: "Morning",
    progressLevel: "Qaida",
    rollNo: "০৪",
    photoUrl: "https://images.unsplash.com/photo-1595454223600-91fb5ac24458?w=200&auto=format&fit=crop&q=80",
    currentLesson: "কায়দা পৃষ্ঠা ৮ (তানভীন ও সাকিন)",
  },
  {
    name: "মুহাম্মদ তালহা",
    guardianName: "মুফতি আব্দুল বাতেন",
    guardianPhone: "01611445566",
    batch: "Afternoon",
    progressLevel: "Hifz",
    rollNo: "০৫",
    photoUrl: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=200&auto=format&fit=crop&q=80",
    currentLesson: "৩য় পারা (পৃষ্ঠা ৪২ - নতুন সবক)",
  },
  {
    name: "উম্মে হাবিবা",
    guardianName: "মোঃ জহিরুল ইসলাম",
    guardianPhone: "01555667788",
    batch: "Afternoon",
    progressLevel: "Ampara",
    rollNo: "০৬",
    photoUrl: "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=200&auto=format&fit=crop&q=80",
    currentLesson: "সূরা মুলক (পৃষ্ঠা ৫৬২ - রিভিশন)",
  },
];

export const GET = route(async () => {
  const a = await requireAuth();
  let students = await db.maktabStudent.findMany({
    where: { mosqueId: a.mosque.id },
    include: {
      attendances: {
        take: 7,
        orderBy: { date: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Auto-seed if empty for high realism
  if (students.length === 0) {
    const today = new Date().toISOString().slice(0, 10);
    for (const s of DEFAULT_SAMPLE_STUDENTS) {
      const created = await db.maktabStudent.create({
        data: {
          mosqueId: a.mosque.id,
          ...s,
        },
      });
      await db.maktabAttendance.create({
        data: {
          studentId: created.id,
          date: today,
          status: "PRESENT",
          sabaqRating: "EXCELLENT",
          notes: "মাশাআল্লাহ খুব সুন্দর তিলাওয়াত করেছে",
        },
      });
    }
    students = await db.maktabStudent.findMany({
      where: { mosqueId: a.mosque.id },
      include: {
        attendances: {
          take: 7,
          orderBy: { date: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  return { students };
});

export const POST = route(async (req: NextRequest) => {
  const a = await requireAuth();
  const body = (await jsonBody(req)) as any;

  if (body?.type === "attendance") {
    const data = attendanceSchema.parse(body);
    const row = await db.maktabAttendance.upsert({
      where: { studentId_date: { studentId: data.studentId, date: data.date } },
      update: { status: data.status, sabaqRating: data.sabaqRating, notes: data.notes },
      create: { studentId: data.studentId, date: data.date, status: data.status, sabaqRating: data.sabaqRating, notes: data.notes },
    });
    return { attendance: row };
  }

  const data = studentSchema.parse(body);
  const student = await db.maktabStudent.create({
    data: {
      mosqueId: a.mosque.id,
      name: data.name,
      guardianName: data.guardianName,
      guardianPhone: data.guardianPhone,
      batch: data.batch,
      progressLevel: data.progressLevel,
      rollNo: data.rollNo || null,
      photoUrl: data.photoUrl || null,
      currentLesson: data.currentLesson || null,
    },
  });
  return { student };
});

export const PATCH = route(async (req: NextRequest) => {
  const a = await requireAuth();
  const body = (await jsonBody(req)) as any;
  const { id, ...rest } = body;
  if (!id) return { ok: false };
  const updated = await db.maktabStudent.update({
    where: { id, mosqueId: a.mosque.id },
    data: rest,
  });
  return { student: updated };
});

export const DELETE = route(async (req: NextRequest) => {
  const a = await requireAuth();
  const sp = req.nextUrl.searchParams;
  const id = sp.get("id");
  if (!id) return { ok: false };
  await db.maktabAttendance.deleteMany({ where: { studentId: id } });
  await db.maktabStudent.deleteMany({ where: { id, mosqueId: a.mosque.id } });
  return { ok: true };
});
