import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const listings = await prisma.listing.findMany({
    where: { isPublic: true },
    select: {
      id: true,
      name: true,
      neighborhood: true,
      address: true,
      distance: true,
      rating: true,
      reviewCount: true,
      pricePerHour: true,
      photos: true,
      perks: true,
      vibeTags: true,
      availability: true,
      lat: true,
      lng: true,
      description: true,
      rules: true,
      vibe: true,
      mode: true,
      isPublic: true,
      reviewsEnabled: true,
      requiresId: true,
      securityDepositCents: true,
      cancellationPolicy: true,
      houseRules: true,
      requiresApproval: true,
      paidEnabled: true,
      allowedEmails: true,
    },
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
      perks: safeParse<string[]>(l.perks, []),
      vibeTags: safeParse<string[]>(l.vibeTags, []),
      availability: safeParse<boolean[]>(l.availability, []),
      rules: safeParse<Array<{ icon: string; text: string }>>(l.rules, []),
      vibe: safeParse<{ quiet: number; bright: number; focus: number }>(l.vibe, { quiet: 0, bright: 0, focus: 0 }),
      houseRules: safeParse<string[]>(l.houseRules || "[]", []),
      allowedEmails: safeParse<string[]>(l.allowedEmails || "[]", []),
    };
  });
  return NextResponse.json({ listings: parsed });
}
