-- Script to copy all data from tal.gurevich@gmail.com to moran.marmus@gmail.com
-- This will give both users the same starting data

DO $$
DECLARE
    tal_user_id UUID; 
    moran_user_id UUID;
    settings_record RECORD;
    customer_record RECORD;
    product_record RECORD;
    proposal_record RECORD;
    proposal_item_record RECORD;
    new_proposal_id UUID;
    old_proposal_id UUID;
BEGIN
    -- Get user IDs from auth.users table
    SELECT id INTO tal_user_id FROM auth.users WHERE email = 'tal.gurevich@gmail.com';
    SELECT id INTO moran_user_id FROM auth.users WHERE email = 'moran.marmus@gmail.com';
    
    -- Verify both users exist
    IF tal_user_id IS NULL THEN
        RAISE EXCEPTION 'Could not find user ID for tal.gurevich@gmail.com';
    END IF;
    
    IF moran_user_id IS NULL THEN
        RAISE EXCEPTION 'Could not find user ID for moran.marmus@gmail.com';
    END IF;
    
    RAISE NOTICE 'Found Tal user ID: %', tal_user_id;
    RAISE NOTICE 'Found Moran user ID: %', moran_user_id;
    
    -- 1. Copy Settings
    RAISE NOTICE 'Copying settings...';
    FOR settings_record IN 
        SELECT * FROM settings WHERE tenant_id = tal_user_id
    LOOP
        INSERT INTO settings (
            tenant_id, vat_rate, default_payment_terms, business_name, 
            business_email, business_phone, business_address, business_license, logo_url
        ) VALUES (
            moran_user_id, settings_record.vat_rate, settings_record.default_payment_terms,
            settings_record.business_name, settings_record.business_email, settings_record.business_phone,
            settings_record.business_address, settings_record.business_license, settings_record.logo_url
        ) ON CONFLICT DO NOTHING;
    END LOOP;
    
    -- 2. Copy Customers
    RAISE NOTICE 'Copying customers...';
    FOR customer_record IN 
        SELECT * FROM customer WHERE tenant_id = tal_user_id
    LOOP
        INSERT INTO customer (
            id, tenant_id, name, phone, email, address, created_at, updated_at
        ) VALUES (
            gen_random_uuid(), moran_user_id, customer_record.name, customer_record.phone,
            customer_record.email, customer_record.address, customer_record.created_at, customer_record.updated_at
        );
    END LOOP;
    
    -- 3. Copy Products
    RAISE NOTICE 'Copying products...';
    FOR product_record IN 
        SELECT * FROM product WHERE tenant_id = tal_user_id
    LOOP
        INSERT INTO product (
            id, tenant_id, category, name, unit_label, base_price, notes, options, created_at, updated_at
        ) VALUES (
            gen_random_uuid(), moran_user_id, product_record.category, product_record.name,
            product_record.unit_label, product_record.base_price, product_record.notes,
            product_record.options, product_record.created_at, product_record.updated_at
        );
    END LOOP;
    
    -- 4. Copy Proposals (with new customer references)
    RAISE NOTICE 'Copying proposals...';
    FOR proposal_record IN 
        SELECT p.id, p.tenant_id, p.proposal_number, p.customer_id, p.payment_terms, p.notes, p.delivery_date,
               p.subtotal, p.discount_value, p.include_discount_row, p.vat_rate, p.vat_amount, p.total,
               p.signature_status, p.signature_data, p.created_at, p.updated_at, c_old.name as customer_name 
        FROM proposal p
        LEFT JOIN customer c_old ON p.customer_id = c_old.id
        WHERE p.tenant_id = tal_user_id
    LOOP
        -- Find the corresponding customer in Moran's account by name
        SELECT id INTO new_proposal_id FROM customer 
        WHERE tenant_id = moran_user_id AND name = proposal_record.customer_name
        LIMIT 1;
        
        -- Store old proposal ID for proposal_items copying
        old_proposal_id := proposal_record.id;
        
        -- Generate new proposal ID
        new_proposal_id := gen_random_uuid();
        
        INSERT INTO proposal (
            id, tenant_id, proposal_number, customer_id, payment_terms, notes, delivery_date,
            subtotal, discount_value, include_discount_row, vat_rate, vat_amount, total,
            signature_status, signature_data, created_at, updated_at
        ) VALUES (
            new_proposal_id, moran_user_id, proposal_record.proposal_number || '_COPY',
            (SELECT id FROM customer WHERE tenant_id = moran_user_id AND name = proposal_record.customer_name LIMIT 1),
            proposal_record.payment_terms, proposal_record.notes, proposal_record.delivery_date,
            proposal_record.subtotal, proposal_record.discount_value, proposal_record.include_discount_row,
            proposal_record.vat_rate, proposal_record.vat_amount, proposal_record.total,
            proposal_record.signature_status, proposal_record.signature_data,
            proposal_record.created_at, proposal_record.updated_at
        );
        
        -- 5. Copy Proposal Items for this proposal
        FOR proposal_item_record IN 
            SELECT * FROM proposal_item WHERE proposal_id = old_proposal_id
        LOOP
            INSERT INTO proposal_item (
                id, tenant_id, proposal_id, product_id, product_name, custom_name,
                qty, unit_price, line_total, notes, created_at, updated_at
            ) VALUES (
                gen_random_uuid(), moran_user_id, new_proposal_id,
                (SELECT id FROM product WHERE tenant_id = moran_user_id AND name = proposal_item_record.product_name LIMIT 1),
                proposal_item_record.product_name, proposal_item_record.custom_name,
                proposal_item_record.qty, proposal_item_record.unit_price, proposal_item_record.line_total,
                proposal_item_record.notes, proposal_item_record.created_at, proposal_item_record.updated_at
            );
        END LOOP;
    END LOOP;
    
    RAISE NOTICE 'Data copy completed successfully!';
    
    -- Show summary
    RAISE NOTICE 'Summary for Moran account:';
    RAISE NOTICE 'Settings: % records', (SELECT COUNT(*) FROM settings WHERE tenant_id = moran_user_id);
    RAISE NOTICE 'Customers: % records', (SELECT COUNT(*) FROM customer WHERE tenant_id = moran_user_id);
    RAISE NOTICE 'Products: % records', (SELECT COUNT(*) FROM product WHERE tenant_id = moran_user_id);
    RAISE NOTICE 'Proposals: % records', (SELECT COUNT(*) FROM proposal WHERE tenant_id = moran_user_id);
    RAISE NOTICE 'Proposal Items: % records', (SELECT COUNT(*) FROM proposal_item WHERE tenant_id = moran_user_id);
    
END $$;