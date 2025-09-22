import { getServerSession } from 'next-auth/next'
import { createClient } from '@supabase/supabase-js'
import { validateSessionAndGetBusinessUserId } from '../../../lib/businessUserUtils'
import { authOptions } from '../auth/[...nextauth]/route'

const handler = async (req) => {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  // Create Supabase client with anon key
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  
  try {
    // Get business user ID
    const businessUserId = await validateSessionAndGetBusinessUserId(session);
    console.log('Products API - Auth User ID:', session.user.id);
    console.log('Products API - Business User ID:', businessUserId);
    
    // Query products filtered by user_id
    const { data, error } = await supabase
      .from('product')
      .select('*')
      .eq('user_id', businessUserId)
      .order('category', { ascending: true })
      .order('name', { ascending: true })
    
    console.log('Products API - Query result:', { dataLength: data?.length || 0, error });
    
    if (error) throw error
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Products API Error:', error);
    return new Response(JSON.stringify({ error: error.message, stack: error.stack }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export { handler as GET }