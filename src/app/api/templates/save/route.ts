import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { boardId, name, icon } = await request.json();

  if (!boardId || !name) {
    return NextResponse.json({ error: "boardId and name required" }, { status: 400 });
  }

  const board = await prisma.board.findFirst({
    where: { id: boardId, project: { userId: session.id } },
    include: { cards: true },
  });

  if (!board) {
    return NextResponse.json({ error: "Board not found" }, { status: 404 });
  }

  const templateCards = board.cards.map((card) => ({
    type: card.type,
    content: card.content,
    x: card.x,
    y: card.y,
    width: card.width,
    height: card.height,
  }));

  const template = await prisma.customTemplate.create({
    data: {
      name,
      icon: icon || "clipboard",
      cards: templateCards,
      userId: session.id,
    },
  });

  return NextResponse.json({ template });
}