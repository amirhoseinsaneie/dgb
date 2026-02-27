import { NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store/mongodb-store";
import type { Decision } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const decision = (await request.json()) as Decision;
    const created = await dataStore.addDecision(decision);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Failed to create decision:", error);
    return NextResponse.json(
      { error: "Failed to create decision." },
      { status: 500 }
    );
  }
}
