const header = document.getElementById('siteHeader');
const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');
const bookingForm = document.getElementById('bookingForm');
const serviceSelect = document.getElementById('serviceSelect');
const formStatus = document.getElementById('formStatus');
const t = value => window.siteI18n?.translate(value) || value;

function updateHeader(){header.classList.toggle('scrolled',window.scrollY>35)}
updateHeader();
window.addEventListener('scroll', updateHeader, {passive:true});

menuToggle.addEventListener('click',()=>{
  const expanded = menuToggle.getAttribute('aria-expanded')==='true';
  menuToggle.setAttribute('aria-expanded',String(!expanded));
  menuToggle.setAttribute('aria-label',t(expanded?'Открыть меню':'Закрыть меню'));
  nav.classList.toggle('open',!expanded);
});
nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
  nav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded','false');
  menuToggle.setAttribute('aria-label',t('Открыть меню'));
}));
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'){
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
