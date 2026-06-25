// Structured World Cup data for the WORLD CUP tab's non-NEWS panes.
// Fixtures / results / standings / knockouts come from football-data.org;
// match odds + outright (forecast) probabilities come from the-odds-api.com.
// All fetched server-side so the API keys never reach the client. Cached via
// the Next Data Cache (revalidate) to stay inside the odds free-tier quota.

const FD_BASE = "https://api.football-data.org/v4/competitions/WC";
const ODDS_BASE = "https://api.the-odds-api.com/v4/sports";

const FD_REVALIDATE = 1800;    // 30 min — fixtures/results/standings
const ODDS_REVALIDATE = 21600; // 6 h    — protect the 500/month odds quota

// Pin co-hosts first in every team-ordered view.
const PIN = ["Mexico", "Australia"];

export type WcFixture = {
  utcDate: string;
  home: string;
  away: string;
  homeTla: string;
  awayTla: string;
  stage: string;
  group: string | null;
  odds: { home: number; draw: number; away: number } | null;
};
export type WcResult = {
  utcDate: string;
  home: string;
  away: string;
  homeScore: number | null;
  awayScore: number | null;
  stage: string;
};
export type WcStandingRow = {
  position: number;
  team: string;
  tla: string;
  played: number;
  won: number;
  draw: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
  pinned: boolean;
};
export type WcGroup = { group: string; table: WcStandingRow[] };
export type WcForecastRow = { rank: number; team: string; winPct: number; pinned: boolean };

export type WorldCupData = {
  available: boolean;
  oddsAvailable: boolean;
  fetched_at: string;
  fixtures: WcFixture[];
  results: WcResult[];
  standings: WcGroup[];
  knockouts: WcFixture[];
  forecast: WcForecastRow[];
};

