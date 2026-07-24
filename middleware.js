import { NextResponse } from 'next/server'

const AUTH_COOKIE_NAME = 'rahmania_session'

const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/mission',
  '/campus',
  '/academics',
  '/admission',
  '/admission-choice',
  '/admission-form',
  '/gallery',
  '/video-gallery',
  '/branch-gallery',
  '/teachers',
  '/results',
  '/facilities',
  '/notices',
  '/notice',
  '/faq',
  '/departments',
  '/branch',
  '/noorani-page',
  '/login',
  '/AdminLogin',
  '/TeacherLogin',
  '/StudentLogin',
  '/StudentProfile',
  '/TeacherProfile',
  '/TeacherDashboard',
]

const PUBLIC_API_ROUTES = [
  '/api/public',
  '/api/health',
  '/api/cron',
  '/api/uploads',
]

function isPublicRoute(pathname) {
  if (pathname === '/' || pathname === '') return true
  if (PUBLIC_API_ROUTES.some(route => pathname.startsWith(route))) return true
  if (PUBLIC_ROUTES.some(route => {
    if (route.endsWith('/')) return pathname.startsWith(route)
    return pathname === route || pathname.startsWith(route + '/')
  })) return true
  if (pathname.startsWith('/_next') || pathname.startsWith('/static') || pathname.startsWith('/api/auth/login') || pathname.startsWith('/api/auth/logout') || pathname.startsWith('/api/auth/refresh') || pathname.startsWith('/api/auth/session')) return true
  return false
}

function isAsset(pathname) {
  const assetExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico', '.css', '.js', '.json', '.woff', '.woff2']
  return assetExtensions.some(ext => pathname.endsWith(ext)) || pathname.startsWith('/fonts')
}

function hasAuthCookie(request) {
  return request.cookies.has(AUTH_COOKIE_NAME)
}

export async function middleware(request) {
  const { pathname } = request.nextUrl

  if (isAsset(pathname)) {
    return NextResponse.next()
  }

  const response = NextResponse.next()

  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()')
  response.headers.set('X-XSS-Protection', '0')

  if (isPublicRoute(pathname)) {
    return response
  }

  if (!hasAuthCookie(request)) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { ok: false, message: 'Authentication required' },
        { status: 401 }
      )
    }
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
