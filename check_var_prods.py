import requests

r = requests.get('http://127.0.0.1:8100/api/shop/products')
products = r.json().get('products', [])

var_prods = [p for p in products if p.get('var_group')]
print(f'Total products with var_group: {len(var_prods)}')
for p in var_prods:
    vg = p['var_group']
    combos = vg.get('combos', [])
    cols = vg.get('colors', [])
    opts = vg.get('options', [])
    print(f"ID {p['id']}: {p['name']} | Colors ({len(cols)}): {cols} | Options ({len(opts)}): {opts} | Combos: {len(combos)}")
    for c in combos[:3]:
        print(f"    Combo {c.get('id')}: col={c.get('color')} opt={c.get('option')} imgs={c.get('images')}")
