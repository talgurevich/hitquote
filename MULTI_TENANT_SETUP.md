# Multi-Tenant Setup Guide

This guide explains how to convert the HIT Quote system to support multiple isolated user accounts.

## 🎯 What Was Implemented

### 1. Database Changes
- **Created**: `add-multi-tenant-migration.sql` - Adds tenant_id columns and RLS policies
- **Created**: `migrate-existing-data.sql` - Assigns existing data to approved users
- **Added**: Automatic tenant_id triggers for new records
- **Added**: Row Level Security (RLS) policies for data isolation

### 2. Authentication Changes
- **Removed**: Email restrictions - now anyone can sign up
- **Added**: First-time user detection and redirect to settings
- **Added**: User ID tracking in session for tenant isolation

### 3. UI/UX Changes
- **Added**: Welcome message for first-time users in settings
- **Added**: Automatic redirect to dashboard after first-time setup
- **Created**: Tenant helper functions for database queries

## 🚀 Setup Instructions

### Step 1: Run Database Migrations in Supabase

1. **Go to Supabase SQL Editor** and run these scripts in order:

```sql
-- 1. First, run the multi-tenant migration
-- Copy and paste the contents of: add-multi-tenant-migration.sql
```

```sql
-- 2. Then, run the data migration for existing users  
-- Copy and paste the contents of: migrate-existing-data.sql
```

```sql
-- 3. Finally, copy all data to Moran's account
-- Copy and paste the contents of: copy-data-to-moran.sql
```

### Step 2: Verify Migration

Run this query to verify the migration worked:

```sql
SELECT 
  'settings' as table_name, 
  tenant_id, 
  COUNT(*) as record_count 
FROM settings 
WHERE tenant_id IS NOT NULL 
GROUP BY tenant_id
UNION ALL
SELECT 
  'customer' as table_name, 
  tenant_id, 
  COUNT(*) as record_count 
FROM customer 
WHERE tenant_id IS NOT NULL 
GROUP BY tenant_id
UNION ALL
SELECT 
  'proposal' as table_name, 
  tenant_id, 
  COUNT(*) as record_count 
FROM proposal 
WHERE tenant_id IS NOT NULL 
GROUP BY tenant_id;
```

### Step 3: Update Application Code (FUTURE)

The database queries throughout the application will need to be updated to include tenant filtering. This has been planned but not yet implemented to avoid breaking the current system.

## 🔒 Security Features

### Row Level Security (RLS)
- Each user can only see their own data
- Automatic tenant_id assignment on inserts
- Secure policies prevent data leakage between accounts

### Authentication Flow
1. User signs in with Google
2. System checks if they have settings
3. First-time users → Settings page with welcome message
4. Existing users → Dashboard
5. All data is automatically filtered by user

## 👥 Existing Users

### tal.gurevich@gmail.com
- Gets ALL existing data (customers, products, proposals, settings)
- Account works exactly as before

### moran.marmus@gmail.com  
- Gets a COMPLETE COPY of all Tal's data
- Both accounts start with identical data but are completely isolated
- Each can modify their data independently

## 🌟 New User Experience

1. **Sign up** with any Google account
2. **Redirected** to settings page with welcome message
3. **Fill out** business information
4. **Automatically redirected** to dashboard
5. **Start creating** quotes with empty account

## 📁 Files Created/Modified

### New Files
- `add-multi-tenant-migration.sql` - Database schema changes
- `migrate-existing-data.sql` - Data migration script for tal.gurevich@gmail.com
- `copy-data-to-moran.sql` - Script to copy all data to moran.marmus@gmail.com
- `lib/tenantHelper.js` - Helper functions for tenant operations
- `MULTI_TENANT_SETUP.md` - This guide

### Modified Files
- `app/api/auth/[...nextauth]/route.js` - Removed email restrictions, added first-time user detection
- `app/settings/page.js` - Added welcome message and redirect for first-time users

## ⚠️ Important Notes

1. **Database migrations must be run in Supabase before deploying**
2. **Existing users' data will be preserved** 
3. **New users start with empty accounts**
4. **All queries are automatically filtered by tenant_id** through RLS
5. **No application code changes needed** for basic tenant isolation (RLS handles it)

## 🔄 Next Steps (Future)

When you're ready to fully implement tenant isolation in the application code:
1. Update all database queries to use tenant helper functions
2. Add explicit tenant_id filtering in complex queries
3. Test thoroughly with multiple user accounts
4. Consider adding admin features for user management