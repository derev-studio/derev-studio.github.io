(()=>{'use strict';
const known=['index','nalogi','isracard','hapoalim','zaklyuchenie'];
const names={ru:{site:'АЛЕКСАНДР ДЕРЕВЯШКИН · ЛИЧНОЕ ПИСЬМО',nav:['Личное письмо','Тапочки и НДС','Isracard и доставка','Банк «Апоалим»','Требования и заключение'],ui:{languages:'Языки',topics:'Темы письма'}},en:{site:'ALEXANDER DEREVYASHKIN · PERSONAL LETTER',nav:['Personal letter','VAT and essentials','Isracard and delivery','Bank Hapoalim','Requests and conclusion'],ui:{languages:'Languages',topics:'Sections'}},he:{site:'אלכסנדר דרביאשקין · מכתב אישי',nav:['מכתב אישי','כפכפים ומע״מ','ישראכרט והשליח','בנק הפועלים','בקשות וסיכום'],ui:{languages:'שפות',topics:'נושאים'}},ar:{site:'ألكسندر ديريفياشكين · رسالة شخصية',nav:['الرسالة الشخصية','النعال وضريبة القيمة المضافة','إسراكارد والتوصيل','بنك هبوعليم','المطالب والخاتمة'],ui:{languages:'اللغات',topics:'الموضوعات'}}};
const file=(document.body.dataset.page||'index');const page=known.includes(file)?file:'index';
const current=new URL(location.href);const requested=current.searchParams.get('lang');
let lang=['ru','en','he','ar'].includes(requested)?requested:'ru';
try{if(!requested){const saved=localStorage.getItem('derev-letter-lang');if(['ru','en','he','ar'].includes(saved))lang=saved;}localStorage.setItem('derev-letter-lang',lang);}catch(e){}
const destinations=['index','nalogi','isracard','hapoalim','zaklyuchenie'];
function url(p,lc){const qs=lc==='ru'?'':'?lang='+lc;return p+'.html'+qs;}
function el(tag,cls,txt){const n=document.createElement(tag);if(cls)n.className=cls;if(txt)n.textContent=txt;return n;}
const main=document.querySelector('main');
if(!main)return;
const wrapper=el('div','site-layout');const sidebar=el('aside','site-sidebar');sidebar.setAttribute('aria-label','Languages and topics');
const langHeading=el('h2','sidebar-heading',names[lang].ui.languages);sidebar.append(langHeading);
const buttons=el('div','language-buttons');buttons.setAttribute('role','group');buttons.setAttribute('aria-label','Language');
for(const [code,label] of [['en','English'],['ru','Русский'],['ar','العربية'],['he','עברית']]){
const a=el('a','language-button',label);a.href=url(page,code);a.lang=code;a.setAttribute('hreflang',code);if(lang===code){a.classList.add('active');a.setAttribute('aria-current','true');}buttons.append(a);
}
sidebar.append(buttons);
const topicsHeading=el('h2','sidebar-heading topics-heading',names[lang].ui.topics);sidebar.append(topicsHeading);
const list=el('nav','sidebar-topics');list.setAttribute('aria-label','Letter topics');
destinations.forEach((dest,i)=>{const a=el('a','topic-link');a.href=url(dest,lang);const n=el('span','topic-num',String(i+1).padStart(2,'0'));const t=el('span','topic-text',names[lang].nav[i]);a.append(n,t);if(dest===page)a.setAttribute('aria-current','page');list.append(a);});
sidebar.append(list);
main.parentNode.insertBefore(wrapper,main);wrapper.append(sidebar,main);
const body=document.body;body.classList.add('letter-has-sidebar');
document.documentElement.lang=lang;document.documentElement.dir=(lang==='ar'||lang==='he')?'rtl':'ltr';
function localizeLinks(){main.querySelectorAll('a[href]').forEach(a=>{const raw=a.getAttribute('href');const m=/^(index|nalogi|isracard|hapoalim|zaklyuchenie)\.html$/.exec(raw||'');if(m)a.href=url(m[1],lang);});}
localizeLinks();
const header=document.querySelector('header .brand');if(header)header.textContent=names[lang].site;
function apply(t){if(!t||!t.pages||!t.pages[page])return;
const p=t.pages[page];document.title=names[lang].nav[destinations.indexOf(page)]+' — Alexander Derevyashkin';
const kicker=main.querySelector('.kicker');if(kicker)kicker.textContent=p.tag;
const title=main.querySelector('h1');if(title)title.textContent=p.title;
const article=main.querySelector('article');if(article)article.innerHTML=p.body;
const footer=document.querySelector('footer');if(footer)footer.textContent=t.ui.footer;
const arrows=main.querySelector('.page-links');if(arrows){arrows.replaceChildren();const i=destinations.indexOf(page);if(i>0){const a=el('a',null,(lang==='he'||lang==='ar'?'→ ':'← ')+names[lang].nav[i-1]);a.href=url(destinations[i-1],lang);arrows.append(a);}if(i<destinations.length-1){const a=el('a',null,names[lang].nav[i+1]+(lang==='he'||lang==='ar'?' ←':' →'));a.href=url(destinations[i+1],lang);arrows.append(a);}}
localizeLinks();window.DEREV_UI=t.ui;window.dispatchEvent(new CustomEvent('derev-language',{detail:{lang,ui:t.ui}}));
}
if(lang==='ru'){window.DEREV_UI=null;return;}
const script=document.createElement('script');script.src='i18n-'+lang+'.js';script.onload=()=>apply(window.DEREV_TRANSLATIONS);script.onerror=()=>{const msg=el('p','translation-error','Translation is temporarily unavailable. Русский текст доступен.');main.prepend(msg);};document.head.append(script);
})();