import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, projectId } = await request.json();
  if (!title || !projectId) return NextResponse.json({ error: "Title and project required" }, { status: 400 });

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: session.id },
  });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const board = await prisma.board.create({
    data: { title, projectId },
  });

  return NextResponse.json({ board });
}
