import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
  const token = (await cookies()).get("fd_session")?.value;
  const payload = token ? verifyToken<{ sub: string }>(token) : null;
  if (!payload?.sub) return NextResponse.json({ listings: [] });

  const listings = await prisma.listing.findMany({
    where: { ownerId: payload.sub },
  });

  const defaultPhoto = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=500&fit=crop";
  const safeParse = <T,>(value: string | null | undefined, fallback: T): T => {
    if (!value) return fallback;
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  };
  const parsed = listings.map((l) => {
    const photos = safeParse<string[]>(l.photos, []);
    return {
      ...l,
      photos: photos.length > 0 ? photos : [defaultPhoto],
      perks: safeParse<string[]>(l.perks || "[]", []),
      vibeTags: safeParse<string[]>(l.vibeTags || "[]", []),
      availability: safeParse<boolean[]>(l.availability || "[]", []),
      rules: safeParse<Array<{ icon: string; text: string }>>(l.rules || "[]", []),
      vibe: safeParse<{ quiet: number; bright: number; focus: number }>(l.vibe || "{}", { quiet: 0, bright: 0, focus: 0 }),
      allowedEmails: safeParse<string[]>(l.allowedEmails || "[]", []),
      houseRules: safeParse<string[]>(l.houseRules || "[]", []),
    };
  });

  return NextResponse.json({ listings: parsed });
}

export async function POST(req: Request) {
  try {
    const token = (await cookies()).get("fd_session")?.value;
    const payload = token ? verifyToken<{ sub: string }>(token) : null;
    if (!payload?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, address, pricePerHour } = body as { name: string; address: string; pricePerHour: number };
    if (!name || !address) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const listing = await prisma.listing.create({
      data: {
        ownerId: payload.sub,
        name,
        neighborhood: "Beirut",
        address,
        distance: "0.0 km",
        rating: 0,
        reviewCount: 0,
        pricePerHour: Number(pricePerHour) || 0,
        photos: JSON.stringify(["https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=500&fit=crop"]),
        perks: JSON.stringify([]),
        vibeTags: JSON.stringify([]),
        availability: JSON.stringify([]),
        lat: 33.8938,
        lng: 35.5018,
        description: "",
        rules: JSON.stringify([]),
        vibe: JSON.stringify({ quiet: 0, bright: 0, focus: 0 }),
        mode: "OPEN",
        isPublic: true,
        reviewsEnabled: true,
        requiresId: false,
        securityDepositCents: 0,
        cancellationPolicy: "flexible",
        houseRules: JSON.stringify([]),
      },
    });

    return NextResponse.json({ listing }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}