"use client";

import { useEffect, useState } from "react";

export type BankQuote = {
  ticker: string;
  name: string;
  price: number | null;
  change: number | null;
  changePct: number | null;
  marketCap: number | null;
};

const TICKERS = ["CBA.AX", "ANZ.AX", "NAB.AX", "WBC.AX"] as const;

const MONO =
  'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace';

const UP = "#15803d";
const DOWN = "#dc2626";

/** $267b — billions, no decimals, per spec. Null-safe. */
function fmtMarketCap(v: number | null): string {
  if (v === null || !Number.isFinite(v)) return "—";
  return `$${Math.round(v / 1_000_000_000)}b`;
}

function fmtPrice(v: number | null): string {
  if (v === null || !Number.isFinite(v)) return "—";
  return v.toFixed(2);
}

/** Zone abbreviation is derived, not hardcoded: Melbourne is AEDT in summer. */
function asAtLabel(d: Date): string {
  const time = d.toLocaleTimeString("en-AU", {
    timeZone: "Australia/Sydney",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const zone =
    new Intl.DateTimeFormat("en-AU", {
      timeZone: "Australia/Sydney",
      timeZoneName: "short",
    })
      .formatToParts(d)
      .find((p) => p.type === "timeZoneName")?.value ?? "AEST";
  return `As at ${time} ${zone} · ASX`;
}

const th: React.CSSProperties = {
  padding: "7px 10px",
  textAlign: "left",
  fontSize: 10,
  fontWeight: 600,
  color: "#fff",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
};

const td: React.CSSProperties = {
  padding: "9px 10px",
  fontSize: 13,
  color: "#000",
  whiteSpace: "nowrap",
};

const tdNum: React.CSSProperties = {
  ...td,
  fontFamily: MONO,
  textAlign: "right",
  fontVariantNumeric: "tabular-nums",
};

export default function BankingMarketCapTable() {
  const [rows, setRows] = useState<BankQuote[] | null>(null);
  const [asAt, setAsAt] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/banking/market-cap")
      .then((r) => r.json())
      .then((data: BankQuote[] | { banks?: BankQuote[] }) => {
        if (cancelled) return;
        const banks = Array.isArray(data) ? data : data.banks ?? [];
        if (banks.length) {
          setRows(banks);
          setAsAt(new Date());
        } else {
          setRows([]);
        }
      })
      .catch(() => {
        // Never crash or block the tab — fall through to the empty state.
        if (!cancelled) setRows([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Skeleton: same row count and geometry as the real table, so nothing shifts.
  const skeleton = rows === null;
  const display: BankQuote[] = skeleton
    ? TICKERS.map((t) => ({
        ticker: t,
        name: "",
        price: null,
        change: null,
        changePct: null,
        marketCap: null,
      }))
    : rows;

  if (!skeleton && display.length === 0) {
    return (
      <div style={{ margin: "16px 0", padding: "10px 12px", border: "1px solid #e5e5e5", borderRadius: 6, fontSize: 12, color: "#888" }}>
        Big Four market data unavailable.
      </div>
    );
  }

  return (
    <div style={{ margin: "16px 0" }}>
      <div style={{ border: "1px solid #e5e5e5", borderRadius: 6, overflow: "hidden", background: "#fff" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
            <thead>
              <tr style={{ background: "#000" }}>
                <th style={th}>Bank</th>
                <th style={th}>ASX</th>
                <th style={{ ...th, textAlign: "right" }}>Price</th>
                <th style={{ ...th, textAlign: "right" }}>Mkt Cap</th>
                <th style={{ ...th, textAlign: "right" }}>Day</th>
              </tr>
            </thead>
            <tbody>
              {display.map((b, i) => {
                const last = i === display.length - 1;
                const pct = b.changePct;
                const up = typeof pct === "number" && pct >= 0;
                const colour = typeof pct === "number" ? (up ? UP : DOWN) : "#888";
                return (
                  <tr key={b.ticker} style={{ borderBottom: last ? "none" : "1px solid #f0f0f0" }}>
                    <td style={{ ...td, fontWeight: 600 }}>
                      {skeleton ? <Bar w={118} /> : b.name}
                    </td>
                    <td style={{ ...td, fontFamily: MONO, fontSize: 12, color: "#555" }}>
                      {skeleton ? <Bar w={34} /> : b.ticker.replace(".AX", "")}
                    </td>
                    <td style={tdNum}>{skeleton ? <Bar w={52} right /> : fmtPrice(b.price)}</td>
                    <td style={tdNum}>{skeleton ? <Bar w={44} right /> : fmtMarketCap(b.marketCap)}</td>
                    <td style={{ ...tdNum, color: colour, fontWeight: 600 }}>
                      {skeleton ? (
                        <Bar w={62} right />
                      ) : typeof pct === "number" ? (
                        `${up ? "▲" : "▼"} ${Math.abs(pct).toFixed(2)}%`
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div style={{ marginTop: 5, fontSize: 10, color: "#999" }}>
        {skeleton || !asAt ? "Loading ASX prices…" : asAtLabel(asAt)}
      </div>
    </div>
  );
}

/** Inert placeholder block used only by the skeleton state. */
function Bar({ w, right }: { w: number; right?: boolean }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: w,
        height: 10,
        borderRadius: 2,
        background: "#eee",
        verticalAlign: "middle",
        marginLeft: right ? "auto" : undefined,
      }}
    />
  );
}
