export type DebateTopic = {
  topic: string;
  category: string;
  difficulty: "Accessible" | "Intermediate" | "Advanced";
  background: {
    summary: string;
    context: string;
    timeline: string;
  };
  sides: {
    for: {
      label: string;
      points: string[];
    };
    against: {
      label: string;
      points: string[];
    };
  };
  impacts: {
    economic: string;
    social: string;
    political: string;
    generational: string;
  };
  debatable_points: string[];
  discussion_questions: string[];
  next_steps: string;
  balanced_sources: {
    left: string;
    center: string;
    right: string;
  };
};

// ISO week number (1–52)
export function getISOWeek(date: Date = new Date()): number {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

// Monday of the current ISO week (for cache key)
export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getUTCDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().split("T")[0];
}

export function getCategoryForWeek(week: number): string {
  const categories = [
    "Economy & Work",
    "Environment & Climate",
    "Sport & Society",
    "Politics & Democracy",
    "Health & Science",
    "Culture & Education",
    "Ethics & Justice",
  ];
  return categories[week % categories.length];
}

const TOPIC_SCHEMA = `{
  "topic": "Should [clear debatable statement]?",
  "category": "Economy & Work",
  "difficulty": "Accessible",
  "background": {
    "summary": "2-3 sentence plain English explanation",
    "context": "Why this matters RIGHT NOW in 2026",
    "timeline": "Brief history of how this issue developed"
  },
  "sides": {
    "for": {
      "label": "Yes, and here is why",
      "points": ["Point 1 (1-2 sentences)", "Point 2", "Point 3"]
    },
    "against": {
      "label": "No, and here is why",
      "points": ["Point 1 (1-2 sentences)", "Point 2", "Point 3"]
    }
  },
  "impacts": {
    "economic": "How this affects money and jobs",
    "social": "How this affects communities",
    "political": "How this affects government and policy",
    "generational": "Why this especially matters for teenagers"
  },
  "debatable_points": [
    "A nuanced middle-ground point",
    "A values question underlying the debate",
    "A factual uncertainty that complicates things",
    "A question about who should decide"
  ],
  "discussion_questions": [
    "A question to get teenagers thinking personally",
    "A question connecting to their daily life",
    "What would you do if you were in charge?",
    "What kind of world do you want to live in?"
  ],
  "next_steps": "What is actually happening and what decisions are coming.",
  "balanced_sources": {
    "left": "Name of reputable left-leaning source",
    "center": "Name of reputable center source",
    "right": "Name of reputable right-leaning source"
  }
}`;

export async function generateDailyDebates(): Promise<DebateTopic[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const today = new Date().toISOString().split("T")[0];
  const weekNum = getISOWeek();

  const prompt = `Today is ${today}. Week ${weekNum} of the year.

Generate exactly 3 debate topics for a Melbourne family with two teenagers (ages 13-18).

STRICT RULES:
- NEVER suggest AI, social media, or generic tech topics (boring and overused)
- Each topic must be tied to something REAL happening in 2026
- All 3 must be from DIFFERENT categories:
  Topic 1: Economy, Work, Cost of Living, or Housing
  Topic 2: Environment, Health, Science, or Climate
  Topic 3: Society, Culture, Sport, Ethics, or Justice
- Every topic must be genuinely debatable (no obvious answer)
- Written so a 13-year-old can understand and engage
- Relevant to Australian life where possible

Return ONLY a valid JSON array of exactly 3 objects.
Each object structure:
${TOPIC_SCHEMA}

No markdown, no code fences. Only the JSON array of 3 objects.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 6000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Haiku API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const text: string = data.content?.[0]?.text ?? "";
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]") + 1;
  if (start === -1) throw new Error("No JSON array in Haiku response");

  return JSON.parse(text.slice(start, end)) as DebateTopic[];
}
