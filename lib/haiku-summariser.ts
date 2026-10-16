import { RawArticle } from "./rss-fetcher";
import { BiasPosition, getBias } from "./source-bias";
import { toAustralianEnglish } from "./australian-english";

// Belt-and-braces removal of emoji/pictographs the model may still emit.
// Intentionally excludes arrows (U+2190–21FF) and Latin accents so Spanish
// names ("Frías", "José") and em dashes survive untouched.
const EMOJI_RE =
  /[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{FE0F}\u{200D}]/gu;
function stripEmoji(s: string): string {
  return (s ?? "").replace(EMOJI_RE, "").replace(/\s{2,}/g, " ").trim();
}

// Strip emoji, then enforce Australian English spelling (criterion 12).
const clean = (s: string) => toAustralianEnglish(stripEmoji(s));

export type CuratedArticle = {
  title: string;
  summary: string;
  source: string;
  sentiment: "positive" | "negative" | "neutral";
  tag: string;
  story_type: "news" | "opinion" | "analysis" | "feature";
  league?: string;
  competition?: string;
  image_url?: string | null;
  url?: string;
  pubDate?: string;
  bias?: BiasPosition;
  bias_label?: string;
  bias_reliability?: "high" | "mixed" | "low";
  blindspot?: boolean;
  sourceCount?: number;
  // Haiku's raw 3-point guess, kept alongside the resolved `bias` so it stays
  // visible when the registry overrode it.
  haikuBias?: string;
};

// What Haiku actually returns. Its "bias" is a 3-point scale plus "unknown",
// unvalidated, and is renamed to haikuBias on parse so it can never be mistaken
// for the registry's 5-point value.
type HaikuArticle = Omit<CuratedArticle, "bias" | "haikuBias"> & {
  bias?: string;
};

// Haiku's 3-point scale onto the registry's 5-point one. The three values map
// straight through; "unknown" and anything unrecognised become undefined so the
// UI can tell "no rating" apart from a real centre rating.
const FIVE_POINT: Record<string, BiasPosition> = {
  left: "left",
  center: "center",
  right: "right",
};
const mapToFivePoint = (v: unknown): BiasPosition | undefined =>
  typeof v === "string" ? FIVE_POINT[v] : undefined;

// Haiku counts the raw articles it was shown, so clamp to the 1-10 range the
// prompt asks for rather than trusting the model's arithmetic.
const clampSourceCount = (n: unknown): number => {
  const parsed = Math.round(Number(n));
  if (!Number.isFinite(parsed)) return 1;
  return Math.min(10, Math.max(1, parsed));
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

  // AFL runs during finals season, when the value of the section is in the
  // details Haiku tends to drop: odds, named tipsters, and who is actually
  // playing. This hint is injected just above the article list so those
  // requirements sit close to the raw material they apply to.
  let searchHint = "";
  if (sectionId === "afl") {
    searchHint = `
SPECIAL AFL FINALS INSTRUCTIONS:
This is AFL finals season. For every finals game preview:
1. Include the betting odds if mentioned in any article
2. Include at least one expert prediction with their name
3. Include injury news for both teams
4. Name specific players — never use "the forward" or
   "their midfielder" — always use full names

Priority story list for AFL finals 2026:
- Geelong vs Carlton (Elimination Final Fri 5 Sep)
- Adelaide vs Western Bulldogs (Elimination Final Sat 5 Sep)
- Fremantle vs Hawthorn (Qualifying Final Thu 4 Sep)
- Sydney vs Brisbane (Qualifying Final Sat 6 Sep)
- Sydney Swans 5-player suspension (Heeney/Warner/Blakey)
- Matthew Kennedy (Bulldogs) concussion protocols
- Jacob van Rooyen (Melbourne) — season over

Always include AEST times in match previews.
`;
  }

  const prompt = `You are a professional news editor. Below are raw RSS feed articles fetched today.

Your job:
1. Select the ${count} most important and newsworthy stories
2. Write a clean 2-3 sentence summary for each in your own words
3. Assign a sentiment and a short category tag
4. Rate each story for political bias, blindspot status and source count

SPECIAL INSTRUCTIONS FOR THIS SECTION:
${specialInstructions}
${searchHint}
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
  "bias": "left" | "center" | "right" | "unknown",
  "blindspot": true | false,
  "sourceCount": 1-10,
  "image_url": null
}

story_type guide: "news" = factual reporting of events; "opinion" = editorial/op-ed/commentary; "analysis" = in-depth explanatory piece; "feature" = human-interest or long-form.

BIAS AND COVERAGE FIELDS:
- "bias": the political lean of the outlet named in SOURCE, judged from the outlet itself rather than from this particular story. Use "left", "center", or "right". Use "unknown" when you do not recognise the outlet or it has no meaningful political lean (sport, weather, trade press) - do not guess.
- "blindspot": true when every raw article above covering this same story comes from outlets on one side of the spectrum, so readers on the other side would not see it. false when outlets of differing lean cover it, and false when bias is "unknown".
- "sourceCount": how many of the raw articles above cover this same story, counting the one you selected. Use 1 when no other article covers it.

If the SPECIAL INSTRUCTIONS above tell you to add an extra field (e.g. "league", "competition"), include that field on EVERY object using one of the allowed values listed.

STYLE RULES (apply to every title, summary and tag):
- Use Australian English spelling (e.g. organise, colour, centre, defence, labour, metre).
- Do not use any emoji.

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
      max_tokens: 4000,
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

  const articles = JSON.parse(text.slice(start, end)) as HaikuArticle[];

  // Attach real images from RSS + bias. The source-bias registry is
  // authoritative where it has a rating (it carries reliability and a label
  // Haiku can't supply); Haiku's per-article guess only fills the gaps for
  // outlets the registry doesn't know. "unknown" is dropped entirely so the UI
  // can still tell "no rating" apart from a real one.
  return articles.map((raw) => {
    const biasRating = getBias(raw.source);

    // Normalise onto one shape before resolving: `bias` holds the registry's
    // 5-point rating (absent when the registry doesn't know the outlet), and
    // `haikuBias` holds Haiku's raw 3-point guess.
    const article: CuratedArticle = {
      ...raw,
      bias: biasRating?.position,
      haikuBias: raw.bias,
    };

    const resolvedBias =
      article.bias ?? // from registry
      mapToFivePoint(article.haikuBias); // fallback from Haiku

    const match = rawArticles.find((r) => r.source === article.source && r.image);
    return {
      ...article,
      bias: resolvedBias,
      title: clean(article.title),
      summary: clean(article.summary),
      tag: clean(article.tag),
      image_url: match?.image ?? null,
      blindspot: article.blindspot === true,
      sourceCount: clampSourceCount(article.sourceCount),
      ...(biasRating
        ? {
            bias_label: biasRating.label,
            bias_reliability: biasRating.reliability,
          }
        : {}),
    };
  });
}
