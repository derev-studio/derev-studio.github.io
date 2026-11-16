// Охотник: Google sign-in and comments via existing photo-gallery Firebase project.
// Comments share RTDB /comments rules, with site-specific keys starting "ohotnik_".
// This avoids new Firestore services and does not overwrite other websites' records.
const community=document.getElementById('community');
if(community){
 const status=community.querySelector('#community-status');
 const login=community.querySelector('#community-login');
 const logout=community.querySelector('#community-logout');
 const form=community.querySelector('#community-form');
 const input=community.querySelector('#community-text');
 const list=community.querySelector('#community-list');
 const identity=community.querySelector('#community-user');
 const config=window.OHOTNIK_FIREBASE_CONFIG;
 const say=message=>{status.textContent=message;};
 const ready=config&&['apiKey','authDomain','projectId','databaseURL','appId'].every(k=>typeof config[k]==='string'&&config[k].trim());
 if(!ready){
  say('Настройки Google-входа не найдены. Попробуйте обновить страницу.');
 }else{
  try{
   const [
    {initializeApp},
    {getAuth,GoogleAuthProvider,signInWithPopup,signOut,onAuthStateChanged},
    {getDatabase,ref,push,set,query,orderByKey,startAt,endAt,limitToLast,onValue,serverTimestamp}
   ]=await Promise.all([
    import('https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js'),
    import('https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js')
   ]);
   const app=initializeApp(config,'ohotnik-community');
   const auth=getAuth(app),database=getDatabase(app);
   const allComments=ref(database,'comments');
   const indexed=query(allComments,orderByKey(),startAt('ohotnik_'),endAt('ohotnik_\uf8ff'),limitToLast(80));
   login.hidden=false;
   login.addEventListener('click',async()=>{
    login.disabled=true;
    try{
     await signInWithPopup(auth,new GoogleAuthProvider());
     say('Вы вошли через Google. Теперь можно написать комментарий.');
    }catch(error){
     const code=String(error?.code||'');
     if(code.includes('popup-closed')||code.includes('cancelled-popup'))say('Вход отменён.');
     else if(code.includes('popup-blocked'))say('Разрешите всплывающие окна для сайта и нажмите «Войти через Google» снова.');
     else if(code.includes('unauthorized-domain'))say('Домен derev-studio.github.io должен быть разрешён в Firebase Authentication.');
     else say('Google-вход не удался. Код: '+(code||'ошибка подключения'));
    }finally{login.disabled=false}
   });
   logout.addEventListener('click',async()=>{try{await signOut(auth)}catch(e){say('Не удалось выйти: проверьте интернет.')}});
   onAuthStateChanged(auth,user=>{
    login.hidden=!!user;
    logout.hidden=!user;
    form.hidden=!user;
    identity.textContent=user?'Вы вошли как '+(user.displayName||'пользователь Google'):'Войдите через Google, чтобы оставить комментарий.';
   });
   form.addEventListener('submit',async event=>{
    event.preventDefault();
    const user=auth.currentUser,body=input.value.trim();
    if(!user){say('Сначала войдите через Google.');return}
    if(body.length<2||body.length>500){say('Комментарий должен быть от 2 до 500 символов.');return}
    const submit=form.querySelector('button[type="submit"]');submit.disabled=true;
    say('Публикую комментарий…');
    try{
     const generated=push(allComments).key;
     if(!generated)throw Error('NO_KEY');
     await set(ref(database,'comments/ohotnik_'+generated),{
      uid:user.uid,
      author:String(user.displayName||'Посетитель').slice(0,80),
      text:body,
      createdAt:serverTimestamp()
     });
     input.value='';
     say('Комментарий опубликован.');
    }catch(error){
     say('Комментарий не сохранился. Возможно, в Firebase запрещена запись. Код: '+String(error?.code||'ошибка'));
    }finally{submit.disabled=false}
   });
   onValue(indexed,snapshot=>{
    list.replaceChildren();
    const records=[];
    snapshot.forEach(child=>{
     const value=child.val();
     if(!String(child.key||'').startsWith('ohotnik_')||!value||typeof value!=='object')return;
     records.push({author:String(value.author||'Посетитель').slice(0,80),
      text:String(value.text||'').slice(0,500),date:Number(value.createdAt)||0});
    });
    records.sort((a,b)=>b.date-a.date);
    for(const item of records.slice(0,30)){
     const article=document.createElement('article');article.className='community-comment';
     const author=document.createElement('strong');author.textContent=item.author;
     const body=document.createElement('p');body.textContent=item.text;
     article.append(author,body);list.append(article);
    }
    if(!records.length)list.textContent='Пока нет комментариев. Можно оставить первый.';
    if(!auth.currentUser)say('Комментарии можно читать без входа. Для публикации войдите через Google.');
   },error=>{
    say('Не удалось прочитать комментарии из Firebase. Код: '+String(error?.code||'ошибка'));
   });
  }catch(error){
   login.hidden=true;form.hidden=true;
   say('Google-вход и комментарии не загрузились. Попробуйте обновить страницу.');
  }
 }
}
