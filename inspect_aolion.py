import sqlite3
import requests
import json

conn = sqlite3.connect('/home/pi/ngr-sine-system/data/pos.db')
conn.row_factory = sqlite3.Row

print("--- SQLITE ROWS FOR AOLION ---")
rows = conn.execute("SELECT * FROM products WHERE name LIKE '%Aolion%'").fetchall()
for r in rows:
    print(dict(r))
    media = conn.execute("SELECT * FROM product_media WHERE product_id=?", (r['id'],)).fetchall()
    print("  Media:", [dict(m) for m in media])

print("\n--- API OUTPUT FOR AOLION ---")
resp = requests.get('http://127.0.0.1:8100/api/shop/products')
for p in resp.json()['products']:
    if 'aolion' in p['name'].lower():
        print(json.dumps(p, indent=2))

conn.close()
