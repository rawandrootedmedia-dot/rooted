import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const project = await prisma.project.findFirst({
    where: { id, userId: session.id },
    include: {
      client: { select: { id: true, name: true } },
      shots: { orderBy: { order: "asc" } },
      callSheets: { orderBy: { date: "asc" } },
    },
  });

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [boards, trashedBoards] = await Promise.all([
    prisma.board.findMany({
      where: { projectId: project.id, deletedAt: null },
      include: { _count: { select: { cards: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.board.findMany({
      where: { projectId: project.id, deletedAt: { not: null } },
      include: { _count: { select: { cards: true } } },
      orderBy: { deletedAt: "desc" },
    }),
  ]);

  return NextResponse.json({ project: { ...project, boards, trashedBoards } });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const data = await request.json();

  await prisma.project.updateMany({
    where: { id, userId: session.id },
    data,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.project.deleteMany({ where: { id, userId: session.id } });

  return NextResponse.json({ ok: true });
}
