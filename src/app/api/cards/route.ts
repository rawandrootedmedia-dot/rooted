import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { type, content, x, y, width, height, boardId } = await request.json();
  if (!type || !boardId) return NextResponse.json({ error: "Type and board required" }, { status: 400 });

  const board = await prisma.board.findFirst({
    where: { id: boardId, project: { userId: session.id } },
  });
  if (!board) return NextResponse.json({ error: "Board not found" }, { status: 404 });

  const maxZ = await prisma.card.findFirst({
    where: { boardId },
    orderBy: { zIndex: "desc" },
    select: { zIndex: true },
  });

  const card = await prisma.card.create({
    data: {
      type,
      content: content || {},
      x: x ?? 0,
      y: y ?? 0,
      width: width ?? 260,
      height: height ?? 200,
      zIndex: (maxZ?.zIndex ?? 0) + 1,
      boardId,
    },
  });

  return NextResponse.json({ card });
}
