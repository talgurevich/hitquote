// Tenant helper functions for multi-tenant support
import { getSession } from 'next-auth/react';

export async function getCurrentUserId() {
  try {
    const session = await getSession();
    return session?.user?.id || null;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
}

export function addTenantFilter(query, tenantId = null) {
  if (tenantId) {
    return query.eq('tenant_id', tenantId);
  }
  return query;
}

export async function addCurrentUserFilter(query) {
  const userId = await getCurrentUserId();
  if (userId) {
    return query.eq('tenant_id', userId);
  }
  throw new Error('User not authenticated');
}

export function addTenantData(data, tenantId = null) {
  if (tenantId && typeof data === 'object') {
    return { ...data, tenant_id: tenantId };
  }
  return data;
}

export async function addCurrentUserData(data) {
  const userId = await getCurrentUserId();
  if (userId) {
    return { ...data, tenant_id: userId };
  }
  throw new Error('User not authenticated');
}