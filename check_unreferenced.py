import os
import sqlite3

conn = sqlite3.connect('/home/pi/ngr-sine-system/data/pos.db')
db_images = set(r[0] for r in conn.execute("SELECT image FROM products WHERE image != ''").fetchall())
media_images = set(r[0] for r in conn.execute("SELECT filename FROM product_media").fetchall())
all_db_files = db_images | media_images

disk_files = set(os.listdir('/home/pi/ngr-sine-system/data/images'))
unreferenced = disk_files - all_db_files
print(f"Unreferenced files in /data/images: {len(unreferenced)}")
for f in sorted(unreferenced)[:20]:
    sz = os.path.getsize(f'/home/pi/ngr-sine-system/data/images/{f}')
    print(f"  {f} ({sz} bytes)")
