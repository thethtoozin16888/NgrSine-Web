import sqlite3
import os

conn = sqlite3.connect('/home/pi/ngr-sine-system/data/pos.db')
conn.row_factory = sqlite3.Row

r = conn.execute("SELECT * FROM products WHERE id=79").fetchone()
print("Product 79:", dict(r))

# Are there other shampoo products?
shampoos = conn.execute("SELECT id, name, category, image FROM products WHERE category LIKE '%shampoo%' OR name LIKE '%shampoo%'").fetchall()
print(f"\nOther shampoos ({len(shampoos)}):")
for s in shampoos:
    print(dict(s))

# Are there images with shampoo in their filename or in data/images/?
img_dir = '/home/pi/ngr-sine-system/data/images'
for f in os.listdir(img_dir):
    if 'shampoo' in f.lower() or 'kerastase' in f.lower():
        print("Found matching image file:", f)

conn.close()
