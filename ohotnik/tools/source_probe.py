#!/usr/bin/env python3
from urllib.request import Request,urlopen
from urllib.parse import urlparse
from urllib.robotparser import RobotFileParser
import xml.etree.ElementTree as ET
import json
import re,json,html
SITES=["https://www.homecenter.co.il","https://www.ace.co.il"]
def fetch(url,limit=4000000):
 with urlopen(Request(url,headers={"User-Agent":"OhotnikCatalogBot/1.0 (respectful low rate)","Accept":"application/xml,text/html,*/*"}),timeout=12) as r:
  return r.read(limit).decode("utf-8","replace")
for origin in SITES:
 print("SITE",origin,flush=True)
 bot=RobotFileParser();bot.set_url(origin+"/robots.txt");bot.read()
 try:
  xml=fetch(origin+"/sitemap.xml")
  root=ET.fromstring(xml)
  urls=[e.text for e in root.iter() if e.tag.endswith("loc") and e.text]
  print("SITEMAP LINKS",len(urls),"sample",urls[:9],flush=True)
  products=[u for u in urls if "product" in u.lower() or "sitemap" in u.lower()]
  selected=(products[1:3] if origin.endswith("homecenter.co.il") else products[1:3])
  for suburl in selected:
   if not bot.can_fetch("OhotnikCatalogBot",suburl):print("SITEMAP DISALLOWED",suburl);continue
   content=fetch(suburl)
   print("SUB",suburl,"SIZE",len(content),"HEAD",content[:420].replace("\n"," "),flush=True)
   try:
    subroot=ET.fromstring(content)
    sublocs=[e.text for e in subroot.iter() if e.tag.endswith("loc") and e.text]
   except Exception as exc:print("SUBPARSE",repr(exc));continue
   print("PRODUCT URLS",len(sublocs),"SAMPLE",sublocs[:5],flush=True)
   print("IMG TITLE",[e.text for e in subroot.iter() if "title" in e.tag or "caption" in e.tag][:5],flush=True)
   for prod in [u for u in sublocs if "/products/" in u or re.search(r"/\d{5,}$",u)][:1]:
    if not bot.can_fetch("OhotnikCatalogBot",prod):print("PRODUCT DISALLOWED",prod);continue
    p=fetch(prod,limit=140000)
    print("PRODUCT",prod,"length",len(p),"title",re.findall(r"<title[^>]*>(.*?)</title>",p,re.I|re.S)[:1],flush=True)
    print("OG IMG",re.findall(r'<meta[^>]+(?:og:image|twitter:image)[^>]*>',p,re.I)[:3],flush=True)
    print("JSONLD HEAD",[x[:450] for x in re.findall(r'<script[^>]+application/ld\+json[^>]*>(.*?)</script>',p,re.S|re.I)[:2]],flush=True)
 except Exception as exc:print("ERROR",type(exc).__name__,str(exc)[:250],flush=True)


import urllib.request
def probe_shopify():
 origin="https://www.homecenter.co.il"
 rb=RobotFileParser();rb.set_url(origin+"/robots.txt");rb.read()
 for url in [origin+"/products.json?limit=10",origin+"/products/1214106334.js"]:
  allowed=rb.can_fetch("OhotnikCatalogBot",url)
  print("SHOPIFY",url,"robots_allowed",allowed,flush=True)
  if not allowed:continue
  try:
   req=urllib.request.Request(url,headers={"User-Agent":"OhotnikCatalogBot/1.0","Accept":"application/json"})
   with urllib.request.urlopen(req,timeout=10) as r:
    body=r.read(500000)
    data=json.loads(body)
    products=data.get("products",[]) if isinstance(data,dict) else []
    p=products[0] if products else data
    variants=p.get("variants",[])
    print("SHOPIFY STATUS",r.status,"PRODUCT_COUNT",len(products),"FIRST",repr({k:p.get(k) for k in ("id","title","handle","price","available")}),"FIRST_VARIANT",repr(variants[0])[:420] if variants else None,flush=True)
  except Exception as e:print("SHOPIFY ERROR",type(e).__name__,str(e)[:200],flush=True)
probe_shopify()
