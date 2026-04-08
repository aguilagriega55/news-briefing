import { Article } from "@/lib/supabase";

interface NewsCardProps {
  article: Article;
  index: number;
  sectionAccent: string;
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
    });
  } catch {
    return null;
  }
}

const sentimentConfig = {
  positive: { label: "↑ Positive", bg: "rgba(16,185,129,0.15)", color: "#34d399", border: "rgba(16,185,129,0.3)" },
  negative: { label: "↓ Negative", bg: "rgba(239,68,68,0.15)", color: "#f87171", border: "rgba(239,68,68,0.3)" },
  neutral:  { label: "→ Neutral",  bg: "rgba(99,157,255,0.1)",  color: "#94a3b8", border: "rgba(99,157,255,0.2)" },
};

export default function NewsCard({ article, index, sectionAccent }: NewsCardProps) {
  const dateLabel = formatArticleDate(article.pubDate);
  const sentiment = article.sentiment ? sentimentConfig[article.sentiment] : null;
  const hasImage = !!article.image_url;

  const placeholderGradients = [
    "linear-gradient(135deg, #1e3358 0%, #0f1e38 100%)",
    "linear-gradient(135deg, #1e3830 0%, #0f2020 100%)",
    "linear-gradient(135deg, #38201e 0%, #200f0f 100%)",
    "linear-gradient(135deg, #1e2838 0%, #0f1820 100%)",
    "linear-gradient(135deg, #2a1e38 0%, #180f20 100%)",
  ];

  const cardContent = (
    <div style={styles.card}>
      {/* Left: text content */}
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
          <span style={{ ...styles.source, color: sectionAccent }}>{article.source}</span>
          {dateLabel && (
            <>
              <span style={styles.metaDot}>·</span>
              <span style={styles.pubDate}>{dateLabel}</span>
            </>
          )}
          {sentiment && (
            <span
              style={{
                ...styles.sentimentPill,
                background: sentiment.bg,
                color: sentiment.color,
                border: `1px solid ${sentiment.border}`,
              }}
            >
              {sentiment.label}
            </span>
          )}
        </div>
      </div>

      {/* Right: image or placeholder */}
      <div
        style={{
          ...styles.imageWrap,
          background: hasImage ? "#000" : placeholderGradients[index % placeholderGradients.length],
          borderColor: sectionAccent + "30",
        }}
      >
        {hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.image_url!}
            alt=""
            style={styles.image}
            onError={(e) => {
              const wrap = (e.target as HTMLElement).parentElement;
              if (wrap) {
                wrap.style.background = placeholderGradients[index % placeholderGradients.length];
                (e.target as HTMLElement).style.display = "none";
                const span = document.createElement("span");
                span.style.cssText = "color:rgba(99,157,255,0.25);font-size:22px;";
                span.textContent = String(index + 1);
                wrap.appendChild(span);
              }
            }}
          />
        ) : (
          <span style={{ ...styles.imagePlaceholder, color: sectionAccent + "50" }}>
            {index + 1}
          </span>
        )}
      </div>
    </div>
  );

  return cardContent;
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    display: "flex",
    gap: "16px",
    alignItems: "flex-start",
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "10px",
    padding: "16px",
    marginBottom: "10px",
    transition: "border-color 0.15s, transform 0.15s, box-shadow 0.15s",
    cursor: "default",
  },
  textContent: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    display: "block",
    color: "var(--text-primary)",
    fontSize: "15px",
    fontWeight: 600,
    lineHeight: "1.45",
    marginBottom: "7px",
    textDecoration: "none",
    fontFamily: "var(--font-display)",
    letterSpacing: "-0.01em",
  },
  titlePlain: {
    color: "var(--text-primary)",
    fontSize: "15px",
    fontWeight: 600,
    lineHeight: "1.45",
    margin: "0 0 7px 0",
    fontFamily: "var(--font-display)",
    letterSpacing: "-0.01em",
  },
  summary: {
    color: "var(--text-secondary)",
    fontSize: "12.5px",
    lineHeight: "1.6",
    margin: "0 0 10px 0",
    fontFamily: "var(--font-body)",
  },
  meta: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "6px",
  },
  source: {
    fontSize: "10px",
    fontFamily: "var(--font-mono)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    fontWeight: 500,
  },
  metaDot: {
    color: "var(--text-dim)",
    fontSize: "10px",
  },
  pubDate: {
    color: "var(--text-dim)",
    fontSize: "10px",
    fontFamily: "var(--font-mono)",
  },
  sentimentPill: {
    fontSize: "9px",
    fontFamily: "var(--font-mono)",
    padding: "2px 7px",
    borderRadius: "20px",
    letterSpacing: "0.04em",
    fontWeight: 500,
  },
  imageWrap: {
    flexShrink: 0,
    width: "110px",
    height: "78px",
    borderRadius: "8px",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  imagePlaceholder: {
    fontSize: "28px",
    fontFamily: "var(--font-display)",
    fontWeight: 700,
  },
};
