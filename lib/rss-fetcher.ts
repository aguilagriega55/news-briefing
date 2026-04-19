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

  const articles: RawArticle[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      articles.push(...result.value);
    }
  }

  // Sort newest first
  return articles.sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );
}
