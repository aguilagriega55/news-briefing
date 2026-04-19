import { BiasPosition } from "@/lib/source-bias";

interface BiasBarProps {
  position: BiasPosition;
}

const POSITION_PERCENT: Record<BiasPosition, number> = {
  left:          5,
  "center-left": 28,
  center:        50,
  "center-right": 72,
  right:         95,
};

export default function BiasBar({ position }: BiasBarProps) {
  const pct = POSITION_PERCENT[position];
  return (
    <div style={{ position: "relative", width: "44px", height: "4px", flexShrink: 0 }}>
      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(90deg, #2563eb 0%, #9ca3af 50%, #dc2626 100%)",
        borderRadius: "2px",
      }} />
      <div style={{
        position: "absolute",
        top: "-2px",
        left: `calc(${pct}% - 4px)`,
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        background: "#fff",
        border: "1.5px solid #333",
      }} />
    </div>
  );
}
