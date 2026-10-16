"use client";

import { useEffect, useState } from "react";

/**
 * Mirrors the payload of /api/banking/market-data. Declared here rather than
 * imported from the route so the route module stays out of the client bundle
 * graph — same convention as BankingMarketCapTable.
 */
export type BankMarketData = {
  ticker: string;
  price: number | null;
  change: number | null;
  changePct: number | null;
  high52w: number | null;
  low52w: number | null;
  pe: number | null;
  dividendYield: number | null;
  ytdChangePct: number | null;
};

/* ------------------------------------------------------------------ banks */

type BankKey = "CBA" | "NAB" | "WBC" | "ANZ";

const BANKS: readonly BankKey[] = ["CBA", "NAB", "WBC", "ANZ"] as const;

/** Market leader — its column is tinted so it reads as the benchmark. */
const LEADER: BankKey = "CBA";

const TICKERS: Record<BankKey, string> = {
  CBA: "CBA.AX",
  NAB: "NAB.AX",
  WBC: "WBC.AX",
  ANZ: "ANZ.AX",
};

/** Shares on issue, millions. Fixed inputs to the market-cap calculation. */
const SHARES_M: Record<BankKey, number> = {
  CBA: 1651,
  NAB: 3323,
  WBC: 3214,
  ANZ: 3105,
};

/* ------------------------------------------------------------------ theme */

const BG = "#0a0a0a";
const ROW_A = "#111";
const ROW_B = "#1a1a1a";
const BORDER = "#222";
const TEXT = "#fff";
const MUTED = "#888";
const DIM = "#666";
const UP = "#22c55e";
const DOWN = "#ef4444";
/** Layered over the row background, so it works on both alternating shades. */
const LEADER_TINT = "rgba(255,255,255,0.045)";

const MONO =
  'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace';

/* ------------------------------------------------------------------- rows */

type Tone = "up" | "down" | null;

type Cell = {
  text: string;
  /** Secondary line, used by the Share Price row for the day move. */
  sub?: string;
  subTone?: Tone;
};

type Row = {
  label: string;
  cells: Record<BankKey, Cell>;
  /** Colour each cell by its leading sign: "+" green, "-" red. */
  signed?: boolean;
  /** Left-align the values instead of right-aligning them (text rows). */
  text?: boolean;
};

/** Build a row from four plain strings, in CBA · NAB · WBC · ANZ order. */
function row(
  label: string,
  cba: string,
  nab: string,
  wbc: string,
  anz: string,
  opts: { signed?: boolean; text?: boolean } = {},
): Row {
  return {
    label,
    cells: { CBA: { text: cba }, NAB: { text: nab }, WBC: { text: wbc }, ANZ: { text: anz } },
    ...opts,
  };
}

/* --------------------------------------------------------- static figures */

// Everything below is as-reported figures, held here deliberately: these tabs
// are never fetched. Only the Market tab talks to an API.

const PL_ROWS: readonly Row[] = [
  row("Total Revenue (AUD B)", "26.0", "~19.0", "~17.9", "~17.5"),
  row("Net Interest Income (AUD B)", "~19.0", "14.2", "13.1", "12.8"),
  row("Cash Earnings (AUD B)", "10.2", "7.1", "6.9", "6.7"),
  row("NPAT (AUD B)", "~10.2", "~6.8", "~6.1", "~5.9"),
  row("NIM (%)", "2.08", "1.72", "1.89", "1.63"),
  row("Cost-to-Income Ratio (%)", "42.6", "46.9", "48.3", "52.1"),
];

const CUSTOMER_ROWS: readonly Row[] = [
  row("Total Customers (M)", "17.6", "~9.0", "~10.0", "~8.0"),
  row("Retail / Personal (M)", "16.0", "~7.5", "~9.0", "~6.0"),
  row("Business / SME (M)", "1.25", "~1.1", "~0.9", "~1.1"),
  row("Institutional Clients", "~3,000", "~2,500", "~2,000", "~2,800"),
  row(
    "#1 position",
    "Home loans, deposits",
    "Business banking",
    "Pacific banking",
    "Institutional (Aus/NZ)",
    { text: true },
  ),
];

