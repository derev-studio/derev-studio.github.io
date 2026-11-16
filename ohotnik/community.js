// Охотник: Google authentication and comments via Firebase Authentication + Firestore.
// This module intentionally does not work without a properly configured Firebase project.
// No secret/API key is embedded or generated here.
const section=document.getElementById('community');
if(section){
 const status=section.querySelector('#community-status');
 const login=section.querySelector('#community-login');
 const logout=section.querySelector('#community-logout');
 const form=section.querySelector('#community-form');
 const text=section.querySelector('#community-text');
 const list=section.querySelector('#community-list');
 const who=section.querySelector('#community-user');
 const config=window.OHOTNIK_FIREBASE_CONFIG;
 const ready=config&&['apiKey','authDomain','projectId','appId'].every(k=>typeof config[k]==='string'&&config[k].trim());
 const say=s=>{status.textContent=s};
 if(!ready){
  login.hidden=true;form.hidden=true;
  say('Google-вход и комментарии готовятся к подключению. Пока они не активированы.');
 }else{
  try{
   const [{initializeApp},{getAuth,GoogleAuthProvider,signInWithPopup,signOut,onAuthStateChanged},
    {getFirestore,collection,addDoc,query,orderBy,limit,onSnapshot,serverTimestamp}]=await Promise.all([
    import('https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js'),
    import('https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js')
   ]);
   const app=initializeApp(config,'ohotnik-community');
   const auth=getAuth(app),db=getFirestore(app);
   const posts=collection(db,'ohotnik_comments');
   login.addEventListener('click',async()=>{
    try{await signInWithPopup(auth,new GoogleAuthProvider())}
    catch(e){say(e.code==='auth/popup-closed-by-user'?'Вход отменён.':'Google-вход не удался. Проверь разрешённый домен и настройки Firebase.')}
   });
   logout.addEventListener('click',()=>signOut(auth));
   onAuthStateChanged(auth,user=>{
    login.hidden=!!user;logout.hidden=!user;form.hidden=!user;
    who.textContent=user?'Вы вошли как '+(user.displayName||'пользователь Google'):'Войдите через Google, чтобы оставить комментарий.';
   });
   form.addEventListener('submit',async e=>{
    e.preventDefault();
    const user=auth.currentUser,body=text.value.trim();
    if(!user||body.length<2||body.length>1000)return;
    const send=form.querySelector('button[type=submit]');send.disabled=true;
    try{
     await addDoc(posts,{uid:user.uid,name:String(user.displayName||'Пользователь').slice(0,80),
       body,createdAt:serverTimestamp()});
     text.value='';say('Комментарий опубликован.');
    }catch(e){say('Не удалось опубликовать комментарий. Проверь правила Firestore.')}
    finally{send.disabled=false}
   });
   onSnapshot(query(posts,orderBy('createdAt','desc'),limit(30)),snap=>{
    list.replaceChildren();
    for(const doc of snap.docs){
     const v=doc.data(),article=document.createElement('article');article.className='community-comment';
     const heading=document.createElement('strong');heading.textContent=String(v.name||'Посетитель').slice(0,80);
     const body=document.createElement('p');body.textContent=String(v.body||'').slice(0,1000);
     article.append(heading,body);list.append(article);
    }
    if(snap.empty)list.textContent='Пока нет комментариев. Стань первым!';
    if(!auth.currentUser)say('Комментарии доступны для чтения без входа.');
   },()=>say('Комментарии временно недоступны. Проверь подключение и правила доступа.'));
  }catch(e){
   login.hidden=true;form.hidden=true;say('Сервис комментариев не загрузился. Попробуй обновить страницу.');
  }
 }
}
