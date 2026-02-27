import { NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store/json-file-store";
import type { Template } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const template = (await request.json()) as Template;
    const created = await dataStore.addTemplate(template);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Failed to create template:", error);
    return NextResponse.json(
      { error: "Failed to create template." },
      { status: 500 }
    );
  }
}
