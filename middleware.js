import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { isEmailApproved } from './lib/emailApproval'

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token
    
    // If user is authenticated, check if their email is approved
    if (token?.email) {
      // Always allow admin access
      if (token.email === 'tal.gurevich@gmail.com') {
        return NextResponse.next()
      }
      
      const approved = await isEmailApproved(token.email)
      
      if (!approved) {
        // Redirect to approval required page
        return NextResponse.redirect(new URL('/approval-required', req.url))
      }
    }
    
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
)

export const config = { 
  matcher: [
    '/dashboard/:path*',
    '/new/:path*',
    '/quotes/:path*',
    '/quote/:path*',
    '/catalog/:path*',
    '/health/:path*',
    '/diag/:path*',
    '/admin/:path*'
  ]
}