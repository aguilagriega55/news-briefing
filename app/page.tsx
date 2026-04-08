"use client";

import { useState } from "react";
import { sections } from "@/lib/sections";
import SectionPanel from "@/components/SectionPanel";
import Link from "next/link";

type Edition = "morning" | "evening";

export default function Home() {
  const [edition, setEdition] = useState<Edition>(() => {
    const hour = new Date().getHours();
    return hour < 12 ? "morning" : "evening";
  });
  const [activeTab, setActiveTab] = useState(0);

  const section = sections[activeTab];

  const today = new Date().toLocaleDateString("en-AU", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main style={styles.main}>
      <div style={styles.container}>

        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerTop}>
            <div>
              <h1 style={styles.title}>News Briefing</h1>
              <p style={styles.date}>{today}</p>
            </div>
            <div style={styles.headerRight}>
              <Link href="/history" style={styles.archiveLink}>
                View archive →
              </Link>
              <div style={styles.editionToggle}>
                <button
                  onClick={() => setEdition("morning")}
                  style={{
                    ...styles.editionBtn,
                    ...(edition === "morning" ? styles.editionBtnActive : {}),
                  }}
                >
                  ☀️ AM
                </button>
                <button
                  onClick={() => setEdition("evening")}
                  style={{
                    ...styles.editionBtn,
                    ...(edition === "evening" ? styles.editionBtnActive : {}),
                  }}
                >
                  🌙 PM
                </button>
              </div>
            </div>
          </div>
          <div style={styles.rule} />
        </header>

        {/* Tab bar */}
        <div style={styles.tabBar}>
          {sections.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActiveTab(i)}
              style={{
                ...styles.tab,
                ...(activeTab === i ? styles.tabActive : {}),
              }}
            >
              <span style={styles.tabIcon}>{s.icon}</span>
              <span>{s.title}</span>
            </button>
          ))}
        </div>

        {/* Active section */}
        <SectionPanel key={`${section.id}-${edition}`} section={section} edition={edition} />

      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    padding: "36px 20px 60px",
  },
  container: {
    maxWidth: "820px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "28px",
  },
  headerTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
  },
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
  date: {
    color: "var(--text-dim)",
    fontSize: "12px",
    fontFamily: "var(--font-mono)",
    margin: 0,
    letterSpacing: "0.04em",
  },
  headerRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "10px",
    flexShrink: 0,
  },
  archiveLink: {
    color: "var(--text-dim)",
    fontSize: "11px",
    fontFamily: "var(--font-mono)",
    textDecoration: "none",
    letterSpacing: "0.04em",
    transition: "color 0.2s",
  },
  editionToggle: {
    display: "flex",
    gap: "6px",
    background: "var(--bg2)",
    border: "1px solid var(--border)",
    borderRadius: "10px",
    padding: "4px",
  },
  editionBtn: {
    background: "transparent",
    color: "var(--text-dim)",
    border: "none",
    borderRadius: "7px",
    padding: "6px 14px",
    fontSize: "12px",
    cursor: "pointer",
    fontFamily: "var(--font-mono)",
    transition: "all 0.15s",
  },
  editionBtnActive: {
    background: "var(--accent)",
    color: "#fff",
    boxShadow: "0 0 12px var(--accent-glow)",
  },
  rule: {
    height: "1px",
    background: "linear-gradient(90deg, var(--accent) 0%, transparent 70%)",
    opacity: 0.4,
  },
  tabBar: {
    display: "flex",
    gap: "6px",
    marginBottom: "20px",
    overflowX: "auto",
    paddingBottom: "4px",
    scrollbarWidth: "none",
  },
  tab: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    background: "var(--bg2)",
    color: "var(--text-dim)",
    border: "1px solid var(--border)",
    borderRadius: "10px",
    padding: "9px 16px",
    fontSize: "12px",
    cursor: "pointer",
    fontFamily: "var(--font-mono)",
    whiteSpace: "nowrap",
    flexShrink: 0,
    transition: "all 0.15s",
    letterSpacing: "0.02em",
  },
  tabActive: {
    background: "rgba(59,130,246,0.15)",
    color: "var(--accent-bright)",
    borderColor: "var(--border-bright)",
    boxShadow: "0 0 16px rgba(59,130,246,0.12)",
  },
  tabIcon: {
    fontSize: "14px",
  },
};
