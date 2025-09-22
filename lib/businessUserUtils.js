import { createClient } from '@supabase/supabase-js'

export async function getBusinessUserId(authUserId) {
  // Use service role key for server-side operations to bypass RLS
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  
  const { data: user, error } = await supabase
    .from('users')
    .select('id')
    .eq('auth_user_id', authUserId)
    .single()
  
  if (error) {
    console.error('Error fetching business user:', error)
    return null
  }
  
  return user?.id || null
}

export async function validateSessionAndGetBusinessUserId(session) {
  if (!session?.user?.id) {
    throw new Error('Invalid session')
  }
  
  let businessUserId = await getBusinessUserId(session.user.id)
  
  // If business user doesn't exist, create it automatically
  if (!businessUserId) {
    console.log('Business user not found for auth user:', session.user.id, 'Creating automatically...')
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    // Create business user record
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        email: session.user.email,
        name: session.user.name || session.user.email,
        auth_user_id: session.user.id,
        created_at: new Date().toISOString()
      })
      .select('id')
      .single()

    if (userError) {
      console.error('Error creating business user:', userError)
      throw new Error('Failed to create business user: ' + userError.message)
    }

    businessUserId = newUser.id

    // Create default settings
    try {
      await supabase
        .from('settings')
        .insert({
          user_id: businessUserId,
          vat_rate: 18,
          default_payment_terms: 'מזומן / המחאה / העברה בנקאית / שוטף +30'
        })
    } catch (settingsError) {
      console.error('Error creating default settings:', settingsError)
      // Don't fail the whole operation if settings creation fails
    }

    console.log('Business user created successfully with ID:', businessUserId)
  }
  
  return businessUserId
}