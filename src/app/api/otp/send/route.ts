// app/api/otp/send/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  // 1. Security Check
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Get the Access Token
  // (This assumes you are using OIDC. If using Credentials, you might need a different strategy 
  // or ensure your credentials provider fetches an OAuth token).
  const accessToken = session.user.accessToken;

  if (!accessToken) {
    return NextResponse.json({ error: "No access token available. Login with College ID." }, { status: 403 });
  }

  // 3. Call Drupal
  const DRUPAL_API = process.env.NEXT_PUBLIC_DRUPAL_DOMAIN || "https://drupal-college-cms.ddev.site";
  
  try {
    const res = await fetch(`${DRUPAL_API}/api/v1/auth/otp/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`, // Pass the token to Drupal
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      return NextResponse.json({ error: errorData.error || "Drupal failed to send OTP" }, { status: res.status });
    }

    return NextResponse.json({ message: "OTP Sent" });
  } catch (error) {
    console.error("OTP Send Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}