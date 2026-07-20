import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import crypto from "crypto";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const board = await prisma.board.findFirst({
    where: { id: params.id, project: { userId: session.id } },
  });
  if (!board) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { clientName, clientEmail } = await request.json();

  const token = crypto.randomBytes(32).toString("hex");

  const share = await prisma.boardShare.create({
    data: {
      token,
      boardId: params.id,
      clientName: clientName || null,
      clientEmail: clientEmail || null,
    },
  });

  return NextResponse.json({ share });
}
