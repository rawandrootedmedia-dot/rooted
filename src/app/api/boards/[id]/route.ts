import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const board = await prisma.board.findFirst({
    where: { id, project: { userId: session.id } },
    include: {
      cards: { orderBy: { zIndex: "asc" } },
      project: { select: { id: true, title: true, client: { select: { name: true } } } },
    },
  });

  if (!board) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ board });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const data = await request.json();

  await prisma.board.updateMany({
    where: { id, project: { userId: session.id } },
    data,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.board.updateMany({
    where: { id, project: { userId: session.id }, deletedAt: null },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.board.updateMany({
    where: { id, project: { userId: session.id }, deletedAt: { not: null } },
    data: { deletedAt: null },
  });

  return NextResponse.json({ ok: true });
}
