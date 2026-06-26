"use client";

import { useEffect, useState } from "react";
import { Article } from "@/lib/supabase";
import type { WorldCupData, WcFixture } from "@/lib/worldcup-data";
import SubTabNav, { SubTabItem } from "./SubTabNav";
import StoryRow from "./StoryRow";

// ── WORLD CUP tab: structured subtabs ────────────────────────
// NEWS renders the live RSS → Haiku briefing. FIXTURES / RESULTS / STANDINGS /
// KNOCKOUTS / FORECAST render structured data from /api/worldcup
// (football-data.org + the-odds-api). Panes fall back to an "awaiting feed"
// message when a source/key is unavailable. The KNOCKOUTS pane is always shown;
// it self-describes as "bracket populates once the group stage finishes" until
// ties are drawn.

const ACCENT = "#ca8a04";
const PIN_BG = "#fdf6e3";

type SectionState = "idle" | "loading" | "loaded" | "error";

const ALL_SUBTABS: SubTabItem[] = [
  { id: "news",      label: "NEWS" },
  { id: "fixtures",  label: "FIXTURES & ODDS" },
  { id: "results",   label: "LATEST RESULTS" },
  { id: "standings", label: "GROUP STANDINGS" },
  { id: "knockouts", label: "KNOCKOUTS" },
  { id: "forecast",  label: "FORECAST" },
];

