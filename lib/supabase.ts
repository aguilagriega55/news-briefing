import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseReady = !!supabaseUrl && !!supabaseKey;

// Guarded init: when env vars are missing, surface one readable diagnostic
// instead of crashing inside createClient or silently writing to a fake
// endpoint. We still return a placeholder-backed client so modules that import
// `supabase` directly (history pages, debate route) keep a non-null value; the
// `supabaseReady` guard blocks real reads/writes until the project is configured.
if (!supabaseReady) {
  const missing = [
    !supabaseUrl && "NEXT_PUBLIC_SUPABASE_URL",
    !supabaseKey && "SUPABASE_SERVICE_ROLE_KEY",
  ].filter(Boolean);
  console.error(
    `[supabase] Caching disabled — missing env var(s): ${missing.join(", ")}. ` +
      `Briefings will be fetched live and not persisted.`
  );
}

export const supabase = createClient(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseKey ?? "placeholder"
);

export interface Article {
  title: string;
  summary: string;
  source: string;
  url?: string;
  pubDate?: string;
  image_url?: string | null;
  sentiment?: "positive" | "negative" | "neutral";
  tag?: string;
  league?: string;
  competition?: string;
  bias?: "left" | "center-left" | "center" | "center-right" | "right";
  bias_label?: string;
  bias_reliability?: "high" | "mixed" | "low";
  story_type?: "news" | "opinion" | "analysis" | "feature";
  markdown?: string;
}

export type Edition = "morning" | "midday" | "evening" | "midnight";

export interface Briefing {
  id: string;
  section_id: string;
  edition: Edition;
  articles: Article[];
  fetched_at: string;
  date: string;
}

export async function getCachedBriefing(
  sectionId: string,
  edition: Edition
): Promise<Briefing | null> {
  if (!supabaseReady) return null;
  try {
    const today = new Date().toISOString().split("T")[0];
    const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from("briefings")
      .select("*")
      .eq("section_id", sectionId)
      .eq("edition", edition)
      .eq("date", today)
      .gte("fetched_at", fiveHoursAgo)
      .order("fetched_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;
    return data as Briefing;
  } catch (err) {
    console.warn(
      `[supabase] Cache read failed for ${sectionId}/${edition}: ${
        err instanceof Error ? err.message : String(err)
      }`
    );
    return null;
  }
}

export async function saveBriefing(
  sectionId: string,
  edition: Edition,
  articles: Article[]
): Promise<void> {
  if (!supabaseReady) return;
  try {
    await supabase.from("briefings").insert({
      section_id: sectionId,
      edition,
      articles,
    });
  } catch (err) {
    // Live fetch already succeeded — log but don't fail the request.
    console.warn(
      `[supabase] Failed to persist ${sectionId}/${edition}: ${
        err instanceof Error ? err.message : String(err)
      }`
    );
  }
}
