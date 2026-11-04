import requests

prods = requests.get('http://127.0.0.1:8100/api/shop/products').json()['products']
avif_products = []

for p in prods:
    urls = []
    if p.get('thumb'):
        urls.append(p['thumb'])
    for u in p.get('images', []):
        urls.append(u)
    if p.get('var_group'):
        for c in p['var_group'].get('combos', []):
            for u in c.get('images', []):
                urls.append(u)
    avifs = [u for u in urls if u and '.avif' in u.lower()]
    if avifs:
        avif_products.append((p['id'], p['name'], set(avifs)))

print(f"Total products with AVIF images: {len(avif_products)}")
for p in avif_products:
    print(f"Product {p[0]}: '{p[1]}'")
    for u in p[2]:
        print(f"   {u}")
