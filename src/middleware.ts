// middleware.ts
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Helper booleans for clarity
  const isAuth = !!token;
  const isVerified = !!token?.otpVerified; // The flag we set in auth.ts
  const isOtpPage = pathname === "/verify-phone";
  const isGuestPage = ["/login", "/signup"].includes(pathname);

  // 1. EXISTING LOGIC:
  // If user is logged in and trying to access login/signup pages,
  // redirect them to the home page.
  if (isAuth && isGuestPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 2. OTP ENFORCEMENT (THE JAIL):
  // If user is logged in but NOT verified, and they are NOT on the OTP page,
  // force them to the OTP page.
  if (isAuth && !isVerified && !isOtpPage) {
    return NextResponse.redirect(new URL("/verify-phone", req.url));
  }

  // 3. OTP CLEANUP:
  // If user is logged in AND verified, but they try to go back to the OTP page,
  // kick them back to the dashboard.
  if (isAuth && isVerified && isOtpPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  // CRITICAL UPDATE: 
  // The matcher must now include ALL routes (except api/static) 
  // so that we can intercept users on the Home page ('/') and check their OTP status.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};