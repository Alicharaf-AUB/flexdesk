import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const listingId = searchParams.get("listingId");
  if (!listingId) return NextResponse.json({ blackouts: [] });

  const blackouts = await prisma.blackoutDate.findMany({
    where: { listingId },
    orderBy: { date: "asc" },
  });
  return NextResponse.json({ blackouts });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { listingId, blackouts } = body as {
      listingId: string;
      blackouts: Array<{ date: string; startTime?: string; endTime?: string; reason?: string }>;
    };
    if (!listingId) return NextResponse.json({ error: "Listing required" }, { status: 400 });

    await prisma.blackoutDate.deleteMany({ where: { listingId } });
    if (blackouts?.length) {
      await prisma.blackoutDate.createMany({
        data: blackouts.map((b) => ({
          listingId,
          date: b.date,
          startTime: b.startTime || null,
          endTime: b.endTime || null,
          reason: b.reason || null,
        })),
      });
    }

    const saved = await prisma.blackoutDate.findMany({ where: { listingId } });
    return NextResponse.json({ blackouts: saved });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
