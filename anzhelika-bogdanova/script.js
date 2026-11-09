const header = document.getElementById('siteHeader');
const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');
const bookingForm = document.getElementById('bookingForm');
const serviceSelect = document.getElementById('serviceSelect');
const formStatus = document.getElementById('formStatus');
const t = value => window.siteI18n?.translate(value) || value;
const settingsToggle = document.getElementById('settingsToggle');
const styleDock = document.getElementById('styleDock');
const soundToggle = document.getElementById('soundToggle');
const siteToast = document.getElementById('siteToast');

let toastTimeout;
function toast(message){
  siteToast.textContent=message;
  siteToast.classList.add('is-visible');
  clearTimeout(toastTimeout);
  toastTimeout=setTimeout(()=>{siteToast.classList.remove('is-visible');siteToast.textContent=''},3400);
}
function closeSettings(){styleDock.hidden=true;settingsToggle.setAttribute('aria-expanded','false')}
settingsToggle.addEventListener('click',()=>{
  const isOpen=!styleDock.hidden;
  styleDock.hidden=isOpen;
  settingsToggle.setAttribute('aria-expanded',String(!isOpen));
  nav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded','false');
});
document.addEventListener('pointerdown',event=>{
  if(!styleDock.hidden&&!event.target.closest('.settings-wrap'))closeSettings();
});

let soundEnabled=false;
try{soundEnabled=localStorage.getItem('angelika-sound')==='on'}catch(e){}
let audioContext;
function updateSoundToggle(){
  soundToggle.textContent=soundEnabled?t('Включён'):t('Выключен');
  soundToggle.setAttribute('aria-pressed',String(soundEnabled));
  soundToggle.setAttribute('aria-label',t(soundEnabled?'Выключить звуки кнопок':'Включить звуки кнопок'));
}
function playClickSound(){
  if(!soundEnabled)return;
  try{
    const Context=window.AudioContext||window.webkitAudioContext;
    if(!Context)return;
    audioContext ||= new Context();
    if(audioContext.state==='suspended')void audioContext.resume();
    const now=audioContext.currentTime;
    const oscillator=audioContext.createOscillator();
    const gain=audioContext.createGain();
    oscillator.type='sine';oscillator.frequency.setValueAtTime(590,now);
    oscillator.frequency.exponentialRampToValueAtTime(770,now+.055);
    gain.gain.setValueAtTime(.0001,now);
    gain.gain.exponentialRampToValueAtTime(.018,now+.007);
    gain.gain.exponentialRampToValueAtTime(.0001,now+.067);
    oscillator.connect(gain);gain.connect(audioContext.destination);
    oscillator.start(now);oscillator.stop(now+.075);
  }catch(e){}
}
soundToggle.addEventListener('click',()=>{
  soundEnabled=!soundEnabled;
  try{localStorage.setItem('angelika-sound',soundEnabled?'on':'off')}catch(e){}
  updateSoundToggle();
});
document.addEventListener('site:language-change',updateSoundToggle);
updateSoundToggle();
document.addEventListener('click',event=>{
  if(event.target.closest('button,.header-cta,.button,.article-row,.library-card'))playClickSound();
});

document.getElementById('shareButton').addEventListener('click',async()=>{
  const url=document.querySelector('link[rel="canonical"]')?.href||location.href;
  const english=window.siteI18n?.language==='en';
  if(navigator.share){
    try{await navigator.share({title:english?'Angelika Bogdanova — Personal Website':'Анжелика Богданова — персональный сайт',url});return}
    catch(error){if(error?.name==='AbortError')return}
  }
  const copied=await copyText(url);
  toast(copied?(english?'Website link copied':'Ссылка на сайт скопирована'):(english?'You can copy the address from your browser':'Скопируйте адрес из строки браузера'));
});

