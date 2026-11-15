#!/usr/bin/env python3
"""Validate the published index before GitHub Actions commits it."""
import json
import sys
from collections import Counter
from pathlib import Path
from urllib.parse import urlsplit

FILE = Path(__file__).resolve().parents[1] / "catalog-auto.json"
EXPECTED_HOST = {"Home Center": "www.homecenter.co.il", "ACE": "www.ace.co.il"}

def main():
    doc = json.loads(FILE.read_text(encoding="utf-8"))
    items = doc.get("items")
    if not isinstance(items, list):
        raise ValueError("Missing items list")
    urls = set()
    problems = []
    by_store = Counter()
    by_price = Counter()
    photo_count = 0
    for i, p in enumerate(items):
        store, url = p.get("store"), p.get("url")
        by_store[store] += 1
        if store not in EXPECTED_HOST:
            problems.append(f"row {i}: unknown seller {store}")
            continue
        parsed = urlsplit(url or "")
        if parsed.scheme != "https" or parsed.netloc != EXPECTED_HOST[store]:
            problems.append(f"row {i}: wrong store destination {url}")
        if store == "Home Center" and not parsed.path.startswith("/products/"):
            problems.append(f"row {i}: not a direct Home Center product {url}")
        if not parsed.path.strip("/"):
            problems.append(f"row {i}: empty product path")
        if url in urls:
            problems.append(f"row {i}: duplicate product {url}")
        urls.add(url)
        if not p.get("name") and not p.get("name_he"):
            problems.append(f"row {i}: missing name")
        if p.get("img"):
            photo_count += 1
        price = p.get("price")
        if price is not None:
            if type(price) not in (float, int) or not 0 < price < 1000000:
                problems.append(f"row {i}: invalid price {price}")
            else:
                by_price[store] += 1
        if p.get("price_is_from") and price is None:
            problems.append(f"row {i}: variant qualifier without price")
        if len(problems) > 20:
            break
    if len(items) < 6600 or sum(by_price.values()) < 5000:
        problems.append("index too small or lost the verified-price baseline")
    print("INDEX CHECK:", len(items), "products;", sum(by_price.values()),
          "retailer prices;", photo_count, "photos")
    for store in EXPECTED_HOST:
        print(store, "products", by_store[store], "priced", by_price[store])
    if problems:
        for err in problems[:20]:
            print("ERROR:", err, file=sys.stderr)
        return 1
    print("PASS: unique merchant URLs, prices and source ownership")
    return 0

if __name__ == "__main__":
    sys.exit(main())
