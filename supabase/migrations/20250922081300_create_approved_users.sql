-- Create user records in auth.users table for the approved accounts
-- This allows the migration scripts to find the user IDs and assign data properly

DO $$
BEGIN
    -- Only insert if users don't already exist
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'tal.gurevich@gmail.com') THEN
        INSERT INTO auth.users (
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            created_at,
            updated_at,
            is_sso_user
        ) VALUES (
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'tal.gurevich@gmail.com',
            '',
            NOW(),
            '{"provider": "google", "providers": ["google"]}',
            '{"email": "tal.gurevich@gmail.com", "email_verified": true, "name": "Tal Gurevich"}',
            false,
            NOW(),
            NOW(),
            true
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'moran.marmus@gmail.com') THEN
        INSERT INTO auth.users (
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            created_at,
            updated_at,
            is_sso_user
        ) VALUES (
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'moran.marmus@gmail.com',
            '',
            NOW(),
            '{"provider": "google", "providers": ["google"]}',
            '{"email": "moran.marmus@gmail.com", "email_verified": true, "name": "Moran Marmus"}',
            false,
            NOW(),
            NOW(),
            true
        );
    END IF;
END $$;