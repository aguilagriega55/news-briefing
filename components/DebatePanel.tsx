"use client";

import { useState } from "react";
import { DebateTopic } from "@/lib/debate-generator";

interface DebatePanelProps {
  topics: DebateTopic[];
  week?: number;
}

function getISOWeekClient(): number {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function Divider({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "24px 0 16px" }}>
      <div style={{ flex: 1, height: "1px", background: "#e5e5e5" }} />
      <span style={{
        fontFamily: "var(--font-mono)",
        fontSize: "9px",
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        color: "#aaa",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}>
        {label}
      </span>
      <div style={{ flex: 1, height: "1px", background: "#e5e5e5" }} />
    </div>
  );
}

const DIFFICULTY_COLORS: Record<string, { color: string; borderColor: string }> = {
  Accessible:   { color: "#2d6a4f", borderColor: "#b7d9c5" },
  Intermediate: { color: "#92400e", borderColor: "#f0c97a" },
  Advanced:     { color: "#dc2626", borderColor: "#e8a9a3" },
};

function TopicCard({
  topic,
  selected,
  onClick,
}: {
  topic: DebateTopic;
  selected: boolean;
  onClick: () => void;
}) {
  const diffColors = DIFFICULTY_COLORS[topic.difficulty] ?? { color: "#888", borderColor: "#ddd" };
  return (
    <button
      onClick={onClick}
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        padding: "14px",
        border: selected ? "2px solid #000" : "1px solid #e5e5e5",
        borderRadius: "4px",
        background: selected ? "#f9f9f9" : "#fff",
        cursor: "pointer",
        WebkitTapHighlightColor: "transparent",
        marginBottom: "8px",
      }}
    >
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px" }}>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: "9px",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "#555",
          border: "1px solid #ddd",
          padding: "2px 7px",
          borderRadius: "2px",
        }}>
          {topic.category}
        </span>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: "9px",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          border: "1px solid",
          padding: "2px 7px",
          borderRadius: "2px",
          ...diffColors,
        }}>
          {topic.difficulty}
        </span>
      </div>
      <p style={{
        fontFamily: "var(--font-display)",
        fontSize: "16px",
        fontWeight: 700,
        lineHeight: 1.3,
        color: "#000",
        margin: 0,
      }}>
        {topic.topic}
      </p>
    </button>
  );
}

