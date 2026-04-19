import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 300;

const SECTION_IDS = [
  "latest", "australia", "politics", "finance",
  "business", "banking", "worldcup", "sports", "running",
];

function getEdition(): "morning" | "midday" | "evening" | "midnight" {
  const h = new Date().getUTCHours();
  if (h === 19 || (h >= 17 && h < 21)) return "morning";
  if (h === 1  || (h >= 23 || h < 3))  return "midday";
  if (h === 7  || (h >= 5  && h < 9))  return "evening";
  return "midnight";
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const edition = getEdition();
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    `https://${request.headers.get("host")}`;

  const results: Record<string, string> = {};

  // Fetch all news sections sequentially with delay
  for (const sectionId of SECTION_IDS) {
    try {
      const res = await fetch(`${baseUrl}/api/news`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionId, edition, bypassCache: true }),
      });
      results[sectionId] = res.ok ? "ok" : `error ${res.status}`;
      console.log(`[cron] ${res.ok ? "✓" : "✗"} ${sectionId} (${edition})`);
    } catch (e) {
      results[sectionId] = `failed: ${e}`;
      console.error(`[cron] ✗ ${sectionId}: ${e}`);
    }
    await sleep(2000);
  }

  // Regenerate debate in morning run only (weekly cache handles deduplication)
  if (edition === "morning") {
    try {
      const res = await fetch(`${baseUrl}/api/debate`);
      results["debate"] = res.ok ? "ok" : `error ${res.status}`;
    } catch (e) {
      results["debate"] = `failed: ${e}`;
    }
  }

  return NextResponse.json({
    success: true,
    edition,
    timestamp: new Date().toISOString(),
    results,
  });
}
