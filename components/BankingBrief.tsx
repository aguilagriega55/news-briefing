"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function BankingBrief({ markdown }: { markdown: string }) {
  if (!markdown) {
    return (
      <div style={{ padding: "16px", color: "#666" }}>
        Brief unavailable.
      </div>
    );
  }

  return (
    <div className="banking-brief" style={{ padding: "16px" }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => (
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "22px",
                fontWeight: 800,
                marginTop: "24px",
                marginBottom: "10px",
                lineHeight: 1.2,
                letterSpacing: "-0.3px",
                color: "#0f766e",
              }}
            >
              {children}
            </h2>
          ),
          p: ({ children }) => (
            <p
              style={{
                fontSize: "15px",
                lineHeight: 1.55,
                marginBottom: "12px",
                color: "#222",
              }}
            >
              {children}
            </p>
          ),
          table: ({ children }) => (
            <div style={{ overflowX: "auto", margin: "12px 0 18px" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "13px",
                  fontFamily: "var(--font-mono, ui-monospace, monospace)",
                }}
              >
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th
              style={{
                textAlign: "left",
                padding: "8px 10px",
                borderBottom: "2px solid #0f766e",
                background: "#f5f5f4",
                fontWeight: 700,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                fontSize: "11px",
              }}
            >
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td
              style={{
                padding: "8px 10px",
                borderBottom: "1px solid #e5e5e5",
                verticalAlign: "top",
              }}
            >
              {children}
            </td>
          ),
          strong: ({ children }) => (
            <strong style={{ fontWeight: 700, color: "#000" }}>{children}</strong>
          ),
          em: ({ children }) => (
            <em style={{ fontStyle: "italic", color: "#444" }}>{children}</em>
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
