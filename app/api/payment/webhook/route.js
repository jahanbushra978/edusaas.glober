import { NextResponse } from "next/server";
import { handlePaymentWebhook } from "../../../../src/lib/payment/webhookHandler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const url = new URL(request.url);
    const gateway = url.searchParams.get("gateway") || "bkash";
    const signature = request.headers.get("x-signature") || request.headers.get("signature") || "";
    const payload = await request.json();

    const result = await handlePaymentWebhook({ gateway, payload, signature });

    if (!result.ok) {
      return NextResponse.json({ ok: false, message: result.message }, { status: result.status || 400 });
    }

    return NextResponse.json({ ok: true, data: result });
  } catch (err) {
    return NextResponse.json({ ok: false, message: err.message }, { status: 500 });
  }
}
