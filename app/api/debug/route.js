import { createClient } from '@supabase/supabase-js'

const handler = async (req) => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  
  try {
    // Check if the product table exists and has any data
    const { data: allData, error: allError } = await supabase
      .from('product')
      .select('*')
    
    // Also check user table
    const { data: userData, error: userError } = await supabase
      .from('auth.users')
      .select('id, email')
      .limit(5)
    
    // Check tables that exist
    const { data: tables, error: tablesError } = await supabase
      .rpc('', {})
      .then(() => null)
      .catch(() => null)
    
    return new Response(JSON.stringify({
      product_table: {
        data: allData,
        error: allError?.message,
        count: allData?.length || 0
      },
      users: {
        data: userData,
        error: userError?.message,
        count: userData?.length || 0
      },
      supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export { handler as GET }