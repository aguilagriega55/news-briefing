import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 300; // cache 5 min

const SYMBOLS = ["^AXJO", "^DJI", "^GSPC", "AUDUSD=X", "GC=F", "CL=F", "BTC-USD"];
const NAMES: Record<string, string> = {
  "^AXJO":    "ASX 200",
  "^DJI":     "DOW",
  "^GSPC":    "S&P 500",
  "AUDUSD=X": "AUD/USD",
  "GC=F":     "GOLD",
  "CL=F":     "OIL",
  "BTC-USD":  "BTC",
};

export async function GET() {
  try {
    const results = await Promise.allSettled(
      SYMBOLS.map(async (symbol) => {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
        const res = await fetch(url, {
          headers: { "User-Agent": "Mozilla/5.0" },
          next: { revalidate: 300 },
        });
        if (!res.ok) return null;
        const data = await res.json();
        const meta = data?.chart?.result?.[0]?.meta;
        if (!meta) return null;
        const price: number = meta.regularMarketPrice;
        const prev: number = meta.previousClose ?? meta.chartPreviousClose ?? price;
        const change = ((price - prev) / prev) * 100;
        return {
          symbol,
          name: NAMES[symbol],
          price: price < 1
            ? price.toFixed(4)
            : price.toLocaleString("en", { maximumFractionDigits: 2 }),
          change: change.toFixed(2),
          up: change >= 0,
        };
      })
    );

    const tickers = results
      .filter((r) => r.status === "fulfilled" && r.value !== null)
      .map((r) => (r as PromiseFulfilledResult<unknown>).value);

    return NextResponse.json({ tickers });
  } catch {
    return NextResponse.json({ tickers: [] });
  }
}
