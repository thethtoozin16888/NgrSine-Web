import sqlite3

conn = sqlite3.connect('/home/pi/ngr-sine-system/data/pos.db')
conn.row_factory = sqlite3.Row

rows = conn.execute("SELECT id, name, category, image FROM products WHERE image = 'None' OR image = 'null' OR image = '' OR image IS NULL").fetchall()
print(f"Products with blank, null, or 'None' image: {len(rows)}")
for r in rows:
    media = conn.execute("SELECT filename FROM product_media WHERE product_id=?", (r['id'],)).fetchall()
    print(f"ID {r['id']:3d} | Name: '{r['name']}' | Image: {repr(r['image'])} | Media count: {len(media)}")

conn.close()
