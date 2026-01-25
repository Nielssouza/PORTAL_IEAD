import { NextRequest, NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  await clearSession(token);

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: "auth_token",
    value: "",
    expires: new Date(0),
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}
