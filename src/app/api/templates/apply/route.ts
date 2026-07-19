import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { TEMPLATES } from "@/lib/templates";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { boardId, templateId } = await request.json();

  if (!boardId || !templateId) {
    return NextResponse.json({ error: "boardId and templateId required" }, { status: 400 });
  }

  const board = await prisma.board.findFirst({
    where: { id: boardId, project: { userId: session.id } },
    include: { project: true },
  });

  if (!board) {
    return NextResponse.json({ error: "Board not found" }, { status: 404 });
  }

  const template = TEMPLATES.find((t) => t.id === templateId);
  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  const maxZ = await prisma.card.findFirst({
    where: { boardId },
    orderBy: { zIndex: "desc" },
    select: { zIndex: true },
  });

  let zOffset = (maxZ?.zIndex ?? 0) + 1;

  const cards = await Promise.all(
    template.cards.map((tc) =>
      prisma.card.create({
        data: {
          type: tc.type,
          content: tc.content,
          x: tc.x,
          y: tc.y,
          width: tc.width,
          height: tc.height,
          zIndex: zOffset++,
          boardId,
        },
      })
    )
  );

  return NextResponse.json({ cards });
}
