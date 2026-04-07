import { NextRequest, NextResponse } from "next/server";
import { sectionIds } from "@/lib/sections";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const utcHour = new Date().getUTCHours();
  const edition: "morning" | "evening" = utcHour < 12 ? "morning" : "evening";

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    `https://${request.headers.get("host")}`;

  const results: { sectionId: string; success: boolean; error?: string }[] = [];

  for (const sectionId of sectionIds) {
    try {
      const res = await fetch(`${baseUrl}/api/news`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionId, edition }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      console.log(`[cron] ✓ ${sectionId} (${edition})`);
      results.push({ sectionId, success: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[cron] ✗ ${sectionId}: ${message}`);
      results.push({ sectionId, success: false, error: message });
    }

    // 2 second delay between requests to avoid rate limits
    await sleep(2000);
  }

  return NextResponse.json({
    success: true,
    edition,
    sections: results,
    timestamp: new Date().toISOString(),
  });
}