const EFFICIENCY_ROWS: readonly Row[] = [
  row("Return on Equity (%)", "14.1", "11.8", "10.9", "10.2"),
  row("Return on Assets (%)", "1.10", "0.85", "0.78", "0.74"),
  row("Loan Loss Rate (bps)", "18", "20", "22", "24"),
  row("Capital Ratio CET1 (%)", "12.3", "12.5", "12.0", "12.2"),
  row("Net Promoter Score", "+30", "+21", "+18", "+12", { signed: true }),
];

const BALANCE_ROWS: readonly Row[] = [
  row("Total Assets (AUD B)", "1,320", "1,080", "1,010", "1,025"),
  row("Total Loans (AUD B)", "893", "720", "680", "670"),
  row("Home Loans (AUD B)", "590", "350", "440", "340"),
  row("Business Loans (AUD B)", "145", "240", "135", "155"),
  row("Customer Deposits (AUD B)", "801", "650", "590", "600"),
];

/* ---------------------------------------------------------------- formats */

const DASH = "—";

function fmt(v: number | null | undefined, dp: number): string {
  return typeof v === "number" && Number.isFinite(v) ? v.toFixed(dp) : DASH;
}

/** Signed, so the row's own sign-colouring can pick it up. */
function fmtSigned(v: number | null | undefined, dp: number): string {
  if (typeof v !== "number" || !Number.isFinite(v)) return DASH;
  return `${v >= 0 ? "+" : "-"}${Math.abs(v).toFixed(dp)}`;
}

function toneOf(text: string): Tone {
  if (text.startsWith("+")) return "up";
  if (text.startsWith("-")) return "down";
  return null;
}

function colourFor(tone: Tone): string {
  return tone === "up" ? UP : tone === "down" ? DOWN : TEXT;
}

