(()=>{'use strict';
const cfg={apiKey:'AIzaSyB2X3o7KwYFkMfsskKoWpQYBrws8L-Mn9w',authDomain:'photo-gallery-18193.firebaseapp.com',projectId:'photo-gallery-18193',databaseURL:'https://photo-gallery-18193-default-rtdb.firebaseio.com',appId:'1:329094770221:web:b9d076f195f968668212a4'};
const page=document.body.dataset.page||'index';
const path='chat/lichnoe_pismo_2026/'+page;
const el=id=>document.getElementById(id);
const messages={
ru:{comments:'Комментарии',commentInfo:'Чтобы написать комментарий, войдите через Google. Комментарии этой страницы видны всем посетителям.',login:'Войти через Google',logout:'Выйти',write:'Ваш комментарий',publish:'Опубликовать',loading:'Загрузка комментариев…',empty:'Комментариев пока нет.',error:'Комментарии сейчас недоступны.',loginError:'Не удалось войти через Google.',sent:'Комментарий опубликован.'},
en:{comments:'Comments',commentInfo:'Sign in with Google to leave a comment. Comments on this page are public.',login:'Sign in with Google',logout:'Sign out',write:'Your comment',publish:'Publish',loading:'Loading comments…',empty:'No comments yet.',error:'Comments are currently unavailable.',loginError:'Google sign-in failed.',sent:'Comment published.'},
he:{comments:'תגובות',commentInfo:'כדי לפרסם תגובה יש להתחבר באמצעות Google. התגובות בדף זה גלויות לכולם.',login:'התחברות באמצעות Google',logout:'התנתקות',write:'התגובה שלך',publish:'פרסום',loading:'טוען תגובות…',empty:'עדיין אין תגובות.',error:'התגובות אינן זמינות כרגע.',loginError:'ההתחברות באמצעות Google נכשלה.',sent:'התגובה פורסמה.'},
ar:{comments:'التعليقات',commentInfo:'لإضافة تعليق، سجّل الدخول باستخدام Google. التعليقات على هذه الصفحة عامة.',login:'الدخول باستخدام Google',logout:'تسجيل الخروج',write:'تعليقك',publish:'نشر',loading:'جارٍ تحميل التعليقات…',empty:'لا توجد تعليقات بعد.',error:'التعليقات غير متاحة حاليًا.',loginError:'تعذّر تسجيل الدخول عبر Google.',sent:'تم نشر التعليق.'}};
const p=new URLSearchParams(location.search).get('lang');let lang=['ru','en','he','ar'].includes(p)?p:'ru';try{if(!p){const saved=localStorage.getItem('derev-letter-lang');if(messages[saved])lang=saved;}}catch(e){}
let user=null,entries=[],ready=false,failed=false;
const tr=()=>messages[lang];
function status(message){el('comments-status').textContent=message;}
function captions(){const t=tr();const section=document.querySelector('section.comments');if(section){const h=section.querySelector('h2'),i=section.querySelector('.comment-label'),label=section.querySelector('label[for="comment-text"]');if(h)h.textContent=t.comments;if(i)i.textContent=t.commentInfo;if(label)label.textContent=t.write;}el('google-login').textContent=t.login;el('google-logout').textContent=t.logout;el('comment-send').textContent=t.publish;if(!failed)status(!ready?t.loading:entries.length?'':t.empty);else status(t.error);}
function draw(){const host=el('comments-list');host.replaceChildren();for(const v of entries){const box=document.createElement('div'),head=document.createElement('b'),p=document.createElement('p');box.className='comment-item';head.textContent=v.name||'Google';p.textContent=v.text||'';box.append(head,p);host.append(box)}captions();}
window.addEventListener('derev-language',e=>{if(messages[e.detail.lang])lang=e.detail.lang;captions()});captions();
try{
if(!window.firebase)throw Error('Firebase scripts missing');
const app=firebase.apps.length?firebase.app():firebase.initializeApp(cfg);const auth=app.auth(),db=app.database(),provider=new firebase.auth.GoogleAuthProvider();
el('google-login').hidden=false;
auth.onAuthStateChanged(u=>{user=u;el('google-login').hidden=!!u;el('google-logout').hidden=!u;el('comment-form').hidden=!u;el('signed-user').textContent=u?(u.displayName||u.email||''):'';});
el('google-login').onclick=async()=>{try{await auth.signInWithPopup(provider)}catch(e){if(e.code==='auth/popup-blocked')await auth.signInWithRedirect(provider);else status(tr().loginError+' '+(e.code||''));}};
el('google-logout').onclick=()=>auth.signOut();
db.ref(path).limitToLast(100).on('value',snap=>{entries=[];snap.forEach(row=>{const v=row.val();if(v&&typeof v.text==='string')entries.push(v);});entries.reverse();ready=true;failed=false;draw();},err=>{ready=true;failed=true;status(tr().error+' '+(err.code||''));});
el('comment-form').onsubmit=async e=>{e.preventDefault();if(!user)return;const value=el('comment-text').value.trim();if(value.length<2||value.length>1500)return;el('comment-send').disabled=true;try{await db.ref(path).push({uid:user.uid,name:(user.displayName||'Google').slice(0,80),text:value,createdAt:firebase.database.ServerValue.TIMESTAMP});el('comment-text').value='';status(tr().sent);}catch(err){status(tr().error+' '+(err.code||''));}finally{el('comment-send').disabled=false;}};
}catch(err){ready=true;failed=true;status(tr().error);}
})();