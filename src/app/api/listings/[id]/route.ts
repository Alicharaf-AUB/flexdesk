import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params?.id || new URL(req.url).pathname.split("/").pop() || "";
    if (!id) {
      return NextResponse.json({ error: "Missing listing id" }, { status: 400 });
    }
    const listing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const safeParse = <T,>(value: string | null | undefined, fallback: T): T => {
      if (!value) return fallback;
      try {
        return JSON.parse(value) as T;
      } catch {
        return fallback;
      }
    };

    const defaultPhoto = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=500&fit=crop";
    const photos = safeParse<string[]>(listing.photos, []);
    const parsed = {
      ...listing,
      photos: photos.length > 0 ? photos : [defaultPhoto],
      perks: safeParse<string[]>(listing.perks, []),
      vibeTags: safeParse<string[]>(listing.vibeTags, []),
      availability: safeParse<boolean[]>(listing.availability, []),
      rules: safeParse<Array<{ icon: string; text: string }>>(listing.rules, []),
      vibe: safeParse<{ quiet: number; bright: number; focus: number }>(listing.vibe, { quiet: 0, bright: 0, focus: 0 }),
      houseRules: safeParse<string[]>(listing.houseRules, []),
      allowedEmails: safeParse<string[]>(listing.allowedEmails, []),
    };
    return NextResponse.json({ listing: parsed });
  } catch (err) {
    console.error("Listing detail error", err);
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: process.env.NODE_ENV === "production" ? "Server error" : message }, { status: 500 });
  }
}
