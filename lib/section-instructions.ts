export const SECTION_INSTRUCTIONS: Record<string, string> = {
  latest: `Pick the 8 most urgent breaking stories across ALL topics today.
Mix: finance, politics, Australia, sports, world affairs, tech.
Lead with the single most important story of the day.
Avoid duplicates across topics.`,

  finance: `Pick top 5 market-moving finance stories.
Prioritise: central bank decisions, major market moves, inflation data,
corporate earnings, commodities (oil, gold), currency moves.
Prefer Bloomberg and Reuters sources.
Always include at least 1 story about Asian or Australian markets.`,

  politics: `Pick top 5 geopolitically significant stories.
MUST include geographic diversity:
- At least 1 story from Europe
- At least 1 story from the United States
- At least 1 story from Australia or Asia-Pacific
- 1 global/multilateral story (UN, NATO, trade, climate)
Prefer The Guardian and Reuters.`,

  australia: `Pick top 5 Australian news stories.
Focus: federal politics, Victorian/NSW state news, economy,
cost of living, housing, infrastructure, major court cases.
MUST include at least 1 Melbourne-specific story.
Prefer ABC Australia, The Age, SMH.`,

  worldcup: `Pick top 5 World Cup 2026 stories.
CRITICAL: Structure results by NATIONAL TEAM.
ALWAYS include at least 1 story specifically about Mexico (El Tri).
Then cover: Argentina, Brazil, England, USA, Spain, France, Germany, Australia.
Include: squad news, injuries, qualification, match results if available.
Each headline must name the specific country/team.`,

  tech: `Pick top 5 AI and technology stories.
MUST include:
- At least 2 stories about AI (models, research, regulation, company moves)
- At least 1 story about Big Tech (Apple, Google, Meta, Microsoft, Amazon, Nvidia)
- 1-2 stories on broader tech: startups, cybersecurity, semiconductors, policy
Prefer The Verge, Wired, Ars Technica.`,

  banking: `Pick the top 5 banking and financial services stories.
Focus on: central banks (RBA, Fed, ECB, BOE), commercial bank earnings and strategy,
fintech disruption, regulation and compliance, interest rates, credit markets,
bank M&A, digital banking, crypto regulation.
Always include at least 1 story about Australian banking (CBA, ANZ, Westpac, NAB or RBA).
Tag each story with one of: Central Banks | Regulation | Fintech | Earnings | Markets | Strategy`,

  running: `Pick top 5 stories for a Melbourne-based runner, swimmer and cyclist.
This person trains regularly across all three disciplines
and competes in road races, triathlons and cycling events.

MUST prioritise articles that are DIRECTLY USEFUL to an active athlete:
- Training methods, periodisation, intervals, threshold work
- Recovery, sleep, nutrition, injury prevention
- Gear reviews: running shoes, wetsuits, tri bikes, power meters
- Race previews and results for events they might enter:
  Ironman Australia, Ironman 70.3, Melbourne Marathon,
  Gold Coast Marathon, Around the Bay, triathlons
- Elite performances that inspire: Kona, World Triathlon Series,
  Tour de France, World Athletics Marathon Majors
- Australian swimming, cycling and running news
- Science: VO2 max, lactate threshold, heat adaptation, altitude

AVOID: pure spectator sports news, generic fitness lifestyle fluff,
celebrity athletes unrelated to endurance, gear they can't use.

Tag: Run | Swim | Cycle | Triathlon | Science | Race | Gear | Recovery`,

  business: `Pick the top 5 Australian business and small business stories.
Focus SPECIFICALLY on:
- Australian small business news (regulations, grants, tax, costs)
- ASX listed company news and earnings
- Australian startup and entrepreneurship stories
- Retail, hospitality, construction sector news in Australia
- RBA decisions and their impact on Australian businesses
- Cost of doing business: wages, rents, supply chain
- State government business policy (especially Victoria)
- Australian fintech and innovation

Always include at least 1 small business story (not just big corporations).
Always include at least 1 Victorian/Melbourne business story.
Sources: AFR, SmartCompany, ABC Business, Business Insider AU.
Tag each: ASX | Small Business | Retail | Startup | Policy | Economy`,

  sports: `Pick exactly 5 stories covering ALL THREE leagues.
MANDATORY:
- NFL: minimum 1 story. Name specific teams. Scores, trades, injuries.
- AFL: minimum 1 story. Name specific clubs. Results, ladder, trades.
- Liga MX: minimum 2 stories:
  * 1 story about Pumas UNAM men's team (search recent match or news)
  * 1 story about Pumas UNAM women's team / Liga MX Femenil
  * If no Pumas news, use their last result or next fixture
Add "league" field to each: "NFL" | "AFL" | "Liga MX"`,
};