/** Zone abbreviation is derived, not hardcoded: Melbourne is AEDT in summer. */
function asAtLabel(d: Date): string {
  const time = d.toLocaleTimeString("en-AU", {
    timeZone: "Australia/Sydney",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const date = d.toLocaleDateString("en-AU", {
    timeZone: "Australia/Sydney",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const zone =
    new Intl.DateTimeFormat("en-AU", {
      timeZone: "Australia/Sydney",
      timeZoneName: "short",
    })
      .formatToParts(d)
      .find((p) => p.type === "timeZoneName")?.value ?? "AEST";
  return `Last updated ${date}, ${time} ${zone}`;
}

/* ------------------------------------------------------------------- tabs */

type TabId = "market" | "pl" | "customers" | "efficiency" | "balance";

const TABS: ReadonlyArray<{ id: TabId; label: string }> = [
  { id: "market", label: "Market" },
  { id: "pl", label: "P&L" },
  { id: "customers", label: "Customers" },
  { id: "efficiency", label: "Efficiency" },
  { id: "balance", label: "Balance Sheet" },
];

const SOURCE_NOTES: Record<TabId, string> = {
  market:
    "Source: Yahoo Finance (price, day move, 52-week range, YTD) · ASX (P/E, dividend yield). " +
    "Market cap = live price × shares on issue.",
  pl: "Source: FY25/FY26 Annual Reports",
  customers: "Source: FY25 results announcements and investor packs",
  efficiency: "Source: FY25 Annual Reports; Net Promoter Score per published consumer NPS surveys",
  balance: "Source: FY25 Annual Reports, balance sheet as at year end",
};

/** Static tabs carry a reporting vintage, not a render time — that would be misleading. */
const STATIC_VINTAGE: Record<Exclude<TabId, "market">, string> = {
  pl: "Last updated FY25 full-year results · CBA at FY26 H1, annualised",
  customers: "Last updated FY25 reporting season",
  efficiency: "Last updated FY25 full-year results",
  balance: "Last updated FY25 year end",
};

/* -------------------------------------------------------------- component */

export default function BigFourBankingDashboard() {
  const [tab, setTab] = useState<TabId>("market");
  const [market, setMarket] = useState<Record<string, BankMarketData> | null>(null);
  const [asAt, setAsAt] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/banking/market-data")
      .then((r) => r.json())
      .then((data: BankMarketData[]) => {
        if (cancelled) return;
        const byTicker: Record<string, BankMarketData> = {};
        if (Array.isArray(data)) {
          for (const b of data) if (b?.ticker) byTicker[b.ticker] = b;
        }
        setMarket(byTicker);
        setAsAt(new Date());
      })
      .catch(() => {
        // Never crash or block the tab. No synthetic numbers: an empty map
        // renders every cell as an em dash.
        if (!cancelled) setMarket({});
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loading = tab === "market" && market === null;
  const rows = tab === "market" ? marketRows(market) : staticRows(tab);

  return (
    <section
      style={{
        margin: "16px 0",
        background: BG,
        border: `1px solid ${BORDER}`,
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      {/* Tab bar — pills, scrollable rather than wrapped on narrow screens. */}
      <div
        role="tablist"
        aria-label="Big Four banking metrics"
        style={{
          display: "flex",
          gap: 6,
          padding: "10px 12px",
          borderBottom: `1px solid ${BORDER}`,
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
        }}
      >
        {TABS.map((t) => {
          const active = t.id === tab;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              style={{
                flexShrink: 0,
                height: 28,
                padding: "0 12px",
                border: `1px solid ${active ? "#3a3a3a" : "transparent"}`,
                borderRadius: 14,
                background: active ? "#1f1f1f" : "transparent",
                color: active ? TEXT : DIM,
                fontFamily: MONO,
                fontSize: 11,
                fontWeight: active ? 600 : 400,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                cursor: "pointer",
                WebkitTapHighlightColor: "transparent",
                minHeight: 0,
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Table — the only horizontally scrolling element. */}
      <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <table
          style={{
            width: "100%",
            minWidth: 520,
            borderCollapse: "collapse",
            background: BG,
          }}
        >
          <thead>
            <tr style={{ background: BG }}>
              <th style={{ ...thBase, ...stickyLabel(BG), textAlign: "left" }} />
              {BANKS.map((b) => {
                const lead = b === LEADER;
                return (
                  <th
                    key={b}
                    scope="col"
                    style={{
                      ...thBase,
                      textAlign: "right",
                      color: lead ? TEXT : MUTED,
                      fontWeight: lead ? 700 : 600,
                      background: lead ? LEADER_TINT : undefined,
                    }}
                  >
                    {b}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const bg = i % 2 === 0 ? ROW_A : ROW_B;
              return (
                <tr key={r.label} style={{ background: bg }}>
                  <th scope="row" style={{ ...tdLabel, ...stickyLabel(bg) }}>
                    {r.label}
                  </th>
                  {BANKS.map((b) => {
                    const cell = r.cells[b];
                    const lead = b === LEADER;
                    const tone = r.signed ? toneOf(cell.text) : null;
                    return (
                      <td
                        key={b}
                        style={{
                          ...(r.text ? tdText : tdNum),
                          color: colourFor(tone),
                          fontWeight: lead ? 600 : 400,
                          background: lead ? LEADER_TINT : undefined,
                        }}
                      >
                        {loading ? (
                          <Bar w={r.text ? 92 : 54} />
                        ) : (
                          <>
                            {cell.text}
                            {cell.sub && (
                              <div
                                style={{
                                  marginTop: 2,
                                  fontSize: 10,
                                  fontWeight: 500,
                                  color: colourFor(cell.subTone ?? null),
                                }}
                              >
                                {cell.sub}
                              </div>
                            )}
                          </>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Source note + last updated */}
      <div
        style={{
          padding: "9px 12px 11px",
          borderTop: `1px solid ${BORDER}`,
          background: BG,
        }}
      >
        <div style={{ fontSize: 10, color: MUTED, lineHeight: 1.5 }}>{SOURCE_NOTES[tab]}</div>
        <div style={{ marginTop: 3, fontSize: 10, color: DIM, fontFamily: MONO }}>
          {tab === "market"
            ? loading
              ? "Loading ASX prices…"
              : asAt
                ? asAtLabel(asAt)
                : "Live prices unavailable"
            : STATIC_VINTAGE[tab]}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- row builders */

function staticRows(tab: Exclude<TabId, "market">): readonly Row[] {
  switch (tab) {
    case "pl":
      return PL_ROWS;
    case "customers":
      return CUSTOMER_ROWS;
    case "efficiency":
      return EFFICIENCY_ROWS;
    case "balance":
      return BALANCE_ROWS;
  }
}

/** Live rows. A null/absent quote leaves every derived figure as an em dash. */
function marketRows(market: Record<string, BankMarketData> | null): readonly Row[] {
  const q = (b: BankKey): BankMarketData | undefined => market?.[TICKERS[b]];

  const cells = (make: (b: BankKey) => Cell): Record<BankKey, Cell> => ({
    CBA: make("CBA"),
    NAB: make("NAB"),
    WBC: make("WBC"),
    ANZ: make("ANZ"),
  });

  return [
    {
      label: "Share Price (AUD)",
      cells: cells((b) => {
        const d = q(b);
        const pct = d?.changePct;
        const has = typeof pct === "number" && Number.isFinite(pct);
        return {
          text: fmt(d?.price, 2),
          sub: has ? `${pct >= 0 ? "▲" : "▼"} ${Math.abs(pct).toFixed(2)}%` : DASH,
          subTone: has ? (pct >= 0 ? "up" : "down") : null,
        };
      }),
    },
    {
      label: "Market Cap (AUD B)",
      // price (AUD) × shares (millions) ÷ 1,000 = billions.
      cells: cells((b) => {
        const p = q(b)?.price;
        return {
          text:
            typeof p === "number" && Number.isFinite(p)
              ? ((p * SHARES_M[b]) / 1000).toFixed(1)
              : DASH,
        };
      }),
    },
    {
      label: "52-week High / Low",
      cells: cells((b) => {
        const d = q(b);
        const hi = fmt(d?.high52w, 2);
        const lo = fmt(d?.low52w, 2);
        return { text: hi === DASH && lo === DASH ? DASH : `${hi} / ${lo}` };
      }),
    },
    { label: "P/E Ratio", cells: cells((b) => ({ text: fmt(q(b)?.pe, 1) })) },
    {
      label: "Dividend Yield (%)",
      cells: cells((b) => ({ text: fmt(q(b)?.dividendYield, 2) })),
    },
    {
      label: "YTD Change (%)",
      signed: true,
      cells: cells((b) => ({ text: fmtSigned(q(b)?.ytdChangePct, 2) })),
    },
  ];
}

/* ----------------------------------------------------------------- styles */

const thBase: React.CSSProperties = {
  padding: "8px 10px",
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
  borderBottom: `1px solid ${BORDER}`,
};

const tdLabel: React.CSSProperties = {
  padding: "9px 10px",
  textAlign: "left",
  fontSize: 11,
  fontWeight: 400,
  color: MUTED,
  whiteSpace: "nowrap",
};

const tdNum: React.CSSProperties = {
  padding: "9px 10px",
  textAlign: "right",
  fontSize: 13,
  fontFamily: MONO,
  fontVariantNumeric: "tabular-nums",
  whiteSpace: "nowrap",
};

const tdText: React.CSSProperties = {
  padding: "9px 10px",
  textAlign: "left",
  fontSize: 11,
  lineHeight: 1.35,
  color: TEXT,
};

/**
 * The row-label column stays pinned while the bank columns scroll, so a narrow
 * screen never loses the metric name. Needs an opaque background of its own.
 */
function stickyLabel(bg: string): React.CSSProperties {
  return {
    position: "sticky",
    left: 0,
    zIndex: 1,
    background: bg,
    borderRight: `1px solid ${BORDER}`,
  };
}

/** Inert placeholder block used only by the Market tab's skeleton state. */
function Bar({ w }: { w: number }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: w,
        height: 10,
        borderRadius: 2,
        background: "#262626",
        verticalAlign: "middle",
      }}
    />
  );
}
