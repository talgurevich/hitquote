import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { supabase } from '../../../../lib/supabaseClient'

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
      // Allow all users to sign in (no restrictions)
      return true
    },
    async redirect({ url, baseUrl }) {
      // Handle logout - if signing out, go to homepage
      if (url.includes('/signout') || url.includes('callbackUrl=%2F')) {
        return baseUrl + '/'
      }
      
      // Check if this is a first-time user by looking for their settings
      try {
        const { data: settings } = await supabase
          .from('settings')
          .select('id')
          .eq('tenant_id', user?.id)
          .limit(1)
          .maybeSingle()
        
        // If no settings found, redirect to settings page for first-time setup
        if (!settings) {
          return baseUrl + '/settings?first_time=true'
        }
      } catch (error) {
        console.error('Error checking user settings:', error)
      }
      
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
})

export { handler as GET, handler as POST }