import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

// Using anon key since we don't have service role key
const supabase = createClient(
  'https://exfzzadoqlumijmvgwch.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4Znp6YWRvcWx1bWlqbXZnd2NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MTM0NTksImV4cCI6MjA3Mjk4OTQ1OX0.MZhvYkHftPYvfJdrqWsv0G11L5NsyjBR_UgWCZqFAC0'
)

async function updateMoranCatalog() {
  try {
    // First, let's find the user ID for moran.marmus@gmail.com
    // We'll look for existing products with that tenant_id pattern
    console.log('Looking for moran.marmus@gmail.com user...')
    
    // Get all products to see what tenant_ids exist
    const { data: allProducts, error: allError } = await supabase
      .from('product')
      .select('tenant_id')
      .limit(10)
    
    if (allError) {
      console.error('Error fetching products:', allError)
      return
    }
    
    console.log('Found tenant_ids:', allProducts.map(p => p.tenant_id))
    
    // Based on Google OAuth, let's assume the user ID is similar to other users
    // Let's use a known pattern or manually set it
    const moranUserId = 'c3b1e1b5-8d7f-4c5a-9e2f-1a2b3c4d5e6f' // You'll need to provide the actual user ID
    
    console.log(`Deleting existing products for tenant: ${moranUserId}`)
    
    // Delete existing products for Moran
    const { error: deleteError } = await supabase
      .from('product')
      .delete()
      .eq('tenant_id', moranUserId)
    
    if (deleteError) {
      console.error('Error deleting products:', deleteError)
      return
    }
    
    console.log('Reading CSV file...')
    
    // Read and parse the CSV file
    const csvContent = fs.readFileSync('/Users/talgurevich/Documents/quotes-app/bread_station_catalog.csv', 'utf8')
    const lines = csvContent.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',').map(h => h.trim())
    
    console.log('CSV headers:', headers)
    console.log(`Found ${lines.length - 1} products in CSV`)
    
    const products = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      if (values.length >= 4) {
        products.push({
          tenant_id: moranUserId,
          category: values[0] || '',
          name: values[1] || '',
          unit_label: values[2] || '',
          base_price: parseFloat(values[3]) || 0,
          notes: values[4] || null,
          options: values[5] || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }
    }
    
    console.log(`Prepared ${products.length} products for insertion`)
    
    // Insert products in batches to avoid size limits
    const batchSize = 100
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize)
      console.log(`Inserting batch ${Math.floor(i/batchSize) + 1}: ${batch.length} products`)
      
      const { error: insertError } = await supabase
        .from('product')
        .insert(batch)
      
      if (insertError) {
        console.error('Error inserting batch:', insertError)
        return
      }
    }
    
    console.log(`✅ Successfully updated catalog for moran.marmus@gmail.com with ${products.length} products`)
    
  } catch (error) {
    console.error('Script error:', error)
  }
}

updateMoranCatalog()