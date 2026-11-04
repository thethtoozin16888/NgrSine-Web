import requests
import json

resp = requests.get('http://127.0.0.1:8100/api/shop/products')
prods = resp.json()['products']

print(f"Total products: {len(prods)}")

vg_prods = [p for p in prods if p.get('var_group')]
print(f"Products with var_group: {len(vg_prods)}")

for p in vg_prods:
    pid = p['id']
    name = p['name']
    vg = p['var_group']
    colors = vg.get('colors', [])
    options = vg.get('options', [])
    combos = vg.get('combos', [])
    
    # Check images across combos
    combo_img_map = {}
    for c in combos:
        c_key = f"color='{c.get('color')}' | opt='{c.get('option')}'"
        c_imgs = c.get('images', [])
        combo_img_map[c_key] = c_imgs
        
    unique_imgs = set(img for imgs in combo_img_map.values() for img in imgs)
    
    print(f"\n[Product {pid}] '{name}' ({len(combos)} combos, {len(colors)} colors, {len(options)} options, {len(unique_imgs)} unique images):")
    for k, imgs in combo_img_map.items():
        print(f"   {k} -> {imgs}")
