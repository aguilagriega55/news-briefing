import { Article } from "@/lib/supabase";

interface NewsCardProps {
  article: Article;
  index: number;
}

export default function NewsCard({ article, index }: NewsCardProps) {
  return (
    <div style={styles.card}>
      <div style={styles.indexBadge}>{index + 1}</div>
      <div style={styles.content}>
        {article.url ? (
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.title}
          >
            {article.title}
          </a>
        ) : (
          <p style={styles.titlePlain}>{article.title}</p>
        )}
        <p style={styles.summary}>{article.summary}</p>
        <span style={styles.source}>{article.source}</span>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    display: "flex",
    gap: "12px",
    padding: "14px 0",
    borderBottom: "1px solid #1e1e2e",
  },
  indexBadge: {
    flexShrink: 0,
    width: "22px",
    height: "22px",
    borderRadius: "4px",
    background: "#1e1e2e",
    color: "#6c6c8a",
    fontSize: "11px",
    fontFamily: "monospace",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "2px",
  },
  content: {
    flex: 1,
  },
  title: {
    display: "block",
    color: "#e2e2f0",
    fontSize: "14px",
    fontWeight: 600,
    lineHeight: "1.4",
    marginBottom: "6px",
    textDecoration: "none",
    cursor: "pointer",
  },
  titlePlain: {
    color: "#e2e2f0",
    fontSize: "14px",
    fontWeight: 600,
    lineHeight: "1.4",
    marginBottom: "6px",
    margin: "0 0 6px 0",
  },
  summary: {
    color: "#9090b0",
    fontSize: "13px",
    lineHeight: "1.5",
    margin: "0 0 8px 0",
  },
  source: {
    color: "#6c6c8a",
    fontSize: "11px",
    fontFamily: "monospace",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
};