// ── Team-name normalisation (football-data names vs odds-api names) ───────────
const ALIASES: Record<string, string> = {
  "cote d'ivoire": "ivory coast",
  "korea republic": "south korea",
  "korea dpr": "north korea",
  "ir iran": "iran",
  "usa": "united states",
  "united states of america": "united states",
};
function norm(name: string): string {
  const base = (name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .trim();
  return ALIASES[base] ?? base;
}

function prettyStage(stage: string): string {
  return (stage || "")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

async function fdGet(path: string) {
  const key = process.env.FOOTBALL_DATA_API_KEY;
  if (!key) throw new Error("FOOTBALL_DATA_API_KEY not set");
  const res = await fetch(`${FD_BASE}${path}`, {
    headers: { "X-Auth-Token": key },
    next: { revalidate: FD_REVALIDATE },
  });
  if (!res.ok) throw new Error(`football-data ${res.status} for ${path}`);
  return res.json();
}

// Returns a map keyed by "homeNorm|awayNorm" → {home,draw,away} median odds.
async function fetchMatchOdds(): Promise<Map<string, { home: number; draw: number; away: number }>> {
  const key = process.env.ODDS_API_KEY;
  const map = new Map<string, { home: number; draw: number; away: number }>();
  if (!key) return map;
  const res = await fetch(
    `${ODDS_BASE}/soccer_fifa_world_cup/odds?apiKey=${key}&regions=uk&markets=h2h&oddsFormat=decimal`,
    { next: { revalidate: ODDS_REVALIDATE } }
  );
  if (!res.ok) return map;
  const events = (await res.json()) as Array<{
    home_team: string;
    away_team: string;
    bookmakers: Array<{ markets: Array<{ key: string; outcomes: Array<{ name: string; price: number }> }> }>;
  }>;
  for (const ev of events) {
    // Median across bookmakers for each outcome to strip outliers.
    const buckets: Record<"home" | "draw" | "away", number[]> = { home: [], draw: [], away: [] };
    for (const bk of ev.bookmakers ?? []) {
      const m = (bk.markets ?? []).find((x) => x.key === "h2h");
      if (!m) continue;
      for (const o of m.outcomes) {
        if (norm(o.name) === norm(ev.home_team)) buckets.home.push(o.price);
        else if (norm(o.name) === norm(ev.away_team)) buckets.away.push(o.price);
        else buckets.draw.push(o.price);
      }
    }
    const median = (xs: number[]) =>
      xs.length ? xs.sort((a, b) => a - b)[Math.floor(xs.length / 2)] : 0;
    if (buckets.home.length && buckets.away.length) {
      map.set(`${norm(ev.home_team)}|${norm(ev.away_team)}`, {
        home: median(buckets.home),
        draw: median(buckets.draw),
        away: median(buckets.away),
      });
    }
  }
  return map;
}

// Outright winner odds → normalised implied win probability (overround removed).
async function fetchForecast(): Promise<{ rows: WcForecastRow[]; available: boolean }> {
  const key = process.env.ODDS_API_KEY;
  if (!key) return { rows: [], available: false };
  const res = await fetch(
    `${ODDS_BASE}/soccer_fifa_world_cup_winner/odds?apiKey=${key}&regions=uk&markets=outrights&oddsFormat=decimal`,
    { next: { revalidate: ODDS_REVALIDATE } }
  );
  if (!res.ok) return { rows: [], available: false };
  const data = (await res.json()) as Array<{
    bookmakers: Array<{ markets: Array<{ outcomes: Array<{ name: string; price: number }> }> }>;
  }>;
  const bk = data?.[0]?.bookmakers?.[0];
  const outcomes = bk?.markets?.[0]?.outcomes ?? [];
  if (!outcomes.length) return { rows: [], available: false };
  const raw = outcomes.map((o) => ({ team: o.name, p: o.price > 0 ? 1 / o.price : 0 }));
  const sum = raw.reduce((s, r) => s + r.p, 0) || 1;
  const rows = raw
    .map((r) => ({ team: r.team, winPct: (r.p / sum) * 100 }))
    .sort((a, b) => b.winPct - a.winPct)
    .map((r, i) => ({
      rank: i + 1,
      team: r.team,
      winPct: Math.round(r.winPct * 10) / 10,
      pinned: PIN.some((p) => norm(p) === norm(r.team)),
    }));
  return { rows, available: true };
}

// Order groups so the group containing Mexico comes first, Australia's second,
// then the rest alphabetically (editorial spec).
function groupRank(table: WcStandingRow[]): number {
  const names = table.map((r) => norm(r.team));
  if (names.includes(norm("Mexico"))) return 0;
  if (names.includes(norm("Australia"))) return 1;
  return 2;
}

export async function getWorldCupData(): Promise<WorldCupData> {
  if (!process.env.FOOTBALL_DATA_API_KEY) {
    return {
      available: false,
      oddsAvailable: false,
      fetched_at: new Date().toISOString(),
      fixtures: [],
      results: [],
      standings: [],
      knockouts: [],
      forecast: [],
    };
  }

  const [matchesRes, standingsRes, oddsMap, forecast] = await Promise.all([
    fdGet("/matches"),
    fdGet("/standings"),
    fetchMatchOdds(),
    fetchForecast(),
  ]);

  const matches = (matchesRes.matches ?? []) as Array<{
    utcDate: string;
    status: string;
    stage: string;
    group: string | null;
    homeTeam: { name: string; tla: string };
    awayTeam: { name: string; tla: string };
    score: { fullTime: { home: number | null; away: number | null } };
  }>;

  const toFixture = (m: (typeof matches)[number]): WcFixture => ({
    utcDate: m.utcDate,
    home: m.homeTeam.name,
    away: m.awayTeam.name,
    homeTla: m.homeTeam.tla ?? "",
    awayTla: m.awayTeam.tla ?? "",
    stage: prettyStage(m.stage),
    group: m.group ? prettyStage(m.group) : null,
    odds: oddsMap.get(`${norm(m.homeTeam.name)}|${norm(m.awayTeam.name)}`) ?? null,
  });

  const upcoming = matches
    .filter((m) => m.status === "TIMED" || m.status === "SCHEDULED")
    .sort((a, b) => a.utcDate.localeCompare(b.utcDate));

  const fixtures = upcoming
    .filter((m) => m.stage === "GROUP_STAGE")
    .slice(0, 16)
    .map(toFixture);

  const knockouts = upcoming
    .filter((m) => m.stage !== "GROUP_STAGE")
    .slice(0, 16)
    .map(toFixture);

  const results: WcResult[] = matches
    .filter((m) => m.status === "FINISHED")
    .sort((a, b) => b.utcDate.localeCompare(a.utcDate))
    .slice(0, 16)
    .map((m) => ({
      utcDate: m.utcDate,
      home: m.homeTeam.name,
      away: m.awayTeam.name,
      homeScore: m.score.fullTime.home,
      awayScore: m.score.fullTime.away,
      stage: prettyStage(m.stage),
    }));

  const standings: WcGroup[] = ((standingsRes.standings ?? []) as Array<{
    group: string;
    table: Array<{
      position: number;
      team: { name: string; tla: string };
      playedGames: number;
      won: number;
      draw: number;
      lost: number;
      goalsFor: number;
      goalsAgainst: number;
      goalDifference: number;
      points: number;
    }>;
  }>)
    .map((g) => ({
      group: g.group,
      table: g.table.map((r) => ({
        position: r.position,
        team: r.team.name,
        tla: r.team.tla ?? "",
        played: r.playedGames,
        won: r.won,
        draw: r.draw,
        lost: r.lost,
        gf: r.goalsFor,
        ga: r.goalsAgainst,
        gd: r.goalDifference,
        points: r.points,
        pinned: PIN.some((p) => norm(p) === norm(r.team.name)),
      })),
    }))
    .sort((a, b) => groupRank(a.table) - groupRank(b.table) || a.group.localeCompare(b.group));

  return {
    available: true,
    oddsAvailable: forecast.available,
    fetched_at: new Date().toISOString(),
    fixtures,
    results,
    standings,
    knockouts,
    forecast: forecast.rows,
  };
}
