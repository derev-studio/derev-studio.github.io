#!/usr/bin/env python3
"""Incremental public product index (ACE + Home Center).

Uses the stores' published product sitemaps, honoring robots.txt.
Never bypasses access restrictions. Product prices are read only from each
store's own public product metadata, never copied from another retailer.
"""
from __future__ import annotations
import datetime as dt
import hashlib
import html
import json
import re
import sys
import time
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
from urllib.request import Request, urlopen
from urllib.robotparser import RobotFileParser

ROOT=Path(__file__).resolve().parents[1]
DEST=ROOT/"catalog-auto.json"
AGENT="OhotnikCatalogBot/1.0 (public product sitemap index; respectful low rate)"
SOURCES=[
    ("Home Center","https://www.homecenter.co.il",12,400),
    ("ACE","https://www.ace.co.il",6,300),
]
TODAY=dt.date.today().isoformat()
MAX_DETAIL_PAGES=16
DELAY_SECONDS=0.45

def request(url,limit=2500000):
    req=Request(url,headers={"User-Agent":AGENT,"Accept":"application/xml,application/json,text/html,*/*"})
    with urlopen(req,timeout=20) as r:
        return r.read(limit)

def robots(origin):
    r=RobotFileParser()
    r.set_url(origin+"/robots.txt")
    r.read()
    return r

def locs(blob):
    root=ET.fromstring(blob)
    return [n.text for n in root.iter() if n.tag.endswith("loc") and n.text]

def trim(text):
    return re.sub(r"\s+"," ",html.unescape(str(text or ""))).strip()

def parse_feed(source,origin,feed_url,rb,max_items):
    found=[]
    if not rb.can_fetch(AGENT,feed_url):
        print("skip disallowed feed",feed_url,flush=True)
        return found
    req=Request(feed_url,headers={"User-Agent":AGENT,"Accept":"application/xml,text/xml"})
    with urlopen(req,timeout=30) as resp:
        for event,entry in ET.iterparse(resp,events=("end",)):
            if not entry.tag.endswith("}url") and entry.tag!="url":
                continue
            product_url=None;name=None;image=None
            for el in entry:
                tag=el.tag.split("}")[-1]
                if tag=="loc":product_url=trim(el.text)
                elif tag=="image":
                    for img in el:
                        k=img.tag.split("}")[-1]
                        if k=="loc" and not image:image=trim(img.text)
                        if k in ("title","caption") and not name:name=trim(img.text)
            if not product_url or urlsplit(product_url).hostname!=urlsplit(origin).hostname:
                entry.clear();continue
            if source=="Home Center" and "/products/" not in urlsplit(product_url).path:
                entry.clear();continue
            if source=="ACE":
                path=urlsplit(product_url).path
                if not re.search(r"/(?:[a-z0-9-]*\d{4,})(?:\.html)?$",path,re.I):
                    entry.clear();continue
            if not rb.can_fetch(AGENT,product_url):
                entry.clear();continue
            if image and not image.startswith("https://"):image=None
            if name:
                found.append({
                    "id":source.replace(" ","-").lower()+"-"+hashlib.sha1(product_url.encode()).hexdigest()[:16],
                    "name":name,"name_he":name,"price":None,"img":image or "",
                    "brand":"","category":"all","store":source,
                    "url":product_url,"as_of":TODAY,"verified":"public_sitemap"
                })
            entry.clear()
            if len(found)>=max_items:break
    print(source,"feed",feed_url.split("?")[0].rsplit("/",1)[-1],"items",len(found),flush=True)
    return found

class SchemaScripts(HTMLParser):
    def __init__(self):
        super().__init__()
        self.collect=False;self.current=[];self.scripts=[]
    def handle_starttag(self,tag,attrs):
        if tag=="script" and "ld+json" in dict(attrs).get("type","").lower():
            self.collect=True;self.current=[]
    def handle_data(self,data):
        if self.collect:self.current.append(data)
    def handle_endtag(self,tag):
        if tag=="script" and self.collect:
            self.scripts.append("".join(self.current))
            self.collect=False

def first_product_data(doc):
    if isinstance(doc,list):
        for d in doc:
            result=first_product_data(d)
            if result:return result
        return None
    if not isinstance(doc,dict):return None
    t=doc.get("@type","")
    if (isinstance(t,str) and t.lower()=="product") or (isinstance(t,list) and any(str(x).lower()=="product" for x in t)):
        return doc
    for key in ("@graph","mainEntity","itemListElement"):
        if key in doc:
            found=first_product_data(doc[key])
            if found:return found
    return None

