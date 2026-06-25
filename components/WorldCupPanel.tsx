"use client";

import { useMemo, useState } from "react";
import { melbourneDate } from "@/lib/sections";
import { Article } from "@/lib/supabase";
import SubTabNav, { SubTabItem } from "./SubTabNav";
import StoryRow from "./StoryRow";

// ── WORLD CUP tab: structured subtabs ────────────────────────
// The NEWS pane renders the live RSS → Haiku World Cup briefing (the same data
// the other tabs use). The remaining panes are a structured shell: each shows
// an "awaiting feed" state until the structured sources (football-data.org
// fixtures/standings + the-odds-api odds + the projection model) are wired in.
// Knockouts is gated until 28 Jun 2026 (Melbourne local) per the editorial spec.

const ACCENT = "#ca8a04";
const KNOCKOUTS_VISIBLE_FROM = "2026-06-28";

type SectionState = "idle" | "loading" | "loaded" | "error";

const ALL_SUBTABS: SubTabItem[] = [
  { id: "news",      label: "NEWS" },
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

export default function WorldCupPanel({
  articles = [],
  state = "idle",
}: {
  articles?: Article[];
  state?: SectionState;
}) {
  const today = useMemo(() => melbourneDate(), []);
  const knockoutsOpen = today >= KNOCKOUTS_VISIBLE_FROM;

  const subtabs = useMemo(
    () => ALL_SUBTABS.filter((t) => t.id !== "knockouts" || knockoutsOpen),
    [knockoutsOpen]
  );

  const [active, setActive] = useState<string>("news");
  const current = subtabs.find((t) => t.id === active) ?? subtabs[0];

  return (
    <div style={{ margin: "0 -16px" }}>
      {/* Sub-navigation */}
      <SubTabNav tabs={subtabs} active={current.id} accent={ACCENT} onSelect={setActive} />

      <div style={styles.pane}>
        {current.id === "news" && (
          <>
            <PaneHeading
              title="World Cup news"
              sub="Live RSS coverage · Mexico and Australia prioritised"
            />
            {(state === "idle" || state === "loading") && (
              <Pending>Loading the latest World Cup news…</Pending>
            )}
            {state === "error" && (
              <Pending>Couldn&rsquo;t load World Cup news right now — try the refresh button.</Pending>
            )}
            {state === "loaded" && articles.length === 0 && (
              <Pending>No World Cup stories in this edition yet.</Pending>
            )}
            {state === "loaded" && articles.length > 0 && (
              <div style={{ margin: "0 -16px" }}>
                {articles.map((article, i) => (
                  <StoryRow key={i} article={article} />
                ))}
              </div>
            )}
          </>
        )}

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
