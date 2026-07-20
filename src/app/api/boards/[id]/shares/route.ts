import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const board = await prisma.board.findFirst({
    where: { id: params.id, project: { userId: session.id } },
  });
  if (!board) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const shares = await prisma.boardShare.findMany({
    where: { boardId: params.id },
    include: { reviews: { orderBy: { createdAt: "desc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ shares });
}
