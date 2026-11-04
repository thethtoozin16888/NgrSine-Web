import sqlite3
import os
import requests
import json

db_path = '/home/pi/ngr-sine-system/data/pos.db'
data_dir = '/home/pi/ngr-sine-system/data'
api_url = 'http://127.0.0.1:8100/api/shop/products'

print("=" * 60)
print("COMPREHENSIVE CATALOG & MEDIA AUDIT")
print("=" * 60)

# 1. Fetch API response
resp = requests.get(api_url)
data = resp.json()
products = data.get('products', [])
print(f"Total products returned by /api/shop/products: {len(products)}")

# 2. Check every media URL in API response
missing_urls = []
corrupted_files = []
products_with_no_images = []
combos_with_no_images = []

for p in products:
    pid = p['id']
    name = p.get('name', 'Unknown')
    thumb = p.get('thumb')
    images = p.get('images') or []
    vg = p.get('var_group')
    
    # Check if product has no images at all
    if not thumb and not images:
        products_with_no_images.append((pid, name))
        
    all_urls = set()
    if thumb:
        all_urls.add(thumb)
    for img in images:
        all_urls.add(img)
        
    if vg and vg.get('combos'):
        for c in vg['combos']:
            c_imgs = c.get('images') or []
            if not c_imgs:
                combos_with_no_images.append((pid, name, c['id'], c.get('color'), c.get('option')))
            for c_img in c_imgs:
                all_urls.add(c_img)
                
    for url in all_urls:
        try:
            head = requests.head('http://127.0.0.1:8100' + url, timeout=5)
            if head.status_code != 200:
                missing_urls.append((pid, name, url, head.status_code))
        except Exception as e:
            missing_urls.append((pid, name, url, str(e)))

print(f"\n[API Media URL Check Result]")
print(f"- Total missing/failing URLs: {len(missing_urls)}")
for m in missing_urls:
    print(f"  FAILED: Product {m[0]} '{m[1]}' URL: {m[2]} -> {m[3]}")

print(f"\n- Products with NO images at all: {len(products_with_no_images)}")
for p in products_with_no_images:
    print(f"  NO IMAGE: Product {p[0]} '{p[1]}'")

print(f"\n- Combos with NO images: {len(combos_with_no_images)}")
for c in combos_with_no_images:
    print(f"  NO COMBO IMAGE: Product {c[0]} '{c[1]}' Combo {c[2]} (color='{c[3]}', opt='{c[4]}')")

# 3. Direct pos.db check
conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row

db_products = conn.execute("SELECT id, name, category, sub_category, colors, image FROM products WHERE stock_status != 'notavailable'").fetchall()
print(f"\n[Database Direct Check] Active products in DB: {len(db_products)}")

db_missing_files = []
db_empty_image_and_no_media = []

for r in db_products:
    r_id = r['id']
    r_name = r['name']
    r_img = r['image']
    
    media = conn.execute("SELECT id, filename, type FROM product_media WHERE product_id=?", (r_id,)).fetchall()
    
    # Check if both products.image and product_media are empty
    if not r_img and not media:
        db_empty_image_and_no_media.append((r_id, r_name, r['category']))
        
    # Check if products.image exists on disk
    if r_img:
        found = False
        possible_paths = [
            os.path.join(data_dir, 'images', r_img),
            os.path.join(data_dir, 'media', str(r_id), r_img)
        ]
        for path in possible_paths:
            if os.path.exists(path) and os.path.getsize(path) > 0:
                found = True
                break
        if not found:
            db_missing_files.append((r_id, r_name, 'products.image', r_img))
            
    # Check if product_media files exist on disk
    for m in media:
        m_file = m['filename']
        m_type = m['type']
        found = False
        possible_paths = [
            os.path.join(data_dir, 'media', str(r_id), m_file),
            os.path.join(data_dir, 'images' if m_type == 'image' else 'videos', m_file)
        ]
        for path in possible_paths:
            if os.path.exists(path) and os.path.getsize(path) > 0:
                found = True
                break
        if not found:
            db_missing_files.append((r_id, r_name, f"product_media ({m_type})", m_file))

conn.close()

print(f"- DB Products with missing files on disk: {len(db_missing_files)}")
for d in db_missing_files:
    print(f"  FILE MISSING ON DISK: Product {d[0]} '{d[1]}' {d[2]}: {d[3]}")

print(f"- DB Products with NO image and NO product_media: {len(db_empty_image_and_no_media)}")
for d in db_empty_image_and_no_media:
    print(f"  EMPTY PRODUCT: Product {d[0]} '{d[1]}' (Cat: '{d[2]}')")

