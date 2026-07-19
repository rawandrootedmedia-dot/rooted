import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { TEMPLATES } from "@/lib/templates";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const templates = TEMPLATES.map(({ id, name, description, icon }) => ({
    id, name, description, icon, cardCount: 0,
  }));

  return NextResponse.json({ templates });
}
