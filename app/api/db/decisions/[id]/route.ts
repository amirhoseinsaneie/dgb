import { NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store/mongodb-store";
import type { Decision } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = (await request.json()) as Partial<Decision>;
    const updated = await dataStore.updateDecision(id, updates);

    if (!updated) {
      return NextResponse.json(
        { error: "Decision not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update decision:", error);
    return NextResponse.json(
      { error: "Failed to update decision." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await dataStore.deleteDecision(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Decision not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete decision:", error);
    return NextResponse.json(
      { error: "Failed to delete decision." },
      { status: 500 }
    );
  }
}
