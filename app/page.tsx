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
            <Link href="/history" style={styles.archiveLink}>
              View archive →
            </Link>
          </div>

          <div style={styles.editionToggle}>
            <button
              onClick={() => setEdition("morning")}
              style={{
                ...styles.editionBtn,
                ...(edition === "morning" ? styles.editionBtnActive : {}),
              }}
            >
              ☀️ Morning
            </button>
            <button
              onClick={() => setEdition("evening")}
              style={{
                ...styles.editionBtn,
                ...(edition === "evening" ? styles.editionBtnActive : {}),
              }}
            >
              🌙 Evening
            </button>
          </div>
        </header>

        <div>
          {sections.map((section) => (
            <SectionPanel key={section.id} section={section} edition={edition} />
          ))}
        </div>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    background: "#0a0a14",
    padding: "32px 16px",
  },
  container: {
    maxWidth: "760px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "28px",
  },
  headerTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "16px",
  },
  title: {
    color: "#e2e2f0",
    fontSize: "26px",
    fontWeight: 800,
    margin: "0 0 4px 0",
    letterSpacing: "-0.02em",
  },
  date: {
    color: "#6c6c8a",
    fontSize: "12px",
    fontFamily: "monospace",
    margin: 0,
  },
  archiveLink: {
    color: "#6c6c8a",
    fontSize: "12px",
    fontFamily: "monospace",
    textDecoration: "none",
    marginTop: "4px",
  },
  editionToggle: {
    display: "flex",
    gap: "8px",
  },
  editionBtn: {
    background: "#13131f",
    color: "#6c6c8a",
    border: "1px solid #1e1e2e",
    borderRadius: "8px",
    padding: "8px 18px",
    fontSize: "13px",
    cursor: "pointer",
    fontFamily: "monospace",
  },
  editionBtnActive: {
    background: "#1e1e2e",
    color: "#e2e2f0",
    borderColor: "#3a3a5c",
  },
};
