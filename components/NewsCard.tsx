import { Article } from "@/lib/supabase";
import BiasIndicator from "./BiasIndicator";

interface NewsCardProps {
  article: Article;
  index: number;
}

function formatArticleDate(pubDate?: string): string | null {
  if (!pubDate) return null;
  try {
    const d = new Date(pubDate);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).toUpperCase();
  } catch {
    return null;
  }
}

const sentimentConfig = {
  positive: { label: "↑ Positive", color: "#2d6a4f", border: "#b7d9c5" },
  negative: { label: "↓ Negative", color: "var(--accent-red)", border: "#e8a9a3" },
  neutral:  { label: "→ Neutral",  color: "var(--ink-dim)",    border: "var(--rule)" },
};

export default function NewsCard({ article, index }: NewsCardProps) {
  const dateLabel = formatArticleDate(article.pubDate);
  const sentiment = article.sentiment ? sentimentConfig[article.sentiment] : null;
  const hasImage = !!article.image_url;

  return (
    <div style={styles.article}>

      {/* Text content */}
      <div style={styles.textContent}>
        {article.url ? (
          <a href={article.url} target="_blank" rel="noopener noreferrer" style={styles.title}>
            {article.title}
          </a>
        ) : (
          <p style={styles.titlePlain}>{article.title}</p>
        )}
        <p style={styles.summary}>{article.summary}</p>
        <div style={styles.meta}>
          <span style={styles.source}>{article.source}</span>
          {dateLabel && (
            <>
              <span style={styles.metaDivider}>·</span>
              <span style={styles.pubDate}>{dateLabel}</span>
            </>
          )}
          {article.tag && (
            <>
              <span style={styles.metaDivider}>·</span>
              <span style={styles.tag}>{article.tag}</span>
            </>
          )}
          {sentiment && (
            <span style={{
              ...styles.sentimentPill,
              color: sentiment.color,
              borderColor: sentiment.border,
            }}>
              {sentiment.label}
            </span>
          )}
          {article.bias && article.bias_reliability && article.bias_label && (
            <BiasIndicator
              position={article.bias}
              reliability={article.bias_reliability}
              label={article.bias_label}
              variant="compact"
            />
          )}
        </div>
      </div>

      {/* Thumbnail — shown only when image available */}
      {hasImage && (
        <div style={styles.imageWrap}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.image_url!}
            alt=""
            style={styles.image}
            onError={(e) => {
              const wrap = (e.target as HTMLElement).parentElement;
              if (wrap) wrap.style.display = "none";
            }}
          />
        </div>
      )}

      {/* Article number — shown when no image */}
      {!hasImage && (
        <span style={styles.index}>{index + 1}</span>
      )}

    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  // Full-bleed row — parent sets margin: "0 -16px" so this spans edge-to-edge
  article: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
    padding: "16px",
    borderBottom: "1px solid #ddd",
    background: "var(--paper)",
  },
  textContent: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    display: "block",
    fontFamily: "var(--font-display)",
    fontSize: "17px",
    fontWeight: 700,
    lineHeight: 1.38,
    color: "var(--ink)",
    textDecoration: "none",
    marginBottom: "6px",
    letterSpacing: "-0.01em",
  },
  titlePlain: {
    fontFamily: "var(--font-display)",
    fontSize: "17px",
    fontWeight: 700,
    lineHeight: 1.38,
    color: "var(--ink)",
    margin: "0 0 6px 0",
    letterSpacing: "-0.01em",
  },
  summary: {
    fontFamily: "var(--font-body)",
    fontSize: "14px",
    lineHeight: 1.6,
    color: "var(--ink-light)",
    margin: "0 0 8px 0",
  },
  meta: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "5px",
  },
  source: {
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    color: "var(--accent-red)",
  },
  metaDivider: {
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    color: "var(--ink-dim)",
  },
  pubDate: {
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    color: "var(--ink-dim)",
    letterSpacing: "0.03em",
  },
  tag: {
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    color: "var(--ink-dim)",
    letterSpacing: "0.03em",
    textTransform: "uppercase",
  },
  sentimentPill: {
    fontFamily: "var(--font-mono)",
    fontSize: "10px",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    padding: "1px 6px",
    border: "1px solid",
    borderRadius: "2px",
  },

  // Thumbnail
  imageWrap: {
    flexShrink: 0,
    width: "88px",
    height: "66px",
    overflow: "hidden",
    borderRadius: "4px",
    border: "1px solid #ddd",
    background: "#eee",
    alignSelf: "flex-start",
    marginTop: "2px",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },

  // Article number (shown when no image)
  index: {
    fontFamily: "var(--font-display)",
    fontSize: "22px",
    fontWeight: 700,
    fontStyle: "italic",
    color: "var(--rule)",
    flexShrink: 0,
    lineHeight: 1,
    userSelect: "none",
    alignSelf: "flex-start",
    marginTop: "2px",
    minWidth: "22px",
    textAlign: "right",
  },
};
