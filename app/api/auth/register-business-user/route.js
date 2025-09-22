import { getServerSession } from 'next-auth/next'
import { createClient } from '@supabase/supabase-js'
import { authOptions } from '../[...nextauth]/route'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'No authenticated user' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { email, name, id } = session.user

    // Check if business user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', id)
      .single()

    if (existingUser) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Business user already exists',
        businessUserId: existingUser.id 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Create business user record
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        email: email,
        name: name || email,
        auth_user_id: id,
        created_at: new Date().toISOString()
      })
      .select('id')
      .single()

    if (userError) {
      console.error('Error creating business user:', userError)
      throw userError
    }

    // Create default settings
    const { error: settingsError } = await supabase
      .from('settings')
      .insert({
        user_id: newUser.id,
        vat_rate: 18,
        default_payment_terms: 'מזומן / המחאה / העברה בנקאית / שוטף +30'
      })

    if (settingsError) {
      console.error('Error creating default settings:', settingsError)
      // Don't fail the whole operation if settings creation fails
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Business user created successfully',
      businessUserId: newUser.id 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in register-business-user:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}