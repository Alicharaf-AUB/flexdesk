import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const token = (await cookies()).get("fd_session")?.value;
    const payload = token ? verifyToken<{ sub: string }>(token) : null;
    if (!payload?.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const { listingId, name, floors, requiresApproval, paidEnabled, allowedEmails, mode, isPublic, reviewsEnabled, requiresId, securityDepositCents, cancellationPolicy, houseRules, photos } = body as {
      listingId: string;
      name: string;
      requiresApproval?: boolean;
      paidEnabled?: boolean;
      allowedEmails?: string[];
      mode?: "CLOSED" | "OPEN" | "MICRO_HOST";
      isPublic?: boolean;
      reviewsEnabled?: boolean;
      requiresId?: boolean;
      securityDepositCents?: number;
      cancellationPolicy?: string;
      houseRules?: string[];
      photos?: string[];
      floors: Array<{
        name: string;
        sortOrder: number;
        desks: Array<{ label: string; zone: string; perks: string[]; x: number; y: number; width: number; height: number; rotation?: number; available: boolean; whyLike?: string; kind?: string }>;
        zones: Array<{ type: string; name: string; x: number; y: number; width: number; height: number; rotation?: number }>
        amenities: Array<{ type: string; icon: string; x: number; y: number; rotation?: number; name?: string }>
      }>;
    };

    const photosProvided = Array.isArray(photos);
    const sanitizedPhotos = photosProvided
      ? photos
          .filter((photo) => typeof photo === "string" && photo.trim().length > 0)
          .map((photo) => photo.trim())
          .slice(0, 5)
      : [];

    if (!listingId || !name) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }
    if (listing.ownerId && listing.ownerId !== payload.sub) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const existing = await prisma.workspace.findFirst({ where: { listingId } });
    if (existing) {
      await prisma.amenity.deleteMany({ where: { floor: { workspaceId: existing.id } } });
      await prisma.zone.deleteMany({ where: { floor: { workspaceId: existing.id } } });
      await prisma.desk.deleteMany({ where: { floor: { workspaceId: existing.id } } });
      await prisma.floor.deleteMany({ where: { workspaceId: existing.id } });
    }

    const workspace = await prisma.workspace.upsert({
      where: { listingId },
      create: {
        listingId,
        name,
        floors: {
          create: floors.map((f) => ({
            name: f.name,
            sortOrder: f.sortOrder,
            desks: { create: f.desks.map((d) => ({ ...d, rotation: d.rotation ?? 0, kind: d.kind || "desk", perks: JSON.stringify(d.perks || []) })) },
            zones: { create: f.zones.map((z) => ({ ...z, rotation: z.rotation ?? 0 })) },
            amenities: { create: f.amenities.map((a) => ({ ...a, rotation: a.rotation ?? 0 })) },
          })),
        },
      },
      update: {
        name,
        floors: {
          create: floors.map((f) => ({
            name: f.name,
            sortOrder: f.sortOrder,
            desks: { create: f.desks.map((d) => ({ ...d, rotation: d.rotation ?? 0, kind: d.kind || "desk", perks: JSON.stringify(d.perks || []) })) },
            zones: { create: f.zones.map((z) => ({ ...z, rotation: z.rotation ?? 0 })) },
            amenities: { create: f.amenities.map((a) => ({ ...a, rotation: a.rotation ?? 0 })) },
          })),
        },
      },
      include: {
        floors: { include: { desks: true, zones: true, amenities: true } },
      },
    });

    await prisma.listing.update({
      where: { id: listingId },
      data: {
        requiresApproval: Boolean(requiresApproval),
        paidEnabled: paidEnabled !== false,
        allowedEmails: JSON.stringify(allowedEmails || []),
        mode: mode || "OPEN",
        isPublic: mode === "CLOSED" ? false : isPublic !== false,
        reviewsEnabled: reviewsEnabled !== false,
        requiresId: Boolean(requiresId),
        securityDepositCents: Number(securityDepositCents || 0),
        cancellationPolicy: cancellationPolicy || "flexible",
        houseRules: JSON.stringify(houseRules || []),
        ...(photosProvided ? { photos: JSON.stringify(sanitizedPhotos) } : {}),
      },
    });

    return NextResponse.json({ workspace });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
