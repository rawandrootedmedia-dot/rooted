import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projects = await prisma.project.findMany({
    where: { userId: session.id },
    include: {
      client: { select: { id: true, name: true } },
      _count: { select: { boards: true, shots: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, type, status, shootDate, brief, clientId } = await request.json();
  if (!title || !clientId) return NextResponse.json({ error: "Title and client required" }, { status: 400 });

  const project = await prisma.project.create({
    data: {
      title,
      type: type || "photo",
      status: status || "idea",
      shootDate: shootDate ? new Date(shootDate) : null,
      brief,
      clientId,
      userId: session.id,
      boards: {
        create: { title: "Mood Board" },
      },
    },
    include: {
      client: { select: { id: true, name: true } },
      boards: true,
    },
  });

  return NextResponse.json({ project });
}
