import sqlite3
import subprocess
import os

db_path = '/home/pi/ngr-sine-system/data/pos.db'
data_dir = '/home/pi/ngr-sine-system/data'
images_dir = os.path.join(data_dir, 'images')

conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row

# Find all AVIF files in products and product_media
p_rows = conn.execute("SELECT id, image FROM products WHERE image LIKE '%.avif'").fetchall()
m_rows = conn.execute("SELECT id, product_id, filename FROM product_media WHERE filename LIKE '%.avif'").fetchall()

print(f"Products with AVIF image: {len(p_rows)}")
print(f"Product media rows with AVIF: {len(m_rows)}")

# Collect all unique AVIF filenames
avif_files = set()
for r in p_rows:
    avif_files.add((r['image'], r['id']))
for r in m_rows:
    avif_files.add((r['filename'], r['product_id']))

# Also check filesystem for any other .avif files
for f in os.listdir(images_dir):
    if f.lower().endswith('.avif'):
        avif_files.add((f, None))

media_dir = os.path.join(data_dir, 'media')
if os.path.exists(media_dir):
    for sub in os.listdir(media_dir):
        sub_p = os.path.join(media_dir, sub)
        if os.path.isdir(sub_p):
            for f in os.listdir(sub_p):
                if f.lower().endswith('.avif'):
                    avif_files.add((f, int(sub) if sub.isdigit() else None))

print(f"Total unique AVIF references found: {len(avif_files)}")

converted_map = {}

for fn, pid in avif_files:
    base, _ = os.path.splitext(fn)
    new_fn = base + '.jpg'
    
    # Check paths
    paths_to_convert = []
    
    img_path = os.path.join(images_dir, fn)
    if os.path.exists(img_path):
        paths_to_convert.append((img_path, os.path.join(images_dir, new_fn)))
        
    if pid is not None:
        p_media_path = os.path.join(data_dir, 'media', str(pid), fn)
        if os.path.exists(p_media_path):
            paths_to_convert.append((p_media_path, os.path.join(data_dir, 'media', str(pid), new_fn)))

    for src, dst in paths_to_convert:
        if not os.path.exists(dst):
            print(f"Converting: {src} -> {dst}")
            cmd = ['ffmpeg', '-y', '-i', src, '-frames:v', '1', '-q:v', '2', dst]
            res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            if res.returncode != 0:
                print(f"ERROR converting {src}: {res.stderr.decode('utf-8', errors='ignore')}")
            else:
                print(f"SUCCESS: Created {dst} ({os.path.getsize(dst)} bytes)")
                
    converted_map[fn] = new_fn

# Update database
for old_fn, new_fn in converted_map.items():
    cur1 = conn.execute("UPDATE products SET image=? WHERE image=?", (new_fn, old_fn))
    cur2 = conn.execute("UPDATE product_media SET filename=? WHERE filename=?", (new_fn, old_fn))
    if cur1.rowcount > 0 or cur2.rowcount > 0:
        print(f"DB updated: '{old_fn}' -> '{new_fn}' (products: {cur1.rowcount}, media: {cur2.rowcount})")

conn.commit()
conn.close()
print("All AVIF conversions and DB updates complete!")
