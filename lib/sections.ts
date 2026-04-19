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
  { id: "worldcup",  label: "WORLD CUP", color: "#dc2626", sources: "BBC Sport · ESPN · Reuters Sport" },
  { id: "sports",    label: "SPORTS",    color: "#9333ea", sources: "ESPN · AFL.com.au · Reforma" },
  { id: "running",   label: "RUNNING",   color: "#16a34a", sources: "Triathlete · SwimSwam · VeloNews · World Athletics" },
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
  worldcup: 5,
  sports: 5,
  running: 5,
};

export const DEBATE_SECTION_ID = "debate";

export const sectionIds = SECTIONS.map((s) => s.id);
