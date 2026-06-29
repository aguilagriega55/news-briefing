import { NextRequest, NextResponse } from "next/server";
import { isWorldCupActive } from "@/lib/sections";

// Shared cron worker. Each /api/cron/<edition> route is a thin GET handler that
// calls run() with its hardcoded edition. (Four unique paths are required
// because Vercel keys cron jobs by path — four crons on one path collapse to a
// single job, so each edition gets its own route.)

export type Edition = "morning" | "midday" | "evening" | "midnight";

const SECTION_IDS = [
  "latest", "australia", "politics", "finance",
  "business", "banking", "football", "worldcup", "sports", "running",
];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function run(request: NextRequest, edition: Edition) {
  // Auth: Vercel cron requests carry `Authorization: Bearer ${CRON_SECRET}`.
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    `https://${request.headers.get("host")}`;

  const results: Record<string, string> = {};

  // Skip the worldcup section outside the tournament window (Melbourne date).
  const sectionIds = SECTION_IDS.filter(
    (id) => id !== "worldcup" || isWorldCupActive()
  );

  // Fetch all news sections sequentially with delay.
  for (const sectionId of sectionIds) {
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

  // Regenerate debate in the morning run only (weekly cache dedupes).
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
