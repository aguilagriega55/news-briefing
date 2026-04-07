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
    const prompt = `${section.prompt}

Return exactly 5 articles as a JSON array. Each article must have these fields:
- title: string (headline, max 100 chars)
- summary: string (2-3 sentence summary of the story)
- source: string (publication name, e.g. "Reuters", "BBC")
- url: string (article URL if available, otherwise omit)

Today is ${new Date().toLocaleDateString("en-AU", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}. This is the ${editionLabel} edition.

Respond with ONLY valid JSON — no markdown, no explanation, just the array.`;

    const message = await anthropic.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 2048,
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 3,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      ],
      messages: [{ role: "user", content: prompt }],
    });

    // Extract text from response
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
      throw new Error("Failed to parse articles JSON from response");
    }

    const fetched_at = new Date().toISOString();

    // Save to cache (silent fail)
    await saveBriefing(sectionId, edition, articles);

    return NextResponse.json({ articles, cached: false, fetched_at });
  } catch (error) {
    console.error("News API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}
