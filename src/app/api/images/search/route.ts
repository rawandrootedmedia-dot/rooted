import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY;

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!UNSPLASH_KEY) {
    return NextResponse.json({ error: "Unsplash API key not configured. Set UNSPLASH_ACCESS_KEY in your environment." }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const page = searchParams.get("page") || "1";
  const perPage = searchParams.get("per_page") || "20";

  if (!query) return NextResponse.json({ error: "Query required" }, { status: 400 });

  const res = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&orientation=landscape`,
    { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } }
  );

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: `Unsplash API error: ${res.status}`, detail: err }, { status: 502 });
  }

  const data = await res.json();
  const images = data.results.map((img: any) => ({
    id: img.id,
    url: img.urls.regular,
    thumb: img.urls.thumb,
    small: img.urls.small,
    width: img.width,
    height: img.height,
    alt: img.alt_description || img.description || "",
    author: img.user?.name || "",
    authorUrl: img.user?.links?.html || "",
    downloadUrl: img.links?.download_location || "",
  }));

  return NextResponse.json({ images, total: data.total, totalPages: data.total_pages });
}
