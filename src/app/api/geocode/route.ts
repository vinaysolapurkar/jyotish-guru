import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const place = req.nextUrl.searchParams.get("place");

  if (!place || place.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json&limit=5&addressdetails=1`,
      {
        headers: {
          "User-Agent": "JyotishGuru-App/1.0",
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ results: [] });
    }

    const data = await res.json();

    const results = data.map((item: { display_name: string; lat: string; lon: string }) => ({
      name: item.display_name,
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
    }));

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
