"use client";

import { useState } from "react";
import { Section } from "@/lib/sections";
import { Article } from "@/lib/supabase";
import NewsCard from "./NewsCard";

interface SectionPanelProps {
  section: Section;
  edition: "morning" | "evening";
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
      {/* Panel header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.icon}>{section.icon}</span>
          <div>
            <h2 style={styles.title}>{section.title}</h2>
            <div style={styles.sourcePills}>
              {section.sources.split("·").map((s) => (
                <span key={s} style={styles.sourcePill}>{s.trim()}</span>
              ))}
            </div>
          </div>
        </div>

        <div style={styles.headerRight}>
          {state === "loaded" && result && formattedTime && (
            <div style={styles.statusRow}>
              <span
                style={{
                  ...styles.dot,
                  background: result.cached ? "#22c55e" : "#3b82f6",
                  boxShadow: result.cached
                    ? "0 0 6px rgba(34,197,94,0.5)"
                    : "0 0 6px rgba(59,130,246,0.5)",
                }}
              />
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
              ...(state === "loading" ? styles.syncBtnDisabled : {}),
            }}
          >
            <span
              style={{
                display: "inline-block",
                animation: state === "loading" ? "spin 0.8s linear infinite" : "none",
                fontSize: "16px",
                lineHeight: 1,
              }}
            >
              ⟳
            </span>
          </button>
        </div>
      </div>

      {/* Content */}
      {state === "idle" && (
        <p style={styles.idle}>Press fetch to load the latest briefing.</p>
      )}

      {state === "loading" && (
        <div style={styles.loadingWrap}>
          <div style={styles.loadingBar} />
          <p style={styles.idle}>Searching for news…</p>
        </div>
      )}

      {state === "error" && (
        <p style={styles.error}>⚠ {errorMsg}</p>
      )}

      {state === "loaded" && result && (
        <div style={styles.articleList}>
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
    background: "var(--bg2)",
    border: "1px solid var(--border)",
    borderLeft: "3px solid var(--accent)",
    borderRadius: "14px",
    padding: "24px 28px",
    boxShadow: "0 4px 32px rgba(0,0,0,0.3)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
    gap: "16px",
  },
  headerLeft: {
    display: "flex",
    gap: "14px",
    alignItems: "flex-start",
    flex: 1,
  },
  headerRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "8px",
    flexShrink: 0,
  },
  icon: {
    fontSize: "26px",
    lineHeight: 1,
    marginTop: "2px",
  },
  title: {
    color: "var(--text-primary)",
    fontSize: "17px",
    fontWeight: 700,
    margin: "0 0 8px 0",
    fontFamily: "var(--font-body)",
    letterSpacing: "-0.01em",
  },
  sourcePills: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  },
  sourcePill: {
    background: "rgba(59,130,246,0.1)",
    border: "1px solid rgba(99,157,255,0.2)",
    color: "var(--accent-bright)",
    fontSize: "10px",
    fontFamily: "var(--font-mono)",
    padding: "2px 8px",
    borderRadius: "20px",
    letterSpacing: "0.03em",
  },
  statusRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  dot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    flexShrink: 0,
  },
  statusLabel: {
    color: "var(--text-dim)",
    fontSize: "11px",
    fontFamily: "var(--font-mono)",
  },
  syncBtn: {
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 0 16px var(--accent-glow)",
    transition: "all 0.15s",
    flexShrink: 0,
  },
  syncBtnDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
    boxShadow: "none",
  },
  idle: {
    color: "var(--text-dim)",
    fontSize: "13px",
    fontFamily: "var(--font-mono)",
    margin: "8px 0 0 0",
    letterSpacing: "0.02em",
  },
  loadingWrap: {
    paddingTop: "8px",
  },
  loadingBar: {
    height: "2px",
    background: "linear-gradient(90deg, var(--accent), var(--accent-bright), var(--accent))",
    backgroundSize: "200% 100%",
    borderRadius: "2px",
    marginBottom: "12px",
    animation: "shimmer 1.5s infinite linear",
  },
  error: {
    color: "#f87171",
    fontSize: "13px",
    fontFamily: "var(--font-mono)",
    margin: "8px 0 0 0",
  },
  articleList: {
    display: "flex",
    flexDirection: "column",
  },
};
