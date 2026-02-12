import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bookingSchema } from "@/lib/validation";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

const parseDate = (value: string) => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  if (value.toLowerCase() === "today") {
    const now = new Date();
    return now.toISOString().slice(0, 10);
  }
  return null;
};

const parseTimeToMinutes = (value: string) => {
  const hm = value.match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/i);
  if (!hm) return null;
  let hours = Number(hm[1]);
  const minutes = Number(hm[2]);
  const meridian = hm[3]?.toLowerCase();
  if (meridian) {
    if (meridian === "pm" && hours < 12) hours += 12;
    if (meridian === "am" && hours === 12) hours = 0;
  }
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
};

const parseDurationToMinutes = (value: string) => {
  const h = value.match(/(\d+)\s*h/i);
  const m = value.match(/(\d+)\s*m/i);
  const total = (h ? Number(h[1]) * 60 : 0) + (m ? Number(m[1]) : 0);
  return total > 0 ? total : null;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const listingId = searchParams.get("listingId");
  const token = (await cookies()).get("fd_session")?.value;
  const payload = token ? verifyToken<{ sub: string }>(token) : null;

  const bookings = await prisma.booking.findMany({
    where: listingId
      ? { listingId }
      : payload?.sub
      ? { userId: payload.sub }
      : undefined,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ bookings });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = bookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const token = (await cookies()).get("fd_session")?.value;
    const payload = token ? verifyToken<{ sub: string; email?: string }>(token) : null;
    if (!payload?.sub) {
      return NextResponse.json({ error: "Login required" }, { status: 401 });
    }

    const listing = await prisma.listing.findUnique({ where: { id: parsed.data.listingId } });
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (listing.requiresId && !user?.idVerified) {
      return NextResponse.json({ error: "ID verification required for this booking" }, { status: 403 });
    }

    if (listing.mode === "MICRO_HOST") {
      if (!user?.acceptedTermsAt || !user?.acceptedLiabilityAt) {
        return NextResponse.json({ error: "Please accept the house rules and liability terms" }, { status: 400 });
      }
    }

    const allowedEmails = JSON.parse(listing.allowedEmails || "[]") as string[];
    if (allowedEmails.length > 0) {
      if (!payload?.email) {
        return NextResponse.json({ error: "Login required" }, { status: 401 });
      }
      const allowed = allowedEmails.map((e) => e.toLowerCase()).includes(payload.email.toLowerCase());
      if (!allowed) {
        return NextResponse.json({ error: "You are not approved for this workspace" }, { status: 403 });
      }
    }

    const bookingDate = parseDate(parsed.data.date);
    const bookingStart = parseTimeToMinutes(parsed.data.time);
    const durationMinutes = parseDurationToMinutes(parsed.data.duration);
    if (bookingDate && bookingStart !== null && durationMinutes) {
      const dayOfWeek = new Date(`${bookingDate}T00:00:00`).getDay();
      const bookingEnd = bookingStart + durationMinutes;
      const windows = await prisma.availabilityWindow.findMany({ where: { listingId: listing.id } });
      if (windows.length > 0) {
        const matchesWindow = windows.some((w: typeof windows[number]) => {
          if (w.dayOfWeek !== dayOfWeek) return false;
          if (w.isAllDay) return true;
          const start = parseTimeToMinutes(w.startTime);
          const end = parseTimeToMinutes(w.endTime);
          if (start === null || end === null) return false;
          return bookingStart >= start && bookingEnd <= end;
        });
        if (!matchesWindow) {
          return NextResponse.json({ error: "Requested time is outside availability windows" }, { status: 400 });
        }
      }

      const blackouts = await prisma.blackoutDate.findMany({ where: { listingId: listing.id } });
      const blocked = blackouts.some((b: typeof blackouts[number]) => {
        if (b.date !== bookingDate) return false;
        if (!b.startTime || !b.endTime) return true;
        const start = parseTimeToMinutes(b.startTime);
        const end = parseTimeToMinutes(b.endTime);
        if (start === null || end === null) return true;
        return bookingStart < end && bookingEnd > start;
      });
      if (blocked) {
        return NextResponse.json({ error: "Selected time is blocked" }, { status: 400 });
      }

      const override = await prisma.deskAvailabilityOverride.findFirst({
        where: { desk: { label: parsed.data.deskLabel }, date: bookingDate },
      });
      if (override && override.available === false) {
        return NextResponse.json({ error: "Selected desk is not available" }, { status: 400 });
      }
    }

    const booking = await prisma.booking.create({
      data: {
        ...parsed.data,
        totalPrice: listing.paidEnabled ? parsed.data.totalPrice : 0,
        status: listing.requiresApproval ? "pending" : "upcoming",
        checkInCode: `FD-${Math.floor(1000 + Math.random() * 9000)}`,
        userId: payload?.sub,
      },
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
