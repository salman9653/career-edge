import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const session = request.cookies.get("session");

  // Add paths that require authentication
  // For now, we protect /dashboard
  const protectedPaths = ["/dashboard"];
  const isProtected = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  // Ported from proxy.ts: Redirect to dashboard if logged in
  const publicPaths = ["/login", '/signup'];
  const isPublicAuthRoute = publicPaths.some((path) => 
     request.nextUrl.pathname.startsWith(path)
  );

  if (isProtected && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  if (isPublicAuthRoute && session) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Check for role-based access if needed?
  // Ideally, we verify the session cookie content here, 
  // but verification requires Admin SDK (heavy) or a separate lightweight verifier.
  // Next.js Middleware runs on Edge, so standard firebase-admin might fail or be slow.
  // For now, we trust the presence of the httpOnly cookie for basic protection,
  // and perform actual data fetching verification in the Server Components/Server Actions.
  // OR we can call an API route to verify? No, that defeats the purpose of middleware speed.
  
  // We will assume if the cookie exists, it's valid enough to let them through to the Server Component,
  // which will do the hard verification and redirect if invalid.

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login, signup, etc (public pages)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|login|signup|forgot-password).*)",
  ],
};
