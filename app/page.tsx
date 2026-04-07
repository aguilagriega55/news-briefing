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

  return (
    <main style={styles.main}>
      <div style={styles.container}>
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
              <span style={styles.tabLabel}>{s.title}</span>
            </button>
          ))}
        </div>

        {/* Active section */}
        <SectionPanel key={section.id} section={section} edition={edition} />
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    background: "#0a0a14",
    padding: "28px 16px",
  },
  container: {
    maxWidth: "800px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "20px",
  },
  headerTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    color: "#e2e2f0",
    fontSize: "22px",
    fontWeight: 800,
    margin: "0 0 4px 0",
    letterSpacing: "-0.02em",
  },
  date: {
    color: "#6c6c8a",
    fontSize: "11px",
    fontFamily: "monospace",
    margin: 0,
  },
  headerRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "8px",
  },
  archiveLink: {
    color: "#6c6c8a",
    fontSize: "11px",
    fontFamily: "monospace",
    textDecoration: "none",
  },
  editionToggle: {
    display: "flex",
    gap: "6px",
  },
  editionBtn: {
    background: "#13131f",
    color: "#6c6c8a",
    border: "1px solid #1e1e2e",
    borderRadius: "6px",
    padding: "5px 12px",
    fontSize: "12px",
    cursor: "pointer",
    fontFamily: "monospace",
  },
  editionBtnActive: {
    background: "#1e1e2e",
    color: "#e2e2f0",
    borderColor: "#3a3a5c",
  },
  tabBar: {
    display: "flex",
    gap: "4px",
    marginBottom: "16px",
    overflowX: "auto",
    paddingBottom: "2px",
    scrollbarWidth: "none",
  },
  tab: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "#13131f",
    color: "#6c6c8a",
    border: "1px solid #1e1e2e",
    borderRadius: "8px",
    padding: "8px 14px",
    fontSize: "12px",
    cursor: "pointer",
    fontFamily: "monospace",
    whiteSpace: "nowrap",
    flexShrink: 0,
    transition: "all 0.1s",
  },
  tabActive: {
    background: "#1e1e2e",
    color: "#e2e2f0",
    borderColor: "#3a3a5c",
  },
  tabIcon: {
    fontSize: "14px",
  },
  tabLabel: {
    fontSize: "12px",
  },
};
