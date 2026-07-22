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


export async function POST() {
  revalidateTag(HOME_PAGE_CACHE_TAG);
  return NextResponse.json({ ok: true, message: "Home page cache cleared" });
}
