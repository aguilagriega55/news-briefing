import Parser from "rss-parser";

const parser = new Parser({
  timeout: 5000,
  headers: { "User-Agent": "NewsBriefing/1.0" },
});

export type RawArticle = {
  title: string;
  summary: string;
  link: string;
  pubDate: string;
  source: string;
  image?: string;
};

/**
 * Feeds occasionally serve items with a stale publish date — the WSJ AI-rout
 * and gold/silver items have shown up stamped 27 January 2025, over a year
 * before the edition that carried them. Anything older than this many days is
 * dropped before the summariser ever sees it.
 */
const MAX_AGE_DAYS = 7;

/**
 * An item is stale only when it carries a date we can actually parse and that
 * date is more than MAX_AGE_DAYS old. Undated and unparseable items are kept:
 * plenty of feeds omit the field, and dropping those would empty whole
 * sections rather than fix them.
 */
function isStale(pubDate: string, now: number): boolean {
  if (!pubDate) return false;
  const published = Date.parse(pubDate);
  if (Number.isNaN(published)) return false;
  return now - published > MAX_AGE_DAYS * 86400_000;
}

export async function fetchRSSFeeds(
  feeds: { name: string; url: string }[],
  maxPerFeed = 8
): Promise<RawArticle[]> {
  // One clock for every feed, so a slow fetch can't shift its own cutoff.
  const now = Date.now();

  const results = await Promise.allSettled(
    feeds.map(async (feed) => {
      const parsed = await parser.parseURL(feed.url);
      const items = parsed.items.map((item) => ({
        title: item.title ?? "",
        summary: (item.contentSnippet ?? item.content ?? item.summary ?? "")
          .replace(/<[^>]+>/g, "")
          .trim()
          .slice(0, 400),
        link: item.link ?? "",
        pubDate: item.isoDate ?? item.pubDate ?? "",
        source: feed.name,
        image:
          (item.enclosure as { url?: string } | undefined)?.url ??
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (item["media:content"] as any)?.$?.url ??
          undefined,
      }));

      // Drop stale items before the per-feed cap, not after, so a feed
      // leading with old items still contributes a full set of fresh ones.
      const fresh = items.filter((a) => !isStale(a.pubDate, now));
      const dropped = items.length - fresh.length;
      if (dropped > 0) {
        console.warn(
          `[rss] ${feed.name}: dropped ${dropped} item(s) older than ${MAX_AGE_DAYS} days`
        );
      }
      return fresh.slice(0, maxPerFeed);
    })
  );

  // Keep each feed's items together (already newest-first per feed), then
  // round-robin interleave so prolific feeds (e.g. World Cup coverage) can't
  // crowd out smaller ones (e.g. Pumas/Liga MX) before the summariser sees them.
  const perFeed: RawArticle[][] = [];
  for (const result of results) {
    if (result.status === "fulfilled") perFeed.push(result.value);
  }
  const interleaved: RawArticle[] = [];
  const maxLen = perFeed.reduce((m, f) => Math.max(m, f.length), 0);
  for (let i = 0; i < maxLen; i++) {
    for (const feed of perFeed) {
      if (feed[i]) interleaved.push(feed[i]);
    }
  }
  return interleaved;
}
