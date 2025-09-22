-- Check if proposals are being saved with correct user_id

-- Check all proposals and their user_id values
SELECT 'All proposals by user_id:' as debug_step;
SELECT 
    CASE 
        WHEN user_id IS NULL THEN 'NULL' 
        ELSE user_id::TEXT 
    END as user_id_display,
    user_id,
    COUNT(*) as proposal_count,
    MAX(created_at) as latest_created
FROM proposal 
GROUP BY user_id
ORDER BY proposal_count DESC;

-- Check the most recent 5 proposals
SELECT 'Most recent proposals:' as debug_step;
SELECT id, proposal_number, user_id, created_at, total
FROM proposal 
ORDER BY created_at DESC 
LIMIT 5;