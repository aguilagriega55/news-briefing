import { Article } from "@/lib/supabase";
import BiasBar from "./BiasBar";

interface LeadStoryProps {
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

export default function LeadStory({ article }: LeadStoryProps) {
  const kicker = article.tag || article.source;
  const timestamp = formatTimestamp(article.pubDate, article.source);
  const hasImage = !!article.image_url;
  const storyType = article.story_type && article.story_type !== "news"
    ? article.story_type.toUpperCase()
    : null;

  const inner = (
    <div style={styles.wrap}>
      {/* Kicker */}
      {kicker && <div style={styles.kicker}>{kicker.toUpperCase()}</div>}

      {/* Headline */}
      <h2 style={styles.headline}>{article.title}</h2>

      {/* Summary */}
      {article.summary && <p style={styles.summary}>{article.summary}</p>}

      {/* Timestamp + story type */}
      <div style={styles.topMeta}>
        {timestamp && <span style={styles.timestamp}>{timestamp}</span>}
        {storyType && <span style={styles.storyType}>{storyType}</span>}
      </div>

      {/* Full-width 16:9 image — only if available */}
      {hasImage && (
        <div style={styles.imageWrap} id={`lead-img-${article.title?.slice(0, 20)}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.image_url!}
            alt=""
            style={styles.image}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
              const wrap = (e.currentTarget as HTMLImageElement).parentElement;
              if (wrap) wrap.style.display = "none";
            }}
          />
        </div>
      )}

      {/* Bias bar — only shown when image present to avoid clutter */}
      {article.bias && hasImage && (
        <div style={styles.biasMeta}>
          <BiasBar position={article.bias} />
          {article.bias_label && (
            <span style={styles.biasLabel}>{article.bias_label}</span>
          )}
          {article.bias_reliability && (
            <span style={{
              ...styles.biasReliability,
              color: article.bias_reliability === "high" ? "#16a34a"
                   : article.bias_reliability === "mixed" ? "#92400e"
                   : "#dc2626",
            }}>
              {article.bias_reliability === "high" ? "● Reliable"
               : article.bias_reliability === "mixed" ? "◐ Mixed record"
               : "○ Check sources"}
            </span>
          )}
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
  wrap: {
    padding: "16px",
    borderBottom: "1px solid #e5e5e5",
    background: "#fff",
  },
  kicker: {
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    fontWeight: 500,
    color: "#000",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    marginBottom: "8px",
  },
  headline: {
    fontFamily: "var(--font-display)",
    fontSize: "32px",
    fontWeight: 900,
    lineHeight: 1.15,
    color: "#000",
    letterSpacing: "-0.5px",
    margin: "0 0 12px 0",
  },
  summary: {
    fontFamily: "var(--font-ui)",
    fontSize: "15px",
    lineHeight: 1.6,
    color: "#222",
    margin: "0 0 10px 0",
  },
  topMeta: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "14px",
    flexWrap: "wrap",
  },
  timestamp: {
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    color: "#555",
    letterSpacing: "0.03em",
  },
  storyType: {
    fontFamily: "var(--font-mono)",
    fontSize: "9px",
    color: "#555",
    letterSpacing: "0.08em",
    border: "1px solid #ddd",
    padding: "1px 5px",
    borderRadius: "2px",
  },
  imageWrap: {
    position: "relative",
    width: "100%",
    paddingTop: "56.25%",
    borderRadius: "4px",
    overflow: "hidden",
    marginBottom: "10px",
  },
  image: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  biasMeta: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  biasLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: "9px",
    color: "#555",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
  },
  biasReliability: {
    fontFamily: "var(--font-mono)",
    fontSize: "9px",
    letterSpacing: "0.04em",
  },
};