document.querySelectorAll('.service-card,.testimonial-card,.program-small,.booking-panel').forEach(card=>card.classList.add('spotlight-card'));
if(window.matchMedia('(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)').matches){
  document.addEventListener('pointermove',event=>{
    if(!document.body.classList.contains('is-dark'))return;
    const card=event.target.closest('.spotlight-card');
    if(!card)return;
    const rect=card.getBoundingClientRect();
    card.style.setProperty('--spot-x',`${event.clientX-rect.left}px`);
    card.style.setProperty('--spot-y',`${event.clientY-rect.top}px`);
  },{passive:true});
}

function updateHeader(){header.classList.toggle('scrolled',window.scrollY>35)}
updateHeader();
window.addEventListener('scroll', updateHeader, {passive:true});

menuToggle.addEventListener('click',()=>{
  const expanded = menuToggle.getAttribute('aria-expanded')==='true';
  menuToggle.setAttribute('aria-expanded',String(!expanded));
  menuToggle.setAttribute('aria-label',t(expanded?'Открыть меню':'Закрыть меню'));
  nav.classList.toggle('open',!expanded);
  closeSettings();
});
nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
  nav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded','false');
  menuToggle.setAttribute('aria-label',t('Открыть меню'));
}));
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'){
    closeSettings();
    nav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded','false');
    menuToggle.setAttribute('aria-label',t('Открыть меню'));
  }
});

if('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  const observer = new IntersectionObserver((entries, obs)=>{
    for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('visible');obs.unobserve(entry.target)}}
  },{threshold:.1,rootMargin:'0px 0px -25px 0px'});
  document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
}else{
  document.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible'));
}

document.querySelectorAll('[data-service]').forEach(button=>{
  button.addEventListener('click',()=>{
    const value=button.getAttribute('data-service');
    serviceSelect.value=value;
    document.getElementById('booking').scrollIntoView({behavior:'smooth',block:'start'});
    window.setTimeout(()=>document.getElementById('clientName').focus({preventScroll:true}),650);
  });
});

async function copyText(text){
  try{if(navigator.clipboard && window.isSecureContext){await navigator.clipboard.writeText(text);return true}}catch(e){}
  const temporary=document.createElement('textarea');
  temporary.value=text;temporary.setAttribute('readonly','');
  temporary.style.cssText='position:fixed;opacity:0;left:-9999px;top:0';
  document.body.appendChild(temporary);temporary.select();
  let copied=false;
  try{copied=document.execCommand('copy')}catch(e){}
  temporary.remove();
  return copied;
}

bookingForm.addEventListener('submit', async event=>{
  event.preventDefault();
  if(!bookingForm.reportValidity())return;
  const name=document.getElementById('clientName').value.trim();
  const service=serviceSelect.value;
  const contact=document.getElementById('clientContact').value.trim();
  const note=document.getElementById('clientNote').value.trim();
  if(name.length<2 || !contact){formStatus.textContent=t('Пожалуйста, заполните имя и контакт.');return}
  const english = window.siteI18n?.language==='en';
  const message=(english ? [
    'Hello, Angelika! I would like to contact you through your website.',
    'Name: '+name,
    'Interested in: '+t(service),
    'Contact: '+contact,
    note?'Note: '+note:null,
    'Could you please tell me about current availability and booking conditions?'
  ] : [
    'Здравствуйте, Анжелика! Хочу обратиться к вам через ваш сайт.',
    'Имя: '+name,
    'Интересует: '+service,
    'Мой контакт: '+contact,
    note?'Пожелание: '+note:null,
    'Подскажите, пожалуйста, актуальные условия и возможность записи.'
  ]).filter(Boolean).join('\n');
  const popup=window.open('https://t.me/angelikastory','_blank','noopener,noreferrer');
  const copied=await copyText(message);
  formStatus.textContent=t(copied?'Заявка скопирована. Вставьте текст в открывшийся чат Telegram и нажмите «Отправить».':'Не удалось автоматически скопировать сообщение. Вы можете написать Анжелике в Telegram напрямую.');
  if(!popup){
    const link=document.createElement('a');
    link.href='https://t.me/angelikastory';link.target='_blank';link.rel='noopener noreferrer';
    link.textContent=' '+t('Открыть Telegram ↗');
    formStatus.appendChild(link);
  }
});

