// The existing public Firebase Web App configuration used by Derev Studio's KSP thanks page.
// No private credentials are present in browser code.
const firebaseConfig={apiKey:'AIzaSyB2X3o7KwYFkMfsskKoWpQYBrws8L-Mn9w',authDomain:'photo-gallery-18193.firebaseapp.com',projectId:'photo-gallery-18193',appId:'1:329094770221:web:b9d076f195f968668212a4'};
const collectionName='spasibo_vam_comments';
const labels={
ru:{title:'Добрые слова и комментарии',info:'Чтобы оставить комментарий, войдите через Google.',login:'Войти через Google',logout:'Выйти',send:'Опубликовать',loading:'Загружаем комментарии…',empty:'Пока нет комментариев.',error:'Комментарии пока недоступны. Возможно, для этой страницы нужно разрешить новую коллекцию в Firebase.',sent:'Спасибо! Комментарий опубликован.',blocked:'Окно входа заблокировано. Попробуйте снова.'},
en:{title:'Kind words and comments',info:'Sign in with Google to leave a comment.',login:'Sign in with Google',logout:'Sign out',send:'Publish',loading:'Loading comments…',empty:'No comments yet.',error:'Comments are not available yet. This page may need permission for its new Firebase collection.',sent:'Thank you! Your comment was published.',blocked:'Sign-in popup was blocked. Please try again.'},
he:{title:'מילים טובות ותגובות',info:'כדי להשאיר תגובה, יש להתחבר עם Google.',login:'התחברות עם Google',logout:'התנתקות',send:'פרסום',loading:'טוען תגובות…',empty:'אין עדיין תגובות.',error:'התגובות עדיין אינן זמינות. ייתכן שצריך לאפשר את האוסף החדש ב-Firebase.',sent:'תודה! התגובה פורסמה.',blocked:'חלון הכניסה נחסם. נסו שוב.'},
ar:{title:'كلمات طيبة وتعليقات',info:'لتترك تعليقًا، سجّل الدخول باستخدام Google.',login:'تسجيل الدخول عبر Google',logout:'تسجيل الخروج',send:'نشر',loading:'جارٍ تحميل التعليقات…',empty:'لا توجد تعليقات بعد.',error:'التعليقات غير متاحة بعد. قد يلزم السماح بالمجموعة الجديدة في Firebase.',sent:'شكرًا! نُشر تعليقك.',blocked:'تم حظر نافذة تسجيل الدخول. حاول مرة أخرى.'}
};
const $=id=>document.getElementById(id);
let lang='ru',currentUser=null,entries=[],auth=null,db=null,ready=false,loadError=false;
const label=()=>labels[lang];
function update(){const t=label();$('comments-title').textContent=t.title;$('comments-info').textContent=t.info;$('google-login').textContent=t.login;$('google-logout').textContent=t.logout;$('comment-send').textContent=t.send;if(loadError)$('comments-status').textContent=t.error;else if(!ready)$('comments-status').textContent=t.loading;else if(!entries.length)$('comments-status').textContent=t.empty;else $('comments-status').textContent='';}
function draw(){const host=$('comments-list');host.replaceChildren();for(const item of entries){const wrap=document.createElement('article');wrap.className='comment-item';const by=document.createElement('b');by.textContent=item.name||'Google';const body=document.createElement('p');body.textContent=item.text||'';wrap.append(by,body);host.append(wrap)}}
window.addEventListener('shay-language',e=>{lang=labels[e.detail]?e.detail:'ru';update()});
try{const saved=localStorage.getItem('shay-lang');if(labels[saved])lang=saved}catch{}
update();
try{
 const [{initializeApp},{getAuth,GoogleAuthProvider,signInWithPopup,signInWithRedirect,signOut,onAuthStateChanged},{getFirestore,collection,query,orderBy,limit,onSnapshot,addDoc,serverTimestamp}]=await Promise.all([
  import('https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js'),
  import('https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js'),
  import('https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js')
 ]);
 const app=initializeApp(firebaseConfig);auth=getAuth(app);db=getFirestore(app);const provider=new GoogleAuthProvider();
 $('google-login').hidden=false;
 $('google-login').addEventListener('click',async()=>{try{await signInWithPopup(auth,provider)}catch(e){if(e.code==='auth/popup-blocked')await signInWithRedirect(auth,provider);else $('comments-status').textContent=label().error}});
 $('google-logout').addEventListener('click',()=>signOut(auth));
 onAuthStateChanged(auth,u=>{currentUser=u;$('google-login').hidden=!!u;$('google-logout').hidden=!u;$('comment-form').hidden=!u;$('signed-user').textContent=u?(u.displayName||u.email||''):''});
 onSnapshot(query(collection(db,collectionName),orderBy('createdAt','desc'),limit(50)),snap=>{entries=snap.docs.map(d=>d.data());ready=true;loadError=false;draw();update()},()=>{ready=true;loadError=true;update()});
 $('comment-form').addEventListener('submit',async e=>{e.preventDefault();if(!currentUser)return;const body=$('comment-text').value.trim();if(body.length<2||body.length>1200)return;const btn=$('comment-send');btn.disabled=true;try{await addDoc(collection(db,collectionName),{uid:currentUser.uid,name:(currentUser.displayName||'Google user').slice(0,80),text:body,createdAt:serverTimestamp()});$('comment-text').value='';$('comments-status').textContent=label().sent}catch{$('comments-status').textContent=label().error}finally{btn.disabled=false}});
}catch{loadError=true;update()}
