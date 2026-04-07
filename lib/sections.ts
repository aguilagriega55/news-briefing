export interface Section {
  id: string;
  title: string;
  sources: string;
  prompt: string;
  icon: string;
}

export const sections: Section[] = [
  {
    id: "finance",
    title: "Finance & Economy",
    sources: "Reuters · FT · CNBC · Bloomberg · MarketWatch",
    icon: "📈",
    prompt:
      "Search for today's top finance and economy stories. Prioritise Reuters and CNBC as primary free sources, supplemented by Bloomberg, FT, and MarketWatch. Focus on: global markets, central banks, interest rates, inflation data, major corporate earnings, commodities, currencies, crypto.",
  },
  {
    id: "politics",
    title: "Politics & World Affairs",
    sources: "Reuters · AP · BBC · Al Jazeera · The Guardian",
    icon: "🏛️",
    prompt:
      "Search for today's top politics and world affairs stories. Use Reuters and AP as primary wire sources, supplemented by BBC, Al Jazeera, and The Guardian. Focus on: major government decisions, elections, international relations, geopolitical tensions, policy changes, diplomatic developments.",
  },
  {
    id: "australia",
    title: "Australia",
    sources: "ABC Australia · The Age · SMH · Guardian Australia",
    icon: "🦘",
    prompt:
      "Search for today's top Australian news stories. Use ABC Australia as the primary source, supplemented by The Age, Sydney Morning Herald, and The Guardian Australia. Focus on: Australian federal and state politics, economy, cost of living, immigration, housing, environment, major domestic events.",
  },
  {
    id: "worldcup",
    title: "FIFA World Cup 2026",
    sources: "BBC Sport · ESPN · Reuters Sport · Sky Sports · Goal.com",
    icon: "⚽",
    prompt:
      "Search for the latest FIFA World Cup 2026 news and updates. Use BBC Sport and ESPN as primary sources, supplemented by Reuters Sport, Sky Sports, and Goal.com. Focus on: match results, standings, group stage updates, player news, team form, manager quotes, tournament fixtures, and qualification stories.",
  },
  {
    id: "sports",
    title: "NFL · AFL · Liga MX",
    sources: "ESPN · Reuters Sport · AFL.com.au · Fox Sports · Reforma",
    icon: "🏈",
    prompt:
      "Search for today's top stories across NFL, Australian Football League (AFL), and Liga MX. Use ESPN and Reuters Sport as primary sources, supplemented by AFL.com.au, Fox Sports, Reforma, and Record. Focus on: game results, standings, player transfers, injuries, trades, match previews, and league news for all three competitions.",
  },
];

export const sectionIds = sections.map((s) => s.id);
