// Separate Cloudflare Worker for Ohotnik product discovery.
// Required: Workers AI binding "AI" and secret TAVILY_API_KEY.
// Deploy as ohotnik-ai.qerevv.workers.dev (do not change photo gallery Worker).
const ORIGIN='https://derev-studio.github.io';
const STORES={
 'ksp.co.il':'KSP','ivory.co.il':'Ivory','erco.co.il':'ARKA',
 'homecenter.co.il':'Home Center','ace.co.il':'ACE','kravitz.co.il':'Kravitz',
 'zap.co.il':'Zap','rami-levy.co.il':'Rami Levy','yochananof.co.il':'Yohananof'
};
function headers(){return {
 'Access-Control-Allow-Origin':ORIGIN,
 'Access-Control-Allow-Headers':'Content-Type',
 'Access-Control-Allow-Methods':'GET, OPTIONS',
 'Access-Control-Max-Age':'86400','Vary':'Origin',
 'Content-Type':'application/json; charset=utf-8',
 'X-Content-Type-Options':'nosniff'
};}
function json(v,status=200){return new Response(JSON.stringify(v),{status,headers:{...headers(),'Cache-Control':status===200?'public, max-age=180':'no-store'}})}
function merchant(raw){
 try{
  const url=new URL(raw);
  if(url.protocol!=='https:'||url.username||url.password||url.pathname==='/')return null;
  const host=url.hostname.toLowerCase().replace(/^www\./,'');
  const name=Object.entries(STORES).find(([d])=>host===d||host.endsWith('.'+d));
  if(!name||/\/(login|account|cart|checkout|privacy|terms)(\/|$)/i.test(url.pathname))return null;
  for(const k of [...url.searchParams.keys()])if(/^utm_|^fbclid$|^gclid$/i.test(k))url.searchParams.delete(k);
  return {store:name[1],url:url.href};
 }catch(e){return null}
}
async function makeHebrew(q,env){
 if(!env.AI)return q;
 try{
  const p='Translate shopping queries into a concise Hebrew product search suitable for Israeli online shops. Preserve requested brands, model numbers and specifications. Never invent attributes. Output ONLY the Hebrew search phrase, no explanation. Examples: фильтр для воды => מסנן מים; скрепки => אטבי נייר; дрель аккумуляторная => מקדחה נטענת.';
  const r=await env.AI.run('@cf/meta/llama-3.1-8b-instruct',{
   messages:[{role:'system',content:p},{role:'user',content:q}],
   max_tokens:90,temperature:0.1
  });
  const value=String(r&&r.response||'').replace(/[\r\n"']/g,' ').trim();
  if(value.length>=2&&value.length<105&&/[\u0590-\u05ff]/.test(value))return value;
 }catch(e){}
 return q;
}
export default {
 async fetch(request,env,ctx){
  const origin=request.headers.get('Origin');
  if(origin&&origin!==ORIGIN)return json({error:'origin_forbidden'},403);
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:headers()});
  const u=new URL(request.url);
  if(request.method!=='GET'||u.pathname!=='/search')return json({error:'not_found'},404);
  const q=String(u.searchParams.get('q')||'').replace(/\s+/g,' ').trim();
  if(q.length<2||q.length>100)return json({error:'invalid_query'},400);
  if(!env.TAVILY_API_KEY)return json({error:'missing_TAVILY_API_KEY'},503);
  const cache=caches.default;
  const key=new Request('https://ohotnik-ai-cache.invalid/search?q='+encodeURIComponent(q.toLowerCase()));
  const hit=await cache.match(key);
  if(hit)return hit;
  const term=await makeHebrew(q,env);
  let r;
  try{
   r=await fetch('https://api.tavily.com/search',{
    method:'POST',
    headers:{'Authorization':'Bearer '+env.TAVILY_API_KEY,'Content-Type':'application/json'},
    body:JSON.stringify({
     query:term+' לקנייה בישראל',topic:'general',search_depth:'basic',max_results:16,
     include_answer:false,include_raw_content:false,include_images:false,
     include_domains:Object.keys(STORES),include_domains_mode:'restrict',safe_search:true
    }),
    signal:AbortSignal.timeout(9500)
   });
  }catch(e){return json({error:'search_unavailable'},502)}
  if(!r.ok)return json({error:'search_provider_error',status:r.status},502);
  let payload;try{payload=await r.json()}catch(e){return json({error:'invalid_provider_data'},502)}
  const seen=new Set(),items=[];
  for(const item of Array.isArray(payload.results)?payload.results:[]){
   const site=merchant(item&&item.url);
   if(!site||seen.has(site.url))continue;
   const title=String(item.title||'').replace(/\s+/g,' ').trim().slice(0,190);
   if(!title)continue;
   seen.add(site.url);
   items.push({title,url:site.url,store:site.store,
    snippet:String(item.content||'').replace(/\s+/g,' ').trim().slice(0,245)});
   if(items.length>=16)break;
  }
  const response=json({query:q,hebrew_query:term,items,
   note:'Real merchant pages. Prices and stock are not verified.'});
  ctx.waitUntil(cache.put(key,response.clone()));
  return response;
 }
};