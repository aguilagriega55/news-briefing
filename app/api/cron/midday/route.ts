import { NextRequest } from "next/server";
import { run } from "../_shared";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  return run(request, "midday");
}
