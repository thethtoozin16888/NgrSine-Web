import sqlite3
import requests
import json
import os

print("=" * 70)
print("DEEP AUDIT OF ALL PRODUCTS, COMBOS, MEDIA, AND IMAGES")
print("=" * 70)

resp = requests.get('http://127.0.0.1:8100/api/shop/products')
data = resp.json()
products = data.get('products', [])
print(f"Total products returned by API: {len(products)}")

# 1. Check each product
no_img_products = []
bad_thumb_products = []
combos_no_img = []
all_image_urls = set()

for p in products:
    pid = p['id']
    name = p.get('name', '')
    thumb = p.get('thumb', '')
    images = p.get('images', [])
    videos = p.get('videos', [])
    vg = p.get('var_group')
    
    if not thumb and not images:
        no_img_products.append((pid, name, p.get('category')))
        
    if thumb:
        all_image_urls.add(thumb)
    for img in images:
        all_image_urls.add(img)
        
    if vg and vg.get('combos'):
        for c in vg['combos']:
            c_imgs = c.get('images', [])
            if not c_imgs:
                combos_no_img.append((pid, name, c['id'], c.get('color'), c.get('option')))
            for ci in c_imgs:
                all_image_urls.add(ci)

print(f"\n1. Products with NO thumb and NO images: {len(no_img_products)}")
for p in no_img_products:
    print(f"   [ID {p[0]}] {p[1]} (Category: {p[2]})")

print(f"\n2. Combos with empty images list: {len(combos_no_img)}")
for c in combos_no_img:
    print(f"   [Parent ID {c[0]}] {c[1]} -> Combo ID {c[2]} (Color: '{c[3]}', Option: '{c[4]}')")

print(f"\n3. Checking HTTP status of all {len(all_image_urls)} unique media URLs...")
failed_urls = []
for u in sorted(all_image_urls):
    try:
        r = requests.head('http://127.0.0.1:8100' + u, timeout=5)
        if r.status_code != 200:
            failed_urls.append((u, r.status_code))
    except Exception as e:
        failed_urls.append((u, str(e)))

print(f"   Failed URLs: {len(failed_urls)}")
for f in failed_urls:
    print(f"   FAILED: {f[0]} -> {f[1]}")

# 4. Now inspect sqlite database directly for ALL products (active and inactive)
conn = sqlite3.connect('/home/pi/ngr-sine-system/data/pos.db')
conn.row_factory = sqlite3.Row
db_rows = conn.execute("SELECT id, name, category, sub_category, stock_status, image, colors FROM products").fetchall()
print(f"\n4. Direct Database Check: Total rows in products table: {len(db_rows)}")

db_no_img = []
db_missing_file = []
data_dir = '/home/pi/ngr-sine-system/data'

for r in db_rows:
    rid = r['id']
    rname = r['name']
    rimg = r['image']
    status = r['stock_status']
    
    media = conn.execute("SELECT filename, type FROM product_media WHERE product_id=?", (rid,)).fetchall()
    
    if not rimg and not media:
        db_no_img.append((rid, rname, r['category'], status))
        
    if rimg:
        # Check if file exists
        p1 = os.path.join(data_dir, 'images', rimg)
        p2 = os.path.join(data_dir, 'media', str(rid), rimg)
        if not (os.path.exists(p1) or os.path.exists(p2)):
            db_missing_file.append((rid, rname, 'image', rimg, status))
            
    for m in media:
        fn = m['filename']
        mtype = m['type']
        p1 = os.path.join(data_dir, 'media', str(rid), fn)
        p2 = os.path.join(data_dir, 'images' if mtype == 'image' else 'videos', fn)
        if not (os.path.exists(p1) or os.path.exists(p2)):
            db_missing_file.append((rid, rname, f'media({mtype})', fn, status))

print(f"   DB products with NO image and NO media in product_media: {len(db_no_img)}")
for d in db_no_img:
    print(f"   [ID {d[0]}] '{d[1]}' | Cat: '{d[2]}' | Status: {d[3]}")

print(f"   DB products with image file missing on disk: {len(db_missing_file)}")
for d in db_missing_file:
    print(f"   [ID {d[0]}] '{d[1]}' | {d[2]}: {d[3]} | Status: {d[4]}")

conn.close()
