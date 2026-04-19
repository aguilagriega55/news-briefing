"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { SECTIONS } from "@/lib/sections";
import { Article } from "@/lib/supabase";
import { DebateTopic } from "@/lib/debate-generator";
import LeadStory from "@/components/LeadStory";
import StoryRow from "@/components/StoryRow";
import DebatePanel from "@/components/DebatePanel";
import TickerStrip from "@/components/TickerStrip";
import Link from "next/link";

type Edition = "morning" | "midday" | "evening" | "midnight";
type SectionState = "idle" | "loading" | "loaded" | "error";

interface SectionResult {
  state: SectionState;
  articles: Article[];
  cached: boolean;
  fetched_at: string;
  error: string;
}

const TABS = SECTIONS;

const EDITION_CYCLE: Edition[] = ["morning", "midday", "evening", "midnight"];
const EDITION_LABELS: Record<Edition, string> = {
  morning:  "6AM",
  midday:   "12PM",
  evening:  "6PM",
  midnight: "12AM",
};

function getCurrentEdition(): Edition {
  const h = new Date().getHours();
  if (h >= 5  && h < 11) return "morning";
  if (h >= 11 && h < 17) return "midday";
  if (h >= 17 && h < 23) return "evening";
  return "midnight";
}

function cycleEdition(current: Edition): Edition {
  const idx = EDITION_CYCLE.indexOf(current);
  return EDITION_CYCLE[(idx + 1) % EDITION_CYCLE.length];
}

function initResults(): Record<string, SectionResult> {
  return Object.fromEntries(
    SECTIONS.map((s) => [
      s.id,
      { state: "idle", articles: [], cached: false, fetched_at: "", error: "" },
    ])
  );
}

