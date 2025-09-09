import pandas as pd
import json

# Read the CSV file
df = pd.read_csv('catalog.csv')

# Clean and prepare the data
products = []

for index, row in df.iterrows():
    # Skip rows with NaN values in critical columns
    if pd.isna(row['מוצר']) or pd.isna(row['מחיר (₪)']):
        continue
    
    product = {
        'name': str(row['מוצר']).strip(),
        'category': str(row['קטגוריה']).strip() if pd.notna(row['קטגוריה']) else 'כללי',
        'price': float(row['מחיר (₪)']),
        'quantity': str(row['יחידות/כמות']).strip() if pd.notna(row['יחידות/כמות']) else '',
        'options': str(row['אופציות/הערות']).strip() if pd.notna(row['אופציות/הערות']) else '',
        'ingredients': str(row['מרכיבים']).strip() if pd.notna(row['מרכיבים']) else '',
        'available': True
    }
    products.append(product)

# Display the products
print(f"Total products parsed: {len(products)}")
print("\nFirst 3 products:")
for i, p in enumerate(products[:3]):
    print(f"\n{i+1}. {p['name']}")
    print(f"   Category: {p['category']}")
    print(f"   Price: ₪{p['price']}")
    print(f"   Quantity: {p['quantity']}")

# Save to JSON for database import
with open('catalog_parsed.json', 'w', encoding='utf-8') as f:
    json.dump(products, f, ensure_ascii=False, indent=2)

print("\nData saved to catalog_parsed.json")

# Generate SQL insert statements
print("\n--- SQL INSERT STATEMENTS ---\n")
for product in products:
    name = product['name'].replace("'", "''")
    category = product['category'].replace("'", "''")
    quantity = product['quantity'].replace("'", "''")
    options = product['options'].replace("'", "''")
    ingredients = product['ingredients'].replace("'", "''")
    
    sql = f"""INSERT INTO products (name, category, price, quantity, options, ingredients, available) 
VALUES ('{name}', '{category}', {product['price']}, '{quantity}', '{options}', '{ingredients}', {product['available']});"""
    
    print(sql)