import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";
import { registerSchema } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { email, password, name, role, accountType, companyDomain } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const roleMap: Record<string, "CUSTOMER" | "CORPORATE_ADMIN" | "COWORKING_OPERATOR" | "MICRO_HOST" | "SUPER_ADMIN"> = {
      customer: "CUSTOMER",
      corporate_admin: "CORPORATE_ADMIN",
      coworking_operator: "COWORKING_OPERATOR",
      micro_host: "MICRO_HOST",
      super_admin: "SUPER_ADMIN",
    };
    const accountTypeMap: Record<string, "BOOKER" | "COWORKING_OPERATOR" | "MICRO_HOST" | "CORPORATE_ADMIN"> = {
      booker: "BOOKER",
      coworking_operator: "COWORKING_OPERATOR",
      micro_host: "MICRO_HOST",
      corporate_admin: "CORPORATE_ADMIN",
    };

    const resolvedAccountType = accountType ? accountTypeMap[accountType] : "BOOKER";
    const resolvedRole = role
      ? roleMap[role]
      : resolvedAccountType === "COWORKING_OPERATOR"
      ? "COWORKING_OPERATOR"
      : resolvedAccountType === "MICRO_HOST"
      ? "MICRO_HOST"
      : resolvedAccountType === "CORPORATE_ADMIN"
      ? "CORPORATE_ADMIN"
      : "CUSTOMER";

    if (resolvedAccountType === "CORPORATE_ADMIN" && !companyDomain) {
      return NextResponse.json({ error: "Company domain is required" }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: resolvedRole,
        accountType: resolvedAccountType,
        companyDomain: companyDomain || null,
      },
      select: { id: true, email: true, name: true, role: true, accountType: true, companyDomain: true },
    });

    const token = signToken({ sub: user.id, email: user.email });
    const res = NextResponse.json({ user });
    res.cookies.set("fd_session", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
