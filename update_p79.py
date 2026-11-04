import sqlite3

conn = sqlite3.connect('/home/pi/ngr-sine-system/data/pos.db')
conn.execute("UPDATE products SET image='kerastase_shampoo.jpg' WHERE id=79")
conn.commit()
r = conn.execute("SELECT id, name, category, image FROM products WHERE id=79").fetchone()
print("Updated Product 79:", r)
conn.close()