function fmtAEST(utc: string): string {
  try {
    return new Date(utc).toLocaleString("en-AU", {
      timeZone: "Australia/Melbourne",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return utc;
  }
}

const odd = (n: number | undefined) => (n && n > 0 ? n.toFixed(2) : "—");

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

type Row = { cells: React.ReactNode[]; pinned?: boolean };

function DataTable({ cols, rows }: { cols: string[]; rows: Row[] }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={styles.table}>
        <thead>
          <tr>
            {cols.map((c) => (
              <th key={c} style={styles.th}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={r.pinned ? { background: PIN_BG } : undefined}>
              {r.cells.map((cell, j) => (
                <td key={j} style={{ ...styles.td, fontWeight: r.pinned ? 700 : 400 }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const matchPinned = (f: WcFixture) =>
  ["Mexico", "Australia"].some((t) => f.home === t || f.away === t);

export default function WorldCupPanel({
  articles = [],
  state = "idle",
}: {
  articles?: Article[];
  state?: SectionState;
}) {
  const subtabs = ALL_SUBTABS;

  const [active, setActive] = useState<string>("news");
  const current = subtabs.find((t) => t.id === active) ?? subtabs[0];

  // Structured data (fixtures/results/standings/knockouts/forecast).
  const [data, setData] = useState<WorldCupData | null>(null);
  const [wcState, setWcState] = useState<SectionState>("loading");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/worldcup")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((d: WorldCupData) => {
        if (cancelled) return;
        setData(d);
        setWcState("loaded");
      })
      .catch(() => !cancelled && setWcState("error"));
    return () => {
      cancelled = true;
    };
  }, []);

  // Shared loading/error rendering for the structured panes.
  function structured(render: () => React.ReactNode) {
    if (wcState === "loading" || wcState === "idle")
      return <Pending>Loading World Cup data…</Pending>;
    if (wcState === "error" || !data)
      return <Pending>Couldn&rsquo;t load this feed right now — try again shortly.</Pending>;
    if (!data.available)
      return <Pending>Structured World Cup data isn&rsquo;t configured yet.</Pending>;
    return render();
  }

  return (
    <div style={{ margin: "0 -16px" }}>
      <SubTabNav tabs={subtabs} active={current.id} accent={ACCENT} onSelect={setActive} />

      <div style={styles.pane}>
        {current.id === "news" && (
          <>
            <PaneHeading title="World Cup news" sub="Live RSS coverage · Mexico and Australia prioritised" />
            {(state === "idle" || state === "loading") && <Pending>Loading the latest World Cup news…</Pending>}
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
            <PaneHeading title="Fixtures &amp; odds" sub="Upcoming group games · kickoff in Melbourne time · decimal odds (UK median)" />
            {structured(() =>
              data!.fixtures.length === 0 ? (
                <Pending>No upcoming group fixtures.</Pending>
              ) : (
                <>
                  <DataTable
                    cols={["AEST kickoff", "Match", "Group", "Home", "Draw", "Away"]}
                    rows={data!.fixtures.map((f) => ({
                      pinned: matchPinned(f),
                      cells: [
                        fmtAEST(f.utcDate),
                        `${f.home} v ${f.away}`,
                        f.group ?? f.stage,
                        odd(f.odds?.home),
                        odd(f.odds?.draw),
                        odd(f.odds?.away),
                      ],
                    }))}
                  />
                  {!data!.oddsAvailable && <Pending>Odds feed unavailable — fixtures shown without prices.</Pending>}
                </>
              )
            )}
          </>
        )}

        {current.id === "results" && (
          <>
            <PaneHeading title="Latest results" sub="Most recent final scores" />
            {structured(() =>
              data!.results.length === 0 ? (
                <Pending>No completed matches yet.</Pending>
              ) : (
                <DataTable
                  cols={["AEST date", "Match", "Score", "Stage"]}
                  rows={data!.results.map((r) => ({
                    pinned: ["Mexico", "Australia"].some((t) => r.home === t || r.away === t),
                    cells: [
                      fmtAEST(r.utcDate),
                      `${r.home} v ${r.away}`,
                      `${r.homeScore ?? "-"}–${r.awayScore ?? "-"}`,
                      r.stage,
                    ],
                  }))}
                />
              )
            )}
          </>
        )}

        {current.id === "standings" && (
          <>
            <PaneHeading title="Group standings" sub="All groups · Mexico and Australia highlighted and pinned first" />
            {structured(() =>
              data!.standings.length === 0 ? (
                <Pending>Standings not available yet.</Pending>
              ) : (
                <div>
                  {data!.standings.map((g) => (
                    <div key={g.group} style={{ marginBottom: "18px" }}>
                      <h3 style={styles.groupTitle}>{g.group}</h3>
                      <DataTable
                        cols={["Pos", "Team", "P", "W", "D", "L", "GF", "GA", "GD", "Pts"]}
                        rows={g.table.map((t) => ({
                          pinned: t.pinned,
                          cells: [t.position, t.team, t.played, t.won, t.draw, t.lost, t.gf, t.ga, t.gd, t.points],
                        }))}
                      />
                    </div>
                  ))}
                </div>
              )
            )}
          </>
        )}

        {current.id === "knockouts" && (
          <>
            <PaneHeading title="Knockouts" sub="Bracket fixtures from the round of 32 onwards" />
            {structured(() =>
              data!.knockouts.length === 0 ? (
                <Pending>The bracket populates once the group stage finishes.</Pending>
              ) : (
                <DataTable
                  cols={["AEST kickoff", "Match", "Stage", "Home", "Draw", "Away"]}
                  rows={data!.knockouts.map((f) => ({
                    pinned: matchPinned(f),
                    cells: [
                      fmtAEST(f.utcDate),
                      `${f.home} v ${f.away}`,
                      f.stage,
                      odd(f.odds?.home),
                      odd(f.odds?.draw),
                      odd(f.odds?.away),
                    ],
                  }))}
                />
              )
            )}
          </>
        )}

        {current.id === "forecast" && (
          <>
            <PaneHeading title="Forecast" sub="Implied title-win probability from outright odds · Mexico and Australia highlighted" />
            {structured(() =>
              !data!.oddsAvailable || data!.forecast.length === 0 ? (
                <Pending>Forecast needs the odds feed, which isn&rsquo;t available right now.</Pending>
              ) : (
                <DataTable
                  cols={["Rank", "Team", "Win %"]}
                  rows={data!.forecast.map((f) => ({
                    pinned: f.pinned,
                    cells: [f.rank, f.team, `${f.winPct.toFixed(1)}%`],
                  }))}
                />
              )
            )}
          </>
        )}
      </div>
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
  groupTitle: {
    fontFamily: "var(--font-mono)",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    margin: "0 0 6px",
    color: "#000",
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
  td: {
    padding: "7px 10px",
    borderBottom: "1px solid #eee",
    whiteSpace: "nowrap",
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
