"use client";

import { useMemo, useState } from "react";
import { melbourneDate } from "@/lib/sections";

// ── WORLD CUP tab: structured subtabs ────────────────────────
// Shell only. Each pane renders its layout with an "awaiting feed" state;
// the panes fill with live data once the structured feeds (football-data.org
// fixtures/standings + the-odds-api odds + the projection model) are wired in.
// Knockouts is gated until 28 Jun 2026 (Melbourne local) per the editorial spec.

const ACCENT = "#ca8a04";
const KNOCKOUTS_VISIBLE_FROM = "2026-06-28";

type SubTab = { id: string; label: string };

const ALL_SUBTABS: SubTab[] = [
  { id: "fixtures",  label: "FIXTURES & ODDS" },
  { id: "results",   label: "LATEST RESULTS" },
  { id: "standings", label: "GROUP STANDINGS" },
  { id: "knockouts", label: "KNOCKOUTS" },
  { id: "forecast",  label: "FORECAST" },
];

function Pending({ children }: { children: React.ReactNode }) {
  return <p style={styles.pending}>{children}</p>;
}

function PaneHeading({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={styles.paneHead}>
      <h2 style={styles.paneTitle}>{title}</h2>
      <p style={styles.paneSub}>{sub}</p>
    </div>
  );
}

export default function WorldCupPanel() {
  const today = useMemo(() => melbourneDate(), []);
  const knockoutsOpen = today >= KNOCKOUTS_VISIBLE_FROM;

  const subtabs = useMemo(
    () => ALL_SUBTABS.filter((t) => t.id !== "knockouts" || knockoutsOpen),
    [knockoutsOpen]
  );

  const [active, setActive] = useState<string>("fixtures");
  const current = subtabs.find((t) => t.id === active) ?? subtabs[0];

  return (
    <div style={{ margin: "0 -16px" }}>
      {/* Sub-navigation */}
      <nav style={styles.subnav}>
        {subtabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            style={{
              ...styles.subnavBtn,
              color: current.id === t.id ? "#000" : "#aaa",
              borderBottom:
                current.id === t.id ? `3px solid ${ACCENT}` : "3px solid transparent",
            }}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div style={styles.pane}>
        {current.id === "fixtures" && (
          <>
            <PaneHeading
              title="Fixtures &amp; odds"
              sub="Next 24 hours · kickoffs in Melbourne local (AEST/AEDT)"
            />
            <Table
              cols={["AEST kickoff", "Match", "Venue", "Stage", "Home", "Draw", "Away", "Source"]}
            />
            <Pending>
              Awaiting the fixtures and margin-stripped odds feed. Mexico and Australia
              matches in this window expand to a short preview, separating confirmed
              team news from predicted line-ups.
            </Pending>
          </>
        )}

        {current.id === "results" && (
          <>
            <PaneHeading
              title="Latest results"
              sub="Last 24 hours · final scores from the structured feed"
            />
            <Table cols={["Score", "Match", "Scorers (min)", "Summary", "Stage"]} />
            <Pending>
              Awaiting the results feed. Mexico and Australia matches expand to a two to
              three sentence recap.
            </Pending>
          </>
        )}

        {current.id === "standings" && (
          <>
            <PaneHeading
              title="Group standings"
              sub="All 12 groups · Mexico pinned first, Australia second, then alphabetical"
            />
            <Table cols={["Pos", "Team", "P", "W", "D", "L", "GF", "GA", "GD", "Pts"]} />
            <Pending>
              Awaiting the standings feed. Mexico (Group A) pins first and Australia
              second; the remaining groups follow alphabetically.
            </Pending>
          </>
        )}

        {current.id === "knockouts" && (
          <>
            <PaneHeading title="Knockouts" sub="Bracket from R32 onwards" />
            <Pending>
              Awaiting the bracket feed (visible from 28 June 2026). Upcoming knockout
              fixtures list AEST kickoff, venue and implied probabilities.
            </Pending>
          </>
        )}

        {current.id === "forecast" && (
          <>
            <PaneHeading
              title="Forecast"
              sub="48-team ranking · Mexico and Australia highlighted · movement is event-driven"
            />
            <Table
              cols={["Rank", "Team", "Group", "Pos", "Win %", "R16 %", "Move", "Reason"]}
            />
            <Pending>
              Awaiting the projection model and the previous edition&rsquo;s forecast.
              Where two probability sources disagree by more than 5pp on a team, the
              cell shows a range rather than a single number.
            </Pending>
          </>
        )}
      </div>
    </div>
  );
}

function Table({ cols }: { cols: string[] }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={styles.table}>
        <thead>
          <tr>
            {cols.map((c) => (
              <th key={c} style={styles.th}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={styles.tdEmpty} colSpan={cols.length}>
              —
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  subnav: {
    display: "flex",
    overflowX: "auto",
    scrollbarWidth: "none",
    background: "#fafafa",
    borderBottom: "1px solid #e5e5e5",
    WebkitOverflowScrolling: "touch",
  },
  subnavBtn: {
    flexShrink: 0,
    padding: "11px 14px",
    fontSize: "11px",
    fontWeight: 700,
    fontFamily: "var(--font-mono)",
    letterSpacing: "0.05em",
    background: "none",
    border: "none",
    whiteSpace: "nowrap",
    minHeight: "42px",
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
  },
  pane: {
    padding: "16px",
  },
  paneHead: {
    marginBottom: "14px",
  },
  paneTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "20px",
    fontWeight: 900,
    margin: 0,
    letterSpacing: "-0.3px",
  },
  paneSub: {
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    color: "#888",
    margin: "4px 0 0",
    letterSpacing: "0.03em",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
  },
  th: {
    textAlign: "left",
    padding: "7px 10px",
    borderBottom: "2px solid #000",
    whiteSpace: "nowrap",
    letterSpacing: "0.03em",
  },
  tdEmpty: {
    padding: "16px 10px",
    color: "#bbb",
    textAlign: "center",
    borderBottom: "1px solid #eee",
  },
  pending: {
    fontFamily: "var(--font-mono)",
    fontSize: "12px",
    color: "#666",
    lineHeight: 1.6,
    letterSpacing: "0.02em",
    marginTop: "14px",
    padding: "12px 14px",
    background: "#fbf6e9",
    borderLeft: `3px solid ${ACCENT}`,
  },
};