function LoadingSkeleton() {
  return (
    <div style={{ margin: "0 -16px" }}>
      <div style={{ padding: "16px", borderBottom: "1px solid #e5e5e5" }}>
        <div className="shimmer" style={{ height: "12px", width: "28%", marginBottom: "8px" }} />
        <div className="shimmer" style={{ height: "32px", width: "96%", marginBottom: "6px" }} />
        <div className="shimmer" style={{ height: "32px", width: "72%", marginBottom: "12px" }} />
        <div className="shimmer" style={{ height: "11px", width: "50%", marginBottom: "14px" }} />
        <div className="shimmer" style={{ width: "100%", paddingTop: "56.25%", borderRadius: "4px" }} />
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ display: "flex", gap: "14px", padding: "16px", borderBottom: "1px solid #e5e5e5" }}>
          <div style={{ flex: 1 }}>
            <div className="shimmer" style={{ height: "11px", width: "26%", marginBottom: "8px" }} />
            <div className="shimmer" style={{ height: "20px", width: "92%", marginBottom: "6px" }} />
            <div className="shimmer" style={{ height: "20px", width: "68%", marginBottom: "8px" }} />
            <div className="shimmer" style={{ height: "15px", width: "80%", marginBottom: "5px" }} />
            <div className="shimmer" style={{ height: "15px", width: "58%", marginBottom: "9px" }} />
            <div className="shimmer" style={{ height: "11px", width: "44%" }} />
          </div>
          <div className="shimmer" style={{ flexShrink: 0, width: "80px", height: "80px", borderRadius: "4px" }} />
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [edition, setEdition] = useState<Edition>(() => getCurrentEdition());
  const [activeTab, setActiveTab] = useState<string>("latest");
  const [results, setResults] = useState<Record<string, SectionResult>>(initResults);
  const [debateTopics, setDebateTopics] = useState<DebateTopic[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const fetchSection = useCallback(async (sectionId: string, ed: Edition) => {
    if (sectionId === "debate") {
      setResults((prev) => ({
        ...prev,
        debate: { ...prev.debate, state: "loading", error: "" },
      }));
      try {
        const res = await fetch("/api/debate");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setDebateTopics(data.topics as DebateTopic[]);
        setResults((prev) => ({
          ...prev,
          debate: {
            state: "loaded",
            articles: [],
            cached: data.cached,
            fetched_at: new Date().toISOString(),
            error: "",
          },
        }));
      } catch (err) {
        setResults((prev) => ({
          ...prev,
          debate: {
            ...prev.debate,
            state: "error",
            error: err instanceof Error ? err.message : "Unknown error",
          },
        }));
      }
      return;
    }

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

  useEffect(() => {
    SECTIONS.forEach((s) => fetchSection(s.id, edition));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setResults(initResults());
    setDebateTopics([]);
    setActiveFilter(null);
    SECTIONS.forEach((s) => fetchSection(s.id, edition));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edition]);

  async function handleRefreshAll() {
    setRefreshing(true);
    setResults(initResults());
    setDebateTopics([]);
    setActiveFilter(null);
    await Promise.all(SECTIONS.map((s) => fetchSection(s.id, edition)));
    setRefreshing(false);
  }

  function selectTab(id: string) {
    setActiveTab(id);
    setActiveFilter(null);
  }

  const section = SECTIONS.find((s) => s.id === activeTab) ?? SECTIONS[0];
  const result = results[section.id];

  const allLoaded = SECTIONS.every((s) => results[s.id].state !== "loading");
  const loadedCount = SECTIONS.filter((s) => results[s.id].state === "loaded").length;

  const uniqueTags = useMemo(() => {
    if (section.id === "debate" || result.articles.length === 0) return [];
    const tags = result.articles.map((a) => a.tag).filter((t): t is string => Boolean(t));
    return [...new Set(tags)];
  }, [result.articles, section.id]);

  const filteredArticles = useMemo(() => {
    if (!activeFilter) return result.articles;
    return result.articles.filter((a) => a.tag === activeFilter);
  }, [result.articles, activeFilter]);

  const formattedTime = result.fetched_at
    ? new Date(result.fetched_at).toLocaleTimeString("en-AU", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <>
      {/* ── Sticky header ───────────────────────────────── */}
      <header style={{
        background: "#000",
        padding: "12px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 100,
        minHeight: "58px",
      }}>
        <div>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "22px",
            fontWeight: 900,
            color: "#fff",
            letterSpacing: "-0.5px",
            lineHeight: 1.1,
          }}>
            The Daily Brief
          </div>
          <div style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "9px",
            color: "#888",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginTop: "2px",
          }}>
            Rafa Frías &amp; Family
          </div>
        </div>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          {/* Edition pill — cycles on tap */}
          <button
            onClick={() => setEdition(cycleEdition(edition))}
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "10px",
              letterSpacing: "0.1em",
              padding: "5px 10px",
              background: "rgba(255,255,255,0.15)",
              color: "#fff",
              border: "1px solid #444",
              borderRadius: "4px",
              minHeight: "30px",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {EDITION_LABELS[edition]}
          </button>
          {/* Refresh */}
          <button
            onClick={handleRefreshAll}
            disabled={refreshing || !allLoaded}
            style={{
              fontSize: !allLoaded ? "11px" : "16px",
              fontFamily: !allLoaded ? "var(--font-mono)" : "inherit",
              padding: "5px 10px",
              background: "transparent",
              color: !allLoaded || refreshing ? "#666" : "#fff",
              border: "1px solid #444",
              borderRadius: "4px",
              minHeight: "30px",
              minWidth: "36px",
              cursor: !allLoaded || refreshing ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{
              display: "inline-block",
              animation: (!allLoaded || refreshing) ? "spin 0.8s linear infinite" : "none",
            }}>
              {!allLoaded ? `${loadedCount}/${SECTIONS.length}` : "↻"}
            </span>
          </button>
        </div>
      </header>

      {/* ── Sticky ticker (top: 58) ───────────────────── */}
      <div style={{ position: "sticky", top: "58px", zIndex: 99 }}>
        <TickerStrip />
      </div>

      {/* ── Sticky tab navigation (top: 102) ─────────── */}
      <nav style={{
        display: "flex",
        overflowX: "auto",
        scrollbarWidth: "none",
        background: "#fff",
        borderBottom: "1px solid #e5e5e5",
        position: "sticky",
        top: "102px",
        zIndex: 98,
        WebkitOverflowScrolling: "touch",
      }}>
        {TABS.map((s) => (
          <button
            key={s.id}
            onClick={() => selectTab(s.id)}
            style={{
              flexShrink: 0,
              padding: "13px 15px",
              fontSize: "13px",
              fontWeight: 700,
              fontFamily: "var(--font-ui)",
              color: activeTab === s.id ? "#000" : "#aaa",
              borderBottom: activeTab === s.id ? "3px solid #000" : "3px solid transparent",
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
              background: "none",
              whiteSpace: "nowrap",
              minHeight: "46px",
              cursor: "pointer",
              letterSpacing: "0.02em",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {s.label}
          </button>
        ))}
      </nav>

      {/* ── Main content ──────────────────────────────── */}
      <main style={{ minHeight: "100vh", background: "#fff" }}>
        <div style={styles.container} className="page-content">

          {/* Context line */}
          <p style={styles.contextLine}>
            <span>{section.sources}</span>
            {formattedTime && (
              <span style={styles.contextStatus}>
                {" · "}
                <span style={{
                  display: "inline-block",
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  background: result.cached ? "#16a34a" : "#dc2626",
                  verticalAlign: "middle",
                  marginRight: "3px",
                }} />
                {result.cached ? "cached" : "live"} {formattedTime}
              </span>
            )}
          </p>

          {/* Filter pills */}
          {uniqueTags.length > 0 && (
            <div className="filter-row">
              {uniqueTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveFilter(activeFilter === tag ? null : tag)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    height: "30px",
                    padding: "0 10px",
                    border: "1px solid",
                    borderColor: activeFilter === tag ? "#000" : "#ddd",
                    borderRadius: "15px",
                    background: activeFilter === tag ? "#000" : "#fff",
                    color: activeFilter === tag ? "#fff" : "#666",
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    letterSpacing: "0.03em",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    WebkitTapHighlightColor: "transparent",
                    minHeight: 0,
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {/* Loading skeleton */}
          {(result.state === "idle" || result.state === "loading") && <LoadingSkeleton />}

          {/* Error */}
          {result.state === "error" && (
            <p style={styles.errorMsg}>⚠ {result.error}</p>
          )}

          {/* Debate */}
          {result.state === "loaded" && section.id === "debate" && debateTopics.length > 0 && (
            <DebatePanel topics={debateTopics} />
          )}

          {/* Articles */}
          {result.state === "loaded" && section.id !== "debate" && (
            <div style={{ margin: "0 -16px" }}>
              {filteredArticles.length === 0 && (
                <p style={styles.emptyFilter}>No stories match this filter.</p>
              )}
              {filteredArticles[0] && <LeadStory article={filteredArticles[0]} />}
              {filteredArticles.slice(1).map((article, i) => (
                <StoryRow key={i} article={article} />
              ))}
            </div>
          )}

          {/* Archive link */}
          <div style={styles.archiveRow}>
            <Link href="/history" style={styles.archiveLink}>Archive →</Link>
          </div>

        </div>
      </main>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: "820px",
    margin: "0 auto",
    padding: "0 16px",
  },
  contextLine: {
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    color: "#888",
    fontStyle: "italic",
    letterSpacing: "0.03em",
    padding: "10px 0 6px",
  },
  contextStatus: {
    fontStyle: "normal",
  },
  errorMsg: {
    fontFamily: "var(--font-mono)",
    fontSize: "13px",
    color: "#dc2626",
    padding: "24px 0",
    letterSpacing: "0.04em",
  },
  emptyFilter: {
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    color: "#888",
    padding: "20px 16px",
    letterSpacing: "0.04em",
  },
  archiveRow: {
    padding: "24px 0 8px",
    display: "flex",
    justifyContent: "flex-end",
  },
  archiveLink: {
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    color: "#888",
    textDecoration: "none",
    letterSpacing: "0.04em",
  },
};
