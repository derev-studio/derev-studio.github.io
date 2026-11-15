#!/usr/bin/env python3
from urllib.request import Request,urlopen
from urllib.parse import urlparse
from urllib.robotparser import RobotFileParser
import xml.etree.ElementTree as ET
import re,json,html
SITES=["https://www.homecenter.co.il","https://www.ace.co.il"]
def fetch(url,limit=180000):
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
  selected=(products or urls)[:2]
  for suburl in selected:
   if not bot.can_fetch("OhotnikCatalogBot",suburl):print("SITEMAP DISALLOWED",suburl);continue
   content=fetch(suburl)
   print("SUB",suburl,"SIZE",len(content),"HEAD",content[:420].replace("\n"," "),flush=True)
   try:
    subroot=ET.fromstring(content)
    sublocs=[e.text for e in subroot.iter() if e.tag.endswith("loc") and e.text]
   except Exception as exc:print("SUBPARSE",repr(exc));continue
   print("PRODUCT URLS",len(sublocs),"SAMPLE",sublocs[:5],flush=True)
   for prod in sublocs[:1]:
    if not bot.can_fetch("OhotnikCatalogBot",prod):print("PRODUCT DISALLOWED",prod);continue
    p=fetch(prod,limit=140000)
    print("PRODUCT",prod,"length",len(p),"title",re.findall(r"<title[^>]*>(.*?)</title>",p,re.I|re.S)[:1],flush=True)
    print("OG IMG",re.findall(r'<meta[^>]+(?:og:image|twitter:image)[^>]*>',p,re.I)[:3],flush=True)
    print("JSONLD HEAD",[x[:450] for x in re.findall(r'<script[^>]+application/ld\+json[^>]*>(.*?)</script>',p,re.S|re.I)[:2]],flush=True)
 except Exception as exc:print("ERROR",type(exc).__name__,str(exc)[:250],flush=True)
