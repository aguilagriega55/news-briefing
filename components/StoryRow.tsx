import { Article } from "@/lib/supabase";
import BiasBar from "./BiasBar";

interface StoryRowProps {
  article: Article;
}

function formatTimestamp(pubDate?: string, source?: string): string | null {
  if (!pubDate) return source?.toUpperCase() ?? null;
  try {
    const d = new Date(pubDate);
    if (isNaN(d.getTime())) return source?.toUpperCase() ?? null;
    const day = d.getDate();
    const month = d.toLocaleString("en-AU", { month: "short" }).toUpperCase();
    const hours = String(d.getHours()).padStart(2, "0");
    const mins = String(d.getMinutes()).padStart(2, "0");
    const time = `${day} ${month} AT ${hours}:${mins}`;
    return source ? `${time}  ${source.toUpperCase()}` : time;
  } catch {
    return source?.toUpperCase() ?? null;
  }
}

function SentimentBadge({ sentiment }: { sentiment: "positive" | "negative" | "neutral" }) {
  const config = {
    positive: { bg: "#f0fdf4", color: "#16a34a", label: "↑ Positive" },
    negative: { bg: "#fef2f2", color: "#dc2626", label: "↓ Negative" },
    neutral:  { bg: "#f5f5f5", color: "#888",    label: "→ Neutral" },
  };
  const c = config[sentiment];
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      height: "24px",
      padding: "0 10px",
      borderRadius: "12px",
      background: c.bg,
      color: c.color,
      fontFamily: "var(--font-mono)",
      fontSize: "11px",
      fontWeight: 600,
      letterSpacing: "0.03em",
      flexShrink: 0,
    }}>
      {c.label}
    </span>
  );
}

export default function StoryRow({ article }: StoryRowProps) {
  const kicker = article.tag || article.source;
  const timestamp = formatTimestamp(article.pubDate, article.source);
  const hasImage = !!article.image_url;

  const inner = (
    <div style={styles.row}>
      {/* Text */}
      <div style={styles.textContent}>
        {kicker && <div style={styles.kicker}>{kicker.toUpperCase()}</div>}
        <p style={styles.headline}>{article.title}</p>
        {article.summary && <p style={styles.summary}>{article.summary}</p>}
        <div style={styles.meta}>
          {timestamp && <span style={styles.timestamp}>{timestamp}</span>}
          {article.sentiment && <SentimentBadge sentiment={article.sentiment} />}
          {article.bias && <BiasBar position={article.bias} />}
        </div>
      </div>

      {/* Thumbnail — only if image exists */}
      {hasImage && (
        <div style={styles.thumbWrap}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.image_url!}
            alt=""
            style={styles.thumbImg}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
              const wrap = (e.currentTarget as HTMLImageElement).parentElement;
              if (wrap) wrap.style.display = "none";
            }}
          />
        </div>
      )}
    </div>
  );

  if (article.url) {
    return (
      <a href={article.url} target="_blank" rel="noopener noreferrer" style={styles.anchor}>
        {inner}
      </a>
    );
  }
  return inner;
}

const styles: Record<string, React.CSSProperties> = {
  anchor: {
    display: "block",
    textDecoration: "none",
    color: "inherit",
  },
  row: {
    display: "flex",
    gap: "14px",
    alignItems: "flex-start",
    padding: "14px 16px",
    borderBottom: "1px solid #f0f0f0",
    minHeight: "100px",
    background: "#fff",
  },
  textContent: {
    flex: 1,
    minWidth: 0,
  },
  kicker: {
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    fontWeight: 500,
    color: "#000",
    letterSpacing: "0.1em",
    marginBottom: "8px",
  },
  headline: {
    fontFamily: "var(--font-display)",
    fontSize: "20px",
    fontWeight: 700,
    lineHeight: 1.2,
    color: "#000",
    letterSpacing: "-0.3px",
    margin: "0 0 12px 0",
  },
  summary: {
    fontFamily: "var(--font-ui)",
    fontSize: "15px",
    lineHeight: 1.5,
    color: "#222",
    margin: "0 0 9px 0",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  meta: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  },
  timestamp: {
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    color: "#555",
    letterSpacing: "0.02em",
  },
  thumbWrap: {
    flexShrink: 0,
    width: "80px",
    height: "80px",
    borderRadius: "4px",
    overflow: "hidden",
    alignSelf: "flex-start",
    marginTop: "2px",
    background: "#f0f0f0",
  },
  thumbImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
};
