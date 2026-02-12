import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function POST() {
  try {
    const token = (await cookies()).get("fd_session")?.value;
    const payload = token ? verifyToken<{ sub: string }>(token) : null;
    if (!payload?.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const user = await prisma.user.update({
      where: { id: payload.sub },
      data: {
        acceptedTermsAt: now,
        acceptedLiabilityAt: now,
        acceptedHouseRulesAt: now,
      },
      select: {
        id: true,
        acceptedTermsAt: true,
        acceptedLiabilityAt: true,
        acceptedHouseRulesAt: true,
      },
    });

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
