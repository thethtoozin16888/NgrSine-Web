import sqlite3
import requests
import json

db_path = '/home/pi/ngr-sine-system/data/pos.db'
conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row

# Fetch API products
api_prods = requests.get('http://127.0.0.1:8100/api/shop/products').json()['products']

print("=== CHECKING COMBOS AND OPTIONS IN API PRODUCTS ===")

issues = []

for p in api_prods:
    pid = p['id']
    name = p['name']
    vg = p.get('var_group')
    
    if vg:
        combos = vg.get('combos', [])
        # Check if combos have images
        combo_images = [c.get('images', []) for c in combos]
        unique_combo_images = set(img for sub in combo_images for img in sub)
        
        # Issue 1: Combos exist, but ALL combos have the exact same image
        if len(combos) > 1 and len(unique_combo_images) <= 1:
            issues.append({
                'type': 'ALL_COMBOS_SAME_OR_NO_IMAGE',
                'id': pid,
                'name': name,
                'combo_count': len(combos),
                'unique_images': list(unique_combo_images),
                'colors': vg.get('colors'),
                'options': vg.get('options')
            })
            
        # Issue 2: Some combos have images, but some have NO images
        combos_with_no_img = [c for c in combos if not c.get('images')]
        if combos_with_no_img and len(combos_with_no_img) < len(combos):
            issues.append({
                'type': 'PARTIAL_COMBOS_NO_IMAGE',
                'id': pid,
                'name': name,
                'total_combos': len(combos),
                'missing_count': len(combos_with_no_img),
                'missing_combos': [(c['id'], c.get('color'), c.get('option')) for c in combos_with_no_img]
            })

print(f"Total issues found in grouped products: {len(issues)}")
for iss in issues:
    print(f"\n[{iss['type']}] Product {iss['id']}: '{iss['name']}'")
    if iss['type'] == 'ALL_COMBOS_SAME_OR_NO_IMAGE':
        print(f"   Combos: {iss['combo_count']} | Colors: {iss['colors']} | Options: {iss['options']}")
        print(f"   Unique images: {iss['unique_images']}")
    elif iss['type'] == 'PARTIAL_COMBOS_NO_IMAGE':
        print(f"   Total combos: {iss['total_combos']} | Missing images count: {iss['missing_count']}")
        print(f"   Missing combos: {iss['missing_combos']}")

# Now check products that are NOT merged into var_group, but have the same name (siblings)
print("\n=== CHECKING UNMERGED SAME-NAME PRODUCTS ===")
name_map = {}
for p in api_prods:
    norm = p['name'].strip().lower()
    name_map.setdefault(norm, []).append(p)

unmerged_same_name = {k: v for k, v in name_map.items() if len(v) > 1}
print(f"Unmerged same-name groups in API: {len(unmerged_same_name)}")
for norm_name, plist in unmerged_same_name.items():
    print(f"\nGroup '{norm_name}' ({len(plist)} items):")
    for item in plist:
        print(f"   ID {item['id']:3d} | Cat: '{item['category']}' | Thumb: {item.get('thumb')} | Images: {len(item.get('images', []))} | HasVarGroup: {bool(item.get('var_group'))}")

conn.close()
