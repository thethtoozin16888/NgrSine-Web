import sqlite3

conn = sqlite3.connect('/home/pi/ngr-sine-system/data/pos.db')
conn.row_factory = sqlite3.Row

rows = conn.execute("SELECT id, name, category, colors, sub_category, image, stock_status FROM products WHERE category = 'Accessories'").fetchall()
print(f"Total Accessories: {len(rows)}")
for r in rows:
    print(dict(r))

conn.close()
