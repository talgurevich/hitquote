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

    // Check if business user already exists (by auth_user_id OR email)
    const { data: existingUserByAuthId, error: authIdError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', id)
      .maybeSingle()

    if (existingUserByAuthId) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Business user already exists',
        businessUserId: existingUserByAuthId.id 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Check if email already exists (to prevent duplicate email constraint violation)
    const { data: existingUserByEmail, error: emailError } = await supabase
      .from('users')
      .select('id, auth_user_id')
      .eq('email', email)
      .maybeSingle()

    if (existingUserByEmail) {
      // Email exists but with different auth_user_id - update the existing record
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          auth_user_id: id,
          name: name || email
        })
        .eq('email', email)
        .select('id')
        .single()

      if (updateError) {
        console.error('Error updating existing user:', updateError)
        throw updateError
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Existing business user updated with new auth ID',
        businessUserId: updatedUser.id 
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