import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { listingId: string } }
) {
  const { listingId } = params;
  const workspace = await prisma.workspace.findFirst({
    where: { listingId },
    include: {
      floors: {
        orderBy: { sortOrder: "asc" },
        include: { desks: true, zones: true, amenities: true },
      },
    },
  });

  if (!workspace) {
    return NextResponse.json({ workspace: null }, { status: 200 });
  }

  const parsed = {
    ...workspace,
    floors: workspace.floors.map((f) => ({
      ...f,
      desks: f.desks.map((d) => ({
        ...d,
        perks: JSON.parse(d.perks),
      })),
      amenities: f.amenities.map((a) => ({
        ...a,
        name: a.name || null,
      })),
    })),
  };

  return NextResponse.json({ workspace: parsed });
}
