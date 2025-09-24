import { createClient } from '@supabase/supabase-js'

// Create Supabase client with service role for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Check if email is approved for access
export async function isEmailApproved(email) {
  if (!email) return false
  
  try {
    const { data, error } = await supabaseAdmin
      .from('approved_emails')
      .select('status')
      .eq('email', email)
      .eq('status', 'approved')
      .maybeSingle()
    
    if (error) {
      console.error('Error checking email approval:', error)
      return false
    }
    
    return !!data
  } catch (error) {
    console.error('Error in isEmailApproved:', error)
    return false
  }
}

// Add email to approved list
export async function approveEmail(email, approvedBy = 'admin') {
  if (!email) throw new Error('Email is required')
  
  try {
    const { data, error } = await supabaseAdmin
      .from('approved_emails')
      .upsert({
        email,
        status: 'approved',
        approved_by: approvedBy,
        approved_at: new Date().toISOString()
      }, {
        onConflict: 'email'
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error approving email:', error)
    throw error
  }
}

// Create pending approval request
export async function createPendingRequest(email) {
  if (!email) throw new Error('Email is required')
  
  try {
    const { data, error } = await supabaseAdmin
      .from('approved_emails')
      .upsert({
        email,
        status: 'pending',
        created_at: new Date().toISOString()
      }, {
        onConflict: 'email'
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating pending request:', error)
    throw error
  }
}

// Get all pending approval requests
export async function getPendingRequests() {
  try {
    const { data, error } = await supabaseAdmin
      .from('approved_emails')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error getting pending requests:', error)
    return []
  }
}

// Get all approved emails
export async function getApprovedEmails() {
  try {
    const { data, error } = await supabaseAdmin
      .from('approved_emails')
      .select('*')
      .eq('status', 'approved')
      .order('approved_at', { ascending: false })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error getting approved emails:', error)
    return []
  }
}

// Reject email request
export async function rejectEmail(email, rejectedBy = 'admin') {
  if (!email) throw new Error('Email is required')
  
  try {
    const { data, error } = await supabaseAdmin
      .from('approved_emails')
      .update({
        status: 'rejected',
        approved_by: rejectedBy,
        updated_at: new Date().toISOString()
      })
      .eq('email', email)
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error rejecting email:', error)
    throw error
  }
}