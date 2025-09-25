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

async function getNextProposalNumber() {
  const now = new Date();
  const yyyy = now.getFullYear().toString();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `${yyyy}${mm}`;
  
  const { data, error } = await supabaseAdmin
    .from('proposal')
    .select('proposal_number')
    .like('proposal_number', `${prefix}%`);
  
  if (error) throw error;
  
  let maxSeq = 0;
  for (const row of (data || [])) {
    const seq = Number((row.proposal_number || '').slice(6));
    if (!Number.isNaN(seq) && seq > maxSeq) maxSeq = seq;
  }
  
  const next = String(maxSeq + 1).padStart(5, '0');
  return `${prefix}${next}`;
}

export async function POST(request) {
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
    
    // Get the original quote
    const { data: originalQuote, error: fetchError } = await supabaseAdmin
      .from('proposal')
      .select('*')
      .eq('id', quoteId)
      .eq('user_id', businessUserId)
      .single();
    
    if (fetchError || !originalQuote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }
    
    // Get the original quote items
    const { data: originalItems, error: itemsError } = await supabaseAdmin
      .from('proposal_item')
      .select('*')
      .eq('proposal_id', quoteId);
    
    if (itemsError) {
      throw itemsError;
    }
    
    // Create new quote with duplicated data
    const newProposalNumber = await getNextProposalNumber();
    
    const newQuote = {
      ...originalQuote,
      id: undefined, // Let database generate new ID
      proposal_number: newProposalNumber,
      created_at: new Date().toISOString(),
      status: 'pending',
      signature_status: null,
      signature_timestamp: null,
      signer_name: null,
      signature_data: null,
      notes: originalQuote.notes ? `${originalQuote.notes} (העתק)` : '(העתק)'
    };
    
    delete newQuote.id;
    
    // Insert the new quote
    const { data: createdQuote, error: createError } = await supabaseAdmin
      .from('proposal')
      .insert(newQuote)
      .select()
      .single();
    
    if (createError) {
      throw createError;
    }
    
    // Duplicate items if any exist
    if (originalItems && originalItems.length > 0) {
      const newItems = originalItems.map(item => ({
        ...item,
        id: undefined, // Let database generate new ID
        proposal_id: createdQuote.id,
        created_at: new Date().toISOString()
      }));
      
      newItems.forEach(item => delete item.id);
      
      const { error: itemsCreateError } = await supabaseAdmin
        .from('proposal_item')
        .insert(newItems);
      
      if (itemsCreateError) {
        // If items fail, delete the quote and throw error
        await supabaseAdmin
          .from('proposal')
          .delete()
          .eq('id', createdQuote.id);
        throw itemsCreateError;
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      newQuoteId: createdQuote.id 
    });
    
  } catch (error) {
    console.error('Error duplicating quote:', error);
    return NextResponse.json({ 
      error: 'Failed to duplicate quote', 
      details: error.message 
    }, { status: 500 });
  }
}