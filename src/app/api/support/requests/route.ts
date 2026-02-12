import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { supportRequestSchema } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = supportRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const token = (await cookies()).get("fd_session")?.value;
    const payload = token ? verifyToken<{ sub: string; email?: string }>(token) : null;

    const created = await prisma.supportRequest.create({
      data: {
        userId: payload?.sub || null,
        name: parsed.data.name,
        email: parsed.data.email || payload?.email || null,
        role: parsed.data.role || null,
        topic: parsed.data.topic,
        message: parsed.data.message,
      },
    });

    return NextResponse.json({ request: created }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  const token = (await cookies()).get("fd_session")?.value;
  const payload = token ? verifyToken<{ sub: string }>(token) : null;
  if (!payload?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const me = await prisma.user.findUnique({ where: { id: payload.sub }, select: { role: true } });
  if (!me || me.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const requests = await prisma.supportRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ requests });
}
