import { melbourneDate } from "./sections";

// Same model the rest of this app's generation uses (haiku-summariser,
// banking-brief). Named so swapping the whole tab onto a stronger model is a
// one-line change.
const MODEL = "claude-haiku-4-5-20251001";

// Mirrors the regex in haiku-summariser.ts — kept local so this module doesn't
// widen that file's exported surface. Excludes Latin accents so Spanish text
// ("acertijo", "qué", "niño") survives untouched.
const EMOJI_RE =
  /[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{FE0F}\u{200D}]/gu;
/** Single-line fields: strip emoji and collapse every whitespace run. */
const cleanLine = (s: string): string =>
  (s ?? "").replace(EMOJI_RE, "").replace(/\s{2,}/g, " ").trim();

/**
 * Multi-line fields (riddle lines, story paragraphs). Tidies horizontal
 * whitespace only — line and paragraph breaks are load-bearing here, and
 * cleanLine's `\s{2,}` would eat the blank line between paragraphs and
 * flatten a three-paragraph excerpt into one block.
 */
const cleanBlock = (s: string): string =>
  (s ?? "")
    .replace(EMOJI_RE, "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

// Deliberately NOT run through toAustralianEnglish(): the riddles are partly
// Spanish, and the story excerpts are quotations of fixed historical text.
// Re-spelling either would corrupt it.

export type RiddleLanguage = "es" | "en";

export type Riddle = {
  language: RiddleLanguage;
  theme: string;
  riddle: string;
  /** The same riddle in the other language, so the whole family can play. */
  translation: string;
  answer: string;
  answer_translation: string;
};

export type StoryExcerpt = {
  author: string;
  work: string;
  /** Publication year of the work, as a display string. */
  year: string;
  language: RiddleLanguage;
  /** 2-3 paragraphs, separated by blank lines. */
  excerpt: string;
  /** One line on why this passage is worth reading. */
  note: string;
};

export type RiddlesPayload = {
  season: string;
  themes: string[];
  riddles: Riddle[];
  stories: StoryExcerpt[];
};

// ── Public-domain author roster ──────────────────────────────────
// The allowlist is enforced in code, not just asked for in the prompt, because
// "famous author" and "public domain" are not the same thing: Borges (d. 1986)
// and García Márquez (d. 2014) are both still in copyright in Australia, which
// runs life + 70 years. Everyone below died before 1956, so their work is
// public domain here. Spanish-language and Australian authors are included
// deliberately — this brief is for a Melbourne family that reads both.
type PublicDomainAuthor = {
  name: string;
  died: number;
  language: RiddleLanguage;
};

export const PUBLIC_DOMAIN_AUTHORS: PublicDomainAuthor[] = [
  { name: "Franz Kafka",               died: 1924, language: "en" },
  { name: "Anton Chekhov",             died: 1904, language: "en" },
  { name: "Virginia Woolf",            died: 1941, language: "en" },
  { name: "Katherine Mansfield",       died: 1923, language: "en" },
  { name: "Edgar Allan Poe",           died: 1849, language: "en" },
  { name: "Oscar Wilde",               died: 1900, language: "en" },
  { name: "Charles Dickens",           died: 1870, language: "en" },
  { name: "Mary Shelley",              died: 1851, language: "en" },
  { name: "Bram Stoker",               died: 1912, language: "en" },
  { name: "Leo Tolstoy",               died: 1910, language: "en" },
  { name: "Guy de Maupassant",         died: 1893, language: "en" },
  { name: "Henry Lawson",              died: 1922, language: "en" },
  { name: "Banjo Paterson",            died: 1941, language: "en" },
  { name: "Miguel de Cervantes",       died: 1616, language: "es" },
  { name: "Rubén Darío",               died: 1916, language: "es" },
  { name: "Horacio Quiroga",           died: 1937, language: "es" },
  { name: "Gustavo Adolfo Bécquer",    died: 1870, language: "es" },
  { name: "Emilia Pardo Bazán",        died: 1921, language: "es" },
  { name: "José Martí",                died: 1895, language: "es" },
  { name: "Sor Juana Inés de la Cruz", died: 1695, language: "es" },
];

const normaliseName = (s: string) =>
  (s ?? "")
    .normalize("NFD")
    // Drop combining diacritics (U+0300-U+036F) so "Darío" matches "Dario".
    .split("")
    .filter((ch) => {
      const c = ch.codePointAt(0) ?? 0;
      return c < 0x300 || c > 0x36f;
    })
    .join("")
    .toLowerCase()
    .trim();

const ALLOWED_AUTHORS = new Set(
  PUBLIC_DOMAIN_AUTHORS.map((a) => normaliseName(a.name))
);

export const isPublicDomainAuthor = (name: string): boolean =>
  ALLOWED_AUTHORS.has(normaliseName(name));

// ── Seasonal themes ──────────────────────────────────────────────
// Southern-hemisphere seasons, evaluated against the Melbourne date so the
// theme doesn't flip based on where the cron happens to run. Festival windows
// stack on top of the season — late October is both "spring" and "Halloween".

const SOUTHERN_SEASONS: Record<number, string> = {
  1: "summer",  2: "summer",  3: "autumn",
  4: "autumn",  5: "autumn",  6: "winter",
  7: "winter",  8: "winter",  9: "spring",
  10: "spring", 11: "spring", 12: "summer",
};

/** Inclusive [start, end] day-of-month windows within a given month. */
const FESTIVALS: { theme: string; month: number; from: number; to: number }[] = [
  { theme: "Halloween",       month: 10, from: 24, to: 31 },
  { theme: "Halloween",       month: 11, from: 1,  to: 1  },
  { theme: "Día de Muertos",  month: 10, from: 31, to: 31 },
  { theme: "Día de Muertos",  month: 11, from: 1,  to: 3  },
];

export function getSeasonalThemes(date: string = melbourneDate()): {
  season: string;
  themes: string[];
} {
  const [, mm, dd] = date.split("-").map(Number);
  const season = SOUTHERN_SEASONS[mm] ?? "spring";

  const festivals = FESTIVALS.filter(
    (f) => f.month === mm && dd >= f.from && dd <= f.to
  ).map((f) => f.theme);

  // Dedupe — the two Día de Muertos windows can't both match, but Halloween
  // and Día de Muertos overlap on 31 Oct and 1 Nov by design.
  return { season, themes: [season, ...new Set(festivals)] };
}

// ── Generation ───────────────────────────────────────────────────

const PAYLOAD_SCHEMA = `{
  "riddles": [
    {
      "language": "es" | "en",
      "theme": "one of the themes listed above",
      "riddle": "the riddle, 1-4 short lines, in the language named by \\"language\\"",
      "translation": "the same riddle in the OTHER language",
      "answer": "the answer, in the language named by \\"language\\"",
      "answer_translation": "the answer in the OTHER language"
    }
  ],
  "stories": [
    {
      "author": "author name, exactly as spelled in the roster above",
      "work": "title of the work the passage comes from",
      "year": "publication year, e.g. 1915",
      "language": "es" | "en",
      "excerpt": "2-3 paragraphs, each separated by a blank line (\\n\\n)",
      "note": "one sentence on why this passage is worth reading"
    }
  ]
}`;

export async function generateRiddlesAndStories(
  edition: string
): Promise<RiddlesPayload> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const today = melbourneDate();
  const { season, themes } = getSeasonalThemes(today);
  const roster = PUBLIC_DOMAIN_AUTHORS.map(
    (a) => `- ${a.name} (died ${a.died})`
  ).join("\n");

  const prompt = `Today is ${today} in Melbourne, Australia. This is the ${edition} edition.

You are writing the RIDDLES & STORIES section of a daily brief read by a Melbourne family: two parents and two teenagers (13-18). The family is bilingual — Spanish and English — and enjoys both.

Produce exactly 3 riddles and exactly 2 short story excerpts.

RIDDLES — rules:
- Current seasonal themes: ${themes.join(", ")}. Every riddle must draw on one of these.
- Remember Melbourne is in the southern hemisphere: October is ${season}, not autumn.
- Write at least ONE riddle originally in Spanish and at least ONE originally in English.
- Each riddle must be solvable by a 13-year-old, with a single unambiguous answer. No trick questions with multiple defensible answers.
- Provide a faithful translation of both the riddle and its answer in the other language. A translated riddle does not need to rhyme, but it must still make sense.
- Riddles must be your own original work, not well-known ones copied verbatim.

STORY EXCERPTS — rules:
- Choose 2 different authors from this roster. These are the ONLY authors permitted, because their work is in the public domain in Australia:
${roster}
- Pick ONE Spanish-language author and ONE English-language author.
- Quote the passage accurately. If you are not confident you can reproduce a passage word for word, choose a different work you do know well — never invent or paraphrase a passage and present it as a quotation.
- 2-3 paragraphs each, separated by a blank line. Choose a passage that stands on its own without the surrounding plot.
- Prefer a passage that speaks to the current season or themes where one fits naturally; do not force it.

Return ONLY a valid JSON object in this shape:
${PAYLOAD_SCHEMA}

STYLE RULES:
- Do not use any emoji.
- Use Australian English spelling in the English riddles and in every "note" (e.g. organise, colour, centre).
- Leave the story excerpts spelled exactly as the author wrote them.

No markdown, no code fences, no explanation. Only the JSON object.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Haiku API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const text: string = data.content?.[0]?.text ?? "";

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}") + 1;
  if (start === -1) throw new Error("No JSON object in Haiku response");

  const parsed = JSON.parse(text.slice(start, end)) as {
    riddles?: Riddle[];
    stories?: StoryExcerpt[];
  };

  const riddles = (parsed.riddles ?? []).map((r) => ({
    language: r.language === "es" ? ("es" as const) : ("en" as const),
    theme: cleanLine(r.theme),
    riddle: cleanBlock(r.riddle),
    translation: cleanBlock(r.translation),
    answer: cleanLine(r.answer),
    answer_translation: cleanLine(r.answer_translation),
  }));

  // Enforce the roster in code. A model that reaches for Borges or García
  // Márquez despite the prompt would otherwise put in-copyright text — most
  // likely fabricated — in front of the reader.
  const stories = (parsed.stories ?? [])
    .filter((s) => {
      if (isPublicDomainAuthor(s.author)) return true;
      console.warn(
        `[riddles] Dropped excerpt — "${s.author}" is not on the public-domain roster`
      );
      return false;
    })
    .map((s) => ({
      author: cleanLine(s.author),
      work: cleanLine(s.work),
      year: cleanLine(s.year),
      language: s.language === "es" ? ("es" as const) : ("en" as const),
      // Wording is passed through untouched — it is a quotation. Only emoji
      // and stray horizontal whitespace are removed; paragraph breaks stay.
      excerpt: cleanBlock(s.excerpt),
      note: cleanLine(s.note),
    }));

  if (riddles.length === 0 && stories.length === 0) {
    throw new Error("Haiku returned no usable riddles or stories");
  }

  return { season, themes, riddles, stories };
}
