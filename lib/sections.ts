export type Section = {
  id: string;
  label: string;
  color: string;
  sources: string;
};

export const SECTIONS: Section[] = [
  { id: "latest",    label: "TOP NEWS",  color: "#000000", sources: "Reuters · BBC · AP · ABC" },
  { id: "australia", label: "AUSTRALIA", color: "#16a34a", sources: "ABC · The Age · SMH · Guardian AU" },
  { id: "politics",  label: "POLITICS",  color: "#1d4ed8", sources: "Reuters · BBC · Guardian · AP" },
  { id: "finance",   label: "FINANCE",   color: "#b45309", sources: "Reuters · CNBC · Bloomberg · FT" },
  { id: "business",  label: "BUSINESS",  color: "#7c3aed", sources: "AFR · SmartCompany · ABC Business" },
  { id: "banking",   label: "BANKING",   color: "#0f766e", sources: "Reuters · FT · Bloomberg · RBA" },
  { id: "worldcup",  label: "FOOTBALL",  color: "#dc2626", sources: "BBC · ESPN · Record · Reforma" },
  { id: "sports",    label: "SPORTS",    color: "#9333ea", sources: "F1 · AFL · NFL" },
  { id: "running",   label: "RUNNING",   color: "#16a34a", sources: "Triathlete · SwimSwam · Cycling News · Runner's World" },
  { id: "debate",    label: "DEBATE",    color: "#000000", sources: "AI generated · Weekly rotation" },
];

// Backward-compat alias (used by page.tsx, history pages)
export const sections = SECTIONS;

export const STORY_COUNT: Record<string, number> = {
  latest: 8,
  australia: 5,
  politics: 5,
  finance: 5,
  business: 5,
  banking: 5,
  worldcup: 6,
  sports: 5,
  running: 5,
};

export const DEBATE_SECTION_ID = "debate";

export const sectionIds = SECTIONS.map((s) => s.id);

// ── World Cup tab lifecycle ──────────────────────────────────
// The FOOTBALL/worldcup tab is only shown during the tournament window,
// evaluated against the Melbourne (AEST) local date. Removing it from the
// list slides SPORTS into position 7 automatically — no reordering needed.
export const WORLDCUP_WINDOW = { start: "2026-06-11", end: "2026-07-19" };

// Current YYYY-MM-DD in Melbourne, independent of device/server timezone.
export function melbourneDate(now: Date = new Date()): string {
  return now.toLocaleDateString("en-CA", { timeZone: "Australia/Melbourne" });
}

export function isWorldCupActive(date: string = melbourneDate()): boolean {
  return date >= WORLDCUP_WINDOW.start && date <= WORLDCUP_WINDOW.end;
}

// SECTIONS minus any out-of-window lifecycle tabs (currently just worldcup).
export function getVisibleSections(date: string = melbourneDate()): Section[] {
  return SECTIONS.filter((s) => s.id !== "worldcup" || isWorldCupActive(date));
}
