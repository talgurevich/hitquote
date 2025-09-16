import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

const ALLOWED_EMAILS = ['tal.gurevich@gmail.com', 'Moran.marmus@gmail.com']

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Only allow specific emails to sign in
      if (ALLOWED_EMAILS.includes(user.email)) {
        return true
      } else {
        // Deny access for non-allowed emails
        return false
      }
    },
    async redirect({ url, baseUrl }) {
      // Redirect to home page after successful sign in
      return baseUrl
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