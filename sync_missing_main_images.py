import sqlite3
import os
import shutil

db_path = '/home/pi/ngr-sine-system/data/pos.db'
data_dir = '/home/pi/ngr-sine-system/data'
upload_folder = os.path.join(data_dir, 'images')

conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row

rows = conn.execute("SELECT id, name, image FROM products WHERE image IS NULL OR image = '' OR image = 'None'").fetchall()
print(f"Products with empty image column: {len(rows)}")

fixed = 0
for r in rows:
    pid = r['id']
    # Find first image media (non-video)
    media = conn.execute(
        "SELECT filename, type FROM product_media WHERE product_id = ? AND type = 'image' ORDER BY sort_order, id LIMIT 1",
        (pid,)
    ).fetchone()
    if not media:
        # Check any media
        media = conn.execute(
            "SELECT filename, type FROM product_media WHERE product_id = ? ORDER BY sort_order, id LIMIT 1",
            (pid,)
        ).fetchone()
        
    if media:
        fn = media['filename']
        src = os.path.join(data_dir, 'media', str(pid), fn)
        dst = os.path.join(upload_folder, fn)
        if os.path.exists(src) and not os.path.exists(dst):
            try:
                shutil.copy2(src, dst)
            except Exception as e:
                print(f"Copy error for {src}: {e}")
                
        conn.execute("UPDATE products SET image = ? WHERE id = ?", (fn, pid))
        fixed += 1
        print(f"Fixed product {pid} ('{r['name']}'): image set to '{fn}'")

conn.commit()
conn.close()
print(f"Successfully synced {fixed} products' main image!")
