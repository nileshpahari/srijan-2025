import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJwtToken } from "./lib/auth";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath =
    path === "/login" ||
    path === "/signup" ||
    path === "/" ||
    path.startsWith("/api/");

  // Get the token from the cookies
  const token = request.cookies.get("token")?.value || "";

  // Verify the token
  const verifiedToken = token && (await verifyJwtToken(token));

  // Redirect logic
  if (isPublicPath && verifiedToken && !path.startsWith("/api/")) {
    // If user is logged in and tries to access public path, redirect to profile
    return NextResponse.redirect(new URL("/profile", request.url));
  }

  if (!isPublicPath && !verifiedToken && !path.startsWith("/api/")) {
    // If user is not logged in and tries to access protected path, redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    "/profile/:path*",
    "/chat/:path*",
    "/skillsync/:path*",
    "/login",
    "/signup",
    "/api/:path*",
  ],
  runtime: "nodejs", 
};
