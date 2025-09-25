import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { createClient } from '@supabase/supabase-js';
import { validateSessionAndGetBusinessUserId } from '../../../lib/businessUserUtils';

// Create Supabase client with service role
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const businessUserId = await validateSessionAndGetBusinessUserId(session);
    const { quoteId } = await request.json();
    
    if (!quoteId) {
      return NextResponse.json({ error: 'Quote ID required' }, { status: 400 });
    }
    
    // Verify the quote belongs to the current user before deleting
    const { data: quote, error: fetchError } = await supabaseAdmin
      .from('proposal')
      .select('id, user_id')
      .eq('id', quoteId)
      .eq('user_id', businessUserId)
      .single();
    
    if (fetchError || !quote) {
      return NextResponse.json({ error: 'Quote not found or unauthorized' }, { status: 404 });
    }
    
    // Delete quote items first (foreign key constraint)
    const { error: itemsDeleteError } = await supabaseAdmin
      .from('proposal_item')
      .delete()
      .eq('proposal_id', quoteId);
    
    if (itemsDeleteError) {
      throw itemsDeleteError;
    }
    
    // Delete the quote
    const { error: deleteError } = await supabaseAdmin
      .from('proposal')
      .delete()
      .eq('id', quoteId)
      .eq('user_id', businessUserId);
    
    if (deleteError) {
      throw deleteError;
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Quote deleted successfully' 
    });
    
  } catch (error) {
    console.error('Error deleting quote:', error);
    return NextResponse.json({ 
      error: 'Failed to delete quote', 
      details: error.message 
    }, { status: 500 });
  }
}