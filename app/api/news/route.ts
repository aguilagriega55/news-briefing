import { NextRequest, NextResponse } from "next/server";
import Parser from "rss-parser";
import { sections } from "@/lib/sections";
import { getCachedBriefing, saveBriefing, Article } from "@/lib/supabase";

const parser = new Parser({
  timeout: 8000,
  headers: { "User-Agent": "Mozilla/5.0 (compatible; NewsBriefing/1.0)" },
});

async function fetchFeed(
  url: string,
  source: string
): Promise<Article[]> {
  try {
    const feed = await parser.parseURL(url);
    return (feed.items || []).slice(0, 10).map((item) => ({
      title: (item.title || "").trim().slice(0, 120),
      summary: (item.contentSnippet || item.content || item.summary || "")
        .replace(/<[^>]+>/g, "")
        .trim()
        .slice(0, 300),
      source: feed.title || source,
      url: item.link || item.guid || undefined,
      pubDate: item.isoDate || item.pubDate || "",
    }));
  } catch {
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sectionId, edition } = body as {
      sectionId: string;
      edition: "morning" | "evening";
    };

    if (!sectionId || !edition) {
      return NextResponse.json(
        { error: "sectionId and edition are required" },
        { status: 400 }
      );
    }

    const section = sections.find((s) => s.id === sectionId);
    if (!section) {
      return NextResponse.json({ error: "Invalid sectionId" }, { status: 400 });
    }

    // Check cache first
    const cached = await getCachedBriefing(sectionId, edition);
    if (cached) {
      return NextResponse.json({
        articles: cached.articles,
        cached: true,
        fetched_at: cached.fetched_at,
      });
    }

    // Fetch all feeds in parallel
    const results = await Promise.all(
      section.feeds.map((f) => fetchFeed(f.url, f.source))
    );

    // Merge, sort by date (newest first), deduplicate by title, take top 5
    const all: (Article & { pubDate: string })[] = results
      .flat()
      .filter((a) => a.title && a.summary) as (Article & { pubDate: string })[];

    const seen = new Set<string>();
    const deduped = all.filter((a) => {
      const key = a.title.toLowerCase().slice(0, 60);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    deduped.sort((a, b) => {
      const da = a.pubDate ? new Date(a.pubDate).getTime() : 0;
      const db = b.pubDate ? new Date(b.pubDate).getTime() : 0;
      return db - da;
    });

    const articles: Article[] = deduped.slice(0, 5).map(({ pubDate: _p, ...a }) => a);

    if (articles.length === 0) {
      return NextResponse.json(
        { error: "No articles found — feeds may be temporarily unavailable" },
        { status: 503 }
      );
    }

    const fetched_at = new Date().toISOString();
    await saveBriefing(sectionId, edition, articles);

    return NextResponse.json({ articles, cached: false, fetched_at });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[news] ERROR:", msg);
    return NextResponse.json(
      { error: "Failed to fetch news", detail: msg },
      { status: 500 }
    );
  }
}
