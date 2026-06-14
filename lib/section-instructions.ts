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
MUST include every day:

ECONOMIC INDICATOR (mandatory 1 story):
- GDP growth data or projections
- RBA interest rate decisions or commentary
- Inflation figures (CPI, PPI)
- Consumer sentiment index (Westpac-Melbourne Institute)
- Business/producer confidence (NAB Business Survey)
- Employment data, unemployment rate
- Housing prices, construction data
- Trade balance, current account
- If no new data released today, use the most recent
  figures and what economists are projecting next

MELBOURNE/VICTORIA (mandatory 1 story):
- Local politics, infrastructure, development
- Victorian economy, business conditions
- Melbourne cost of living, housing market
- Local government decisions

FEDERAL AUSTRALIA (mandatory 1 story):
- Federal politics and parliament
- National policy: energy, immigration, defence
- Federal budget, taxation, spending

GENERAL AUSTRALIA (remaining stories):
- Major court cases, crime
- Weather events, natural disasters
- Culture, sport, society
- Any major breaking Australian news

Sources: ABC Australia, The Age, SMH,
Guardian Australia, AFR for economic data.
Tags: Economy | GDP | Sentiment | Melbourne |
Federal | Victoria | Markets | Housing`,

  worldcup: `Pick exactly 6 stories covering all football/soccer.
Coverage MUST include every day:

FIFA WORLD CUP 2026 (min 2 stories):
- Structure by specific national team, not generic news
- ALWAYS include at least 1 Mexico national team (El Tri) story
- Cover: Argentina, Brazil, England, USA, Spain,
  France, Germany, Australia
- Qualification updates, squad news, injuries,
  match results, host city news (USA/Mexico/Canada)
- Every headline must name the specific country

PUMAS UNAM (min 2 stories — non-negotiable):
- 1 story about Pumas UNAM MEN (Liga MX)
  Result, standings, upcoming match, transfers,
  coach news, player news
- 1 story about Pumas UNAM WOMEN (Liga MX Femenil)
  Result, standings, upcoming match, transfers
- If no news today, use their most recent result
  or next scheduled fixture
- Sources: Record, Reforma, ESPN Mexico

GENERAL FOOTBALL/SOCCER (min 2 stories):
- Major European leagues: Premier League, La Liga,
  Champions League, Serie A, Bundesliga
- Major transfers, match results, manager news
- Australian football (A-League) when newsworthy

Add "competition" field to every article:
"World Cup" | "Pumas Men" | "Pumas Women" |
"Liga MX" | "Europe" | "A-League" | "International"`,

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

  sports: `Pick exactly 5 stories covering all three sports.
MANDATORY every day:

F1 FORMULA 1 (min 1 story):
- Race results, qualifying, practice sessions
- Driver standings, constructor championship
- Team news, car updates, driver transfers
- Name the specific drivers and teams involved

AFL AUSTRALIAN FOOTBALL (min 2 stories):
- Name specific clubs in every headline
- Match results with scores, ladder positions
- Player trades, injuries, suspensions
- Finals and premiership news
- Melbourne-based clubs preferred when newsworthy
  (Collingwood, Carlton, Melbourne, Richmond,
   Essendon, Hawthorn, St Kilda, Western Bulldogs,
   North Melbourne, Footscray)

NFL AMERICAN FOOTBALL (min 1 story):
- Name specific teams in every headline
- Scores, standings, playoffs, Super Bowl
- Trades, injuries, draft news

Add "league" field to every article: "F1" | "AFL" | "NFL"`,
};
