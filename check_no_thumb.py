import requests

data = requests.get('http://127.0.0.1:8100/api/shop/products').json()
products = data.get('products', [])

for p in products:
    thumb = p.get('thumb')
    imgs = p.get('images') or []
    vg = p.get('var_group')
    if not thumb:
        print(f"Product {p['id']} '{p['name']}': NO THUMB! images={imgs}, has_vg={vg is not None}")