// A useful, private orientation aid: the visitor only chooses a topic; nothing is stored.
const guideDialog=document.getElementById('formatGuide');
const guideChoices=document.getElementById('guideChoices');
const guideResult=document.getElementById('guideResult');
const guideTitle=document.getElementById('guideResultTitle');
const guideText=document.getElementById('guideResultText');
const guideMap={
  talk:{service:'Индивидуальная консультация',ru:['Индивидуальная консультация','Личный разговор, в котором можно остановиться, разобраться в переживаниях и найти опору.'],en:['Individual consultation','A personal conversation to explore your feelings, questions, and inner sources of support.']},
  write:{service:'Блоготерапия и творческое сопровождение',ru:['Блоготерапия','Работа со словом, самовыражением и собственным голосом — через письмо и творчество.'],en:['Blog therapy','Exploring self-expression and your own voice through writing and creative work.']},
  images:{service:'Образные практики и аромапсихология',ru:['Образные практики','Метафоры, ассоциации и творческие образы помогают посмотреть на привычные вопросы по-новому.'],en:['Creative image-based practices','Metaphors, associations, and creative imagery can offer a new perspective on familiar questions.']}
};
let guideSelection='talk';
function openGuide(){
  guideChoices.hidden=false;guideResult.hidden=true;
  if(typeof guideDialog.showModal==='function')guideDialog.showModal();
  else document.getElementById('practice').scrollIntoView({behavior:'smooth'});
}
document.querySelectorAll('[data-open-guide]').forEach(button=>button.addEventListener('click',openGuide));
document.getElementById('closeGuide').addEventListener('click',()=>guideDialog.close());
document.querySelectorAll('[data-guide]').forEach(button=>button.addEventListener('click',()=>{
  guideSelection=button.dataset.guide;
  const english=window.siteI18n?.language==='en';
  const info=guideMap[guideSelection];
  guideTitle.textContent=info[english?'en':'ru'][0];
  guideText.textContent=info[english?'en':'ru'][1];
  guideChoices.hidden=true;guideResult.hidden=false;
  document.getElementById('guideBack').focus();
}));
document.getElementById('guideBack').addEventListener('click',()=>{guideChoices.hidden=false;guideResult.hidden=true;document.querySelector('[data-guide]').focus()});
document.getElementById('guideBook').addEventListener('click',()=>{
  serviceSelect.value=guideMap[guideSelection].service;
  guideDialog.close();
  document.getElementById('booking').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
});
guideDialog.addEventListener('click',event=>{if(event.target===guideDialog)guideDialog.close()});

// Large images open inside the page, with an optional link to the artist's original post.
const imageDialog=document.getElementById('imageDialog');
const imageDialogPhoto=document.getElementById('imageDialogPhoto');
document.querySelectorAll('.about-portrait-open,.hero-art-link,.art-tile,.editorial-image-open,.art-feature-open').forEach(trigger=>{
  trigger.addEventListener('click',event=>{
    if(typeof imageDialog.showModal!=='function')return;
    const image=trigger.querySelector('img');
    if(!image)return;
    event.preventDefault();
    imageDialogPhoto.src=trigger.dataset.imageLarge||image.currentSrc||image.src;
    imageDialogPhoto.alt=image.alt;
    imageDialog.showModal();
  });
});
document.getElementById('closeImageDialog').addEventListener('click',()=>imageDialog.close());
imageDialog.addEventListener('click',event=>{if(event.target===imageDialog)imageDialog.close()});

const backToTop=document.getElementById('backToTop');
function updateBackToTop(){backToTop.classList.toggle('is-visible',window.scrollY>850)}
window.addEventListener('scroll',updateBackToTop,{passive:true});
updateBackToTop();
