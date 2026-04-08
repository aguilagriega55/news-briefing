import { Article } from "@/lib/supabase";

interface NewsCardProps {
  article: Article;
  index: number;
}

// Section-keyed gradient placeholders when no image is available
const gradients = [
  "linear-gradient(135deg, #1e3a5f 0%, #0f2340 100%)",
  "linear-gradient(135deg, #1a3a2a 0%, #0d2018 100%)",
  "linear-gradient(135deg, #3a1a3a 0%, #200d20 100%)",
  "linear-gradient(135deg, #3a2a1a 0%, #201808 100%)",
  "linear-gradient(135deg, #1a2a3a 0%, #0d1820 100%)",
];

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

export default function NewsCard({ article, index }: NewsCardProps) {
  const dateLabel = formatArticleDate(article.pubDate);
  const gradient = gradients[index % gradients.length];

  return (
    <div style={styles.card}>
      {/* Image / placeholder */}
      <div
        style={{
          ...styles.imageWrap,
          background: article.imageUrl ? undefined : gradient,
        }}
      >
        {article.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.imageUrl}
            alt=""
            style={styles.image}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <span style={styles.imagePlaceholder}>{index + 1}</span>
        )}
      </div>

      {/* Content */}
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
        <div style={styles.meta}>
          <span style={styles.source}>{article.source}</span>
          {dateLabel && (
            <>
              <span style={styles.metaDot}>·</span>
              <span style={styles.pubDate}>{dateLabel}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    display: "flex",
    gap: "16px",
    padding: "16px 0",
    borderBottom: "1px solid var(--border)",
    alignItems: "flex-start",
  },
  imageWrap: {
    flexShrink: 0,
    width: "80px",
    height: "60px",
    borderRadius: "8px",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid var(--border)",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  imagePlaceholder: {
    color: "rgba(99,157,255,0.3)",
    fontSize: "22px",
    fontFamily: "var(--font-display)",
    fontWeight: 700,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    display: "block",
    color: "var(--text-primary)",
    fontSize: "14px",
    fontWeight: 600,
    lineHeight: "1.45",
    marginBottom: "6px",
    textDecoration: "none",
    fontFamily: "var(--font-body)",
    letterSpacing: "-0.01em",
  },
  titlePlain: {
    color: "var(--text-primary)",
    fontSize: "14px",
    fontWeight: 600,
    lineHeight: "1.45",
    margin: "0 0 6px 0",
    fontFamily: "var(--font-body)",
    letterSpacing: "-0.01em",
  },
  summary: {
    color: "var(--text-secondary)",
    fontSize: "12.5px",
    lineHeight: "1.55",
    margin: "0 0 8px 0",
  },
  meta: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  source: {
    color: "var(--accent-bright)",
    fontSize: "10px",
    fontFamily: "var(--font-mono)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    opacity: 0.8,
  },
  metaDot: {
    color: "var(--text-dim)",
    fontSize: "10px",
    fontFamily: "var(--font-mono)",
  },
  pubDate: {
    color: "var(--text-dim)",
    fontSize: "10px",
    fontFamily: "var(--font-mono)",
  },
};
