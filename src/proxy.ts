
import {NextRequest, NextResponse} from 'next/server';

interface UserSession {
  uid: string;
  email: string;
  displayName: string;
  role: 'candidate' | 'company' | 'admin';
  displayImageUrl?: string | null;
}

const PROTECTED_ROUTES = ['/dashboard'];
const PUBLIC_ROUTES = ['/login', '/signup', '/', '/candidates', '/companies'];

// This is a simplified auth check. In a real app, you would
// use a server-side library to verify a session cookie or token.
async function getSession(req: NextRequest): Promise<UserSession | null> {
  const session = req.cookies.get('firebase-session');
  if (!session) {
    return null;
  }
  // In a real app, you would verify the session token with Firebase Admin SDK.
  // For this prototype, we'll assume the presence of the cookie means authenticated.
  // And we'll decode the user from the cookie value.
  try {
    const user = JSON.parse(atob(session.value));
    return user as UserSession;
  } catch (e) {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const {pathname} = req.nextUrl;
  const session = await getSession(req);

  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // DEPRECATED: /company is no longer a valid path prefix, it has been moved to /dashboard/company
  if (pathname.startsWith('/company')) {
    const newPath = pathname.replace('/company', '/dashboard/company');
    req.nextUrl.pathname = newPath;
    return NextResponse.redirect(req.nextUrl);
  }

  if (isProtectedRoute && !session) {
    req.nextUrl.pathname = '/login';
    return NextResponse.redirect(req.nextUrl);
  }

  if (session) {
    // If user is logged in, redirect from auth or landing pages to dashboard
    if (PUBLIC_ROUTES.includes(pathname) || pathname.startsWith('/signup')) {
      req.nextUrl.pathname = '/dashboard';
      return NextResponse.redirect(req.nextUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
