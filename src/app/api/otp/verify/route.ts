// app/api/otp/verify/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { code } = await req.json();
  const accessToken = session.user.accessToken;

  // 1. Call Drupal to Verify
  const DRUPAL_API = process.env.NEXT_PUBLIC_DRUPAL_DOMAIN || "https://drupal-college-cms.ddev.site";

  try {
    const res = await fetch(`${DRUPAL_API}/api/v1/auth/otp/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ code }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    // 2. SUCCESS! 
    // We don't need to manually update the DB (Drupal did it).
    // But we DO need to return success so the frontend knows to unlock the session.
    return NextResponse.json({ message: "Verified" });
  } catch (error) {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}