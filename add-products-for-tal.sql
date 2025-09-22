-- Add sample products for tal.gurevich2@gmail.com
-- First, find the user ID for tal.gurevich2@gmail.com
-- Run this in Supabase SQL editor:
-- SELECT id FROM auth.users WHERE email = 'tal.gurevich2@gmail.com';

-- Replace 'USER_ID_HERE' with the actual user ID from the query above

-- Sample products for testing
INSERT INTO product (tenant_id, category, name, unit_label, base_price, notes, options, created_at, updated_at) VALUES
('USER_ID_HERE', 'שירותים', 'ייעוץ טכני', 'שעה', 500.00, 'כולל נסיעות', null, NOW(), NOW()),
('USER_ID_HERE', 'שירותים', 'פיתוח תוכנה', 'שעה', 400.00, 'פיתוח מותאם אישית', 'Frontend|Backend|Full Stack', NOW(), NOW()),
('USER_ID_HERE', 'מוצרים', 'מחשב נייד', 'יחידה', 5000.00, 'אחריות שנה', 'Dell|HP|Lenovo', NOW(), NOW()),
('USER_ID_HERE', 'מוצרים', 'מסך מחשב', 'יחידה', 1500.00, '24 אינץ׳', '24"|27"|32"', NOW(), NOW()),
('USER_ID_HERE', 'שירותים', 'תמיכה טכנית', 'חודש', 2000.00, 'תמיכה מרחוק', 'בסיסי|מתקדם|פרימיום', NOW(), NOW()),
('USER_ID_HERE', 'מוצרים', 'עכבר אלחוטי', 'יחידה', 150.00, 'טכנולוגיה אלחוטית', null, NOW(), NOW()),
('USER_ID_HERE', 'מוצרים', 'מקלדת', 'יחידה', 300.00, 'מקלדת מכנית', 'עברית|אנגלית|דו-לשונית', NOW(), NOW()),
('USER_ID_HERE', 'שירותים', 'הדרכה', 'יום', 1200.00, 'הדרכה אישית או קבוצתית', 'אישית|קבוצה קטנה|קבוצה גדולה', NOW(), NOW()),
('USER_ID_HERE', 'מוצרים', 'נתב אלחוטי', 'יחידה', 400.00, 'WiFi 6', null, NOW(), NOW()),
('USER_ID_HERE', 'שירותים', 'אבטחת מידע', 'פרויקט', 8000.00, 'ביקורת אבטחה מלאה', 'בסיסי|מתקדם|מקיף', NOW(), NOW());

-- Steps to execute this script:
-- 1. Go to Supabase SQL editor
-- 2. Run: SELECT id FROM auth.users WHERE email = 'tal.gurevich2@gmail.com';
-- 3. Copy the user ID 
-- 4. Replace all instances of 'USER_ID_HERE' with the actual user ID
-- 5. Execute the INSERT statements above