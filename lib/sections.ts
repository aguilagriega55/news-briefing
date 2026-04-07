export interface Section {
  id: string;
  title: string;
  sources: string;
  icon: string;
  prompt: string;
}

export const sections: Section[] = [
  {
    id: "finance",
    title: "Finance & Economy",
    sources: "Bloomberg · Reuters · The Economist",
    icon: "📈",
    prompt: `Search for today's top 5 finance and economy stories.
Sources to prioritise IN ORDER: Bloomberg first, Reuters second, The Economist third.
Focus on: global markets (equities, bonds, FX), central bank decisions,
inflation data, major corporate news, commodities, oil, gold.
Be selective — only the most market-moving stories of the day.
Return exactly 5 items. Each must have a clear source attribution.`,
  },
  {
    id: "politics",
    title: "Politics & World Affairs",
    sources: "Bloomberg · The Guardian · Reuters",
    icon: "🏛️",
    prompt: `Search for today's top 5 political and international news stories.
Sources: Bloomberg Politics, The Guardian, Reuters World News.
Geographic coverage MUST include a mix — always try to cover:
- At least 1 story from Europe
- At least 1 story from the United States
- At least 1 story from Australia or Asia-Pacific
- 1-2 global/multilateral stories (UN, NATO, trade, climate)
Prioritise stories with genuine geopolitical significance.
Return exactly 5 items.`,
  },
  {
    id: "australia",
    title: "Australia",
    sources: "The Age · SMH · The Australian · ABC",
    icon: "🦘",
    prompt: `Search for today's top 5 Australian news stories.
Sources: The Age, Sydney Morning Herald, The Australian, ABC News Australia.
Focus: federal politics, Victorian/NSW state news, economy,
cost of living, housing, major court or crime news, weather events.
Always include at least 1 Melbourne-specific story if available.
Return exactly 5 items.`,
  },
  {
    id: "worldcup",
    title: "FIFA World Cup 2026",
    sources: "FIFA · BBC Sport · ESPN · Goal.com",
    icon: "⚽",
    prompt: `Search for the latest FIFA World Cup 2026 news.
CRITICAL REQUIREMENT: Always structure results by COUNTRY/TEAM news, not just general updates.
Always include at least 1 story specifically about Mexico (El Tri).
Then cover other nations: Argentina, Brazil, England, USA, Spain, France, Germany, Australia.
Include: qualification updates, squad announcements, injuries,
coach news, match results if tournament is underway, host city updates.
Return exactly 5 items, each clearly attributed to a specific national team.`,
  },
  {
    id: "tech",
    title: "AI & Tech",
    sources: "The Verge · Wired · Ars Technica · Bloomberg Tech",
    icon: "🤖",
    prompt: `Search for today's top 5 AI and technology news stories.
Sources to prioritise: The Verge, Wired, Ars Technica, Bloomberg Technology, MIT Technology Review, TechCrunch, Reuters Technology.
Coverage MUST include a mix:
- At least 2 stories specifically about AI (models, research breakthroughs, regulation, company moves)
- At least 1 story about Big Tech (Apple, Google, Meta, Microsoft, Amazon, Nvidia)
- 1-2 stories on broader tech: startups, cybersecurity, semiconductors, or policy
Prioritise stories with genuine industry significance — product launches, funding rounds, regulatory actions, research papers.
Return exactly 5 items. Each must have a clear source attribution.`,
  },
  {
    id: "sports",
    title: "NFL · AFL · Liga MX",
    sources: "ESPN · AFL.com.au · Record · Reforma",
    icon: "🏈",
    prompt: `Search for today's sports news across three leagues. Return exactly 5 items total.
Coverage requirements — you MUST include stories from ALL THREE leagues:

NFL (minimum 1 story): Cover specific teams. Include scores, trades, injuries,
standings. Name the specific teams involved in every story.

AFL (minimum 1 story): Cover specific AFL clubs. Name the teams.
Include match results, ladder, injuries, trades, finals news.

Liga MX (minimum 2 stories):
- ALWAYS include at least 1 story about Pumas UNAM men's team
- ALWAYS include at least 1 story about Pumas UNAM women's team (Liga MX Femenil)
- If no Pumas news today, cover their last match result or upcoming fixture
Sources: ESPN, AFL.com.au, Reforma, Record, MedioTiempo.

Return exactly 5 items. Label each with its league: NFL / AFL / Liga MX.`,
  },
];

export const sectionIds = sections.map((s) => s.id);
