import { NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store/json-file-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const state = await dataStore.getState();
    return NextResponse.json(state);
  } catch (error) {
    console.error("Failed to read JSON datastore:", error);
    return NextResponse.json(
      { error: "Failed to read datastore." },
      { status: 500 }
    );
  }
}
