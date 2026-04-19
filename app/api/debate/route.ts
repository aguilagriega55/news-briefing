import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  generateDailyDebates,
  DebateTopic,
  getISOWeek,
} from "@/lib/debate-generator";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const week = getISOWeek();
  const year = new Date().getFullYear();

  try {
    // Check cache — weekly, keyed by week_number + year
    const { data: cached, error: cacheError } = await supabase
      .from("debates")
      .select("topics, week_number")
      .eq("week_number", week)
      .eq("year", year)
      .single();

    if (!cacheError && cached?.topics) {
      return NextResponse.json({
        topics: cached.topics as DebateTopic[],
        cached: true,
        week,
      });
    }

    // Generate 3 fresh topics
    console.log(`[debate] Week ${week}/${year} — generating 3 topics...`);
    const topics = await generateDailyDebates();
    console.log(`[debate] Generated ${topics.length} topics`);

    // Save to Supabase (upsert on week_number + year unique constraint)
    await supabase.from("debates").upsert(
      { week_number: week, year, topics },
      { onConflict: "week_number,year" }
    );

    return NextResponse.json({ topics, cached: false, week });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[debate] ERROR:", msg);
    return NextResponse.json(
      { error: "Failed to generate debate topics", detail: msg },
      { status: 500 }
    );
  }
}
