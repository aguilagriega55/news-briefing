export type BiasPosition =
  | "left"
  | "center-left"
  | "center"
  | "center-right"
  | "right";

export type ReliabilityTier =
  | "high"      // Fact-based, corrections policy, low sensationalism
  | "mixed"     // Generally reliable but some bias or occasional errors
  | "low";      // Frequent factual errors or heavy opinion framing

export interface BiasRating {
  position: BiasPosition;
  reliability: ReliabilityTier;
  label: string; // Short human-readable label e.g. "Center-Left"
}

// Sources keyed by lowercase name. Partial match is used for lookup.
// Ratings are based on AllSides, Ad Fontes Media, and MBFC consensus data.
export const SOURCE_BIAS: Record<string, BiasRating> = {
  // International wire / broadly trusted
  "reuters":         { position: "center",       reliability: "high",  label: "Center" },
  "ap":              { position: "center",       reliability: "high",  label: "Center" },
  "associated press":{ position: "center",       reliability: "high",  label: "Center" },
  "afp":             { position: "center",       reliability: "high",  label: "Center" },
  "bloomberg":       { position: "center",       reliability: "high",  label: "Center" },
  "financial times": { position: "center",       reliability: "high",  label: "Center" },
  "the economist":   { position: "center",       reliability: "high",  label: "Center" },
  "bbc":             { position: "center",       reliability: "high",  label: "Center" },
  "wall street journal": { position: "center-right", reliability: "high",  label: "Center-Right" },
  "wsj":             { position: "center-right", reliability: "high",  label: "Center-Right" },

  // Left / Center-Left
  "the guardian":    { position: "center-left",  reliability: "high",  label: "Center-Left" },
  "guardian":        { position: "center-left",  reliability: "high",  label: "Center-Left" },
  "new york times":  { position: "center-left",  reliability: "high",  label: "Center-Left" },
  "nyt":             { position: "center-left",  reliability: "high",  label: "Center-Left" },
  "washington post": { position: "center-left",  reliability: "high",  label: "Center-Left" },
  "wapo":            { position: "center-left",  reliability: "high",  label: "Center-Left" },
  "the atlantic":    { position: "center-left",  reliability: "high",  label: "Center-Left" },
  "vox":             { position: "left",         reliability: "mixed", label: "Left" },
  "huffpost":        { position: "left",         reliability: "mixed", label: "Left" },
  "huffington post": { position: "left",         reliability: "mixed", label: "Left" },
  "msnbc":           { position: "left",         reliability: "mixed", label: "Left" },
  "the intercept":   { position: "left",         reliability: "mixed", label: "Left" },
  "mother jones":    { position: "left",         reliability: "mixed", label: "Left" },
  "slate":           { position: "left",         reliability: "mixed", label: "Left" },
  "salon":           { position: "left",         reliability: "low",   label: "Left" },
  "daily kos":       { position: "left",         reliability: "low",   label: "Left" },
  "cnn":             { position: "center-left",  reliability: "mixed", label: "Center-Left" },
  "abc news":        { position: "center-left",  reliability: "high",  label: "Center-Left" },
  "nbc news":        { position: "center-left",  reliability: "high",  label: "Center-Left" },
  "npr":             { position: "center-left",  reliability: "high",  label: "Center-Left" },
  "politico":        { position: "center-left",  reliability: "high",  label: "Center-Left" },
  "the hill":        { position: "center",       reliability: "mixed", label: "Center" },
  "axios":           { position: "center",       reliability: "high",  label: "Center" },

  // Right / Center-Right
  "fox news":        { position: "right",        reliability: "low",   label: "Right" },
  "fox":             { position: "right",        reliability: "low",   label: "Right" },
  "the daily wire":  { position: "right",        reliability: "low",   label: "Right" },
  "daily wire":      { position: "right",        reliability: "low",   label: "Right" },
  "breitbart":       { position: "right",        reliability: "low",   label: "Right" },
  "new york post":   { position: "right",        reliability: "mixed", label: "Right" },
  "ny post":         { position: "right",        reliability: "mixed", label: "Right" },
  "the federalist":  { position: "right",        reliability: "mixed", label: "Right" },
  "national review": { position: "right",        reliability: "mixed", label: "Right" },
  "washington examiner": { position: "center-right", reliability: "mixed", label: "Center-Right" },
  "the telegraph":   { position: "center-right", reliability: "high",  label: "Center-Right" },
  "telegraph":       { position: "center-right", reliability: "high",  label: "Center-Right" },
  "the times":       { position: "center-right", reliability: "high",  label: "Center-Right" },
  "sky news":        { position: "center-right", reliability: "mixed", label: "Center-Right" },
  "cnbc":            { position: "center",       reliability: "high",  label: "Center" },
  "the spectator":   { position: "right",        reliability: "mixed", label: "Right" },
  "reason":          { position: "center-right", reliability: "high",  label: "Center-Right" },

  // Australian sources
  "abc":             { position: "center-left",  reliability: "high",  label: "Center-Left" },
  "abc australia":   { position: "center-left",  reliability: "high",  label: "Center-Left" },
  "the abc":         { position: "center-left",  reliability: "high",  label: "Center-Left" },
  "sydney morning herald": { position: "center-left", reliability: "high", label: "Center-Left" },
  "smh":             { position: "center-left",  reliability: "high",  label: "Center-Left" },
  "the age":         { position: "center-left",  reliability: "high",  label: "Center-Left" },
  "the australian":  { position: "center-right", reliability: "mixed", label: "Center-Right" },
  "news.com.au":     { position: "center-right", reliability: "mixed", label: "Center-Right" },
  "herald sun":      { position: "right",        reliability: "mixed", label: "Right" },
  "daily telegraph": { position: "right",        reliability: "mixed", label: "Right" },
  "crikey":          { position: "center-left",  reliability: "high",  label: "Center-Left" },
  "the saturday paper": { position: "left",      reliability: "high",  label: "Left" },
  "nine news":       { position: "center",       reliability: "high",  label: "Center" },
  "7news":           { position: "center",       reliability: "mixed", label: "Center" },
  "rba":             { position: "center",       reliability: "high",  label: "Center" },
  "afr":             { position: "center-right", reliability: "high",  label: "Center-Right" },
  "australian financial review": { position: "center-right", reliability: "high", label: "Center-Right" },

  // Finance / business
  "the banker":      { position: "center",       reliability: "high",  label: "Center" },
  "american banker": { position: "center",       reliability: "high",  label: "Center" },
  "ecb":             { position: "center",       reliability: "high",  label: "Center" },
  "s&p global":      { position: "center",       reliability: "high",  label: "Center" },
  "ft":              { position: "center",       reliability: "high",  label: "Center" },

  // Sports
  "espn":            { position: "center",       reliability: "high",  label: "Center" },
  "bbc sport":       { position: "center",       reliability: "high",  label: "Center" },
  "sky sports":      { position: "center",       reliability: "high",  label: "Center" },
};

/**
 * Look up bias for a source name. Tries exact match first,
 * then partial substring match (both directions) for flexibility.
 * Returns null if no match found.
 */
export function getBias(sourceName: string): BiasRating | null {
  const key = sourceName.toLowerCase().trim();

  // Exact match
  if (SOURCE_BIAS[key]) return SOURCE_BIAS[key];

  // Partial match: registry key is a substring of source name, or vice versa
  for (const [registryKey, rating] of Object.entries(SOURCE_BIAS)) {
    if (key.includes(registryKey) || registryKey.includes(key)) {
      return rating;
    }
  }

  return null;
}