def enrich_product(p,rb):
    if not rb.can_fetch(AGENT,p["url"]):return p
    url=p["url"]
    if p["store"]=="Home Center":
        # Shopify's public product endpoint supplies variant prices in agorot.
        js=url.split("?",1)[0]+".js"
        if rb.can_fetch(AGENT,js):
            try:
                doc=json.loads(request(js,limit=1400000))
                title=trim(doc.get("title"))
                if title:p["name"]=title;p["name_he"]=title
                variants=doc.get("variants") or []
                valid=[v for v in variants if v.get("available") and isinstance(v.get("price"),(int,float)) and v["price"]>0]
                candidate=valid[0] if valid else (variants[0] if variants else {})
                price=candidate.get("price")
                if isinstance(price,(int,float)) and price>0:
                    p["price"]=round(price/100,2)
                    p["as_of"]=TODAY
                    p["verified"]="store_product_api"
                images=doc.get("images") or []
                if images:
                    img=images[0]
                    if isinstance(img,str) and img.startswith("//"):img="https:"+img
                    if isinstance(img,str) and img.startswith("https://"):p["img"]=img
                return p
            except Exception as e:print("Shopify item failed",type(e).__name__,str(e)[:90],flush=True)
    try:
        page=request(url,limit=900000).decode("utf-8","ignore")
        parser=SchemaScripts();parser.feed(page)
        for raw in parser.scripts:
            try:prod=first_product_data(json.loads(raw))
            except (ValueError,TypeError):continue
            if not prod:continue
            title=trim(prod.get("name"))
            if title:p["name"]=title;p["name_he"]=title
            brand=prod.get("brand")
            p["brand"]=trim(brand.get("name") if isinstance(brand,dict) else brand)
            image=prod.get("image")
            if isinstance(image,list):image=image[0] if image else None
            if isinstance(image,dict):image=image.get("url")
            if isinstance(image,str) and image.startswith("https://"):p["img"]=image
            offers=prod.get("offers")
            if isinstance(offers,list):offers=offers[0] if offers else None
            if isinstance(offers,dict):
                amount=offers.get("price")
                if not amount:amount=(offers.get("priceSpecification") or {}).get("price")
                curr=offers.get("priceCurrency") or "ILS"
                try:
                    value=float(str(amount).replace(",",""))
                    if 0<value<1000000 and curr in ("ILS","NIS","₪"):
                        p["price"]=round(value,2);p["as_of"]=TODAY;p["verified"]="store_product_schema"
                except (TypeError,ValueError):pass
            return p
    except Exception as e:print("HTML product failed",type(e).__name__,str(e)[:90],flush=True)
    return p

def main():
    existing={}
    if DEST.exists():
        try:existing={item["url"]:item for item in json.loads(DEST.read_text("utf-8")).get("items",[]) if item.get("url")}
        except (ValueError,KeyError,TypeError):pass
    updates=0;network_ok=0
    for source,origin,shard_limit,per_shard in SOURCES:
        try:
            rb=robots(origin)
            index_url=origin+"/sitemap.xml"
            if not rb.can_fetch(AGENT,index_url):print("skip blocked site",source);continue
            sitemap_urls=locs(request(index_url,limit=1000000))
            shards=[x for x in sitemap_urls if x.startswith(origin) and ("sitemap_products_" in x or (source=="ACE" and re.search(r"sitemap-\d+-[2-9]\.xml",x)))]
            shards=shards[:shard_limit]
            print("Sitemap shards",source,len(shards),flush=True)
            for url in shards:
                try:
                    items=parse_feed(source,origin,url,rb,per_shard)
                    network_ok+=1
                    for item in items:
                        prev=existing.get(item["url"])
                        if prev:
                            if prev.get("price") is not None:item["price"]=prev.get("price")
                            for k in ("brand","img"):
                                if prev.get(k) and not item.get(k):item[k]=prev[k]
                            if prev.get("name") and len(prev["name"])>len(item["name"]):
                                item["name"]=prev["name"];item["name_he"]=prev["name_he"]
                            if prev.get("verified") in ("store_product_api","store_product_schema"):
                                item["verified"]=prev["verified"];item["as_of"]=prev.get("as_of")
                        else:updates+=1
                        existing[item["url"]]=item
                except Exception as e:print("FEED ERROR",source,type(e).__name__,str(e)[:180],flush=True)
                time.sleep(DELAY_SECONDS)
        except Exception as e:print("SOURCE ERROR",source,type(e).__name__,str(e)[:180],flush=True)
    if network_ok==0:
        print("No permitted source returned data; preserving existing file.",file=sys.stderr)
        return 1
    # Slowly enrich a small group each run. No crawling beyond the public sitemap.
    detail_done={}
    for source,origin,_,_ in SOURCES:
        pages=[p for p in existing.values() if p.get("store")==source and p.get("verified")=="public_sitemap"]
        if not pages:continue
        # Rotate over the alphabetic source index to avoid permanently retrying the same items.
        pages.sort(key=lambda p:p["url"])
        rotation=dt.date.today().toordinal()*MAX_DETAIL_PAGES % len(pages)
        ordered=pages[rotation:]+pages[:rotation]
        rb=robots(origin);count=0
        for p in ordered[:MAX_DETAIL_PAGES]:
            try:
                enrich_product(p,rb);count+=1
            except Exception as e:print("ENRICH ERROR",type(e).__name__,str(e)[:90])
            time.sleep(DELAY_SECONDS)
        detail_done[source]=count
    # Each source is independent. Keep date and price provenance per item.
    all_items=list(existing.values())
    doc={"generated_at":TODAY,"source":"Public product sitemaps Home Center & ACE; exact retail URLs; price only where merchant page available","items":all_items}
    DEST.write_text(json.dumps(doc,ensure_ascii=False,separators=(",",":"))+"\n",encoding="utf-8")
    with_photo=sum(bool(p.get("img")) for p in all_items)
    with_price=sum(isinstance(p.get("price"),(int,float)) and p["price"]>0 for p in all_items)
    print("INDEX",len(all_items),"with_photo",with_photo,"with_price",with_price,"new_items",updates,"enriched",detail_done,flush=True)
    return 0

if __name__=="__main__":sys.exit(main())
