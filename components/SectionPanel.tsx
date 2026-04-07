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
  const [state, setState] = useState<
    "idle" | "loading" | "loaded" | "error"
  >("idle");
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
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.icon}>{section.icon}</span>
          <div>
            <h2 style={styles.title}>{section.title}</h2>
            <p style={styles.sources}>{section.sources}</p>
          </div>
        </div>
        <div style={styles.headerRight}>
          {state === "loaded" && result && formattedTime && (
            <div style={styles.statusRow}>
              <span
                style={{
                  ...styles.dot,
                  background: result.cached ? "#22c55e" : "#3b82f6",
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
            style={{
              ...styles.button,
              ...(state === "loading" ? styles.buttonDisabled : {}),
            }}
          >
            {state === "loading"
              ? "fetching..."
              : state === "loaded"
              ? "refresh"
              : "fetch"}
          </button>
        </div>
      </div>

      {state === "idle" && (
        <p style={styles.idle}>Press fetch to load the latest briefing.</p>
      )}

      {state === "loading" && (
        <p style={styles.idle}>Searching for news…</p>
      )}

      {state === "error" && (
        <p style={styles.error}>Error: {errorMsg}</p>
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
    background: "#13131f",
    border: "1px solid #1e1e2e",
    borderRadius: "10px",
    padding: "20px 24px",
    marginBottom: "16px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "16px",
    gap: "12px",
  },
  headerLeft: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
  },
  headerRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "6px",
    flexShrink: 0,
  },
  icon: {
    fontSize: "22px",
    lineHeight: "1",
    marginTop: "2px",
  },
  title: {
    color: "#e2e2f0",
    fontSize: "16px",
    fontWeight: 700,
    margin: "0 0 4px 0",
  },
  sources: {
    color: "#6c6c8a",
    fontSize: "11px",
    fontFamily: "monospace",
    margin: 0,
  },
  statusRow: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  dot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    flexShrink: 0,
  },
  statusLabel: {
    color: "#6c6c8a",
    fontSize: "11px",
    fontFamily: "monospace",
  },
  button: {
    background: "#1e1e2e",
    color: "#a0a0c0",
    border: "1px solid #2e2e42",
    borderRadius: "6px",
    padding: "6px 14px",
    fontSize: "12px",
    fontFamily: "monospace",
    cursor: "pointer",
    letterSpacing: "0.03em",
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  idle: {
    color: "#4a4a6a",
    fontSize: "13px",
    fontFamily: "monospace",
    margin: "8px 0 0 0",
  },
  error: {
    color: "#f87171",
    fontSize: "13px",
    fontFamily: "monospace",
    margin: "8px 0 0 0",
  },
};
