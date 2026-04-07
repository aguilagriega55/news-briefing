import { supabase, Briefing, Article } from "@/lib/supabase";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface DayGroup {
  date: string;
  morning: Briefing[];
  evening: Briefing[];
}

async function getBriefingHistory(): Promise<DayGroup[]> {
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const { data, error } = await supabase
    .from("briefings")
    .select("*")
    .gte("date", fourteenDaysAgo.toISOString().split("T")[0])
    .order("date", { ascending: false })
    .order("fetched_at", { ascending: false });

  if (error || !data) return [];

  const grouped: Record<string, DayGroup> = {};
  for (const briefing of data as Briefing[]) {
    if (!grouped[briefing.date]) {
      grouped[briefing.date] = { date: briefing.date, morning: [], evening: [] };
    }
    grouped[briefing.date][briefing.edition].push(briefing);
  }

  return Object.values(grouped).sort((a, b) => b.date.localeCompare(a.date));
}

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-AU", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function EditionBlock({
  label,
  briefings,
}: {
  label: string;
  briefings: Briefing[];
}) {
  if (briefings.length === 0) return null;

  const uniqueSections = [...new Set(briefings.map((b) => b.section_id))];

  return (
    <details style={styles.details}>
      <summary style={styles.summary}>
        <span style={styles.summaryLabel}>{label}</span>
        <span style={styles.summaryMeta}>{uniqueSections.length} sections</span>
      </summary>
      <div style={styles.sectionList}>
        {briefings.map((briefing) => (
          <div key={briefing.id} style={styles.sectionBlock}>
            <p style={styles.sectionId}>{briefing.section_id}</p>
            {(briefing.articles as Article[]).map((article, i) => (
              <div key={i} style={styles.articleRow}>
                <span style={styles.articleNum}>{i + 1}</span>
                <div>
                  {article.url ? (
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.articleTitle}
                    >
                      {article.title}
                    </a>
                  ) : (
                    <span style={styles.articleTitle}>{article.title}</span>
                  )}
                  <p style={styles.articleSource}>{article.source}</p>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </details>
  );
}

export default async function HistoryPage() {
  const days = await getBriefingHistory();

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.headerTop}>
            <div>
              <h1 style={styles.title}>Archive</h1>
              <p style={styles.subtitle}>Last 14 days of briefings</p>
            </div>
            <Link href="/" style={styles.backLink}>
              ← Back to dashboard
            </Link>
          </div>
        </header>

        {days.length === 0 ? (
          <p style={styles.empty}>No briefings found yet. Fetch some from the dashboard.</p>
        ) : (
          <div>
            {days.map((day) => (
              <div key={day.date} style={styles.dayBlock}>
                <h2 style={styles.dayTitle}>{formatDate(day.date)}</h2>
                <EditionBlock label="☀️ Morning" briefings={day.morning} />
                <EditionBlock label="🌙 Evening" briefings={day.evening} />
              </div>
            ))}
          </div>
        )}
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
  },
  title: {
    color: "#e2e2f0",
    fontSize: "26px",
    fontWeight: 800,
    margin: "0 0 4px 0",
    letterSpacing: "-0.02em",
  },
  subtitle: {
    color: "#6c6c8a",
    fontSize: "12px",
    fontFamily: "monospace",
    margin: 0,
  },
  backLink: {
    color: "#6c6c8a",
    fontSize: "12px",
    fontFamily: "monospace",
    textDecoration: "none",
    marginTop: "4px",
  },
  empty: {
    color: "#4a4a6a",
    fontSize: "13px",
    fontFamily: "monospace",
  },
  dayBlock: {
    marginBottom: "24px",
    borderBottom: "1px solid #1e1e2e",
    paddingBottom: "24px",
  },
  dayTitle: {
    color: "#e2e2f0",
    fontSize: "15px",
    fontWeight: 700,
    margin: "0 0 12px 0",
  },
  details: {
    marginBottom: "8px",
  },
  summary: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
    padding: "8px 12px",
    background: "#13131f",
    borderRadius: "6px",
    border: "1px solid #1e1e2e",
    listStyle: "none",
    userSelect: "none",
  },
  summaryLabel: {
    color: "#a0a0c0",
    fontSize: "13px",
    fontFamily: "monospace",
    flex: 1,
  },
  summaryMeta: {
    color: "#6c6c8a",
    fontSize: "11px",
    fontFamily: "monospace",
  },
  sectionList: {
    paddingTop: "8px",
    paddingLeft: "8px",
  },
  sectionBlock: {
    marginBottom: "16px",
    padding: "12px",
    background: "#0f0f1a",
    borderRadius: "6px",
    border: "1px solid #1a1a2e",
  },
  sectionId: {
    color: "#6c6c8a",
    fontSize: "10px",
    fontFamily: "monospace",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    margin: "0 0 10px 0",
  },
  articleRow: {
    display: "flex",
    gap: "10px",
    marginBottom: "8px",
  },
  articleNum: {
    color: "#4a4a6a",
    fontSize: "11px",
    fontFamily: "monospace",
    flexShrink: 0,
    marginTop: "2px",
  },
  articleTitle: {
    color: "#c0c0d8",
    fontSize: "13px",
    fontWeight: 500,
    lineHeight: "1.4",
    textDecoration: "none",
    display: "block",
  },
  articleSource: {
    color: "#4a4a6a",
    fontSize: "11px",
    fontFamily: "monospace",
    margin: "2px 0 0 0",
  },
};
