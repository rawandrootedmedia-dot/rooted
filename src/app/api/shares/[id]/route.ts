import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const share = await prisma.boardShare.findFirst({
    where: { id: params.id, board: { project: { userId: session.id } } },
  });
  if (!share) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.boardReview.deleteMany({ where: { shareId: share.id } });
  await prisma.boardShare.delete({ where: { id: share.id } });

  return NextResponse.json({ ok: true });
}
