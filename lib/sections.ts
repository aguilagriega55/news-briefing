export interface Section {
  id: string;
  title: string;
  sources: string;
  icon: string;
  feeds: { url: string; source: string }[];
}

export const sections: Section[] = [
  {
    id: "finance",
    title: "Finance & Economy",
    sources: "Reuters · FT · CNBC · Bloomberg · MarketWatch",
    icon: "📈",
    feeds: [
      { url: "https://feeds.content.dowjones.io/public/rss/mw_marketpulse", source: "MarketWatch" },
      { url: "https://www.cnbc.com/id/100003114/device/rss/rss.html", source: "CNBC" },
      { url: "https://www.cnbc.com/id/10001147/device/rss/rss.html", source: "CNBC Finance" },
      { url: "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml", source: "NYT Business" },
      { url: "https://feeds.skynews.com/feeds/rss/business.xml", source: "Sky News Business" },
    ],
  },
  {
    id: "politics",
    title: "Politics & World Affairs",
    sources: "Reuters · AP · BBC · Al Jazeera · The Guardian",
    icon: "🏛️",
    feeds: [
      { url: "http://feeds.bbci.co.uk/news/world/rss.xml", source: "BBC World" },
      { url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", source: "NYT World" },
      { url: "https://www.theguardian.com/world/rss", source: "The Guardian" },
      { url: "https://feeds.skynews.com/feeds/rss/world.xml", source: "Sky News" },
      { url: "http://feeds.bbci.co.uk/news/politics/rss.xml", source: "BBC Politics" },
    ],
  },
  {
    id: "australia",
    title: "Australia",
    sources: "ABC Australia · The Age · SMH · Guardian Australia",
    icon: "🦘",
    feeds: [
      { url: "https://www.abc.net.au/news/feed/51120/rss.xml", source: "ABC Australia" },
      { url: "https://www.theguardian.com/australia-news/rss", source: "Guardian Australia" },
      { url: "https://www.smh.com.au/rss/feed.xml", source: "SMH" },
      { url: "https://www.theage.com.au/rss/feed.xml", source: "The Age" },
    ],
  },
  {
    id: "worldcup",
    title: "FIFA World Cup 2026",
    sources: "BBC Sport · ESPN · Reuters Sport · Sky Sports · Goal.com",
    icon: "⚽",
    feeds: [
      { url: "http://feeds.bbci.co.uk/sport/football/rss.xml", source: "BBC Sport" },
      { url: "https://www.espn.com/espn/rss/soccer/news", source: "ESPN Soccer" },
      { url: "https://feeds.skynews.com/feeds/rss/sports.xml", source: "Sky Sports" },
      { url: "https://www.theguardian.com/football/rss", source: "Guardian Football" },
    ],
  },
  {
    id: "sports",
    title: "NFL · AFL · Liga MX",
    sources: "ESPN · Reuters Sport · AFL.com.au · Fox Sports · Reforma",
    icon: "🏈",
    feeds: [
      { url: "https://www.espn.com/espn/rss/nfl/news", source: "ESPN NFL" },
      { url: "https://www.espn.com/espn/rss/nba/news", source: "ESPN NBA" },
      { url: "https://www.espn.com/espn/rss/soccer/news", source: "ESPN Soccer" },
      { url: "https://www.theguardian.com/sport/rss", source: "Guardian Sport" },
      { url: "https://feeds.skynews.com/feeds/rss/sports.xml", source: "Sky Sports" },
    ],
  },
];

export const sectionIds = sections.map((s) => s.id);
