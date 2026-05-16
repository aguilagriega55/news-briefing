import { NextRequest, NextResponse } from "next/server";
import { RSS_FEEDS } from "@/lib/rss-feeds";
import { fetchRSSFeeds } from "@/lib/rss-fetcher";
import { summariseWithHaiku } from "@/lib/haiku-summariser";
import { generateBankingBrief } from "@/lib/banking-brief";
import { SECTION_INSTRUCTIONS } from "@/lib/section-instructions";
import { getCachedBriefing, saveBriefing } from "@/lib/supabase";
import { STORY_COUNT } from "@/lib/sections";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { sectionId, edition, bypassCache } = await req.json();

    const feeds = RSS_FEEDS[sectionId as keyof typeof RSS_FEEDS];
    if (!feeds) {
      return NextResponse.json({ error: "Unknown section" }, { status: 400 });
    }

    // 1. Check cache (unless cron bypass)
    if (!bypassCache) {
      const cached = await getCachedBriefing(sectionId, edition);
      if (cached) {
        return NextResponse.json({
          articles: cached.articles,
          fetched_at: cached.fetched_at,
          cached: true,
        });
      }
    }

    // 2. Fetch RSS feeds
    console.log(`[news] Fetching RSS for ${sectionId}...`);
    const rawArticles = await fetchRSSFeeds(feeds);
    console.log(`[news] Got ${rawArticles.length} raw articles for ${sectionId}`);

    if (rawArticles.length === 0) {
      return NextResponse.json({ error: "No RSS articles fetched" }, { status: 502 });
    }

    // 3. Summarise — banking uses a bespoke editorial brief (markdown);
    //    every other section gets the JSON article-list summariser.
    let articles;
    if (sectionId === "banking") {
      console.log(`[news] Generating banking brief from ${Math.min(rawArticles.length, 30)} articles...`);
      const markdown = await generateBankingBrief(rawArticles, edition);
      articles = [{ markdown, title: "", summary: "", source: "Banking Brief" }];
    } else {
      const count = STORY_COUNT[sectionId] ?? 5;
      const instructions = SECTION_INSTRUCTIONS[sectionId] ?? "";
      console.log(`[news] Sending ${Math.min(rawArticles.length, 30)} articles to Haiku...`);
      articles = await summariseWithHaiku(sectionId, rawArticles, count, instructions);
      console.log(`[news] Haiku returned ${articles.length} curated articles`);
    }

    // 4. Save to cache
    const fetched_at = new Date().toISOString();
    await saveBriefing(sectionId, edition, articles);

    return NextResponse.json({ articles, fetched_at, cached: false });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[news] ERROR:", msg);
    return NextResponse.json({ error: "Failed to fetch news", detail: msg }, { status: 500 });
  }
}
