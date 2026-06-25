"use client";

// Reusable sub-tab strip. Shared by the WORLD CUP panel and the FOOTBALL /
// SPORTS tabs so sub-navigation looks and behaves identically everywhere.
// The active underline uses the calling section's accent colour.

export type SubTabItem = { id: string; label: string };

export default function SubTabNav({
  tabs,
  active,
  accent,
  onSelect,
}: {
  tabs: SubTabItem[];
  active: string;
  accent: string;
  onSelect: (id: string) => void;
}) {
  return (
    <nav style={styles.subnav}>
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onSelect(t.id)}
          style={{
            ...styles.subnavBtn,
            color: active === t.id ? "#000" : "#aaa",
            borderBottom:
              active === t.id ? `3px solid ${accent}` : "3px solid transparent",
          }}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  subnav: {
    display: "flex",
    overflowX: "auto",
    scrollbarWidth: "none",
    background: "#fafafa",
    borderBottom: "1px solid #e5e5e5",
    WebkitOverflowScrolling: "touch",
  },
  subnavBtn: {
    flexShrink: 0,
    padding: "11px 14px",
    fontSize: "11px",
    fontWeight: 700,
    fontFamily: "var(--font-mono)",
    letterSpacing: "0.05em",
    background: "none",
    border: "none",
    whiteSpace: "nowrap",
    minHeight: "42px",
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
  },
};
