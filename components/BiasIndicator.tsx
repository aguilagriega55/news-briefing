import { BiasPosition, ReliabilityTier } from "@/lib/source-bias";

interface BiasIndicatorProps {
  position: BiasPosition;
  reliability: ReliabilityTier;
  label: string;
  /** "compact" = small inline pill for NewsCard; "full" = labeled scale for DebatePanel */
  variant?: "compact" | "full";
}

const POSITIONS: BiasPosition[] = [
  "left",
  "center-left",
  "center",
  "center-right",
  "right",
];

const POSITION_COLORS: Record<BiasPosition, string> = {
  "left":         "#2563eb",
  "center-left":  "#60a5fa",
  "center":       "#6b7280",
  "center-right": "#f97316",
  "right":        "#dc2626",
};

const RELIABILITY_META: Record<ReliabilityTier, { icon: string; label: string; color: string }> = {
  high:  { icon: "●", label: "Reliable",       color: "#2d6a4f" },
  mixed: { icon: "◐", label: "Mixed record",   color: "#92400e" },
  low:   { icon: "○", label: "Check sources",  color: "var(--accent-red)" },
};

export default function BiasIndicator({
  position,
  reliability,
  label,
  variant = "compact",
}: BiasIndicatorProps) {
  const activeIndex = POSITIONS.indexOf(position);
  const rel = RELIABILITY_META[reliability];
  const activeColor = POSITION_COLORS[position];

  if (variant === "compact") {
    return (
      <span style={compactStyles.wrap} title={`Political lean: ${label} · ${rel.label}`}>
        {POSITIONS.map((p, i) => (
          <span
            key={p}
            style={{
              ...compactStyles.dot,
              background: i === activeIndex ? POSITION_COLORS[p] : "var(--rule)",
              transform: i === activeIndex ? "scale(1.25)" : "scale(1)",
            }}
          />
        ))}
        <span style={{ ...compactStyles.reliabilityDot, color: rel.color }} title={rel.label}>
          {rel.icon}
        </span>
      </span>
    );
  }

  // Full variant — labeled scale used in DebatePanel
  return (
    <div style={fullStyles.wrap}>
      <div style={fullStyles.scaleRow}>
        <span style={fullStyles.scaleEnd}>Left</span>
        <div style={fullStyles.dots}>
          {POSITIONS.map((p, i) => (
            <span
              key={p}
              style={{
                ...fullStyles.dot,
                background: i === activeIndex ? POSITION_COLORS[p] : "var(--rule)",
                transform: i === activeIndex ? "scale(1.4)" : "scale(1)",
              }}
            />
          ))}
        </div>
        <span style={fullStyles.scaleEnd}>Right</span>
      </div>
      <div style={fullStyles.meta}>
        <span style={{ ...fullStyles.positionLabel, color: activeColor }}>{label}</span>
        <span style={fullStyles.dot2} />
        <span style={{ ...fullStyles.reliabilityLabel, color: rel.color }}>
          {rel.icon} {rel.label}
        </span>
      </div>
    </div>
  );
}

const compactStyles: Record<string, React.CSSProperties> = {
  wrap: {
    display: "inline-flex",
    alignItems: "center",
    gap: "3px",
    verticalAlign: "middle",
  },
  dot: {
    display: "inline-block",
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    transition: "transform 0.1s",
    flexShrink: 0,
  },
  reliabilityDot: {
    fontSize: "8px",
    lineHeight: 1,
    marginLeft: "2px",
    flexShrink: 0,
  },
};

const fullStyles: Record<string, React.CSSProperties> = {
  wrap: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  scaleRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  scaleEnd: {
    fontFamily: "var(--font-mono)",
    fontSize: "8px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "var(--ink-dim)",
    flexShrink: 0,
  },
  dots: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    flex: 1,
    justifyContent: "center",
  },
  dot: {
    display: "inline-block",
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    transition: "transform 0.1s",
    flexShrink: 0,
  },
  meta: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    paddingLeft: "2px",
  },
  positionLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: "9px",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    fontWeight: 500,
  },
  dot2: {
    width: "2px",
    height: "2px",
    borderRadius: "50%",
    background: "var(--rule)",
    flexShrink: 0,
  },
  reliabilityLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: "9px",
    letterSpacing: "0.04em",
  },
};
