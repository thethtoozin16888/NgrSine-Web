import requests
import json

resp = requests.get('http://127.0.0.1:8100/api/shop/products')
data = resp.json()
products = data.get('products', [])

print(f"=== FULL SHOP CATALOG AUDIT: {len(products)} PRODUCTS ===")

total_images_checked = 0
products_with_issues = []

for idx, p in enumerate(products):
    pid = p['id']
    name = p['name']
    cat = p.get('category', '')
    thumb = p.get('thumb', '')
    images = p.get('images', [])
    videos = p.get('videos', [])
    vg = p.get('var_group')
    
    issues = []
    
    # Check 1: Does the product card have a valid thumbnail?
    card_thumb = thumb or (images[0] if images else '')
    if not card_thumb:
        issues.append("NO_CARD_THUMB: Product card has no thumbnail image")
    else:
        # Check HTTP
        total_images_checked += 1
        try:
            r = requests.head('http://127.0.0.1:8100' + card_thumb, timeout=3)
            if r.status_code != 200:
                issues.append(f"BROKEN_CARD_THUMB: {card_thumb} -> HTTP {r.status_code}")
        except Exception as e:
            issues.append(f"FETCH_ERROR_CARD_THUMB: {card_thumb} -> {e}")
            
    # Check 2: Check all product images
    for img in images:
        total_images_checked += 1
        try:
            r = requests.head('http://127.0.0.1:8100' + img, timeout=3)
            if r.status_code != 200:
                issues.append(f"BROKEN_PRODUCT_IMAGE: {img} -> HTTP {r.status_code}")
        except Exception as e:
            issues.append(f"FETCH_ERROR_PRODUCT_IMAGE: {img} -> {e}")
            
    # Check 3: Check all product videos
    for vid in videos:
        total_images_checked += 1
        try:
            r = requests.head('http://127.0.0.1:8100' + vid, timeout=3)
            if r.status_code != 200:
                issues.append(f"BROKEN_PRODUCT_VIDEO: {vid} -> HTTP {r.status_code}")
        except Exception as e:
            issues.append(f"FETCH_ERROR_PRODUCT_VIDEO: {vid} -> {e}")
            
    # Check 4: If var_group exists, check all combo images and videos
    if vg:
        combos = vg.get('combos', [])
        if not combos:
            issues.append("EMPTY_COMBOS: var_group exists but combos array is empty")
        for c in combos:
            cid = c.get('id')
            c_imgs = c.get('images', [])
            if not c_imgs:
                issues.append(f"COMBO_WITHOUT_IMAGE: Combo {cid} (Color: '{c.get('color')}', Opt: '{c.get('option')}') has no image")
            for ci in c_imgs:
                total_images_checked += 1
                try:
                    r = requests.head('http://127.0.0.1:8100' + ci, timeout=3)
                    if r.status_code != 200:
                        issues.append(f"BROKEN_COMBO_IMAGE: Combo {cid} image {ci} -> HTTP {r.status_code}")
                except Exception as e:
                    issues.append(f"FETCH_ERROR_COMBO_IMAGE: Combo {cid} image {ci} -> {e}")
                    
    if issues:
        products_with_issues.append((pid, name, cat, issues))

print(f"\nAudit completed. Total images/media verified: {total_images_checked}")
print(f"Products with any media issues: {len(products_with_issues)}")

if products_with_issues:
    for p in products_with_issues:
        print(f"\n[ISSUE] Product {p[0]}: '{p[1]}' ({p[2]})")
        for iss in p[3]:
            print(f"   - {iss}")
else:
    print("\nALL 166 PRODUCTS PASSED 100%! ZERO MEDIA ISSUES FOUND!")
