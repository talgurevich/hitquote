export { default } from 'next-auth/middleware'

export const config = { 
  matcher: [
    '/dashboard/:path*',
    '/new/:path*',
    '/quotes/:path*',
    '/quote/:path*',
    '/catalog/:path*',
    '/health/:path*',
    '/diag/:path*'
  ]
}