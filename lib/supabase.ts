import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder";

export const supabase = createClient(supabaseUrl, supabaseKey);

const supabaseReady =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.SUPABASE_SERVICE_ROLE_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co";

export interface Article {
  title: string;
  summary: string;
  source: string;
  url?: string;
  pubDate?: string;
  imageUrl?: string;
}

export interface Briefing {
  id: string;
  section_id: string;
  edition: "morning" | "evening";
  articles: Article[];
  fetched_at: string;
  date: string;
}

export async function getCachedBriefing(
  sectionId: string,
  edition: "morning" | "evening"
): Promise<Briefing | null> {
  if (!supabaseReady) return null;
  try {
    const today = new Date().toISOString().split("T")[0];
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from("briefings")
      .select("*")
      .eq("section_id", sectionId)
      .eq("edition", edition)
      .eq("date", today)
      .gte("fetched_at", sixHoursAgo)
      .order("fetched_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;
    return data as Briefing;
  } catch {
    return null;
  }
}

export async function saveBriefing(
  sectionId: string,
  edition: "morning" | "evening",
  articles: Article[]
): Promise<void> {
  if (!supabaseReady) return;
  try {
    await supabase.from("briefings").insert({
      section_id: sectionId,
      edition,
      articles,
    });
  } catch {
    // Silently fail — live fetch already succeeded
  }
}
