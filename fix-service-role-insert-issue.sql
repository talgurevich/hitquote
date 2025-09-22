-- Fix the set_user_id trigger to handle service role insertions properly
-- When using service role, auth.uid() is null, so we should keep the provided user_id

CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER AS $$
BEGIN
    -- Only override user_id if it's not already set and we have an auth user
    IF NEW.user_id IS NULL AND auth.uid() IS NOT NULL THEN
        NEW.user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;