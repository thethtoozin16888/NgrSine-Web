import sqlite3
import requests
import json
import os

db_path = '/home/pi/ngr-sine-system/data/pos.db'
data_dir = '/home/pi/ngr-sine-system/data'

conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row

print("=" * 60)
print("INSPECTING 'Mini Jewel box' AND 'Aolion k20'")
print("=" * 60)

for term in ['Mini Jewel box', 'Aolion']:
    print(f"\n>>> Searching DB for '{term}' <<<")
    rows = conn.execute("SELECT * FROM products WHERE name LIKE ?", (f'%{term}%',)).fetchall()
    print(f"Found {len(rows)} rows:")
    for r in rows:
        pid = r['id']
        print(f"ID {pid}: name='{r['name']}', cat='{r['category']}', sub_cat='{r['sub_category']}', colors='{r['colors']}', image='{r['image']}', status='{r['stock_status']}'")
        media = conn.execute("SELECT * FROM product_media WHERE product_id=?", (pid,)).fetchall()
        print(f"  product_media ({len(media)} rows):")
        for m in media:
            print(f"    id={m['id']}, type={m['type']}, filename='{m['filename']}', sort={m['sort_order']}")
            # Check file existence
            p1 = os.path.join(data_dir, 'media', str(pid), m['filename'])
            p2 = os.path.join(data_dir, 'images' if m['type'] == 'image' else 'videos', m['filename'])
            print(f"      media path exists: p1={os.path.exists(p1)} ({p1}) | p2={os.path.exists(p2)} ({p2})")
            
        if r['image']:
            p1 = os.path.join(data_dir, 'images', r['image'])
            p2 = os.path.join(data_dir, 'media', str(pid), r['image'])
            print(f"  product.image path exists: p1={os.path.exists(p1)} ({p1}) | p2={os.path.exists(p2)} ({p2})")

print("\n" + "=" * 60)
print("API OUTPUT FOR THESE PRODUCTS")
print("=" * 60)

resp = requests.get('http://127.0.0.1:8100/api/shop/products').json()
for p in resp.get('products', []):
    name_l = p.get('name', '').lower()
    if 'jewel' in name_l or 'aolion' in name_l:
        print(f"\nProduct in API: ID {p['id']}, Name '{p['name']}'")
        print(f"  thumb: {p.get('thumb')}")
        print(f"  images: {p.get('images')}")
        print(f"  videos: {p.get('videos')}")
        vg = p.get('var_group')
        if vg:
            print(f"  var_group: colors={vg.get('colors')}, options={vg.get('options')}")
            print(f"  combos ({len(vg.get('combos', []))}):")
            for c in vg.get('combos', []):
                print(f"    combo {c['id']}: color='{c.get('color')}', option='{c.get('option')}', images={c.get('images')}")

conn.close()
