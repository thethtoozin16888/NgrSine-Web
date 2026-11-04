import requests

resp = requests.get('http://127.0.0.1:8100/api/shop/products')
prods = resp.json()['products']

print("=== CHECKING PRODUCTS WITH OPTIONS/COLORS AND THEIR PHOTOS ===")
for p in prods:
    vg = p.get('var_group')
    if not vg:
        continue
    combos = vg.get('combos', [])
    colors = vg.get('colors', [])
    options = vg.get('options', [])
    
    # Collect all image URLs per color
    color_to_imgs = {}
    for c in combos:
        col = c.get('color') or 'default'
        color_to_imgs.setdefault(col, []).extend(c.get('images', []))
        
    # Collect all image URLs per option
    opt_to_imgs = {}
    for c in combos:
        opt = c.get('option') or 'default'
        opt_to_imgs.setdefault(opt, []).extend(c.get('images', []))
        
    # Check if there are multiple colors, but all colors have the same images
    if len(colors) > 1:
        first_c_imgs = list(dict.fromkeys(color_to_imgs.get(colors[0], [])))
        same_c = True
        for col in colors[1:]:
            c_imgs = list(dict.fromkeys(color_to_imgs.get(col, [])))
            if c_imgs != first_c_imgs:
                same_c = False
                break
        if same_c:
            print(f"[SAME COLOR IMAGES] Product {p['id']}: '{p['name']}' has {len(colors)} colors, but all colors share the same images: {first_c_imgs}")
            
    # Check if there are multiple options, but all options have the same images
    if len(options) > 1:
        first_o_imgs = list(dict.fromkeys(opt_to_imgs.get(options[0], [])))
        same_o = True
        for opt in options[1:]:
            o_imgs = list(dict.fromkeys(opt_to_imgs.get(opt, [])))
            if o_imgs != first_o_imgs:
                same_o = False
                break
        if same_o:
            print(f"[SAME OPTION IMAGES] Product {p['id']}: '{p['name']}' has {len(options)} options, but all options share the same images: {first_o_imgs}")
