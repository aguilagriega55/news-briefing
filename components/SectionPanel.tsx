"use client";

import { useState } from "react";
import { Section } from "@/lib/sections";
import { Article } from "@/lib/supabase";
import NewsCard from "./NewsCard";

interface SectionPanelProps {
  section: Section;
  edition: "morning" | "midday" | "evening" | "midnight";
}

interface FetchResult {
  articles: Article[];
  cached: boolean;
  fetched_at: string;
}

export default function SectionPanel({ section, edition }: SectionPanelProps) {
  const [state, setState] = useState<"idle" | "loading" | "loaded" | "error">("idle");
  const [result, setResult] = useState<FetchResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function fetchSection() {
    setState("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionId: section.id, edition }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: FetchResult = await res.json();
      setResult(data);
      setState("loaded");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
      setState("error");
    }
  }

  const formattedTime = result?.fetched_at
    ? new Date(result.fetched_at).toLocaleTimeString("en-AU", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div style={styles.panel}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h2 style={styles.title}>{section.label}</h2>
          <div style={styles.sourcePills}>
            {section.sources.split("·").map((s) => (
              <span key={s} style={styles.sourcePill}>{s.trim()}</span>
            ))}
          </div>
        </div>
        <div style={styles.headerRight}>
          {state === "loaded" && result && formattedTime && (
            <div style={styles.statusRow}>
              <span style={{
                ...styles.dot,
                background: result.cached ? "#2d6a4f" : "var(--accent-red)",
              }} />
              <span style={styles.statusLabel}>
                {result.cached ? "cached" : "live"} · {formattedTime}
              </span>
            </div>
          )}
          <button
            onClick={fetchSection}
            disabled={state === "loading"}
            title={state === "loaded" ? "Sync again" : "Sync"}
            style={{
              ...styles.syncBtn,
              ...(state === "loading" ? { opacity: 0.5, cursor: "not-allowed" } : {}),
            }}
          >
            <span style={{
              display: "inline-block",
              animation: state === "loading" ? "spin 0.8s linear infinite" : "none",
            }}>⟳</span>
          </button>
        </div>
      </div>

      {/* States */}
      {state === "idle" && (
        <p style={styles.idle}>Press ⟳ to load the latest briefing.</p>
      )}

      {state === "loading" && (
        <div style={{ paddingTop: "4px" }}>
          {[88, 72, 80, 65, 76].map((w, i) => (
            <div key={i} style={{ marginBottom: "18px" }}>
              <div className="shimmer" style={{ height: "14px", width: `${w}%`, marginBottom: "6px" }} />
              <div className="shimmer" style={{ height: "10px", width: `${Math.round(w * 0.75)}%`, marginBottom: "4px" }} />
              <div className="shimmer" style={{ height: "10px", width: `${Math.round(w * 0.55)}%` }} />
            </div>
          ))}
        </div>
      )}

      {state === "error" && (
        <p style={styles.error}>⚠ {errorMsg}</p>
      )}

      {state === "loaded" && result && (
        <div>
          {result.articles.map((article, i) => (
            <NewsCard key={i} article={article} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    paddingTop: "20px",
    borderTop: "1px solid var(--rule)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "16px",
    paddingBottom: "12px",
    borderBottom: "1px solid var(--rule)",
    gap: "12px",
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "6px",
    flexShrink: 0,
  },
  title: {
    fontFamily: "var(--font-display)",
    color: "var(--ink)",
    fontSize: "22px",
    fontWeight: 700,
    fontStyle: "italic",
    letterSpacing: "-0.01em",
    margin: "0 0 7px 0",
    lineHeight: 1.1,
  },
  sourcePills: {
    display: "flex",
    flexWrap: "wrap",
    gap: "5px",
  },
  sourcePill: {
    fontFamily: "var(--font-mono)",
    fontSize: "9px",
    color: "var(--ink-dim)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    border: "1px solid var(--rule)",
    padding: "1px 6px",
    borderRadius: "1px",
  },
  statusRow: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  dot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    flexShrink: 0,
  },
  statusLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: "9px",
    color: "var(--ink-dim)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  syncBtn: {
    background: "var(--ink)",
    color: "var(--paper)",
    border: "none",
    borderRadius: "1px",
    width: "28px",
    height: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: "14px",
    flexShrink: 0,
    transition: "opacity 0.12s",
  },
  idle: {
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    color: "var(--ink-dim)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    padding: "24px 0",
  },
  error: {
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    color: "var(--accent-red)",
    padding: "24px 0",
    letterSpacing: "0.04em",
  },
};
