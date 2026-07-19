import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clients = await prisma.client.findMany({
    where: { userId: session.id },
    include: { _count: { select: { projects: true } } },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ clients });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, contactInfo, notes } = await request.json();
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const client = await prisma.client.create({
    data: { name, contactInfo, notes, userId: session.id },
  });

  return NextResponse.json({ client });
}