function TopicDetail({ topic, weekNum }: { topic: DebateTopic; weekNum: number }) {
  return (
    <div>
      {/* Topic headline */}
      <div style={{ textAlign: "center", padding: "24px 0 0" }}>
        <div style={{ height: "1px", background: "#000", marginBottom: "20px" }} />
        <h2 style={{
          fontFamily: "var(--font-display)",
          fontSize: "26px",
          fontWeight: 900,
          fontStyle: "italic",
          color: "#000",
          lineHeight: 1.2,
          letterSpacing: "-0.5px",
          margin: "0 0 20px 0",
          padding: "0 4px",
        }}>
          {topic.topic}
        </h2>
        <div style={{ height: "1px", background: "#000", marginBottom: "12px" }} />
        <div style={{ display: "flex", gap: "6px", justifyContent: "center", flexWrap: "wrap", paddingBottom: "4px" }}>
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "9px",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#555",
            border: "1px solid #ddd",
            padding: "2px 7px",
            borderRadius: "1px",
          }}>
            {topic.category}
          </span>
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "9px",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            border: "1px solid",
            padding: "2px 7px",
            borderRadius: "1px",
            ...(DIFFICULTY_COLORS[topic.difficulty] ?? { color: "#888", borderColor: "#ddd" }),
          }}>
            {topic.difficulty}
          </span>
        </div>
      </div>

      {/* Background */}
      <Divider label="Background" />
      <p style={styles.body}>{topic.background.summary}</p>
      <p style={{ ...styles.body, marginTop: "8px" }}>{topic.background.context}</p>
      <p style={{ ...styles.body, marginTop: "8px", fontStyle: "italic", color: "#aaa" }}>
        {topic.background.timeline}
      </p>

      {/* For / Against stacked */}
      <Divider label="The Debate" />

      <div style={{ borderTop: "3px solid #16a34a", padding: "16px", background: "#f9fdf9" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px", color: "#16a34a" }}>
          THE CASE FOR
        </div>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: "13px", fontStyle: "italic", lineHeight: 1.4, margin: "0 0 12px 0", color: "#16a34a" }}>
          {topic.sides.for.label}
        </p>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
          {topic.sides.for.points.map((pt, i) => (
            <li key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
              <span style={{ color: "#16a34a", flexShrink: 0, fontFamily: "var(--font-mono)", fontSize: "12px" }}>→</span>
              <span style={{ fontFamily: "var(--font-ui)", fontSize: "15px", lineHeight: 1.5, color: "#111" }}>{pt}</span>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ borderTop: "3px solid #dc2626", padding: "16px", background: "#fdf9f9", marginTop: "12px" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px", color: "#dc2626" }}>
          THE CASE AGAINST
        </div>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: "13px", fontStyle: "italic", lineHeight: 1.4, margin: "0 0 12px 0", color: "#dc2626" }}>
          {topic.sides.against.label}
        </p>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
          {topic.sides.against.points.map((pt, i) => (
            <li key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
              <span style={{ color: "#dc2626", flexShrink: 0, fontFamily: "var(--font-mono)", fontSize: "12px" }}>→</span>
              <span style={{ fontFamily: "var(--font-ui)", fontSize: "15px", lineHeight: 1.5, color: "#111" }}>{pt}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Impacts 2×2 */}
      <Divider label="Why It Matters" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        {[
          { label: "Economic",    value: topic.impacts.economic },
          { label: "Social",      value: topic.impacts.social },
          { label: "Political",   value: topic.impacts.political },
          { label: "Young People",value: topic.impacts.generational },
        ].map(({ label, value }) => (
          <div key={label} style={{ padding: "14px", border: "1px solid #f0f0f0", borderRadius: "4px" }}>
            <span style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#000", marginBottom: "6px", fontWeight: 500 }}>
              {label}
            </span>
            <p style={{ fontFamily: "var(--font-ui)", fontSize: "14px", lineHeight: 1.5, color: "#333", margin: 0 }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Discussion questions */}
      <Divider label="Discuss as a Family" />
      <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {topic.discussion_questions.map((q, i) => (
          <li key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "14px 16px", borderBottom: "1px solid #f0f0f0" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "18px", fontWeight: 700, color: "#ddd", flexShrink: 0, lineHeight: 1, marginTop: "1px", minWidth: "18px" }}>
              {i + 1}
            </span>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "17px", lineHeight: 1.3, color: "#000" }}>
              {q}
            </span>
          </li>
        ))}
      </ol>

      {/* Nuances */}
      <Divider label="Nuances to Consider" />
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
        {topic.debatable_points.map((pt, i) => (
          <li key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "#aaa", flexShrink: 0, marginTop: "1px" }}>→</span>
            <span style={styles.body}>{pt}</span>
          </li>
        ))}
      </ul>

      {/* What's happening now */}
      <Divider label="What's Happening Now" />
      <p style={styles.body}>{topic.next_steps}</p>

      {/* Balanced sources */}
      <Divider label="Read More" />
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        {[
          { label: "Left", source: topic.balanced_sources.left },
          { label: "Center", source: topic.balanced_sources.center },
          { label: "Right", source: topic.balanced_sources.right },
        ].map(({ label, source }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", borderBottom: "1px solid #f5f5f5" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.08em", width: "38px", flexShrink: 0 }}>
              {label}
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "#333" }}>
              {source}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        borderTop: "1px solid #f0f0f0",
        marginTop: "24px",
        paddingTop: "16px",
        textAlign: "center",
        fontFamily: "var(--font-mono)",
        fontSize: "11px",
        color: "#aaa",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
      }}>
        New topic every Monday · Week {weekNum} of 52
      </div>
    </div>
  );
}

export default function DebatePanel({ topics, week }: DebatePanelProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const weekNum = week ?? getISOWeekClient();
  const selected = topics[selectedIdx];

  if (!selected) return null;

  return (
    <div style={{ paddingBottom: "8px" }}>
      {/* ── Topic selector cards ─── */}
      <Divider label={`Weekly Debate · Week ${weekNum} of 52`} />
      <div>
        {topics.map((t, i) => (
          <TopicCard
            key={i}
            topic={t}
            selected={i === selectedIdx}
            onClick={() => setSelectedIdx(i)}
          />
        ))}
      </div>

      {/* ── Full debate content ─── */}
      <TopicDetail topic={selected} weekNum={weekNum} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  body: {
    fontFamily: "var(--font-ui)",
    fontSize: "15px",
    lineHeight: 1.65,
    color: "#333",
    margin: 0,
  },
};
