import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

const ALLOWED_EMAILS = ['tal.gurevich@gmail.com', 'moran.marmus@gmail.com']

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  ],
  pages: {
    signOut: '/'
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Only allow specific emails to sign in (case-insensitive)
      if (ALLOWED_EMAILS.includes(user.email?.toLowerCase())) {
        return true
      } else {
        // Deny access for non-allowed emails
        console.log(`Access denied for email: ${user.email}`)
        return false
      }
    },
    async redirect({ url, baseUrl }) {
      // Handle logout - if signing out, go to homepage
      if (url.includes('/signout') || url.includes('callbackUrl=%2F')) {
        return baseUrl + '/'
      }
      // Redirect to dashboard after successful sign in
      return baseUrl + '/dashboard'
    },
    async session({ session, token }) {
      return session
    },
    async jwt({ token, user }) {
      return token
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }