import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";

const randomPassword = () => `github-${Math.random().toString(36).slice(2)}${Date.now()}`;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const origin = url.origin;

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const redirectUri = process.env.GITHUB_REDIRECT_URI || `${origin}/api/auth/github/callback`;

  if (!code || !state || !clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/login?error=github_invalid", origin));
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get("fd_oauth_state")?.value;
  if (!savedState || savedState !== state) {
    return NextResponse.redirect(new URL("/login?error=github_state", origin));
  }

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      state,
    }),
  });

  const tokenData = (await tokenRes.json()) as { access_token?: string };
  const accessToken = tokenData.access_token;
  if (!accessToken) {
    return NextResponse.redirect(new URL("/login?error=github_token", origin));
  }

  const userRes = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const userData = (await userRes.json()) as { login?: string; name?: string | null; email?: string | null };

  const emailsRes = await fetch("https://api.github.com/user/emails", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const emailsData = (await emailsRes.json()) as Array<{ email: string; primary: boolean; verified: boolean }>;

  const emailFromList = emailsData.find((e) => e.primary && e.verified)?.email
    || emailsData.find((e) => e.verified)?.email
    || emailsData[0]?.email;
  const email = userData.email || emailFromList;

  if (!email) {
    return NextResponse.redirect(new URL("/login?error=github_email", origin));
  }

  const name = userData.name || userData.login || "GitHub User";

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const passwordHash = await hashPassword(randomPassword());
    user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: "CUSTOMER",
        accountType: "BOOKER",
      },
    });
  }

  const token = signToken({ sub: user.id, email: user.email });
  const res = NextResponse.redirect(new URL("/", origin));
  res.cookies.set("fd_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  res.cookies.set("fd_oauth_state", "", { path: "/", maxAge: 0 });
  return res;
}
