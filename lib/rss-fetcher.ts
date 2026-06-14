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

export async function fetchRSSFeeds(
  feeds: { name: string; url: string }[],
  maxPerFeed = 8
): Promise<RawArticle[]> {
  const results = await Promise.allSettled(
    feeds.map(async (feed) => {
      const parsed = await parser.parseURL(feed.url);
      return parsed.items.slice(0, maxPerFeed).map((item) => ({
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
