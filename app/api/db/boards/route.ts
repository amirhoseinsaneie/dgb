import { NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store/mongodb-store";
import type { Board } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const board = (await request.json()) as Board;
    const created = await dataStore.addBoard(board);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Failed to create board:", error);
    return NextResponse.json(
      { error: "Failed to create board." },
      { status: 500 }
    );
  }
}
