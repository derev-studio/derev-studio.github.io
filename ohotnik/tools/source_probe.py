#!/usr/bin/env python3
from urllib.request import Request,urlopen
from urllib.parse import urlparse
import urllib.robotparser
TARGETS=[
 "https://www.erco.co.il/b2c/",
 "https://www.ivory.co.il/",
 "https://www.homecenter.co.il/",
 "https://www.ace.co.il/",
 "https://www.victoryonline.co.il/"
]
for base in TARGETS:
 print("DOMAIN",base,flush=True)
 origin=urlparse(base).scheme+"://"+urlparse(base).netloc
 try:
  robot=urllib.robotparser.RobotFileParser();robot.set_url(origin+"/robots.txt");robot.read()
  print("ROBOTS",[(p,robot.can_fetch("OhotnikCatalogBot",origin+p)) for p in ["/","/sitemap.xml","/b2c/sitemap.xml","/catalogsearch/result/?q=foo"]],flush=True)
 except Exception as exc: print("ROBOTS ERROR",repr(exc),flush=True);continue
 for path in ["/sitemap.xml","/sitemap_index.xml","/sitemap_products_1.xml"]:
  u=origin+path
  if not robot.can_fetch("OhotnikCatalogBot",u):continue
  try:
   rq=Request(u,headers={"User-Agent":"OhotnikCatalogBot/1.0 (catalog feed discovery, low rate)","Accept":"application/xml,text/xml,text/plain"})
   with urlopen(rq,timeout=7) as r:
    data=r.read(900).decode("utf8","replace");print("URL",u,"STATUS",r.status,"TYPE",r.headers.get("content-type"),"SAMPLE",data[:200].replace("\n"," "),flush=True)
  except Exception as exc: print("URL",u,"ERROR",str(exc)[:130],flush=True)
