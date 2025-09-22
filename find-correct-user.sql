-- Check all users in the system to find the correct one
SELECT id, email, created_at, raw_user_meta_data
FROM auth.users 
ORDER BY created_at DESC;

-- Also check if there are any variations of the email
SELECT id, email, created_at
FROM auth.users 
WHERE email ILIKE '%tal%' OR email ILIKE '%gurevich%'
ORDER BY created_at DESC;

-- Check what products currently exist (to see if they have any tenant_id patterns)
SELECT tenant_id, COUNT(*) as count, MIN(name) as sample_name
FROM product 
GROUP BY tenant_id
ORDER BY count DESC;