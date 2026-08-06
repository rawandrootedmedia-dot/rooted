import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orderedIds } = await request.json();
  if (!Array.isArray(orderedIds)) return NextResponse.json({ error: "orderedIds required" }, { status: 400 });

  const updates = orderedIds.map((id: string, index: number) =>
    prisma.board.updateMany({
      where: { id, project: { userId: session.id } },
      data: { order: index },
    })
  );

  await Promise.all(updates);

  return NextResponse.json({ ok: true });
}
