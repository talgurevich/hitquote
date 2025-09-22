-- Root cause fix: Update the set_user_id trigger to handle both scenarios
-- 1. Service role insertions (auth.uid() is null, preserve provided user_id)  
-- 2. Client-side insertions (auth.uid() exists, auto-set user_id)

CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER AS $$
BEGIN
    -- If user_id is already provided (from service role), keep it
    IF NEW.user_id IS NOT NULL THEN
        RETURN NEW;
    END IF;
    
    -- If auth.uid() is available (client-side call), auto-set user_id
    IF auth.uid() IS NOT NULL THEN
        NEW.user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()::TEXT);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;