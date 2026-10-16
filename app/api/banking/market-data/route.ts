import { NextResponse } from "next/server";

// Matches the sibling market-cap route: the hourly caching that keeps us under
// Yahoo's rate limit lives on the upstream calls via `next.revalidate`, not on
// the handler. Deliberately NOT `dynamic = "force-static"` — that would bake a
// failed upstream response into the static output for a whole hour.
export const revalidate = 3600;

export type BankMarketData = {
  ticker: string;
  price: number | null;
  change: number | null;
  changePct: number | null;
  high52w: number | null;
  low52w: number | null;
  pe: number | null;
  dividendYield: number | null;
  /** Extra field: the Market tab has a YTD Change row and no other source for it. */
  ytdChangePct: number | null;
};

const TICKERS = ["CBA.AX", "NAB.AX", "WBC.AX", "ANZ.AX"] as const;

/** ASX code for the markitdigital endpoint, derived from the Yahoo ticker. */
const asxCode = (ticker: string): string => ticker.replace(".AX", "");

// Yahoo rejects requests with no browser-ish User-Agent.
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const TIMEOUT_MS = 6000;

/**
 * Last successful payload, kept in module scope. Serverless instances are
 * recycled so this is a best-effort warm cache, not durable storage — it
 * exists so a transient upstream failure serves stale numbers rather than
 * blanks. There is no synthetic fallback: anything we cannot source stays
 * null and renders as an em dash.
 */
let lastGood: BankMarketData[] | null = null;

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function round(v: number | null, dp: number): number | null {
  return v === null ? null : Number(v.toFixed(dp));
}

type ChartMeta = Record<string, unknown>;

/** One daily bar: epoch seconds paired with its close. Both always finite. */
type SeriesPoint = {
  t: number;
  c: number;
};

type ChartPayload = {
  meta: ChartMeta;
  series: SeriesPoint[];
};

/**
 * Yahoo chart endpoint. `meta` carries the live price, day move and 52-week
 * range; the quote series is only read for the YTD baseline.
 */
async function fetchChart(ticker: string, range: string): Promise<ChartPayload> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=${range}`;
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    next: { revalidate },
  });
  if (!res.ok) throw new Error(`yahoo ${ticker} ${range} ${res.status}`);

  const json: unknown = await res.json();
  const result = (
    json as {
      chart?: {
        result?: Array<{
          meta?: ChartMeta;
          timestamp?: Array<number | null>;
          indicators?: { quote?: Array<{ close?: Array<number | null> }> };
        }>;
      };
    }
  )?.chart?.result?.[0];

  const meta = result?.meta;
  if (!meta) throw new Error(`yahoo ${ticker} ${range} no meta`);

  // Zip rather than filter each array separately: dropping a null close
  // without dropping its timestamp would shift every later bar's date.
  const stamps = result?.timestamp ?? [];
  const closes = result?.indicators?.quote?.[0]?.close ?? [];
  const series: SeriesPoint[] = [];
  for (let i = 0; i < stamps.length; i++) {
    const t = stamps[i];
    const c = closes[i];
    if (typeof t === "number" && Number.isFinite(t) && typeof c === "number" && Number.isFinite(c)) {
      series.push({ t, c });
    }
  }

  return { meta, series };
}

type AsxStats = {
  pe: number | null;
  dividendYield: number | null;
  high52w: number | null;
  low52w: number | null;
  prevClose: number | null;
  bid: number | null;
  ask: number | null;
};

/**
 * ASX's own public endpoint. P/E and dividend yield are not on the Yahoo chart
 * endpoint, and Yahoo's quote/quoteSummary endpoints now require a
 * cookie+crumb handshake — so both come from here, as does a 52-week range
 * fallback. Same source the market-cap route already relies on.
 */
async function fetchAsxStats(code: string): Promise<AsxStats> {
  const url = `https://asx.api.markitdigital.com/asx-research/1.0/companies/${code}/key-statistics`;
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    next: { revalidate },
  });
  if (!res.ok) throw new Error(`asx ${code} ${res.status}`);

  const json: unknown = await res.json();
  const data = (json as { data?: Record<string, unknown> })?.data ?? {};
  return {
    pe: num(data.priceEarningsRatio),
    // `yieldAnnual` is already a percentage, not a fraction.
    dividendYield: num(data.yieldAnnual),
    high52w: num(data.priceFiftyTwoWeekHigh),
    low52w: num(data.priceFiftyTwoWeekLow),
    // `priceClose` is the PREVIOUS session's close, while bid/ask are live.
    prevClose: num(data.priceClose),
    bid: num(data.priceBid),
    ask: num(data.priceAsk),
  };
}

/**
 * Calendar year of a bar, in Sydney. The ASX trades 10:00-16:00 AEST/AEDT,
 * which is the previous UTC day for part of the session, so a UTC year would
 * put an early-January bar in the wrong year.
 */
const SYDNEY_YEAR = new Intl.DateTimeFormat("en-AU", {
  timeZone: "Australia/Sydney",
  year: "numeric",
});

