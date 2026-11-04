import requests

data = requests.get('http://127.0.0.1:8100/api/shop/products').json()
products = data.get('products', [])

video_thumbs = []
for p in products:
    thumb = (p.get('thumb') or '').lower()
    if any(thumb.endswith(ext) for ext in ['.mp4', '.webm', '.mov', '.ogg']):
        video_thumbs.append((p['id'], p['name'], p.get('thumb')))

print(f"Products where thumb is a video: {len(video_thumbs)}")
for vt in video_thumbs:
    print(f"  ID {vt[0]} '{vt[1]}': {vt[2]}")
