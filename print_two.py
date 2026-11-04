import requests
import json

resp = requests.get('http://127.0.0.1:8100/api/shop/products')
prods = resp.json()['products']

for p in prods:
    if p['name'] in ['Mini Jewel box', 'Aolion k20']:
        print("=" * 60)
        print("PRODUCT:", p['name'])
        print(json.dumps(p, indent=2, ensure_ascii=False))
