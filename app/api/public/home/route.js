import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { fetchHomePageData, HOME_PAGE_CACHE_TAG } from "../../../../src/lib/home-data.js";

export const runtime = "nodejs";
export const revalidate = 7200;

export async function GET() {
  const startTs = Date.now();

  try {
    const data = await fetchHomePageData();

    const response = NextResponse.json({
      ok: true,
      elapsed: Date.now() - startTs,
      ...data,
    });

    // Let Vercel Edge CDN cache this response for 1 hour, serve stale up to 2 hours
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=7200"
    );

    return response;
  } catch (error) {
    console.error("[Home API]", error?.message);
    return NextResponse.json({ ok: false, message: "Internal server error" }, { status: 500 });
  }
}


export async function POST(request) {
  // Require a secret token to prevent unauthorized cache purge if secret is configured
  const expectedSecret = process.env.CACHE_PURGE_SECRET || process.env.CRON_SECRET;
  const authHeader = request?.headers?.get("authorization");
  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }
  revalidateTag(HOME_PAGE_CACHE_TAG);
  return NextResponse.json({ ok: true, message: "Home page cache cleared" });
}
