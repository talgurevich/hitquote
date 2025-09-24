import { getServerSession } from 'next-auth/next'
import { createClient } from '@supabase/supabase-js'
import { authOptions } from '../auth/[...nextauth]/route'

export async function GET(req) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  
  try {
    // Get all business users for this email
    const { data: usersByEmail, error: emailError } = await supabase
      .from('users')
      .select('*')
      .eq('email', session.user.email)
    
    // Get business user by auth_user_id
    const { data: userByAuthId, error: authError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', session.user.id)
    
    // Get settings for any of these users
    const userIds = [...new Set([
      ...(usersByEmail || []).map(u => u.id),
      ...(userByAuthId || []).map(u => u.id)
    ])]
    
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('*')
      .in('user_id', userIds.length > 0 ? userIds : ['no-match'])
    
    // Get customers for these users
    const { data: customers, error: customersError } = await supabase
      .from('customer')
      .select('*')
      .in('user_id', userIds.length > 0 ? userIds : ['no-match'])
    
    return new Response(JSON.stringify({
      session: {
        user_id: session.user.id,
        email: session.user.email,
        name: session.user.name
      },
      businessUsersByEmail: usersByEmail || [],
      businessUsersByAuthId: userByAuthId || [],
      uniqueBusinessUserIds: userIds,
      settings: settings || [],
      customerCount: customers?.length || 0,
      errors: {
        email: emailError?.message,
        auth: authError?.message,
        settings: settingsError?.message,
        customers: customersError?.message
      }
    }, null, 2), {
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