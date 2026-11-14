export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { jsonBody, route } from "@/lib/http";
import { z } from "zod";

const rosterSchema = z.object({
  date: z.string().min(10),
  dayName: z.string().min(2),
  householdName: z.string().trim().min(2),
  contactNumber: z.string().trim().min(5),
  mealType: z.enum(["LUNCH", "DINNER", "BOTH"]).default("BOTH"),
  notes: z.string().optional(),
});

export const GET = route(async () => {
  const a = await requireAuth();
  const rosters = await db.mealRoster.findMany({
    where: { mosqueId: a.mosque.id },
    orderBy: { date: "asc" },
  });
  return { rosters };
});

export const POST = route(async (req: NextRequest) => {
  const a = await requireAuth();
  const body = (await jsonBody(req)) as any;

  if (body?.action === "update-status" && body?.id) {
    const updated = await db.mealRoster.update({
      where: { id: body.id },
      data: { status: body.status || "DELIVERED" },
    });
    return { roster: updated };
  }

  const data = rosterSchema.parse(body);
  const roster = await db.mealRoster.create({
    data: {
      mosqueId: a.mosque.id,
      date: data.date,
      dayName: data.dayName,
      householdName: data.householdName,
      contactNumber: data.contactNumber,
      mealType: data.mealType,
      notes: data.notes,
    },
  });
  return { roster };
});

export const DELETE = route(async (req: NextRequest) => {
  const a = await requireAuth();
  const sp = req.nextUrl.searchParams;
  const id = sp.get("id");
  if (!id) return { ok: false };
  await db.mealRoster.deleteMany({ where: { id, mosqueId: a.mosque.id } });
  return { ok: true };
});
