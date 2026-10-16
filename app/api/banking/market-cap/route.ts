import { NextResponse } from "next/server";

// Route handlers are not cached by default in this Next version; the hourly
// caching that matters here is on the upstream calls (see `next.revalidate`
// below), which is what keeps us under Yahoo's rate limit. Deliberately NOT
// `dynamic = "force-static"`: that would prerender at build time and bake a
// failed upstream response into the static output for a whole hour.
export const revalidate = 3600;

export type BankQuote = {
  ticker: string;
  name: string;
  price: number | null;
  change: number | null;
  changePct: number | null;
  marketCap: number | null;
};

const BANKS = [
  { ticker: "CBA.AX", asx: "CBA", name: "Commonwealth Bank" },
  { ticker: "ANZ.AX", asx: "ANZ", name: "ANZ Group" },
  { ticker: "NAB.AX", asx: "NAB", name: "NAB" },
  { ticker: "WBC.AX", asx: "WBC", name: "Westpac" },
] as const;

// Yahoo rejects requests with no browser-ish User-Agent.
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const TIMEOUT_MS = 6000;

/**
 * Last successful payload, kept in module scope. Serverless instances are
 * recycled so this is a best-effort warm cache, not durable storage — it
 * exists so a transient upstream failure serves stale numbers rather than
 * blanks.
 */
let lastGood: BankQuote[] | null = null;

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

/** Yahoo chart endpoint — price and day change. No marketCap on this endpoint. */
async function fetchYahoo(ticker: string): Promise<{
  price: number | null;
  change: number | null;
  changePct: number | null;
  prevClose: number | null;
}> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=5d`;
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    next: { revalidate },
  });
  if (!res.ok) throw new Error(`yahoo ${ticker} ${res.status}`);

  const json: unknown = await res.json();
  const meta = (json as { chart?: { result?: Array<{ meta?: Record<string, unknown> }> } })
    ?.chart?.result?.[0]?.meta;
  if (!meta) throw new Error(`yahoo ${ticker} no meta`);

  return {
    price: num(meta.regularMarketPrice),
    // `regularMarketChange` is absent from this endpoint; `fulldayChange` is
    // the equivalent field it does return.
    change: num(meta.fulldayChange),
    changePct: num(meta.regularMarketChangePercent) ?? num(meta.fulldayChangePercent),
    prevClose: num(meta.chartPreviousClose),
  };
}

/**
 * ASX's own public endpoint, for the official share count. Market cap is not
 * available from the Yahoo chart endpoint, and Yahoo's quote/quoteSummary
 * endpoints now require a cookie+crumb handshake, so market cap is derived as
 * live price x shares on issue rather than taken from a single field.
 */
async function fetchShares(asxCode: string): Promise<{
  shares: number | null;
  prevClose: number | null;
  bid: number | null;
  ask: number | null;
}> {
  const url = `https://asx.api.markitdigital.com/asx-research/1.0/companies/${asxCode}/key-statistics`;
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    next: { revalidate },
  });
  if (!res.ok) throw new Error(`asx ${asxCode} ${res.status}`);

  const json: unknown = await res.json();
  const data = (json as { data?: Record<string, unknown> })?.data ?? {};
  // `priceClose` is the PREVIOUS session's close (verified against Yahoo's own
  // day change), while bid/ask are live — so the two together give a real day
  // move even when Yahoo is unavailable.
  return {
    shares: num(data.numOfShares),
    prevClose: num(data.priceClose),
    bid: num(data.priceBid),
    ask: num(data.priceAsk),
  };
}

async function buildBank(bank: (typeof BANKS)[number]): Promise<BankQuote> {
  const [yahoo, asx] = await Promise.allSettled([
    fetchYahoo(bank.ticker),
    fetchShares(bank.asx),
  ]);

  const y = yahoo.status === "fulfilled" ? yahoo.value : null;
  const a = asx.status === "fulfilled" ? asx.value : null;

  // Price, in order of preference: Yahoo's live quote, then the ASX bid/ask
  // midpoint, then the previous close as a last resort.
  const asxMid =
    a && a.bid !== null && a.ask !== null && a.bid > 0 && a.ask > 0
      ? (a.bid + a.ask) / 2
      : null;
  const price = y?.price ?? asxMid ?? a?.prevClose ?? null;

  // True only when `price` reflects current trading. If we are showing a
  // previous close, there is no day move to report — it must stay null and
  // render as a dash. Computing it anyway would yield a fake 0.00% flat day.
  const priceIsLive = y?.price !== null && y?.price !== undefined ? true : asxMid !== null;

  const baseline = a?.prevClose ?? y?.prevClose ?? null;

  let change: number | null = null;
  let changePct: number | null = null;
  if (priceIsLive) {
    change = y?.change ?? (price !== null && baseline !== null ? price - baseline : null);
    changePct =
      y?.changePct ?? (change !== null && baseline ? (change / baseline) * 100 : null);
  }

  const shares = a?.shares ?? null;

  return {
    ticker: bank.ticker,
    name: bank.name,
    price,
    change: change === null ? null : Number(change.toFixed(2)),
    changePct: changePct === null ? null : Number(changePct.toFixed(3)),
    marketCap: price !== null && shares !== null ? price * shares : null,
  };
}

export async function GET() {
  try {
    const settled = await Promise.allSettled(BANKS.map(buildBank));

    const banks: BankQuote[] = settled.map((r, i) => {
      if (r.status === "fulfilled" && r.value.price !== null) return r.value;
      // Per-bank fallback to the last good value for that same ticker.
      const cached = lastGood?.find((b) => b.ticker === BANKS[i].ticker);
      return (
        cached ?? {
          ticker: BANKS[i].ticker,
          name: BANKS[i].name,
          price: null,
          change: null,
          changePct: null,
          marketCap: null,
        }
      );
    });

    if (banks.some((b) => b.price !== null)) lastGood = banks;

    return NextResponse.json(banks);
  } catch {
    // Never crash the Banking tab: serve the last good payload, or a
    // well-formed array of nulls that the table renders as em dashes.
    return NextResponse.json(
      lastGood ??
        BANKS.map((b) => ({
          ticker: b.ticker,
          name: b.name,
          price: null,
          change: null,
          changePct: null,
          marketCap: null,
        })),
    );
  }
}