const yearOf = (epochSeconds: number): number =>
  Number(SYDNEY_YEAR.format(new Date(epochSeconds * 1000)));

/**
 * First trading close of the current calendar year — the YTD baseline. Derived
 * from a `range=1y` series rather than `range=ytd`: on a clean build every
 * ticker's `ytd` request failed while its `5d` request succeeded, so that
 * range is not dependable here. A 1y window spans the year boundary anyway.
 *
 * "Current" is taken from the newest bar, not the server clock, so the
 * baseline always belongs to the same year as the data it is compared against.
 */
function ytdBaseline(series: readonly SeriesPoint[]): number | null {
  const newest = series[series.length - 1];
  if (!newest) return null;
  const year = yearOf(newest.t);
  return series.find((p) => yearOf(p.t) === year)?.c ?? null;
}

/**
 * Pure assembler — every upstream call is made by the caller, in waves, so
 * this never issues a request of its own.
 */
function assembleBank(
  ticker: string,
  d: ChartPayload | null,
  y: ChartPayload | null,
  a: AsxStats | null,
): BankMarketData {
  const meta: ChartMeta = d?.meta ?? {};

  // Price, in order of preference: Yahoo's live quote, then the ASX bid/ask
  // midpoint, then the previous close as a last resort.
  const asxMid =
    a && a.bid !== null && a.ask !== null && a.bid > 0 && a.ask > 0
      ? (a.bid + a.ask) / 2
      : null;
  const price = num(meta.regularMarketPrice) ?? asxMid ?? a?.prevClose ?? null;

  // True only when `price` reflects current trading. If we are showing a
  // previous close there is no day move to report — it must stay null and
  // render as a dash rather than a fake 0.00% flat day.
  const priceIsLive = num(meta.regularMarketPrice) !== null || asxMid !== null;
  const baseline = a?.prevClose ?? num(meta.chartPreviousClose);

  let change: number | null = null;
  let changePct: number | null = null;
  if (priceIsLive) {
    // `regularMarketChange` is absent from this endpoint; `fulldayChange` is
    // the equivalent field it does return.
    change =
      num(meta.fulldayChange) ??
      (price !== null && baseline !== null ? price - baseline : null);
    changePct =
      num(meta.regularMarketChangePercent) ??
      num(meta.fulldayChangePercent) ??
      (change !== null && baseline ? (change / baseline) * 100 : null);
  }

  // No series, no YTD figure — never a synthetic stand-in.
  const ytdOpen = y ? ytdBaseline(y.series) : null;
  const ytdChangePct =
    price !== null && ytdOpen !== null && ytdOpen > 0
      ? ((price - ytdOpen) / ytdOpen) * 100
      : null;

  return {
    ticker,
    price: round(price, 2),
    change: round(change, 2),
    changePct: round(changePct, 2),
    high52w: round(num(meta.fiftyTwoWeekHigh) ?? a?.high52w ?? null, 2),
    low52w: round(num(meta.fiftyTwoWeekLow) ?? a?.low52w ?? null, 2),
    pe: round(a?.pe ?? null, 1),
    dividendYield: round(a?.dividendYield ?? null, 2),
    ytdChangePct: round(ytdChangePct, 2),
  };
}

const blank = (ticker: string): BankMarketData => ({
  ticker,
  price: null,
  change: null,
  changePct: null,
  high52w: null,
  low52w: null,
  pe: null,
  dividendYield: null,
  ytdChangePct: null,
});

/** Fulfilled value, or null — `Promise.allSettled` results, flattened. */
function valueOf<T>(r: PromiseSettledResult<T>): T | null {
  return r.status === "fulfilled" ? r.value : null;
}

export async function GET() {
  try {
    // Three sequential waves of four, rather than one burst of twelve. Yahoo
    // answers a burst with 429s, and it drops the *later* requests in the
    // burst — which is how the YTD series silently went missing while the
    // quote for the same ticker came back fine.
    const quotes = await Promise.allSettled(TICKERS.map((t) => fetchChart(t, "5d")));
    const years = await Promise.allSettled(TICKERS.map((t) => fetchChart(t, "1y")));
    const stats = await Promise.allSettled(TICKERS.map((t) => fetchAsxStats(asxCode(t))));

    const banks: BankMarketData[] = TICKERS.map((ticker, i) => {
      const bank = assembleBank(
        ticker,
        valueOf(quotes[i]),
        valueOf(years[i]),
        valueOf(stats[i]),
      );
      if (bank.price !== null) return bank;
      // Per-bank fallback to the last good value for that same ticker.
      return lastGood?.find((b) => b.ticker === ticker) ?? blank(ticker);
    });

    if (banks.some((b) => b.price !== null)) lastGood = banks;

    return NextResponse.json(banks);
  } catch {
    // Never crash the Banking tab: serve the last good payload, or a
    // well-formed array of nulls that the table renders as em dashes.
    return NextResponse.json(lastGood ?? TICKERS.map((t) => blank(t)));
  }
}
