import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  const token = (await cookies()).get("fd_session")?.value;
  if (!token) return NextResponse.json({ user: null }, { status: 200 });

  const payload = verifyToken<{ sub: string }>(token);
  if (!payload?.sub) return NextResponse.json({ user: null }, { status: 200 });

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      accountType: true,
      companyDomain: true,
      idVerified: true,
      addressVerified: true,
      acceptedTermsAt: true,
      acceptedLiabilityAt: true,
      acceptedHouseRulesAt: true,
    },
  });

  return NextResponse.json({ user });
}
