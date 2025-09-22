import { getServerSession } from 'next-auth/next'
import { createClient } from '@supabase/supabase-js'
import { validateSessionAndGetBusinessUserId } from '../../../../lib/businessUserUtils'
import { authOptions } from '../../auth/[...nextauth]/route'

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
    
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const body = await req.json()
    const { products, deleteExisting } = body
    
    // Get business user ID using the session
    const businessUserId = await validateSessionAndGetBusinessUserId(session)
    console.log('Admin API - Business User ID:', businessUserId)
    
    // Delete existing products if requested
    if (deleteExisting) {
      console.log('Deleting existing products for user:', businessUserId)
      const { error: deleteError } = await supabase
        .from('product')
        .delete()
        .eq('user_id', businessUserId)
      
      if (deleteError) {
        console.error('Delete error:', deleteError)
        throw deleteError
      }
    }
    
    // Prepare products for insertion
    const productsToInsert = products.map(p => ({
      user_id: businessUserId,
      category: p.category || null,
      name: p.name || 'מוצר ללא שם',
      unit_label: p.unit_label || null,
      base_price: parseFloat(p.base_price) || 0,
      notes: p.notes || null,
      options: p.options || null
    }))
    
    console.log('Inserting products:', productsToInsert.length, 'products for user:', businessUserId)
    console.log('First product sample:', productsToInsert[0])
    
    // Insert new products - trigger now handles service role properly
    const { data: insertData, error: insertError } = await supabase
      .from('product')
      .insert(productsToInsert)
      .select()
    
    if (insertError) {
      console.error('Insert error:', insertError)
      throw insertError
    }
    
    console.log('Insert successful - inserted:', productsToInsert.length, 'products')
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: `${products.length} מוצרים הועלו בהצלחה`,
      productsCount: products.length 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.error('Error updating catalog:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}