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

  economy: `Pick top 5 global macroeconomic stories.
This section sits above a static table of GDP, inflation and
policy rates for the USA, China, Germany, Japan, India, UK,
Spain, Brazil, Canada, Mexico and Australia — the stories should
explain what is MOVING those numbers, not restate them.

AUSTRALIA / RBA (mandatory 1 story):
- RBA cash rate decisions, statements, minutes, speeches
- Australian CPI, GDP, wages or unemployment prints
- What it means for mortgages and cost of living
- If no new data, lead with what economists expect next

CENTRAL BANKS (mandatory 1 story):
- Fed, ECB, Bank of England, Bank of Japan decisions and guidance
- Name the bank, the rate, the direction and the vote split

DATA RELEASES (mandatory 1 story):
- Inflation, GDP, jobs, PMI or retail prints from any major economy
- Give the actual figure, the forecast it beat or missed, and the prior

REMAINING STORIES:
- China's growth, stimulus and deflation risk
- Emerging markets, especially Brazil and Mexico
- Trade, tariffs, commodities, currencies
- Sovereign debt, fiscal policy, recession signals

ALWAYS: lead with the number. Name the country and the central
bank. Say whether the figure rose or fell and against what.
NEVER: vague "economists are concerned" stories with no data.

Tags: RBA | Fed | ECB | BoJ | Inflation | GDP | Rates |
Jobs | China | Emerging Markets | Trade`,

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

  auspol: `Pick 6 Australian politics stories.

MANDATORY: Always cover Victorian state election (28 Nov 2026) when there is news — tag as VIC ELECTION. Ben Carroll (Labor) vs Jess Wilson (Liberal) vs One Nation surge.

FEDERAL: Albanese government, Angus Taylor opposition, AUKUS, cost of living, housing, immigration, Senate crossbench.

VICTORIA PRIORITY: State election polling, Victorian debt, crime, infrastructure, Ben Carroll premiership.

Format: Name the politician and the impact. Include polling numbers when available.

Tags: Federal | VIC ELECTION | Labor | Liberal | Greens | One Nation | AUKUS | Housing`,

  football: `Pick exactly 6 football/soccer stories.
Coverage MUST include every day:

PUMAS UNAM (mandatory, min 2 — men and women):
- 1 story Pumas UNAM MEN (Liga MX): result, standings,
  next match, transfers, coach/player news
- 1 story Pumas UNAM WOMEN (Liga MX Femenil): result,
  standings, next match, transfers
- If no news today, use the most recent result or next fixture
- Sources: Record, Reforma, ESPN Mexico

MEXICAN & GENERAL FOOTBALL (remaining stories):
- Liga MX and the Mexico national team (El Tri)
- Major European leagues: Premier League, La Liga,
  Champions League, Serie A, Bundesliga
- Major transfers, match results, manager news
- Australian football (A-League) when newsworthy

Add "competition" field to every article:
"Pumas Men" | "Pumas Women" | "Liga MX" | "Europe" | "A-League" | "International"`,

  worldcup: `Pick exactly 6 stories about the FIFA World Cup 2026.
Structure every story by a specific national team — name the country
in the headline. No generic football: this tab is the World Cup only.

MEXICO — EL TRI (mandatory, at least 1 story):
- Co-host nation. Latest result, next fixture, group standing,
  squad / injury / lineup news.

AUSTRALIA — SOCCEROOS (mandatory, at least 1 story):
- Latest result, next fixture, group standing,
  squad / injury news.

GENERAL WORLD CUP (remaining stories):
- Headline nations and any upsets or breakout performers:
  Argentina, Brazil, England, Spain, France, Germany, USA, etc.
- Match results, fixtures, group qualification scenarios,
  confirmed injuries, host-city news (USA / Mexico / Canada).

Distinguish reported facts (final scores, official lineups,
federation-confirmed injuries) from speculation (predicted
lineups, rumoured transfers, betting sentiment).
If Mexico or Australia have no news today, use their most recent
result or next scheduled fixture.

Add "competition" field to every article: "World Cup".`,

  tech: `Pick top 5 AI and technology stories.
MUST include:
- At least 2 stories about AI (models, research, regulation, company moves)
- At least 1 story about Big Tech (Apple, Google, Meta, Microsoft, Amazon, Nvidia)
- 1-2 stories on broader tech: startups, cybersecurity, semiconductors, policy
Prefer The Verge, Wired, Ars Technica.`,

  banking: `Pick 6 Australian banking stories only.
ONLY about: CBA, ANZ, NAB, Westpac, Macquarie,
RBA, APRA, Australian mortgages, Australian home loans.
Reject JPMorgan, Goldman, Fed, BoJ, ECB, Bank of England.
RBA news always beats international bank news.
Tags: CBA | ANZ | NAB | Westpac | RBA | Housing`,

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

  afl: `You are writing the AFL section for an Australian
family in Melbourne. This is finals season — every
story matters.

STRUCTURE — Pick exactly 6 stories across these categories:

1. MATCH PREVIEW OR RESULT (mandatory — 1–2 stories):
For upcoming finals games include:
- Which teams are playing, venue, date and time AEST
- Betting odds from Sportsbet or TAB (e.g. "Fremantle
  $1.45 · Hawthorn $2.80")
- Predictions from AFL.com.au, Fox Sports, The Age,
  Herald Sun analysts — name the expert and their pick
- Key matchup (e.g. "Bontempelli vs Daicos in the middle")
- Injury and team news affecting the game
For completed finals: full score, best on ground,
margin, key moments

2. PLAYER NEWS (mandatory — 1–2 stories):
- Injury updates — who is in/out and why
- Suspension and tribunal news
- Award news (Brownlow, Rising Star, All-Australian)
- Contract and trade news
- ALWAYS cover Sydney Swans 5-player suspension
  situation (Heeney, Warner, Blakey, Jordon, Bice)
  while it remains active

3. TEAM NEWS (1 story):
- Training reports
- Coach press conferences
- Selection changes and surprises
- MELBOURNE CLUBS priority: Collingwood, Carlton,
  Melbourne, Western Bulldogs, Essendon, Hawthorn,
  Richmond, North Melbourne, St Kilda, Footscray

4. FINALS LADDER / STANDINGS (1 story when relevant):
- Who plays who next week
- What each result means for the premiership race
- Path to the Grand Final

BETTING ODDS FORMAT:
When including odds always format as:
"[Team A] $X.XX · [Team B] $X.XX (Sportsbet)"
Source must be named. Use latest available odds.

PREDICTION FORMAT:
"[Expert name] ([Publication]) tips [Team] by [margin]"
Include at least 2 expert predictions per preview.

ALWAYS:
- Name specific players in every headline
- Include AEST times for all games
- Prioritise Melbourne-based clubs when equal news
- Cover AFLW when in season

NEVER:
- Generic "team wins" headlines
- Stories without player names
- Predictions without naming the source

Tags: Finals | Prediction | Odds | Injury |
Team News | Melbourne Clubs | AFLW | Tribunal`,
};
