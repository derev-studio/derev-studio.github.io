#!/usr/bin/env python3
"""Build public KSP product previews for Ohotnik, without secrets or a local Mac.
Requests are deliberately sequential and limited. If KSP blocks requests,
existing verified catalog.json is preserved unchanged.
"""
from __future__ import annotations
import datetime
import json
import re
import sys
import time
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen

HERE=Path(__file__).resolve().parents[1]
TARGET=HERE/"catalog.json"
SOURCE="https://ksp.co.il/m_action/api/category/"
QUERIES=[
 ("תיק גב","backpack","Рюкзак"),("תיק למחשב","backpack","Сумка для ноутбука"),
 ("מקדחה","drill","Дрель"),("מברגה","drill","Шуруповёрт"),
 ("מדפסת","printer","Принтер"),("Xerox","printer","Принтер Xerox"),
 ("כבל USB","cable","USB-кабель"),("כבל HDMI","cable","HDMI-кабель"),
 ("מטען","charger","Зарядное устройство"),("מפצל חשמל","cable","Удлинитель"),
 ("אוזניות","headphones","Наушники"),("רמקולים","audio","Акустика"),
 ("נגן דיסקים","audio","CD-плеер"),("FiiO","audio","Аудиотехника FiiO"),
 ("מסך מחשב","monitor","Монитор"),("מחשב נייד","laptop","Ноутбук"),
 ("מקלדת","keyboard","Клавиатура"),("עכבר אלחוטי","mouse","Беспроводная мышь"),
 ("טלפון סלולרי","phone","Смартфон"),("טלוויזיה","tv","Телевизор"),
 ("שואב אבק","vacuum","Пылесос"),("מצלמה","camera","Камера"),
 ("כיסא מחשב","chair","Компьютерное кресло"),("אופניים","bike","Велосипед"),
 ("מקרר","appliance","Холодильник"),("מכונת כביסה","appliance","Стиральная машина"),
 ("מכונת קפה","appliance","Кофемашина"),("מיקרופון","audio","Микрофон"),
 ("אוהל","camping","Палатка"),("פנס","flashlight","Фонарь"),
 ("נעליים","shoes","Обувь"),("מעיל","clothing","Куртка"),
 ("תיק טיולים","backpack","Туристический рюкзак"),
 ("מזוודה","luggage","Чемодан"),
]
HEADERS={
 "User-Agent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36",
 "Accept":"application/json",
 "Accept-Language":"he-IL,he;q=0.9,en-US;q=0.8",
 "Referer":"https://ksp.co.il/web/",
 "Origin":"https://ksp.co.il",
}
def get(q,page=1):
    req=Request(SOURCE+"?"+urlencode({"search":q,"page":page}),headers=HEADERS)
    with urlopen(req,timeout=18) as response:
        if response.status!=200: raise RuntimeError("HTTP %s"%response.status)
        payload=json.load(response)
    return (payload.get("result") or {}).get("items") or []
def model(name):
    matches=re.findall(r"[A-Za-z][A-Za-z0-9+._/-]{1,}(?:\s+[A-Z0-9][A-Za-z0-9+._/-]{1,})?",name)
    words=[x for x in matches if x.lower() not in ("ksp","new","sale")]
    return " ".join(words[:3])
def normalize(p,category,prefix,date):
    ident=str(p.get("uin") or "")
    if not ident.isdigit():return None
    name=str(p.get("name") or "").strip()
    if not name:return None
    brand=str(p.get("brandName") or "").strip()
    cost=p.get("price")
    try:
        cost=float(cost)
        if cost<=0 or cost>999999:cost=None
    except (ValueError,TypeError):cost=None
    photo=p.get("img") or ""
    if not isinstance(photo,str):photo=""
    if photo.startswith("//"):photo="https:"+photo
    return {
       "id":ident,
       "name_ru":(prefix+" "+brand+" "+model(name)).strip() or prefix,
       "name_he":name,
       "brand":brand,
       "category":category,
       "price":cost,
       "store":"KSP",
       "url":"https://ksp.co.il/web/item/"+ident,
       "photo":photo,
       "as_of":date,
       "verified":"api"
    }
def main():
    old=json.loads(TARGET.read_text("utf-8"))
    prior=old.get("items") or []
    curated={str(x.get("id")):x for x in prior if x.get("verified")=="store" and str(x.get("id","")).isdigit()}
    all_items={str(x.get("id")):x for x in prior if str(x.get("id","")).isdigit()}
    today=datetime.date.today().isoformat()
    ok=0;errors=[]
    for q,category,prefix in QUERIES:
        try:
            rows=get(q)
            ok+=1
            for p in rows[:24]:
                item=normalize(p,category,prefix,today)
                if not item:continue
                old_curated=curated.get(item["id"])
                if old_curated:
                    item["name_ru"]=old_curated.get("name_ru") or item["name_ru"]
                    item["verified"]="api"
                all_items[item["id"]]=item
        except Exception as exc:
            errors.append(f"{q}: {type(exc).__name__} {str(exc)[:90]}")
        time.sleep(0.7)
    print(f"Successful category searches: {ok}/{len(QUERIES)}")
    if errors:
        print("Some searches failed:",*errors[:15],sep="\n")
    if ok==0:
        print("No live results: keeping previous catalog.",file=sys.stderr)
        return 2
    if len(all_items)>1500:
        # Only keep the newest previews, but never drop verified seed.
        ordered=sorted(all_items.values(),key=lambda x:str(x.get("as_of") or ""),reverse=True)
        chosen={x["id"]:x for x in ordered[:1500]}
        chosen.update(curated)
        all_items=chosen
    data={"generated_at":today,"source":"KSP public catalog; data may be cached","items":list(all_items.values())}
    TARGET.write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n","utf-8")
    print("Catalog products:",len(all_items))
    return 0
if __name__=="__main__":sys.exit(main())
