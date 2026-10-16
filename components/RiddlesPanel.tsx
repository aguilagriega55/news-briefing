"use client";

import { useState } from "react";
import { Riddle, RiddlesPayload, StoryExcerpt } from "@/lib/riddles-generator";

interface RiddlesPanelProps {
  payload: RiddlesPayload;
}

const LANGUAGE_LABELS: Record<string, string> = { es: "Español", en: "English" };

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

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      height: "20px",
      padding: "0 8px",
      border: "1px solid #ddd",
      borderRadius: "10px",
      fontFamily: "var(--font-mono)",
      fontSize: "9px",
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: "#777",
      whiteSpace: "nowrap",
    }}>
      {children}
    </span>
  );
}

/**
 * One riddle. The answer is hidden until the reader asks for it: a click
 * latches it open (so it survives on touch, where there is no hover), and a
 * mouse hover peeks at it without latching.
 */
function RiddleCard({ riddle, index }: { riddle: Riddle; index: number }) {
  const [latched, setLatched] = useState(false);
  const [peeking, setPeeking] = useState(false);
  const shown = latched || peeking;

  return (
    <div style={{
      padding: "16px",
      borderBottom: "1px solid #e5e5e5",
    }}>
      <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "10px" }}>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          color: "#7c2d12",
          letterSpacing: "0.08em",
          fontWeight: 700,
        }}>
          {String(index + 1).padStart(2, "0")}
        </span>
        <Chip>{riddle.theme}</Chip>
        <Chip>{LANGUAGE_LABELS[riddle.language] ?? riddle.language}</Chip>
      </div>

      <p style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: "19px",
        lineHeight: 1.45,
        color: "#000",
        margin: "0 0 8px",
        whiteSpace: "pre-line",
      }}>
        {riddle.riddle}
      </p>

      {riddle.translation && (
        <p style={{
          fontFamily: "var(--font-ui)",
          fontSize: "13px",
          lineHeight: 1.5,
          color: "#888",
          fontStyle: "italic",
          margin: "0 0 12px",
          whiteSpace: "pre-line",
        }}>
          {riddle.translation}
        </p>
      )}

      <button
        onClick={() => setLatched((v) => !v)}
        onMouseEnter={() => setPeeking(true)}
        onMouseLeave={() => setPeeking(false)}
        aria-expanded={shown}
        style={{
          display: "inline-flex",
          alignItems: "center",
          minHeight: "32px",
          padding: "0 12px",
          border: "1px solid",
          borderColor: shown ? "#7c2d12" : "#ddd",
          borderRadius: "16px",
          background: shown ? "#7c2d12" : "#fff",
          color: shown ? "#fff" : "#666",
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          letterSpacing: "0.06em",
          cursor: "pointer",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        {shown ? "Answer" : "Reveal answer"}
      </button>

      {shown && (
        <div style={{ paddingTop: "10px" }}>
          <p style={{
            fontFamily: "var(--font-ui)",
            fontSize: "15px",
            fontWeight: 700,
            color: "#000",
            margin: 0,
          }}>
            {riddle.answer}
          </p>
          {riddle.answer_translation && riddle.answer_translation !== riddle.answer && (
            <p style={{
              fontFamily: "var(--font-ui)",
              fontSize: "13px",
              color: "#888",
              fontStyle: "italic",
              margin: "2px 0 0",
            }}>
              {riddle.answer_translation}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function StoryCard({ story }: { story: StoryExcerpt }) {
  // The generator is asked for blank-line-separated paragraphs; fall back to
  // the whole excerpt as one paragraph if it didn't oblige.
  const paragraphs = story.excerpt.split(/\n\s*\n/).filter((p) => p.trim());

  return (
    <div style={{ padding: "16px", borderBottom: "1px solid #e5e5e5" }}>
      <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "8px" }}>
        <Chip>{LANGUAGE_LABELS[story.language] ?? story.language}</Chip>
        <Chip>Public domain</Chip>
      </div>

      <h3 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: "20px",
        fontWeight: 900,
        color: "#000",
        margin: "0 0 2px",
        lineHeight: 1.2,
      }}>
        {story.work}
      </h3>
      <p style={{
        fontFamily: "var(--font-mono)",
        fontSize: "10px",
        color: "#888",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        margin: "0 0 12px",
      }}>
        {story.author}{story.year ? ` · ${story.year}` : ""}
      </p>

      <blockquote style={{
        margin: 0,
        paddingLeft: "12px",
        borderLeft: "2px solid #e5e5e5",
      }}>
        {(paragraphs.length ? paragraphs : [story.excerpt]).map((p, i) => (
          <p key={i} style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "16px",
            lineHeight: 1.6,
            color: "#222",
            margin: i === 0 ? "0 0 10px" : "0 0 10px",
          }}>
            {p.trim()}
          </p>
        ))}
      </blockquote>

      {story.note && (
        <p style={{
          fontFamily: "var(--font-ui)",
          fontSize: "13px",
          lineHeight: 1.5,
          color: "#666",
          fontStyle: "italic",
          margin: "10px 0 0",
        }}>
          {story.note}
        </p>
      )}
    </div>
  );
}

export default function RiddlesPanel({ payload }: RiddlesPanelProps) {
  const { themes, riddles, stories } = payload;

  return (
    <div style={{ margin: "0 -16px" }}>
      {themes.length > 0 && (
        <div style={{ padding: "4px 16px 0", display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {themes.map((t) => (
            <Chip key={t}>{t}</Chip>
          ))}
        </div>
      )}

      <div style={{ padding: "0 16px" }}>
        <Divider label={`${riddles.length} Riddles`} />
      </div>
      {riddles.map((r, i) => (
        <RiddleCard key={i} riddle={r} index={i} />
      ))}

      {stories.length > 0 && (
        <>
          <div style={{ padding: "0 16px" }}>
            <Divider label="From the Shelf" />
          </div>
          {stories.map((s, i) => (
            <StoryCard key={i} story={s} />
          ))}
        </>
      )}
    </div>
  );
}
