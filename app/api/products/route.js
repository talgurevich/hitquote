import { getServerSession } from 'next-auth/next'
import { createClient } from '@supabase/supabase-js'
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (token?.sub) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = async (req) => {
  // Skip authentication since RLS is disabled and we want to show all products
  // const session = await getServerSession(authOptions)
  
  // if (!session) {
  //   return new Response(JSON.stringify({ error: 'Unauthorized' }), {
  //     status: 401,
  //     headers: { 'Content-Type': 'application/json' }
  //   })
  // }
  
  // Create Supabase client with anon key and manually set the user context
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  
  try {
    // Query all products since RLS is disabled and authentication is skipped
    const { data, error } = await supabase
      .from('product')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true })
    
    if (error) throw error
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export { handler as GET }