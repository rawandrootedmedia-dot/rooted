import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { token: string } }
) {
  const share = await prisma.boardShare.findUnique({
    where: { token: params.token },
  });
  if (!share) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { action, comment } = await request.json();

  if (!["approved", "rejected"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const review = await prisma.boardReview.create({
    data: {
      shareId: share.id,
      action,
      comment: comment || null,
    },
  });

  await prisma.boardShare.update({
    where: { id: share.id },
    data: { status: action },
  });

  return NextResponse.json({ review });
}
