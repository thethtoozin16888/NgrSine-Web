import urllib.request
import ssl

ctx = ssl.create_default_context()

urls = [
    'https://ngrsine.com/data/images/e71b26b931034fa1b979913b39692004.jpg',
    'https://ngrsine.com/data/images/1f6cc5a19b6440e5b214455c203e5edc.jpg',
    'https://ngrsine.com/data/images/e6d1c109beba4596be4759c5c0beda66.jpg',
    'https://ngrsine.com/data/product/383/5c39a367115144a184998f41a9b6ce39.jpeg',
    'https://ngrsine.com/data/product/383/904a9b8ee9bc44ce888299dd25e87619.jpeg'
]

for u in urls:
    try:
        req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'})
        with urllib.request.urlopen(req, timeout=10, context=ctx) as r:
            body = r.read()
            print(f"[{r.status}] {len(body)} bytes -> {u}")
    except Exception as e:
        print(f"[FAILED] {e} -> {u}")
