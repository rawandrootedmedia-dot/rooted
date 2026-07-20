import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  const share = await prisma.boardShare.findUnique({
    where: { token: params.token },
    include: {
      board: {
        include: {
          cards: { orderBy: { zIndex: "asc" } },
          project: { include: { client: true } },
        },
      },
      reviews: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!share) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ share });
}
