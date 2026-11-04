import sqlite3
import json
import os
from PIL import Image

db_path = '/home/pi/ngr-sine-system/data/pos.db'
data_dir = '/home/pi/ngr-sine-system/data'

conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row

# 1. Check all files in product_media
print("--- CHECKING PRODUCT_MEDIA TABLE ---")
media_rows = conn.execute("SELECT id, product_id, type, filename FROM product_media").fetchall()
print(f"Total product_media rows: {len(media_rows)}")

media_errors = []
for m in media_rows:
    mid = m['id']
    pid = m['product_id']
    mtype = m['type']
    fn = m['filename']
    
    # Try finding file
    p1 = os.path.join(data_dir, 'media', str(pid), fn)
    p2 = os.path.join(data_dir, 'images' if mtype == 'image' else 'videos', fn)
    path = p1 if os.path.exists(p1) else (p2 if os.path.exists(p2) else None)
    
    if not path:
        media_errors.append((mid, pid, fn, 'File not found on disk'))
        continue
        
    sz = os.path.getsize(path)
    if sz == 0:
        media_errors.append((mid, pid, fn, 'Zero bytes file'))
        continue
        
    if mtype == 'image':
        try:
            with Image.open(path) as img:
                img.verify()
        except Exception as e:
            media_errors.append((mid, pid, fn, f'Corrupted image: {e}'))

print(f"Product media errors: {len(media_errors)}")
for err in media_errors:
    print("  ERR:", err)

# 2. Check all products in products table
print("\n--- CHECKING PRODUCTS TABLE ---")
prods = conn.execute("SELECT id, name, category, sub_category, colors, image, variants, stock_status FROM products").fetchall()
print(f"Total products: {len(prods)}")

prod_img_errors = []
prods_with_colors = []
prods_with_variants_json = []

for p in prods:
    pid = p['id']
    name = p['name']
    img = p['image']
    colors = p['colors']
    vars_json = p['variants']
    status = p['stock_status']
    
    if colors and colors.strip():
        prods_with_colors.append((pid, name, colors.strip()))
    if vars_json and vars_json.strip() and vars_json != 'null':
        prods_with_variants_json.append((pid, name, vars_json.strip()))
        
    if img:
        p1 = os.path.join(data_dir, 'images', img)
        p2 = os.path.join(data_dir, 'media', str(pid), img)
        path = p1 if os.path.exists(p1) else (p2 if os.path.exists(p2) else None)
        if not path:
            prod_img_errors.append((pid, name, img, 'File not found'))
            continue
        try:
            with Image.open(path) as im:
                im.verify()
        except Exception as e:
            prod_img_errors.append((pid, name, img, f'Corrupted: {e}'))
    else:
        # Check if product has media in product_media
        m_count = conn.execute("SELECT COUNT(*) FROM product_media WHERE product_id=?", (pid,)).fetchone()[0]
        if m_count == 0:
            prod_img_errors.append((pid, name, None, 'NO image and NO product_media'))

print(f"Products image errors: {len(prod_img_errors)}")
for err in prod_img_errors:
    print("  ERR:", err)

print(f"\nProducts with colors field populated: {len(prods_with_colors)}")
print(f"Products with variants JSON populated: {len(prods_with_variants_json)}")

# 3. Check for same-named products
name_groups = {}
for p in prods:
    if p['stock_status'] != 'notavailable':
        n = (p['name'] or '').strip().lower()
        name_groups.setdefault(n, []).append(p)

multi_named = {n: items for n, items in name_groups.items() if len(items) > 1}
print(f"\nProduct names with multiple rows (active): {len(multi_named)}")
for n, items in list(multi_named.items())[:15]:
    print(f"\nName: '{items[0]['name']}' ({len(items)} rows):")
    for it in items:
        media_cnt = conn.execute("SELECT COUNT(*) FROM product_media WHERE product_id=?", (it['id'],)).fetchone()[0]
        print(f"  ID {it['id']:3d} | Cat: '{it['category']}' | SubCat: '{it['sub_category']}' | Colors: '{it['colors']}' | Image: '{it['image']}' | Media: {media_cnt} | Status: {it['stock_status']}")

conn.close()
