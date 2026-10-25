import { NextResponse } from "next/server";
import { verifyPlatformSession } from "@/lib/platform-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const session = await verifyPlatformSession(request);

  if (!session) {
    return NextResponse.json(
      { ok: false, isPlatformOwner: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    ok: true,
    isPlatformOwner: true,
    owner: {
      id: session.sub,
      email: session.email,
      fullName: session.fullName,
      role: session.role,
    },
  });
}
