// Shared Firebase project and Realtime Database used by Derev Studio's photo gallery.
const firebaseConfig={apiKey:'AIzaSyB2X3o7KwYFkMfsskKoWpQYBrws8L-Mn9w',authDomain:'photo-gallery-18193.firebaseapp.com',projectId:'photo-gallery-18193',databaseURL:'https://photo-gallery-18193-default-rtdb.firebaseio.com',appId:'1:329094770221:web:b9d076f195f968668212a4'};
const commentsPath='spasibo_vam_comments';
const labels={
ru:{title:'Добрые слова и комментарии',info:'Чтобы оставить комментарий, войдите через Google.',login:'Войти через Google',logout:'Выйти',send:'Опубликовать',loading:'Загружаем комментарии…',empty:'Пока нет комментариев.',error:'Комментарии пока недоступны: для нового раздела базы нужно разрешение.',authError:'Не удалось войти через Google.',sent:'Спасибо! Комментарий опубликован.'},
en:{title:'Kind words and comments',info:'Sign in with Google to leave a comment.',login:'Sign in with Google',logout:'Sign out',send:'Publish',loading:'Loading comments…',empty:'No comments yet.',error:'Comments are unavailable: the new database path needs permission.',authError:'Google sign-in failed.',sent:'Thank you! Your comment was published.'},
he:{title:'מילים טובות ותגובות',info:'כדי להשאיר תגובה, יש להתחבר עם Google.',login:'התחברות עם Google',logout:'התנתקות',send:'פרסום',loading:'טוען תגובות…',empty:'אין עדיין תגובות.',error:'התגובות עדיין לא זמינות: יש לאפשר גישה לנתיב החדש במסד הנתונים.',authError:'ההתחברות עם Google נכשלה.',sent:'תודה! התגובה פורסמה.'},
ar:{title:'كلمات طيبة وتعليقات',info:'لتترك تعليقًا، سجّل الدخول باستخدام Google.',login:'تسجيل الدخول عبر Google',logout:'تسجيل الخروج',send:'نشر',loading:'جارٍ تحميل التعليقات…',empty:'لا توجد تعليقات بعد.',error:'التعليقات غير متاحة بعد: يحتاج المسار الجديد في قاعدة البيانات إلى إذن.',authError:'فشل تسجيل الدخول عبر Google.',sent:'شكرًا! نُشر تعليقك.'}
};
const $=id=>document.getElementById(id);let lang='he',user=null,entries=[],ready=false,loadError=false;
const label=()=>labels[lang];
function update(){const t=label();$('comments-title').textContent=t.title;$('comments-info').textContent=t.info;$('google-login').textContent=t.login;$('google-logout').textContent=t.logout;$('comment-send').textContent=t.send;if(loadError)$('comments-status').textContent=t.error;else if(!ready)$('comments-status').textContent=t.loading;else if(!entries.length)$('comments-status').textContent=t.empty;else $('comments-status').textContent='';}
function draw(){const host=$('comments-list');host.replaceChildren();for(const item of entries){const wrap=document.createElement('article');wrap.className='comment-item';const by=document.createElement('b');by.textContent=item.name||'Google';const body=document.createElement('p');body.textContent=item.text||'';wrap.append(by,body);host.append(wrap)}}
window.addEventListener('shay-language',e=>{lang=labels[e.detail]?e.detail:'he';update()});
update();
try{
 if(!window.firebase||!firebase.auth||!firebase.database)throw Error('Firebase scripts missing');
 const app=firebase.apps.length?firebase.app():firebase.initializeApp(firebaseConfig);
 const auth=app.auth(),db=app.database(),provider=new firebase.auth.GoogleAuthProvider();
 $('google-login').hidden=false;
 $('google-login').addEventListener('click',async()=>{try{await auth.signInWithPopup(provider)}catch(e){if(e.code==='auth/popup-blocked')await auth.signInWithRedirect(provider);else $('comments-status').textContent=label().authError+' '+(e.code||'')}});
 $('google-logout').addEventListener('click',()=>auth.signOut());
 auth.onAuthStateChanged(u=>{user=u;$('google-login').hidden=!!u;$('google-logout').hidden=!u;$('comment-form').hidden=!u;$('signed-user').textContent=u?(u.displayName||u.email||''):''});
 db.ref(commentsPath).limitToLast(50).on('value',snap=>{entries=[];snap.forEach(child=>{const v=child.val();if(v&&typeof v.text==='string')entries.push(v)});entries.reverse();ready=true;loadError=false;draw();update()},()=>{ready=true;loadError=true;update()});
 $('comment-form').addEventListener('submit',async e=>{e.preventDefault();if(!user)return;const body=$('comment-text').value.trim();if(body.length<2||body.length>1200)return;const btn=$('comment-send');btn.disabled=true;try{await db.ref(commentsPath).push({uid:user.uid,name:(user.displayName||'Google user').slice(0,80),text:body,createdAt:firebase.database.ServerValue.TIMESTAMP});$('comment-text').value='';$('comments-status').textContent=label().sent}catch(e){$('comments-status').textContent=label().error+' '+(e.code||'')}finally{btn.disabled=false}});
}catch(e){ready=true;loadError=true;update()}
