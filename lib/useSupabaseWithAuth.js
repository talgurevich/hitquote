'use client';

import { useSession } from 'next-auth/react';
import { supabase } from './supabaseClient';

export function useSupabaseWithAuth() {
  const { data: session } = useSession();

  // Create a wrapper that automatically adds tenant_id filtering
  const createFilteredQuery = (table) => {
    const originalFrom = supabase.from(table);
    
    // Override the select method to add tenant_id filtering
    const originalSelect = originalFrom.select.bind(originalFrom);
    originalFrom.select = function(columns) {
      const query = originalSelect(columns);
      
      // Add tenant_id filter if user is authenticated
      if (session?.user?.id) {
        return query.eq('tenant_id', session.user.id);
      }
      
      return query;
    };
    
    return originalFrom;
  };

  return {
    supabase,
    session,
    from: createFilteredQuery,
    isAuthenticated: !!session?.user?.id
  };
}