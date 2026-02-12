import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { status } = body as { status: string };
    if (!status) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

    const booking = await prisma.booking.update({
      where: { id: params.id },
      data: { status },
    });

    return NextResponse.json({ booking });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
