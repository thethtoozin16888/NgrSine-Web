import requests

data = requests.get('http://127.0.0.1:8100/api/shop/products').json()
products = data.get('products', [])

for pid in [4, 13, 14, 80, 92, 93]:
    p = next((x for x in products if x['id'] == pid), None)
    if p:
        print(f"Product {p['id']} '{p['name']}': thumb={p.get('thumb')}, images={p.get('images')}, videos={p.get('videos')}")
        if p.get('thumb'):
            r = requests.get('http://127.0.0.1:8100' + p['thumb'])
            print(f"   thumb HTTP: {r.status_code}, size: {len(r.content)}")
