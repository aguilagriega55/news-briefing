"use client";

import { useState, useEffect } from "react";

interface Ticker {
  symbol: string;
  name: string;
  price: string;
  change: string;
  up: boolean;
}

export default function TickerStrip() {
  const [tickers, setTickers] = useState<Ticker[]>([]);

  async function load() {
    try {
      const res = await fetch("/api/tickers");
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.tickers)) setTickers(data.tickers);
    } catch {
      // non-critical
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  if (tickers.length === 0) return null;

  return (
    <div style={styles.wrap}>
      <div style={styles.inner}>
        {tickers.map((t) => (
          <div key={t.symbol} style={styles.item}>
            <span style={styles.name}>{t.name}</span>
            <span style={styles.price}>{t.price}</span>
            <span style={{ ...styles.change, color: t.up ? "#16a34a" : "#dc2626" }}>
              {t.up ? "+" : ""}{t.change}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    background: "#111",
    overflowX: "auto",
    overflowY: "hidden",
    height: "44px",
    borderBottom: "1px solid #222",
    scrollbarWidth: "none",
    flexShrink: 0,
  },
  inner: {
    display: "flex",
    alignItems: "center",
    height: "100%",
    whiteSpace: "nowrap",
  },
  item: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    paddingRight: "20px",
    paddingLeft: "10px",
    height: "100%",
    flexShrink: 0,
  },
  name: {
    fontFamily: "var(--font-mono)",
    fontSize: "10px",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  price: {
    fontFamily: "var(--font-mono)",
    fontSize: "14px",
    fontWeight: 500,
    color: "#fff",
    letterSpacing: "0.02em",
  },
  change: {
    fontFamily: "var(--font-mono)",
    fontSize: "12px",
    fontWeight: 600,
    letterSpacing: "0.02em",
  },
};
