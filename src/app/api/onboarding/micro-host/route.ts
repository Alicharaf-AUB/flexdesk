import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const token = (await cookies()).get("fd_session")?.value;
    const payload = token ? verifyToken<{ sub: string }>(token) : null;
    if (!payload?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { idVerified, addressVerified, acceptTerms, acceptLiability, acceptHouseRules } = body as {
      idVerified?: boolean;
      addressVerified?: boolean;
      acceptTerms?: boolean;
      acceptLiability?: boolean;
      acceptHouseRules?: boolean;
    };

    if (!acceptTerms || !acceptLiability || !acceptHouseRules) {
      return NextResponse.json({ error: "All legal acknowledgements are required" }, { status: 400 });
    }

    const now = new Date();
    const user = await prisma.user.update({
      where: { id: payload.sub },
      data: {
        role: "MICRO_HOST",
        accountType: "MICRO_HOST",
        idVerified: Boolean(idVerified),
        addressVerified: Boolean(addressVerified),
        acceptedTermsAt: now,
        acceptedLiabilityAt: now,
        acceptedHouseRulesAt: now,
      },
      select: {
        id: true,
        role: true,
        accountType: true,
        idVerified: true,
        addressVerified: true,
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
