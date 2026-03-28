import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const mobile = request.cookies.get('mobile')?.value;
  const { pathname } = request.nextUrl;

  const publicRoutes = ['/login'];
  const isPublicRoute = publicRoutes.includes(pathname);

  if (!mobile && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set(
      'redirect',
      request.nextUrl.pathname + request.nextUrl.search
    );
    const response = NextResponse.redirect(loginUrl);

    request.cookies.getAll().forEach((cookie) => {
      response.cookies.delete(cookie.name);
    });

    return response;
  }

  if (mobile && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/no-permission',
    '/dashboard/:path*',
    '/nomination_form/:path*',
    '/view_status/:path*',
  ],
};
