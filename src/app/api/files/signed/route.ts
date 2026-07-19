import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDownloadUrl } from "@/lib/s3";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (!key) {
    return NextResponse.json({ error: "key parameter required" }, { status: 400 });
  }

  try {
    const url = await getDownloadUrl(key, 3600);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Signed URL error:", error);
    return NextResponse.json({ error: "Failed to generate URL" }, { status: 500 });
  }
}
