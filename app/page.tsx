"use client";

import { useState, useEffect, useCallback } from "react";
import { sections } from "@/lib/sections";
import { Article } from "@/lib/supabase";
import NewsCard from "@/components/NewsCard";
import Link from "next/link";

type Edition = "morning" | "evening";
type SectionState = "idle" | "loading" | "loaded" | "error";

interface SectionResult {
  state: SectionState;
  articles: Article[];
  cached: boolean;
  fetched_at: string;
  error: string;
}

function initResults(): Record<string, SectionResult> {
  return Object.fromEntries(
    sections.map((s) => [
      s.id,
      { state: "idle", articles: [], cached: false, fetched_at: "", error: "" },
    ])
  );
}

export default function Home() {
  const [edition, setEdition] = useState<Edition>(() =>
    new Date().getHours() < 12 ? "morning" : "evening"
  );
  const [activeTab, setActiveTab] = useState(0);
  const [results, setResults] = useState<Record<string, SectionResult>>(initResults);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSection = useCallback(async (sectionId: string, ed: Edition) => {
    setResults((prev) => ({
      ...prev,
      [sectionId]: { ...prev[sectionId], state: "loading", error: "" },
    }));
    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionId, edition: ed }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResults((prev) => ({
        ...prev,
        [sectionId]: {
          state: "loaded",
          articles: data.articles,
          cached: data.cached,
          fetched_at: data.fetched_at,
          error: "",
        },
      }));
    } catch (err) {
      setResults((prev) => ({
        ...prev,
        [sectionId]: {
          ...prev[sectionId],
          state: "error",
          error: err instanceof Error ? err.message : "Unknown error",
        },
      }));
    }
  }, []);

  // Auto-fetch all sections on mount
  useEffect(() => {
    sections.forEach((s) => fetchSection(s.id, edition));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch all when edition changes
  useEffect(() => {
    setResults(initResults());
    sections.forEach((s) => fetchSection(s.id, edition));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edition]);

  async function refreshAll() {
    setRefreshing(true);
    setResults(initResults());
    await Promise.all(sections.map((s) => fetchSection(s.id, edition)));
    setRefreshing(false);
  }

  const section = sections[activeTab];
  const result = results[section.id];

  const formattedTime = result.fetched_at
    ? new Date(result.fetched_at).toLocaleTimeString("en-AU", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const allLoaded = sections.every((s) => results[s.id].state !== "loading");
  const loadedCount = sections.filter((s) => results[s.id].state === "loaded").length;

  return (
    <main style={styles.main}>
      <div style={styles.container}>

        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerTop}>
            <div>
              <h1 style={styles.title}>News Briefing</h1>
              <p style={styles.date}>
                {new Date().toLocaleDateString("en-AU", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div style={styles.headerRight}>
              <Link href="/history" style={styles.archiveLink}>View archive →</Link>
              <div style={styles.controls}>
                {/* Edition toggle */}
                <div style={styles.editionToggle}>
                  <button
                    onClick={() => setEdition("morning")}
                    style={{ ...styles.editionBtn, ...(edition === "morning" ? styles.editionBtnActive : {}) }}
                  >☀️ AM</button>
                  <button
                    onClick={() => setEdition("evening")}
                    style={{ ...styles.editionBtn, ...(edition === "evening" ? styles.editionBtnActive : {}) }}
                  >🌙 PM</button>
                </div>
                {/* Refresh All */}
                <button
                  onClick={refreshAll}
                  disabled={refreshing || !allLoaded}
                  style={{
                    ...styles.refreshBtn,
                    ...(!allLoaded || refreshing ? styles.refreshBtnDisabled : {}),
                  }}
                >
                  <span style={{
                    display: "inline-block",
                    animation: (!allLoaded || refreshing) ? "spin 0.8s linear infinite" : "none",
                    marginRight: "6px",
                  }}>⟳</span>
                  {!allLoaded ? `Loading ${loadedCount}/${sections.length}…` : "Refresh All"}
                </button>
              </div>
            </div>
          </div>
          <div style={styles.rule} />
        </header>

        {/* Tab bar */}
        <div style={styles.tabBar}>
          {sections.map((s, i) => {
            const r = results[s.id];
            const isLoading = r.state === "loading";
            return (
              <button
                key={s.id}
                onClick={() => setActiveTab(i)}
                style={{
                  ...styles.tab,
                  ...(activeTab === i ? { ...styles.tabActive, borderColor: s.accent + "60", color: s.accent } : {}),
                }}
              >
                <span style={{ display: "inline-block", animation: isLoading ? "spin 0.8s linear infinite" : "none" }}>
                  {s.icon}
                </span>
                <span>{s.title}</span>
                {r.state === "loaded" && (
                  <span style={{ ...styles.tabBadge, background: s.accent + "25", color: s.accent }}>
                    {r.articles.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active section panel */}
        <div style={{ ...styles.panel, borderLeft: `3px solid ${section.accent}` }}>
          {/* Panel header */}
          <div style={styles.panelHeader}>
            <div style={styles.panelHeaderLeft}>
              <span style={styles.panelIcon}>{section.icon}</span>
              <div>
                <h2 style={styles.panelTitle}>{section.title}</h2>
                <div style={styles.sourcePills}>
                  {section.sources.split("·").map((src) => (
                    <span key={src} style={styles.sourcePill}>{src.trim()}</span>
                  ))}
                </div>
              </div>
            </div>
            <div style={styles.panelHeaderRight}>
              {result.state === "loaded" && formattedTime && (
                <div style={styles.statusRow}>
                  <span style={{
                    ...styles.dot,
                    background: result.cached ? "#22c55e" : "#3b82f6",
                    boxShadow: result.cached ? "0 0 6px rgba(34,197,94,0.5)" : "0 0 6px rgba(59,130,246,0.5)",
                  }} />
                  <span style={styles.statusLabel}>
                    {result.cached ? "cached" : "live"} · {formattedTime}
                  </span>
                </div>
              )}
              <button
                onClick={() => fetchSection(section.id, edition)}
                disabled={result.state === "loading"}
                title="Sync this section"
                style={{
                  ...styles.syncBtn,
                  background: section.accent,
                  boxShadow: `0 0 14px ${section.accent}40`,
                  ...(result.state === "loading" ? { opacity: 0.5, cursor: "not-allowed" } : {}),
                }}
              >
                <span style={{
                  display: "inline-block",
                  animation: result.state === "loading" ? "spin 0.8s linear infinite" : "none",
                  fontSize: "16px",
                }}>⟳</span>
              </button>
            </div>
          </div>

          {/* Content */}
          {result.state === "idle" && (
            <p style={styles.idle}>Loading…</p>
          )}
          {result.state === "loading" && (
            <div>
              <div style={{
                height: "2px",
                background: `linear-gradient(90deg, transparent, ${section.accent}, transparent)`,
                backgroundSize: "200% 100%",
                animation: "shimmer 1.2s infinite linear",
                borderRadius: "2px",
                marginBottom: "12px",
              }} />
              <p style={{ ...styles.idle, color: section.accent }}>Fetching live news…</p>
            </div>
          )}
          {result.state === "error" && (
            <p style={styles.error}>⚠ {result.error}</p>
          )}
          {result.state === "loaded" && (
            <div>
              {result.articles.map((article, i) => (
                <NewsCard key={i} article={article} index={i} sectionAccent={section.accent} />
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: { minHeight: "100vh", padding: "36px 20px 60px" },
  container: { maxWidth: "820px", margin: "0 auto" },
  header: { marginBottom: "24px" },
  headerTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" },
  title: {
    fontFamily: "var(--font-display)",
    fontSize: "clamp(36px, 6vw, 52px)",
    fontWeight: 800,
    background: "linear-gradient(135deg, #60A5FA 0%, #A78BFA 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    margin: "0 0 6px 0",
    lineHeight: 1.1,
  },
  date: { color: "var(--text-dim)", fontSize: "12px", fontFamily: "var(--font-mono)", margin: 0, letterSpacing: "0.04em" },
  headerRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px", flexShrink: 0 },
  archiveLink: { color: "var(--text-dim)", fontSize: "11px", fontFamily: "var(--font-mono)", textDecoration: "none", letterSpacing: "0.04em" },
  controls: { display: "flex", gap: "8px", alignItems: "center" },
  editionToggle: { display: "flex", gap: "4px", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "10px", padding: "4px" },
  editionBtn: { background: "transparent", color: "var(--text-dim)", border: "none", borderRadius: "7px", padding: "6px 12px", fontSize: "12px", cursor: "pointer", fontFamily: "var(--font-mono)", transition: "all 0.15s" },
  editionBtnActive: { background: "var(--accent)", color: "#fff", boxShadow: "0 0 12px var(--accent-glow)" },
  refreshBtn: {
    display: "flex", alignItems: "center",
    background: "rgba(59,130,246,0.12)",
    color: "var(--accent-bright)",
    border: "1px solid var(--border-bright)",
    borderRadius: "8px",
    padding: "7px 14px",
    fontSize: "12px",
    fontFamily: "var(--font-mono)",
    cursor: "pointer",
    letterSpacing: "0.02em",
    transition: "all 0.15s",
    whiteSpace: "nowrap",
  },
  refreshBtnDisabled: { opacity: 0.6, cursor: "not-allowed" },
  rule: { height: "1px", background: "linear-gradient(90deg, var(--accent) 0%, transparent 70%)", opacity: 0.4 },
  tabBar: { display: "flex", gap: "6px", marginBottom: "16px", overflowX: "auto", paddingBottom: "4px", scrollbarWidth: "none" },
  tab: {
    display: "flex", alignItems: "center", gap: "7px",
    background: "var(--bg2)", color: "var(--text-dim)",
    border: "1px solid var(--border)", borderRadius: "10px",
    padding: "8px 14px", fontSize: "12px", cursor: "pointer",
    fontFamily: "var(--font-mono)", whiteSpace: "nowrap", flexShrink: 0,
    transition: "all 0.15s", letterSpacing: "0.02em",
  },
  tabActive: { background: "rgba(59,130,246,0.1)" },
  tabBadge: { fontSize: "10px", padding: "1px 6px", borderRadius: "10px", fontWeight: 600 },
  panel: { background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "14px", padding: "24px 28px", boxShadow: "0 4px 32px rgba(0,0,0,0.3)" },
  panelHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", gap: "16px" },
  panelHeaderLeft: { display: "flex", gap: "14px", alignItems: "flex-start", flex: 1 },
  panelHeaderRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px", flexShrink: 0 },
  panelIcon: { fontSize: "26px", lineHeight: 1, marginTop: "2px" },
  panelTitle: { color: "var(--text-primary)", fontSize: "17px", fontWeight: 700, margin: "0 0 8px 0", fontFamily: "var(--font-body)", letterSpacing: "-0.01em" },
  sourcePills: { display: "flex", flexWrap: "wrap", gap: "6px" },
  sourcePill: { background: "rgba(59,130,246,0.1)", border: "1px solid rgba(99,157,255,0.2)", color: "var(--accent-bright)", fontSize: "10px", fontFamily: "var(--font-mono)", padding: "2px 8px", borderRadius: "20px", letterSpacing: "0.03em" },
  statusRow: { display: "flex", alignItems: "center", gap: "6px" },
  dot: { width: "7px", height: "7px", borderRadius: "50%", flexShrink: 0 },
  statusLabel: { color: "var(--text-dim)", fontSize: "11px", fontFamily: "var(--font-mono)" },
  syncBtn: { color: "#fff", border: "none", borderRadius: "50%", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s", flexShrink: 0 },
  idle: { color: "var(--text-dim)", fontSize: "13px", fontFamily: "var(--font-mono)", margin: "8px 0 0 0", letterSpacing: "0.02em" },
  error: { color: "#f87171", fontSize: "13px", fontFamily: "var(--font-mono)", margin: "8px 0 0 0" },
};
