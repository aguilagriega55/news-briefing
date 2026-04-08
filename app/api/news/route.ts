import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { sections } from "@/lib/sections";
import { getCachedBriefing, saveBriefing, Article } from "@/lib/supabase";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

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

    // Live fetch from Anthropic
    const editionLabel = edition === "morning" ? "morning" : "evening";
    const today = new Date().toLocaleDateString("en-AU", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const prompt = `${section.prompt}

Today is ${today}. This is the ${editionLabel} edition.

Return the results as a JSON array of exactly 5 objects. Each object must have:
- "title": string (headline, max 100 chars)
- "summary": string (2-3 sentence summary of the story)
- "source": string (publication name, e.g. "Bloomberg", "Reuters")
- "url": string (article URL if available — omit field if not found)
- "pubDate": string (article publication date/time in ISO 8601 format, e.g. "2026-04-08T09:30:00Z" — use your best estimate based on the article, omit if truly unknown)
- "imageUrl": string (direct URL to the article's main image or thumbnail if you can find it — omit if not available)

Respond with ONLY a valid JSON array — no markdown fences, no explanation, just the raw array.`;

    const message = await anthropic.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 2048,
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 5,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      ],
      messages: [{ role: "user", content: prompt }],
    });

    // Extract text block from response
    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from Anthropic");
    }

    let articles: Article[];
    try {
      const raw = textBlock.text.trim();
      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      articles = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
    } catch {
      throw new Error("Failed to parse articles JSON from Anthropic response");
    }

    const fetched_at = new Date().toISOString();

    // Save to Supabase cache (silent fail)
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
