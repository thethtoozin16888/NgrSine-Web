import requests

r = requests.get('http://127.0.0.1:8100/api/shop/products')
data = r.json()
products = data.get('products', [])
print(f'Total products returned by API: {len(products)}')

broken_products = []

for p in products:
    p_id = p.get('id')
    p_name = p.get('name')
    urls_to_test = set()
    
    if p.get('thumb'):
        urls_to_test.add(p['thumb'])
    for img in p.get('images', []):
        urls_to_test.add(img)
        
    vg = p.get('var_group')
    if vg and 'combos' in vg:
        for c in vg['combos']:
            for img in c.get('images', []):
                urls_to_test.add(img)
                
    errors = []
    for u in urls_to_test:
        if not u.startswith('/'):
            u = '/' + u
        full_url = f'http://127.0.0.1:8100{u}'
        try:
            head = requests.head(full_url, timeout=3)
            if head.status_code != 200:
                get_r = requests.get(full_url, timeout=3, stream=True)
                if get_r.status_code != 200:
                    errors.append((u, get_r.status_code))
        except Exception as e:
            errors.append((u, str(e)))
            
    if errors:
        broken_products.append({
            'id': p_id,
            'name': p_name,
            'errors': errors
        })

print(f'\nTotal broken products: {len(broken_products)}')
for bp in broken_products:
    print(f"ID: {bp['id']} | Name: {bp['name']}")
    for err in bp['errors']:
        print(f"   URL: {err[0]} -> {err[1]}")
