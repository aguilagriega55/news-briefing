import { supabase, Briefing, Article } from "@/lib/supabase";
import { sections } from "@/lib/sections";
import { notFound } from "next/navigation";
import Link from "next/link";
import LeadStory from "@/components/LeadStory";
import StoryRow from "@/components/StoryRow";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ date: string; edition: string }>;
}

async function getBriefings(date: string, edition: string) {
  try {
    const { data, error } = await supabase
      .from("briefings")
      .select("*")
      .eq("date", date)
      .eq("edition", edition)
      .order("fetched_at", { ascending: false });
    if (error || !data) return [];
    return data as Briefing[];
  } catch {
    return [];
  }
}

export default async function EditionPage({ params }: Props) {
  const { date, edition } = await params;

  if (!["morning", "midday", "evening", "midnight"].includes(edition)) notFound();

  const briefings = await getBriefings(date, edition);
  if (briefings.length === 0) {
    return (
      <div style={{ padding: "40px 24px", textAlign: "center", fontFamily: "var(--font-mono)" }}>
        <p style={{ fontSize: "13px", color: "#666", marginBottom: "16px" }}>
          No briefing found for {date} · {edition} edition.
        </p>
        <a href="/history" style={{ fontSize: "11px", color: "#000", textDecoration: "underline" }}>← Back to archive</a>
      </div>
    );
  }

  // Group by section_id, take most recent per section
  const sectionMap = new Map<string, Article[]>();
  for (const b of briefings) {
    if (!sectionMap.has(b.section_id)) {
      sectionMap.set(b.section_id, b.articles as Article[]);
    }
  }

  // Order by sections definition
  const orderedSections = sections
    .filter((s) => sectionMap.has(s.id) && s.id !== "debate")
    .map((s) => ({ section: s, articles: sectionMap.get(s.id)! as Article[] }));

  const formattedDate = new Date(date + "T00:00:00").toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      {/* Top bar */}
      <header style={styles.topBar}>
        <div>
          <div style={styles.topBarTitle}>
            {edition === "morning" ? "☀ Morning" : edition === "midday" ? "☀ Midday" : edition === "evening" ? "☾ Evening" : "☾ Midnight"} Edition
          </div>
          <div style={styles.topBarSubtitle}>{formattedDate.toUpperCase()}</div>
        </div>
        <Link href="/history" style={styles.backLink}>← Archive</Link>
      </header>

      <main style={styles.main}>
        <div style={styles.container}>

          {orderedSections.map(({ section, articles }) => (
            <div key={section.id} style={styles.sectionBlock}>
              <div style={styles.sectionHeader}>
                <span style={styles.sectionTitle}>{section.label}</span>
              </div>
              <div style={{ margin: "0 -16px" }}>
                {articles[0] && <LeadStory article={articles[0]} />}
                {articles.slice(1).map((a, i) => (
                  <StoryRow key={i} article={a} />
                ))}
              </div>
            </div>
          ))}

          {orderedSections.length === 0 && (
            <p style={styles.empty}>No articles cached for this edition.</p>
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
    fontSize: "18px",
    fontWeight: 900,
    color: "#fff",
    letterSpacing: "-0.5px",
    lineHeight: 1.1,
  },
  topBarSubtitle: {
    fontFamily: "var(--font-mono)",
    fontSize: "8px",
    color: "#666",
    letterSpacing: "0.1em",
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
    maxWidth: "820px",
    margin: "0 auto",
    padding: "0 16px",
  },
  sectionBlock: {
    paddingTop: "20px",
    marginBottom: "8px",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    paddingBottom: "10px",
    borderBottom: "2px solid #000",
    marginBottom: "0",
  },
  sectionTitle: {
    fontFamily: "var(--font-display)",
    fontSize: "18px",
    fontWeight: 700,
    fontStyle: "italic",
    color: "#000",
    letterSpacing: "-0.01em",
  },
  empty: {
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    color: "#888",
    letterSpacing: "0.06em",
    paddingTop: "32px",
  },
};
