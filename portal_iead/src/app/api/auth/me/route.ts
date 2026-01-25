import { NextRequest, NextResponse } from "next/server";
import { getSessionUserByToken } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const user = await getSessionUserByToken(token);
  return NextResponse.json({ user });
}
