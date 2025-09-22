import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { createClient } from '@supabase/supabase-js'

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  ],
  pages: {
    signOut: '/',
    signIn: '/auth/signin'
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow all users to sign in (no restrictions)
      return true
    },
    async redirect({ url, baseUrl }) {
      // Always redirect to homepage after signout
      if (url.startsWith(baseUrl + '/api/auth/signout') || url === baseUrl + '/' || url.includes('callbackUrl=%2F')) {
        return baseUrl + '/'
      }
      
      // Check if this is a first-time user by looking for their settings
      // Temporarily disabled to fix client/server issues
      // try {
      //   const supabase = createClient(
      //     process.env.NEXT_PUBLIC_SUPABASE_URL,
      //     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      //   )
      //   const { data: settings } = await supabase
      //     .from('settings')
      //     .select('id')
      //     .eq('tenant_id', user?.id)
      //     .limit(1)
      //     .maybeSingle()
      //   
      //   // If no settings found, redirect to settings page for first-time setup
      //   if (!settings) {
      //     return baseUrl + '/settings?first_time=true'
      //   }
      // } catch (error) {
      //   console.error('Error checking user settings:', error)
      // }
      
      // Redirect to dashboard for existing users
      return baseUrl + '/dashboard'
    },
    async session({ session, token }) {
      // Add user ID to session for tenant isolation
      if (token?.sub) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, user, account }) {
      // Store user ID in token for session access
      if (user) {
        token.sub = user.id
      }
      return token
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }