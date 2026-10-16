type Trend = "Hiking" | "Cutting" | "Hold";

type Economy = {
  country: string;
  gdp: string;
  inflation: string;
  rate: string;
  trend: Trend;
  /** Highlighted rows — the markets this household actually tracks. */
  highlight?: boolean;
};

const ECONOMIES: Economy[] = [
  { country: "USA",       gdp: "2.3%", inflation: "3.8%", rate: "3.88%",  trend: "Hiking" },
  { country: "China",     gdp: "4.6%", inflation: "0.5%", rate: "3.10%",  trend: "Cutting" },
  { country: "Germany",   gdp: "0.9%", inflation: "2.2%", rate: "2.50%",  trend: "Hiking" },
  { country: "Japan",     gdp: "1.4%", inflation: "3.1%", rate: "1.25%",  trend: "Hiking" },
  { country: "India",     gdp: "6.4%", inflation: "4.8%", rate: "5.25%",  trend: "Cutting" },
  { country: "UK",        gdp: "1.6%", inflation: "3.7%", rate: "3.75%",  trend: "Hold" },
  { country: "Spain",     gdp: "2.4%", inflation: "2.2%", rate: "2.50%",  trend: "Hiking" },
  { country: "Brazil",    gdp: "3.5%", inflation: "5.8%", rate: "10.75%", trend: "Hiking" },
  { country: "Canada",    gdp: "1.8%", inflation: "2.5%", rate: "5.25%",  trend: "Hold" },
  { country: "Mexico",    gdp: "1.9%", inflation: "4.2%", rate: "9.75%",  trend: "Cutting", highlight: true },
  { country: "Australia", gdp: "2.0%", inflation: "4.0%", rate: "4.60%",  trend: "Hiking",  highlight: true },
];

const HEADERS = ["Country", "GDP", "Inflation", "Rate", "Trend"];

// Tightening reads red, easing green, on hold amber — same pill treatment as
// the ratings column in BanksTable.
const trendStyle = (t: Trend) =>
  t === "Cutting"
    ? { background: "#f0fdf4", color: "#15803d" }
    : t === "Hiking"
    ? { background: "#fef2f2", color: "#dc2626" }
    : { background: "#fefce8", color: "#ca8a04" };

const HIGHLIGHT_BG = "#eff6ff";

export default function EconomyTable() {
  return (
    <div style={{ margin: "16px 0", borderRadius: 8, overflow: "hidden", border: "1px solid #e5e5e5" }}>
      <div
        style={{
          padding: "12px 16px",
          background: "#000",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>Global Economic Indicators</div>
        <div style={{ fontSize: 10, color: "#888" }}>Annual GDP · CPI · Policy rate</div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, background: "#fff" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e5e5e5", background: "#f9f9f9" }}>
              {HEADERS.map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "8px 12px",
                    textAlign: "left",
                    fontSize: 10,
                    color: "#888",
                    fontWeight: 500,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ECONOMIES.map((e, i) => (
              <tr
                key={e.country}
                style={{
                  borderBottom: i < ECONOMIES.length - 1 ? "1px solid #f0f0f0" : "none",
                  background: e.highlight ? HIGHLIGHT_BG : "transparent",
                }}
              >
                <td style={{ padding: "12px 12px", fontWeight: e.highlight ? 700 : 600, fontSize: 14, color: "#000", whiteSpace: "nowrap" }}>
                  {e.country}
                </td>
                <td style={{ padding: "12px 12px", fontSize: 14, fontWeight: 600, color: "#000" }}>{e.gdp}</td>
                <td style={{ padding: "12px 12px", fontSize: 13, color: "#555" }}>{e.inflation}</td>
                <td style={{ padding: "12px 12px", fontSize: 13, color: "#555" }}>{e.rate}</td>
                <td style={{ padding: "12px 12px" }}>
                  <span
                    style={{
                      ...trendStyle(e.trend),
                      fontSize: 11,
                      padding: "3px 8px",
                      borderRadius: 4,
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {e.trend}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        style={{
          padding: "10px 16px",
          background: "#f9f9f9",
          borderTop: "1px solid #e5e5e5",
          fontSize: 11,
          color: "#888",
        }}
      >
        Sources: IMF · RBA · Trading Economics · Oct 2026
      </div>
    </div>
  );
}
