#!/usr/bin/env python3
"""Read public OG/gallery photo URLs from Forel Dan's own product pages.
No product images are rehosted; the website links to the original photo.
"""
from html.parser import HTMLParser
from urllib.request import Request, urlopen
from urllib.parse import quote, urljoin, urlparse
from pathlib import Path
import json, re
PAGES={
 "white-trout":"https://forel-dan.co.il/product/white-trout/",
 "pink-trout":"https://forel-dan.co.il/product/pink-trout/",
 "family-trout":"https://forel-dan.co.il/product/פורל-משפחתי/",
 "frozen-trout":"https://forel-dan.co.il/product/פורל-חמישיות-קפוא/",
 "smoked-trout":"https://forel-dan.co.il/product/פילה-פורל-מעושן/",
 "cold-smoked-trout":"https://forel-dan.co.il/product/פורל-בעישון-קר/",
}
class Photos(HTMLParser):
 def __init__(self):
  super().__init__()
  self.candidates=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=="meta":
   p=(a.get("property") or a.get("name") or "").lower()
   if p in ("og:image","og:image:url","twitter:image"):self.candidates.append((0,a.get("content") or ""))
  if tag=="img":
   cls=a.get("class") or ""
   src=a.get("data-large_image") or a.get("data-src") or a.get("src") or ""
   if src:self.candidates.append((1 if "wp-post-image" in cls or "woocommerce-product-gallery" in cls else 3,src))
  if tag=="a":
   cls=a.get("class") or ""
   if "woocommerce-product-gallery__image" in cls:self.candidates.append((2,a.get("href") or ""))
def load(url):
 req=Request(url,headers={"User-Agent":"Mozilla/5.0 (compatible; OhotnikProductCard/1.0)","Accept":"text/html"})
 with urlopen(req,timeout=15) as r:
  return r.read(2_000_000).decode("utf-8","ignore")
def photo(page):
 html=load(quote(page,safe=":/?=&%"));p=Photos();p.feed(html)
 print("DEBUG",page,"candidates",len(p.candidates),"samples",p.candidates[:8])
 for _,image in sorted(p.candidates):
  if not image:continue
  u=urljoin(page,image.strip())
  host=urlparse(u).hostname or ""
  if host not in ("forel-dan.co.il","www.forel-dan.co.il"):continue
  if "logo" in u.lower() or "placeholder" in u.lower():continue
  if not re.search(r"\.(jpg|jpeg|png|webp|avif|gif)(\?|$)",u,re.I):continue
  return u
 return None
def main():
 path=Path(__file__).resolve().parents[1]/"farm-photos.json"
 existing=json.loads(path.read_text(encoding="utf-8"))
 result=dict(existing)
 for key,page in PAGES.items():
  try:
   found=photo(page)
   if found:
    result[key]=found
    print(key,found)
   else:print("NO IMAGE",key)
  except Exception as e:print("ERROR",key,type(e).__name__,str(e)[:90])
 if len(result)>len(existing):
  path.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
 print("valid photo URLs:",len(result))
if __name__=="__main__":main()
