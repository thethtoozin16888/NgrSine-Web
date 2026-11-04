import requests
import json
import sqlite3

resp = requests.get('http://127.0.0.1:8100/api/shop/products')
products = resp.json()['products']

print(f"Total API products: {len(products)}")

# Check each product's media, var_group, combos, and image switching logic
print("\n--- SIMULATING PRODUCT MODAL FOR EACH PRODUCT ---")

modal_issues = []

for p in products:
    pid = p['id']
    name = p['name']
    thumb = p.get('thumb')
    images = p.get('images', [])
    videos = p.get('videos', [])
    vg = p.get('var_group')
    
    # 1. Base media check
    if not thumb and not images and not videos:
        modal_issues.append((pid, name, "NO_MEDIA", "Product has zero media"))
        continue
        
    # 2. Check if product has var_group
    if vg:
        colors = vg.get('colors', [])
        options = vg.get('options', [])
        combos = vg.get('combos', [])
        
        # Check if selecting any color or option finds a combo
        for c in colors:
            for o in options:
                matched = [x for x in combos if x.get('color') == c and x.get('option') == o]
                if not matched:
                    # Partial match?
                    pass
        
        # Check if combos have images
        combos_without_images = []
        for combo in combos:
            c_imgs = combo.get('images', [])
            if not c_imgs:
                combos_without_images.append((combo['id'], combo.get('color'), combo.get('option')))
        if combos_without_images:
            modal_issues.append((pid, name, "COMBO_WITHOUT_IMAGE", combos_without_images))
            
        # Check if changing color or option actually has different images to show
        # If there are multiple colors or options, do they have distinct images?
        color_image_map = {}
        for combo in combos:
            col = combo.get('color')
            c_imgs = combo.get('images', [])
            if col:
                color_image_map.setdefault(col, set()).update(c_imgs)
                
        if len(colors) > 1:
            all_color_imgs = set()
            identical_colors = True
            first_imgs = None
            for col in colors:
                imgs = color_image_map.get(col, set())
                if first_imgs is None:
                    first_imgs = imgs
                elif imgs != first_imgs:
                    identical_colors = False
            if identical_colors:
                modal_issues.append((pid, name, "COLORS_HAVE_SAME_IMAGES", f"{len(colors)} colors share same images: {first_imgs}"))

print(f"\nTotal Modal Issues found: {len(modal_issues)}")
for iss in modal_issues:
    print(f"\n[Issue] Product {iss[0]}: '{iss[1]}' -> {iss[2]}")
    print(f"   Detail: {iss[3]}")
