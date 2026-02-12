import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const listingId = searchParams.get("listingId");
  if (!listingId) return NextResponse.json({ windows: [] });

  const windows = await prisma.availabilityWindow.findMany({
    where: { listingId },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });
  return NextResponse.json({ windows });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { listingId, windows } = body as {
      listingId: string;
      windows: Array<{ dayOfWeek: number; startTime: string; endTime: string; timezone?: string; isAllDay?: boolean; appliesToAllDesks?: boolean }>;
    };
    if (!listingId) return NextResponse.json({ error: "Listing required" }, { status: 400 });

    await prisma.availabilityWindow.deleteMany({ where: { listingId } });
    if (windows?.length) {
      await prisma.availabilityWindow.createMany({
        data: windows.map((w) => ({
          listingId,
          dayOfWeek: w.dayOfWeek,
          startTime: w.startTime,
          endTime: w.endTime,
          timezone: w.timezone || "UTC",
          isAllDay: Boolean(w.isAllDay),
          appliesToAllDesks: w.appliesToAllDesks !== false,
        })),
      });
    }

    const saved = await prisma.availabilityWindow.findMany({ where: { listingId } });
    return NextResponse.json({ windows: saved });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
