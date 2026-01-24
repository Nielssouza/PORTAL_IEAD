import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const token = request.cookies.get("auth_token")?.value;
  clearSession(token);

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: "auth_token",
    value: "",
    expires: new Date(0),
    path: "/",
  });
  return response;
}
