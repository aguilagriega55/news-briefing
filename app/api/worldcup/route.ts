import { NextResponse } from "next/server";
import { getWorldCupData } from "@/lib/worldcup-data";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET() {
  try {
    const data = await getWorldCupData();
    return NextResponse.json(data);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[worldcup] ERROR:", msg);
    return NextResponse.json(
      { error: "Failed to load World Cup data", detail: msg },
      { status: 500 }
    );
  }
}
