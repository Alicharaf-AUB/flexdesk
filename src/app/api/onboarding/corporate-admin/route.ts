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
    const { companyDomain } = body as { companyDomain?: string };
    if (!companyDomain || companyDomain.length < 3) {
      return NextResponse.json({ error: "Company domain is required" }, { status: 400 });
    }

    const now = new Date();
    const user = await prisma.user.update({
      where: { id: payload.sub },
      data: {
        role: "CORPORATE_ADMIN",
        accountType: "CORPORATE_ADMIN",
        companyDomain,
        acceptedTermsAt: now,
      },
      select: {
        id: true,
        role: true,
        accountType: true,
        companyDomain: true,
        acceptedTermsAt: true,
      },
    });

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
