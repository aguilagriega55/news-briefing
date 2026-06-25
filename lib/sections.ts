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
  { id: "football",  label: "FOOTBALL",  color: "#dc2626", sources: "BBC · ESPN · Record · Reforma" },
  { id: "worldcup",  label: "WORLD CUP", color: "#ca8a04", sources: "FIFA · BBC · ESPN · MARCA" },
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
  football: 6,
  worldcup: 6,
  sports: 5,
  running: 5,
};

// ── Sub-tab navigation (FOOTBALL / SPORTS) ───────────────────
// Each non-"all" sub-tab filters the section's already-summarised article list
// by a structured field the Haiku summariser emits: SPORTS articles carry a
// `league` ("F1" | "AFL" | "NFL"); FOOTBALL articles carry a `competition`
// ("Pumas Men" | "Pumas Women" | "Liga MX" | "Europe" | "A-League" |
// "International"). "all" has no filter and always shows the full list, so the
// tab still works even if the model omits a field on some article.
export type SubTab = {
  id: string;
  label: string;
  field?: "league" | "competition";
  values?: string[];
};

export const SUB_TABS: Record<string, SubTab[]> = {
  football: [
    { id: "all",    label: "ALL" },
    { id: "pumas",  label: "PUMAS",         field: "competition", values: ["Pumas Men", "Pumas Women"] },
    { id: "mexico", label: "MEXICO",        field: "competition", values: ["Liga MX"] },
    { id: "europe", label: "EUROPE",        field: "competition", values: ["Europe"] },
    { id: "world",  label: "INTERNATIONAL", field: "competition", values: ["International", "A-League"] },
  ],
  sports: [
    { id: "all", label: "ALL" },
    { id: "f1",  label: "F1",  field: "league", values: ["F1"] },
    { id: "afl", label: "AFL", field: "league", values: ["AFL"] },
    { id: "nfl", label: "NFL", field: "league", values: ["NFL"] },
  ],
};

export const DEBATE_SECTION_ID = "debate";

export const sectionIds = SECTIONS.map((s) => s.id);

// ── World Cup tab lifecycle ──────────────────────────────────
// The permanent FOOTBALL tab (id "football") is always shown. The WORLD CUP
// tab (id "worldcup") is temporal — only during the tournament window,
// evaluated against the Melbourne (AEST) local date. Removing it just slides
// the following tabs up; no reordering needed.
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
