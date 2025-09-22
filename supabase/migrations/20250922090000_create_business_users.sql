-- Create proper business users table to replace auth.users as business entity
-- This separates authentication concerns from business logic

-- Create the business users table
CREATE TABLE IF NOT EXISTS public.users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON public.users(auth_user_id);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS policy: users can only see their own record
DROP POLICY IF EXISTS "Users can view own record" ON public.users;
CREATE POLICY "Users can view own record" ON public.users
    FOR SELECT USING (auth_user_id = auth.uid());

-- RLS policy: users can update their own record
DROP POLICY IF EXISTS "Users can update own record" ON public.users;
CREATE POLICY "Users can update own record" ON public.users
    FOR UPDATE USING (auth_user_id = auth.uid());

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE
    ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert existing auth users as business users
INSERT INTO public.users (email, name, auth_user_id, created_at)
SELECT 
    email,
    COALESCE(raw_user_meta_data->>'name', email),
    id,
    created_at
FROM auth.users
WHERE email IN ('tal.gurevich@gmail.com', 'moran.marmus@gmail.com')
ON CONFLICT (email) DO NOTHING;