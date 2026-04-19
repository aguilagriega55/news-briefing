import { RawArticle } from "./rss-fetcher";
import { getBias } from "./source-bias";

export type CuratedArticle = {
  title: string;
  summary: string;
  source: string;
  sentiment: "positive" | "negative" | "neutral";
  tag: string;
  story_type: "news" | "opinion" | "analysis" | "feature";
  league?: string;
  image_url?: string | null;
  url?: string;
  pubDate?: string;
  bias?: "left" | "center-left" | "center" | "center-right" | "right";
  bias_label?: string;
  bias_reliability?: "high" | "mixed" | "low";
};

export async function summariseWithHaiku(
  sectionId: string,
  rawArticles: RawArticle[],
  count: number,
  specialInstructions: string
): Promise<CuratedArticle[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const articleList = rawArticles
    .slice(0, 30)
    .map(
      (a, i) =>
        `[${i + 1}] SOURCE: ${a.source}\nTITLE: ${a.title}\nSUMMARY: ${a.summary.slice(0, 200)}\nURL: ${a.link}\nDATE: ${a.pubDate}`
    )
    .join("\n\n");

  const prompt = `You are a professional news editor. Below are raw RSS feed articles fetched today.

Your job:
1. Select the ${count} most important and newsworthy stories
2. Write a clean 2-3 sentence summary for each in your own words
3. Assign a sentiment and a short category tag

SPECIAL INSTRUCTIONS FOR THIS SECTION:
${specialInstructions}

RAW ARTICLES:
${articleList}

Return ONLY a valid JSON array with exactly ${count} objects. Each object:
{
  "title": "clean rewritten headline",
  "summary": "2-3 sentence summary in your own words",
  "source": "source name from the article",
  "url": "the article URL",
  "pubDate": "ISO date string",
  "sentiment": "positive" | "negative" | "neutral",
  "tag": "short category tag",
  "story_type": "news" | "opinion" | "analysis" | "feature",
  "image_url": null
}

story_type guide: "news" = factual reporting of events; "opinion" = editorial/op-ed/commentary; "analysis" = in-depth explanatory piece; "feature" = human-interest or long-form.

No markdown, no code fences, no explanation. Only the JSON array.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Haiku API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const text: string = data.content?.[0]?.text ?? "";

  const start = text.indexOf("[");
  const end = text.lastIndexOf("]") + 1;
  if (start === -1) throw new Error("No JSON array in Haiku response");

  const articles = JSON.parse(text.slice(start, end)) as CuratedArticle[];

  // Attach real images from RSS + bias from registry
  return articles.map((article) => {
    const match = rawArticles.find((r) => r.source === article.source && r.image);
    const biasRating = getBias(article.source);
    return {
      ...article,
      image_url: match?.image ?? null,
      ...(biasRating
        ? {
            bias: biasRating.position,
            bias_label: biasRating.label,
            bias_reliability: biasRating.reliability,
          }
        : {}),
    };
  });
}
