import { NextResponse } from "next/server";
import { getSessionUserByToken } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const token = request.cookies.get("auth_token")?.value;
  const user = getSessionUserByToken(token);
  return NextResponse.json({ user });
}
