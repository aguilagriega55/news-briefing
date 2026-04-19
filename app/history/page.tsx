import { supabase, Briefing } from "@/lib/supabase";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface DayGroup {
  date: string;
  morning: boolean;
  midday: boolean;
  evening: boolean;
  midnight: boolean;
  sectionCount: number;
}

async function getBriefingHistory(): Promise<DayGroup[]> {
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const { data, error } = await supabase
    .from("briefings")
    .select("date, edition, section_id")
    .gte("date", fourteenDaysAgo.toISOString().split("T")[0])
    .order("date", { ascending: false });

  if (error || !data) return [];

  const grouped: Record<string, { morning: Set<string>; midday: Set<string>; evening: Set<string>; midnight: Set<string> }> = {};
  for (const row of data as { date: string; edition: string; section_id: string }[]) {
    if (!grouped[row.date]) grouped[row.date] = { morning: new Set(), midday: new Set(), evening: new Set(), midnight: new Set() };
    const ed = row.edition as "morning" | "midday" | "evening" | "midnight";
    if (grouped[row.date][ed]) grouped[row.date][ed].add(row.section_id);
  }

  return Object.entries(grouped)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, { morning, midday, evening, midnight }]) => ({
      date,
      morning: morning.size > 0,
      midday: midday.size > 0,
      evening: evening.size > 0,
      midnight: midnight.size > 0,
      sectionCount: morning.size + midday.size + evening.size + midnight.size,
    }));
}

function formatDateHeader(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateShort(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
  });
}

export default async function HistoryPage() {
  const days = await getBriefingHistory();

  return (
    <>
      {/* Top bar */}
      <header style={styles.topBar}>
        <div>
          <div style={styles.topBarTitle}>Archive</div>
          <div style={styles.topBarSubtitle}>The Daily Brief</div>
        </div>
        <Link href="/" style={styles.backLink}>← Today</Link>
      </header>

      <main style={styles.main}>
        <div style={styles.container}>

          {days.length === 0 ? (
            <p style={styles.empty}>No briefings found yet.</p>
          ) : (
            days.map((day) => (
              <div key={day.date} style={styles.dayBlock}>
                {/* Date header */}
                <h2 style={styles.dateHeader}>{formatDateHeader(day.date)}</h2>

                {/* Edition rows */}
                <div style={styles.editionRows}>
                  {day.morning && (
                    <Link href={`/history/${day.date}/morning`} style={styles.editionRow}>
                      <div>
                        <span style={styles.editionIcon}>☀</span>
                        <span style={styles.editionLabel}>Morning Edition</span>
                      </div>
                      <div style={styles.editionMeta}>
                        <span style={styles.editionDate}>{formatDateShort(day.date)}</span>
                        <span style={styles.editionArrow}>→</span>
                      </div>
                    </Link>
                  )}
                  {day.midday && (
                    <Link href={`/history/${day.date}/midday`} style={styles.editionRow}>
                      <div>
                        <span style={styles.editionIcon}>☀</span>
                        <span style={styles.editionLabel}>Midday Edition</span>
                      </div>
                      <div style={styles.editionMeta}>
                        <span style={styles.editionDate}>{formatDateShort(day.date)}</span>
                        <span style={styles.editionArrow}>→</span>
                      </div>
                    </Link>
                  )}
                  {day.evening && (
                    <Link href={`/history/${day.date}/evening`} style={styles.editionRow}>
                      <div>
                        <span style={styles.editionIcon}>☾</span>
                        <span style={styles.editionLabel}>Evening Edition</span>
                      </div>
                      <div style={styles.editionMeta}>
                        <span style={styles.editionDate}>{formatDateShort(day.date)}</span>
                        <span style={styles.editionArrow}>→</span>
                      </div>
                    </Link>
                  )}
                  {day.midnight && (
                    <Link href={`/history/${day.date}/midnight`} style={styles.editionRow}>
                      <div>
                        <span style={styles.editionIcon}>☾</span>
                        <span style={styles.editionLabel}>Midnight Edition</span>
                      </div>
                      <div style={styles.editionMeta}>
                        <span style={styles.editionDate}>{formatDateShort(day.date)}</span>
                        <span style={styles.editionArrow}>→</span>
                      </div>
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}

        </div>
      </main>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  topBar: {
    background: "#000",
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  topBarTitle: {
    fontFamily: "var(--font-display)",
    fontSize: "20px",
    fontWeight: 900,
    color: "#fff",
    letterSpacing: "-0.5px",
    lineHeight: 1.1,
  },
  topBarSubtitle: {
    fontFamily: "var(--font-mono)",
    fontSize: "9px",
    color: "#666",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    marginTop: "2px",
  },
  backLink: {
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    color: "#888",
    textDecoration: "none",
    letterSpacing: "0.04em",
  },
  main: {
    minHeight: "100vh",
    background: "#fff",
    paddingBottom: "60px",
  },
  container: {
    maxWidth: "760px",
    margin: "0 auto",
    padding: "0 16px",
  },
  empty: {
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    paddingTop: "32px",
  },
  dayBlock: {
    paddingTop: "24px",
    borderTop: "1px solid #f0f0f0",
    marginTop: "24px",
  },
  dateHeader: {
    fontFamily: "var(--font-display)",
    fontSize: "18px",
    fontWeight: 700,
    color: "#000",
    letterSpacing: "-0.01em",
    margin: "0 0 12px 0",
  },
  editionRows: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  editionRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 0",
    borderBottom: "1px solid #f5f5f5",
    textDecoration: "none",
    color: "inherit",
    minHeight: "44px",
  },
  editionIcon: {
    fontSize: "15px",
    marginRight: "10px",
  },
  editionLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: "12px",
    color: "#333",
    letterSpacing: "0.04em",
  },
  editionMeta: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  editionDate: {
    fontFamily: "var(--font-mono)",
    fontSize: "10px",
    color: "#aaa",
    letterSpacing: "0.04em",
  },
  editionArrow: {
    fontFamily: "var(--font-mono)",
    fontSize: "14px",
    color: "#ccc",
  },
};
