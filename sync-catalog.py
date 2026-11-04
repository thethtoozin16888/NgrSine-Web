#!/usr/bin/env python3
"""
NgrSine Shop - 1-Click Catalog & Media Synchronizer
Syncs products and thumbnails from local POS / Pi to the static cloud repository.
Usage:
    python sync-catalog.py [--push]
"""

import os
import sys
import json
import urllib.request
import subprocess
from datetime import datetime

PI_API_URL = os.environ.get("PI_API_URL", "http://192.168.100.20:8100/api/shop/products")
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PUBLIC_DIR = os.path.join(BASE_DIR, "public", "data")
THUMBS_DIR = os.path.join(PUBLIC_DIR, "thumbs")
PRODUCTS_JSON = os.path.join(PUBLIC_DIR, "products.json")

def main():
    print("=" * 60)
    print("NgrSine Shop Catalog Sync")
    print(f"Target API: {PI_API_URL}")
    print("=" * 60)

    os.makedirs(THUMBS_DIR, exist_ok=True)

    # 1. Fetch latest products from POS
    try:
        req = urllib.request.Request(PI_API_URL, headers={"User-Agent": "NgrSine-Sync/1.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        print(f"[ERROR] Could not connect to Pi POS at {PI_API_URL}: {e}")
        print("Please ensure the Pi is powered on and connected to the same Wi-Fi.")
        sys.exit(1)

    prods = data.get("products", [])
    cats = data.get("categories", [])
    print(f"Fetched {len(prods)} products across {len(cats)} categories.")

    # 2. Save products.json
    with open(PRODUCTS_JSON, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"[OK] Saved catalog to {PRODUCTS_JSON}")

    # 3. Collect all referenced image URLs
    referenced_urls = set()
    for p in prods:
        if p.get("thumb"):
            referenced_urls.add(p["thumb"])
        for img in (p.get("images") or []):
            if img:
                referenced_urls.add(img)
        for opt in (p.get("options") or []):
            for combo in (opt.get("combos") or []):
                for ci in (combo.get("images") or []):
                    if ci:
                        referenced_urls.add(ci)

    print(f"Checking {len(referenced_urls)} media files in catalog...")
    new_images = 0
    pi_host = urllib.parse.urlparse(PI_API_URL).netloc

    for url in referenced_urls:
        fname = os.path.basename(url)
        local_path = os.path.join(THUMBS_DIR, fname)
        if not os.path.exists(local_path):
            # Download from Pi
            img_url = f"http://{pi_host}{url}"
            try:
                urllib.request.urlretrieve(img_url, local_path)
                new_images += 1
            except Exception as e:
                print(f"  [WARN] Failed to download {img_url}: {e}")

    print(f"[OK] Media check completed. Downloaded {new_images} new images.")

    # 4. Optional Git Commit & Push
    if "--push" in sys.argv:
        print("\nCommitting and pushing to GitHub...")
        try:
            subprocess.run(["git", "add", "public/data/"], check=True)
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
            subprocess.run(["git", "commit", "-m", f"chore: sync catalog & media [{timestamp}]"], check=False)
            subprocess.run(["git", "push", "origin", "main"], check=True)
            print("[OK] Successfully pushed changes to GitHub! Cloudflare Pages will auto-deploy.")
        except Exception as e:
            print(f"[ERROR] Git push failed: {e}")

    print("\nSync completed successfully!")

if __name__ == "__main__":
    main()
