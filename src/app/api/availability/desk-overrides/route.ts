import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const deskId = searchParams.get("deskId");
  if (!deskId) return NextResponse.json({ overrides: [] });

  const overrides = await prisma.deskAvailabilityOverride.findMany({
    where: { deskId },
    orderBy: { date: "asc" },
  });
  return NextResponse.json({ overrides });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { deskId, overrides } = body as {
      deskId: string;
      overrides: Array<{ date: string; startTime?: string; endTime?: string; available?: boolean }>;
    };
    if (!deskId) return NextResponse.json({ error: "Desk required" }, { status: 400 });

    await prisma.deskAvailabilityOverride.deleteMany({ where: { deskId } });
    if (overrides?.length) {
      await prisma.deskAvailabilityOverride.createMany({
        data: overrides.map((o) => ({
          deskId,
          date: o.date,
          startTime: o.startTime || null,
          endTime: o.endTime || null,
          available: o.available !== false,
        })),
      });
    }

    const saved = await prisma.deskAvailabilityOverride.findMany({ where: { deskId } });
    return NextResponse.json({ overrides: saved });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
