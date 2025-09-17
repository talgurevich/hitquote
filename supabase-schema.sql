-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vat_rate DECIMAL(5,2) DEFAULT 18,
    default_payment_terms TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create customer table
CREATE TABLE IF NOT EXISTS customer (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create product table
CREATE TABLE IF NOT EXISTS product (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT,
    name TEXT NOT NULL,
    unit_label TEXT,
    base_price DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    options TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create proposal table
CREATE TABLE IF NOT EXISTS proposal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_number TEXT UNIQUE,
    customer_id UUID REFERENCES customer(id),
    payment_terms TEXT,
    notes TEXT,
    delivery_date DATE,
    subtotal DECIMAL(10,2) DEFAULT 0,
    discount_value DECIMAL(10,2) DEFAULT 0,
    include_discount_row BOOLEAN DEFAULT false,
    vat_rate DECIMAL(5,2) DEFAULT 18,
    vat_amount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create proposal_item table
CREATE TABLE IF NOT EXISTS proposal_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID REFERENCES proposal(id) ON DELETE CASCADE,
    product_id UUID REFERENCES product(id),
    product_name TEXT,
    custom_name TEXT,
    qty DECIMAL(10,2) DEFAULT 1,
    unit_price DECIMAL(10,2) DEFAULT 0,
    line_total DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO settings (vat_rate, default_payment_terms)
VALUES (18, 'מזומן / המחאה / העברה בנקאית / שוטף +30')
ON CONFLICT DO NOTHING;

-- Insert sample customers
INSERT INTO customer (name, phone, email, address) VALUES
('לקוח לדוגמה 1', '050-1234567', 'customer1@example.com', 'רחוב הראשי 1, תל אביב'),
('לקוח לדוגמה 2', '050-2345678', 'customer2@example.com', 'רחוב השני 2, ירושלים'),
('לקוח לדוגמה 3', '050-3456789', 'customer3@example.com', 'רחוב השלישי 3, חיפה');

-- Insert sample products
INSERT INTO product (category, name, unit_label, base_price, notes, options) VALUES
('שירותים', 'ייעוץ טכני', 'שעה', 500.00, 'כולל נסיעות', NULL),
('שירותים', 'פיתוח תוכנה', 'שעה', 400.00, NULL, 'Frontend|Backend|Full Stack'),
('מוצרים', 'מחשב נייד', 'יחידה', 5000.00, 'אחריות שנה', 'Dell|HP|Lenovo'),
('מוצרים', 'מסך מחשב', 'יחידה', 1500.00, '24 אינץ׳', NULL),
('שירותים', 'תמיכה טכנית', 'חודש', 2000.00, 'תמיכה מרחוק', 'בסיסי|מתקדם|פרימיום');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_proposal_customer_id ON proposal(customer_id);
CREATE INDEX IF NOT EXISTS idx_proposal_item_proposal_id ON proposal_item(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_item_product_id ON proposal_item(product_id);
CREATE INDEX IF NOT EXISTS idx_proposal_number ON proposal(proposal_number);

-- Enable Row Level Security (RLS) - optional but recommended
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer ENABLE ROW LEVEL SECURITY;
ALTER TABLE product ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_item ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (for development)
-- In production, you should create more restrictive policies
CREATE POLICY "Allow all operations on settings" ON settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on customer" ON customer FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on product" ON product FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on proposal" ON proposal FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on proposal_item" ON proposal_item FOR ALL USING (true) WITH CHECK (true);