import { NextResponse, type NextRequest } from 'next/server';

const protectedRoutes = [
  '/dashboard',
  '/learn',
  '/my-courses',
  '/my-artworks',
  '/my-orders',
  '/cart',
  '/checkout',
  '/profile',
  '/settings',
  '/create',
  '/notifications',
];

const teacherRoutes = ['/teacher'];

const adminRoutes = ['/admin'];

const authRoutes = ['/login', '/register', '/forgot-password'];

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('accessToken')?.value;

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  const isTeacherRoute = teacherRoutes.some((route) => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  const isAuth = authRoutes.some((route) => pathname.startsWith(route));

  // Redirect unauthenticated users to login
  if ((isProtected || isTeacherRoute || isAdminRoute) && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages
  if (isAuth && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images/).*)',
  ],
};
