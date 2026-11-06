import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// In-memory active live rooms fallback
let ACTIVE_ROOMS_STORE = [
  {
    id: "room-default-live",
    room_code: "ROOM-LIVE-101",
    teacher_id: "teacher-1",
    teacher_name: "মুফতী মাওলানা ক্বারী আহমাদুল্লাহ",
    title: "সূরা আল-ফাতিহা ও তাজবীদ মাশক লাইভ গ্রুপ ক্লাস",
    description: "সকল শিক্ষার্থীদের সাথে সরাসরি ১-অন-মেনি ফেসবুক-স্টাইল লাইভ কুরআন ক্লাস",
    surah_number: 1,
    ayah_number: 1,
    is_active: true,
    max_participants: 25,
    participant_count: 6,
    started_at: new Date().toISOString(),
  },
];

export async function GET() {
  try {
    const adminClient = createSupabaseAdminClient();
    const { data, error } = await adminClient
      .from("teacher_live_rooms")
      .select("*, live_room_participants(*)")
      .eq("is_active", true)
      .order("started_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return NextResponse.json({ ok: true, source: "database", rooms: data });
    }
  } catch {
    // Database fallback
  }

  return NextResponse.json({ ok: true, source: "in_memory", rooms: ACTIVE_ROOMS_STORE });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      teacher_id,
      teacher_name,
      title,
      description,
      surah_number,
      ayah_number,
      max_participants,
    } = body;

    const room_code = `ROOM-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRoom = {
      id: crypto.randomUUID(),
      room_code,
      room_id: room_code, // Schema backward-compatibility with room_id column
      teacher_id: teacher_id || "teacher-1",
      teacher_name: teacher_name || "প্রধান উস্তাদ",
      title: title || "দৈনন্দিন কুরআন ও তাজবীদ মাশক",
      description: description || "গ্রুপ লাইভ ক্লাস — ফেসবুক ও জুম স্টাইল ক্লাসরুম",
      surah_number: Number(surah_number) || 1,
      ayah_number: Number(ayah_number) || 1,
      is_active: true,
      max_participants: Number(max_participants) || 50,
      participant_count: 1,
      started_at: new Date().toISOString(),
    };

    try {
      const adminClient = createSupabaseAdminClient();
      const { data, error } = await adminClient
        .from("teacher_live_rooms")
        .insert(newRoom)
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({ ok: true, source: "database", room: data });
      }
    } catch {
      // Fallback
    }

    ACTIVE_ROOMS_STORE.unshift(newRoom);
    return NextResponse.json({ ok: true, source: "in_memory", room: newRoom });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const { room_id, surah_number, ayah_number, is_active } = body;

    if (!room_id) {
      return NextResponse.json({ ok: false, error: "Room ID is required" }, { status: 400 });
    }

    try {
      const adminClient = createSupabaseAdminClient();
      const updates = {};
      if (surah_number !== undefined) updates.surah_number = Number(surah_number);
      if (ayah_number !== undefined) updates.ayah_number = Number(ayah_number);
      if (is_active !== undefined) updates.is_active = is_active;

      const { data } = await adminClient
        .from("teacher_live_rooms")
        .update(updates)
        .eq("id", room_id)
        .select()
        .maybeSingle();

      if (data) {
        return NextResponse.json({ ok: true, source: "database", room: data });
      }
    } catch {
      // Fallback
    }

    // Update in memory
    const room = ACTIVE_ROOMS_STORE.find((r) => r.id === room_id);
    if (room) {
      if (surah_number !== undefined) room.surah_number = Number(surah_number);
      if (ayah_number !== undefined) room.ayah_number = Number(ayah_number);
      if (is_active !== undefined) room.is_active = is_active;
    }

    return NextResponse.json({ ok: true, source: "in_memory", room });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

