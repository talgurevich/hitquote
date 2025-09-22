import { createClient } from '@supabase/supabase-js'

const handler = async (req) => {
  // Create Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  
  try {
    // Query all products (RLS is now disabled)
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