import { NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store/json-file-store";
import type { Board } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = (await request.json()) as Partial<Board>;
    const updated = await dataStore.updateBoard(id, updates);

    if (!updated) {
      return NextResponse.json({ error: "Board not found." }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update board:", error);
    return NextResponse.json(
      { error: "Failed to update board." },
      { status: 500 }
    );
  }
}
