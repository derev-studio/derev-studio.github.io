/* Shuk community: Google identity, Firebase Realtime Database metadata,
   photo files via ImgBB behind the gallery's Cloudflare Worker.
   Never embed the ImgBB secret or store image blobs in Firebase. */
(() => {
  "use strict";
  const CONFIG = {
    apiKey: "AIzaSyB2X3o7KwYFkMfsskKoWpQYBrws8L-Mn9w",
    authDomain: "photo-gallery-18193.firebaseapp.com",
    databaseURL: "https://photo-gallery-18193-default-rtdb.firebaseio.com",
    projectId: "photo-gallery-18193",
    appId: "1:329094770221:web:b9d076f195f968668212a4"
  };
  const API = "https://photo-ai-qwen.qerevv.workers.dev/";
  const COLLECTION = "shukCommunity";
  const $ = id => document.getElementById(id);
  const words = {
    ru: {
      title:"💬 Разговоры и фотографии с рынка",intro:"Расскажи о находке, задай вопрос или покажи цветы. Для отправки нужен вход через Google. Фото хранятся в ImgBB, не в Google.",
      login:"🔐 Войти через Google",logout:"Выйти",guest:"Читать можно без регистрации",signed:"Вы вошли как",
      category:"Раздел",flowers:"🌷 Цветы и растения",finds:"🛍️ Находки на рынке",question:"❓ Вопрос",text:"Твой комментарий",placeholder:"Что интересного ты увидел на рынке?",
      photo:"📷 Добавить фотографию (необязательно)",choose:"Выбрать фото",remove:"Убрать фото",nothing:"Фото не выбрано",
      publish:"Опубликовать",pending:"Сначала запись проверит редактор. Пожалуйста, публикуй только свои фотографии, а людей — с их согласия.",
      preparing:"Подготавливаю фотографию…",uploading:"Загружаю фото в ImgBB…",saving:"Отправляю на проверку…",
      success:"✅ Отправлено! Запись появится после проверки.",loginFirst:"Чтобы написать, войди через Google.",
      needed:"Добавь комментарий или фотографию.",tooLong:"Комментарий слишком длинный (максимум 900 символов).",
      fileType:"Поддерживаются JPEG, PNG, WebP и HEIC.",fileSize:"Фото слишком большое. Выбери файл до 20 МБ.",
      decode:"Не удалось открыть фото. Попробуй JPEG или PNG.",offline:"Не удалось соединиться с сервисом. Попробуй позже.",
      denied:"База данных не разрешила эту операцию. Нужно проверить правила доступа Firebase.",
      uploadLost:"Фото загружено в ImgBB, но запись не сохранена. Попробуй ещё раз — повторно загружать фото не придётся.",
      empty:"Пока нет опубликованных записей. Можешь стать первым!",minePending:"Твоя запись ждёт проверки.",
      moderator:"🛡️ Проверка публикаций",nonePending:"Новых публикаций на проверку нет.",
      approve:"✓ Одобрить",reject:"Удалить",confirmReject:"Удалить эту публикацию без возможности восстановления?",approved:"Запись опубликована.",removed:"Запись удалена.",
      photosExternal:"Фото загружается в ImgBB и может быть доступно всем, у кого есть его ссылка. Не загружай документы и личные данные.",
      initFail:"Не удалось подключить вход Google и базу комментариев.",
      inaccessible:"Не удалось загрузить записи. Проверь доступ к базе комментариев.",
      loading:"Загружаю записи…",unknown:"Посетитель",imageAlt:"Фотография посетителя рынка",working:"Обрабатываю…"
    },
    en: {
      title:"💬 Market stories and photos",intro:"Share a find, ask a question or show your flowers. Sign in with Google to post. Photos are stored on ImgBB, not Google.",
      login:"🔐 Sign in with Google",logout:"Sign out",guest:"Reading does not require sign-in",signed:"Signed in as",
      category:"Category",flowers:"🌷 Flowers and plants",finds:"🛍️ Market finds",question:"❓ Question",text:"Your comment",placeholder:"What did you discover at the market?",
      photo:"📷 Add a photo (optional)",choose:"Choose a photo",remove:"Remove photo",nothing:"No photo selected",
      publish:"Submit",pending:"An editor reviews posts before publication. Upload your own photos only; ask people before photographing them.",
      preparing:"Preparing the photo…",uploading:"Uploading to ImgBB…",saving:"Sending for review…",
      success:"✅ Sent! Your post will appear after review.",loginFirst:"Sign in with Google to post.",
      needed:"Add a comment or photo.",tooLong:"Maximum comment length is 900 characters.",
      fileType:"JPEG, PNG, WebP and HEIC are supported.",fileSize:"Photo is too large. Choose one under 20 MB.",
      decode:"Could not process this photo. Try JPEG or PNG.",offline:"Service unavailable. Please try again.",
      denied:"Database refused this operation. Firebase access rules need checking.",
      uploadLost:"Photo uploaded to ImgBB, but the post was not saved. Retry without uploading it twice.",
      empty:"No approved posts yet. You can be the first!",minePending:"Your post is awaiting review.",
      moderator:"🛡️ Review submissions",nonePending:"No submissions need review.",
      approve:"✓ Approve",reject:"Delete",confirmReject:"Delete this submission permanently?",approved:"Post approved.",removed:"Post deleted.",
      photosExternal:"Photos go to ImgBB and can be visible to anyone with the link. Do not upload documents or private details.",
      initFail:"Could not connect to Google sign-in and the comment database.",
      inaccessible:"Could not load posts. Check database access.",
      loading:"Loading posts…",unknown:"Visitor",imageAlt:"Visitor's market photo",working:"Working…"
    },
    he: {
      title:"💬 סיפורים ותמונות מהשוק",intro:"שתפו מציאה, שאלו שאלה או הראו פרחים. כדי לפרסם מתחברים עם Google. התמונות נשמרות ב-ImgBB ולא ב-Google.",
      login:"🔐 התחברות באמצעות Google",logout:"התנתקות",guest:"אפשר לקרוא בלי להירשם",signed:"מחובר/ת בתור",
      category:"קטגוריה",flowers:"🌷 פרחים ועציצים",finds:"🛍️ מציאות בשוק",question:"❓ שאלה",text:"התגובה שלכם",placeholder:"מה גיליתם בשוק?",
      photo:"📷 הוספת תמונה (לא חובה)",choose:"בחירת תמונה",remove:"הסרת תמונה",nothing:"לא נבחרה תמונה",
      publish:"שליחה",pending:"עורך יבדוק את הפרסום לפני הצגתו. פרסמו תמונות שלכם בלבד וקבלו הסכמה מאנשים מצולמים.",
      preparing:"מכין את התמונה…",uploading:"מעלה תמונה ל-ImgBB…",saving:"שולח לבדיקה…",
      success:"✅ נשלח! הפרסום יופיע לאחר בדיקה.",loginFirst:"כדי לפרסם, התחברו עם Google.",
      needed:"כתבו תגובה או הוסיפו תמונה.",tooLong:"עד 900 תווים בתגובה.",
      fileType:"נתמכות תמונות JPEG, PNG, WebP ו-HEIC.",fileSize:"התמונה גדולה מדי. בחרו תמונה עד 20 MB.",
      decode:"לא ניתן לפתוח את התמונה. נסו JPEG או PNG.",offline:"השירות אינו זמין כעת. נסו שוב.",
      denied:"מסד הנתונים חסם את הפעולה. יש לבדוק את הרשאות Firebase.",
      uploadLost:"התמונה עלתה ל-ImgBB אך הפרסום לא נשמר. נסו שוב בלי להעלות מחדש.",
      empty:"עדיין אין פרסומים מאושרים. אתם מוזמנים להיות הראשונים!",minePending:"הפרסום שלכם ממתין לבדיקה.",
      moderator:"🛡️ בדיקת פרסומים",nonePending:"אין פרסומים שממתינים לבדיקה.",
      approve:"✓ אישור",reject:"מחיקה",confirmReject:"למחוק את הפרסום לצמיתות?",approved:"הפרסום אושר.",removed:"הפרסום נמחק.",
      photosExternal:"התמונה עולה ל-ImgBB ועשויה להיות נגישה לכל מי שיש לו קישור. אין להעלות מסמכים או פרטים אישיים.",
      initFail:"לא ניתן להתחבר למערכת Google ולמסד התגובות.",
      inaccessible:"לא ניתן לטעון פרסומים. בדקו הרשאות מסד הנתונים.",
      loading:"טוען פרסומים…",unknown:"מבקר",imageAlt:"תמונת מבקר מהשוק",working:"מעבד…"
    },
    ar: {
      title:"💬 حكايات وصور من السوق",intro:"شارك ما وجدته أو اطرح سؤالاً أو اعرض الزهور. يلزم تسجيل الدخول عبر Google للنشر. الصور تُحفظ في ImgBB وليس Google.",
      login:"🔐 الدخول عبر Google",logout:"تسجيل الخروج",guest:"يمكن القراءة دون تسجيل الدخول",signed:"تم الدخول باسم",
      category:"القسم",flowers:"🌷 الزهور والنباتات",finds:"🛍️ أشياء من السوق",question:"❓ سؤال",text:"تعليقك",placeholder:"ماذا اكتشفت في السوق؟",
      photo:"📷 إضافة صورة (اختياري)",choose:"اختيار صورة",remove:"إزالة الصورة",nothing:"لم تُحدد صورة",
      publish:"إرسال",pending:"تُراجع المشاركات قبل نشرها. شارك صورك فقط واستأذن الأشخاص قبل تصويرهم.",
      preparing:"أجهز الصورة…",uploading:"أرفع الصورة إلى ImgBB…",saving:"أرسل للمراجعة…",
      success:"✅ تم الإرسال! ستظهر المشاركة بعد المراجعة.",loginFirst:"سجّل الدخول عبر Google للمشاركة.",
      needed:"أضف تعليقاً أو صورة.",tooLong:"التعليق لا يتجاوز 900 حرف.",
      fileType:"تُقبل JPEG وPNG وWebP وHEIC.",fileSize:"الصورة كبيرة جداً. اختر صورة أصغر من 20 MB.",
      decode:"تعذّر فتح الصورة. جرّب JPEG أو PNG.",offline:"الخدمة غير متاحة حالياً. حاول مجدداً.",
      denied:"رفضت قاعدة البيانات العملية. يجب فحص قواعد وصول Firebase.",
      uploadLost:"رُفعت الصورة إلى ImgBB لكن المنشور لم يُحفظ. حاول ثانية دون رفعها مجدداً.",
      empty:"لا توجد مشاركات منشورة بعد. يمكنك أن تكون الأول!",minePending:"مشاركتك تنتظر المراجعة.",
      moderator:"🛡️ مراجعة المشاركات",nonePending:"لا توجد مشاركات للمراجعة.",
      approve:"✓ موافقة",reject:"حذف",confirmReject:"هل تريد حذف هذا المنشور نهائياً؟",approved:"تم نشر المشاركة.",removed:"تم حذف المشاركة.",
      photosExternal:"تُرفع الصور إلى ImgBB ويمكن لمن يملك الرابط مشاهدتها. لا ترفع مستندات أو بيانات خاصة.",
      initFail:"تعذّر الاتصال بتسجيل دخول Google وقاعدة التعليقات.",
      inaccessible:"تعذّر تحميل المشاركات. افحص أذونات قاعدة البيانات.",
      loading:"جار تحميل المشاركات…",unknown:"زائر",imageAlt:"صورة زائر من السوق",working:"جار المعالجة…"
    }
  };
  let lang = document.documentElement.lang || "ru";
  const t = key => (words[lang] || words.ru)[key] || words.ru[key] || key;
  let auth, db, currentUser = null, isOwner = false, entries = [];
  let selectedFile = null, previewUrl = "", recentUpload = null, sending = false;
  const categoryList = ["flowers","finds","question"];
  function setStatus(value, error = false) {
    const el = $("shukStatus");
    if (el) { el.textContent = value; el.classList.toggle("error", error); }
  }
  function safePhoto(url) {
    try {
      const u = new URL(String(url || ""));
      if (u.protocol !== "https:") return null;
      if (!["i.ibb.co","ibb.co"].includes(u.hostname)) return null;
      return u.href;
    } catch { return null; }
  }
  function localDate(value) {
    if (!Number.isFinite(Number(value)) || Number(value) < 1) return "";
    return new Date(Number(value)).toLocaleDateString(lang === "he" ? "he-IL" : lang === "ar" ? "ar" : lang === "en" ? "en-GB" : "ru-RU", {year:"numeric",month:"short",day:"numeric"});
  }
  const make = (tag, className, value) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (value !== undefined) el.textContent = value;
    return el;
  };
  function translateForm() {
    for (const el of document.querySelectorAll("[data-shuk-t]")) el.textContent = t(el.dataset.shukT);
    $("shukText").placeholder = t("placeholder");
    $("shukText").setAttribute("aria-label", t("text"));
    $("shukPhoto").setAttribute("aria-label", t("photo"));
    for (const option of $("shukCategory").options) option.textContent = t(option.value);
    $("shukFileName").textContent = selectedFile ? selectedFile.name : t("nothing");
    if (auth) updateAccount();
    renderEntries();
  }
  function updateAccount() {
    const btn = $("shukLogin");
    const account = $("shukAccount");
    btn.textContent = currentUser ? t("logout") : t("login");
    const name = currentUser?.displayName || t("unknown");
    account.textContent = currentUser ? t("signed") + " " + name : t("guest");
  }
  function showPreview() {
    const img = $("shukPreview");
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = selectedFile ? URL.createObjectURL(selectedFile) : "";
    img.hidden = !previewUrl;
    if (previewUrl) img.src = previewUrl;
    else img.removeAttribute("src");
    $("shukFileName").textContent = selectedFile ? selectedFile.name : t("nothing");
    $("shukClearPhoto").hidden = !selectedFile;
  }
  async function login() {
    if (auth.currentUser) return auth.currentUser;
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      return (await auth.signInWithPopup(provider)).user;
    } catch (e) {
      if (e.code === "auth/popup-blocked") {
        await auth.signInWithRedirect(provider);
        return null;
      }
      if (e.code === "auth/popup-closed-by-user" || e.code === "auth/cancelled-popup-request") return null;
      throw e;
    }
  }
  async function verifyOwner(user) {
    if (!user) return false;
    try {
      const resp = await fetch(API,{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+await user.getIdToken()},body:JSON.stringify({action:"whoami"})});
      if (!resp.ok) return false;
      const data = await resp.json();
      return data.isOwner === true;
    } catch { return false; }
  }
  function entryCard(id, data, pending = false) {
    const card = make("article", "shuk-entry");
    const header = make("div", "shuk-entry-head");
    const who = make("strong","",String(data.author || t("unknown")).slice(0,72));
    const stamp = make("small","",localDate(data.createdAt));
    header.append(who, stamp);
    card.append(header);
    if (categoryList.includes(data.category)) card.append(make("span", "shuk-entry-category", t(data.category)));
    if (data.text) card.append(make("p", "shuk-entry-text", String(data.text).slice(0,900)));
    const imageUrl = safePhoto(data.imageUrl);
    if (imageUrl) {
      const a = make("a", "shuk-photo-link");
      a.href=imageUrl;a.target="_blank";a.rel="noopener noreferrer";
      const img=make("img","shuk-entry-photo");
      img.src=imageUrl;img.alt=t("imageAlt");img.loading="lazy";img.referrerPolicy="no-referrer";
      a.append(img);card.append(a);
    }
    if (pending && isOwner) {
      const actions=make("div","shuk-mod-actions");
      const approve=make("button", "shuk-green", t("approve"));
      const reject=make("button","shuk-red",t("reject"));
      approve.type=reject.type="button";
      approve.onclick=()=>moderate(id,true,approve,reject);
      reject.onclick=()=>moderate(id,false,approve,reject);
      actions.append(approve,reject);card.append(actions);
    }
    return card;
  }
  function renderEntries() {
    const publicBox=$("shukEntries"),pendingBox=$("shukPending"),moderation=$("shukModeration");
    if (!publicBox || !pendingBox) return;
    publicBox.replaceChildren();
    pendingBox.replaceChildren();
    const approved=entries.filter(([k,v])=>v && v.state==="approved").sort((a,b)=>(Number(b[1].createdAt)||0)-(Number(a[1].createdAt)||0));
    const awaiting=entries.filter(([k,v])=>v && v.state==="pending").sort((a,b)=>(Number(b[1].createdAt)||0)-(Number(a[1].createdAt)||0));
    if (!approved.length) publicBox.append(make("p", "shuk-muted", t("empty")));
    else for(const [id,entry] of approved.slice(0,60))publicBox.append(entryCard(id,entry));
    moderation.hidden=!isOwner;
    if(isOwner) {
      $("shukModerationTitle").textContent=t("moderator")+" ("+awaiting.length+")";
      if(!awaiting.length) pendingBox.append(make("p","shuk-muted",t("nonePending")));
      else for(const [id,entry] of awaiting)pendingBox.append(entryCard(id,entry,true));
    }
    if(currentUser && awaiting.some(([,x])=>x.userUid===currentUser.uid) && !isOwner) {
      const msg=make("p","shuk-awaiting",t("minePending"));
      publicBox.prepend(msg);
    }
  }
  async function moderate(id, approve, yes, no) {
    if (!isOwner || !currentUser || !/^[\w-]{15,28}$/.test(id)) return;
    if (!approve && !confirm(t("confirmReject"))) return;
    yes.disabled=no.disabled=true;
    try {
      const row=db.ref(COLLECTION).child(id);
      if (approve) await row.update({state:"approved",reviewedAt:firebase.database.ServerValue.TIMESTAMP});
      else await row.remove();
      setStatus(t(approve?"approved":"removed"));
    } catch (e) {
      setStatus((e?.code==="PERMISSION_DENIED"?t("denied"):e.message||t("offline")),true);
    } finally {yes.disabled=no.disabled=false}
  }
  async function convertPhoto(file) {
    if (file.size > 20*1024*1024) throw new Error(t("fileSize"));
    const mime=String(file.type||"").toLowerCase();
    const allowed=["image/jpeg","image/png","image/webp","image/heic","image/heif"];
    if(!allowed.includes(mime)&&!/\.(jpe?g|png|webp|heic|heif)$/i.test(file.name))throw new Error(t("fileType"));
    let bitmap,objectURL="";
    try {
      if(typeof createImageBitmap==="function") bitmap=await createImageBitmap(file);
      else throw new Error("Use img fallback");
    }catch {
      objectURL=URL.createObjectURL(file);
      try {
        bitmap=await new Promise((resolve,reject)=>{
          const img=new Image();
          img.onload=()=>resolve(img);
          img.onerror=()=>reject(new Error(t("decode")));
          img.src=objectURL;
        });
      }catch {throw new Error(t("decode"))}
    }
    try {
      const scale=Math.min(1,1600/Math.max(bitmap.width,bitmap.height));
      const canvas=document.createElement("canvas");
      canvas.width=Math.max(1,Math.round(bitmap.width*scale));
      canvas.height=Math.max(1,Math.round(bitmap.height*scale));
      const ctx=canvas.getContext("2d");
      if(!ctx)throw new Error(t("decode"));
      ctx.fillStyle="#fff";ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
      const blob=await new Promise(resolve=>canvas.toBlob(resolve,"image/jpeg",0.83));
      if(!blob)throw new Error(t("decode"));
      return new File([blob],"shuk-photo.jpg",{type:"image/jpeg"});
    }finally{
      if(typeof bitmap.close==="function")bitmap.close();
      if(objectURL)URL.revokeObjectURL(objectURL);
    }
  }
  async function uploadPhoto(file,user) {
    const signature=[file.name,file.size,file.lastModified].join("|");
    if(recentUpload?.signature===signature&&safePhoto(recentUpload.url))return recentUpload.url;
    setStatus(t("preparing"));
    const prepared=await convertPhoto(file);
    setStatus(t("uploading"));
    const form=new FormData();
    form.append("action","imgbbUpload");
    form.append("image",prepared,prepared.name);
    const ctrl=new AbortController();
    const timeout=setTimeout(()=>ctrl.abort(),120000);
    try {
      const response=await fetch(API,{method:"POST",headers:{"Authorization":"Bearer "+await user.getIdToken()},body:form,signal:ctrl.signal});
      let data={};
      try{data=await response.json()}catch{}
      if(!response.ok||data.storage!=="imgbb"||!safePhoto(data.url))throw new Error(data.error||t("offline"));
      recentUpload={signature,url:data.url};
      return data.url;
    }finally{clearTimeout(timeout)}
  }
  async function submit(evt) {
    evt.preventDefault();
    if(sending)return;
    const text=$("shukText").value.trim(),file=selectedFile,cat=$("shukCategory").value;
    if(!text&&!file){setStatus(t("needed"),true);return}
    if(text.length>900){setStatus(t("tooLong"),true);return}
    sending=true;$("shukSubmit").disabled=true;
    let uploaded=false;
    try {
      const user=await login();
      if(!user){setStatus(t("loginFirst"),true);return}
      let imageUrl="";
      if(file){imageUrl=await uploadPhoto(file,user);uploaded=true}
      setStatus(t("saving"));
      const ref=db.ref(COLLECTION).push();
      await ref.set({
        author:String(user.displayName || user.email?.split("@")[0] || t("unknown")).slice(0,72),
        userUid:user.uid,category:categoryList.includes(cat)?cat:"finds",
        text, imageUrl, state:"pending",
        createdAt:firebase.database.ServerValue.TIMESTAMP
      });
      $("shukText").value="";selectedFile=null;
      $("shukPhoto").value="";recentUpload=null;showPreview();
      setStatus(t("success"));
    }catch(e){
      const code=String(e?.code||"").toLowerCase();
      setStatus(uploaded?t("uploadLost"):code.includes("permission")?t("denied"):(e.message||t("offline")),true);
    }finally{sending=false;$("shukSubmit").disabled=false}
  }
  function init() {
    lang=words[document.documentElement.lang]?document.documentElement.lang:"ru";
    translateForm();
    setStatus(t("loading"));
    $("shukPhoto").addEventListener("change",event=>{selectedFile=event.target.files?.[0]||null;recentUpload=null;showPreview()});
    $("shukClearPhoto").addEventListener("click",()=>{selectedFile=null;recentUpload=null;$("shukPhoto").value="";showPreview()});
    $("shukLogin").addEventListener("click",async()=>{
      try {if(auth.currentUser)await auth.signOut();else await login()}catch(e){setStatus(e.message||t("offline"),true)}
    });
    $("shukForm").addEventListener("submit",submit);
    window.addEventListener("shuk:language-change",event=>{lang=words[event.detail?.lang]?event.detail.lang:"ru";translateForm()});
    try{
      if(!window.firebase||!firebase.auth||!firebase.database)throw new Error("Firebase SDK unavailable");
      if(!firebase.apps.length)firebase.initializeApp(CONFIG);
      auth=firebase.auth();db=firebase.database();
      auth.onAuthStateChanged(async u=>{
        currentUser=u;isOwner=false;updateAccount();renderEntries();
        if(u){
          const uid=u.uid;
          isOwner=await verifyOwner(u);
          if(auth.currentUser?.uid!==uid)return;
          renderEntries();
        }
      });
      db.ref(COLLECTION).limitToLast(80).on("value",snap=>{
        entries=Object.entries(snap.val()||{});
        renderEntries();setStatus("");
      },error=>setStatus((error.code==="PERMISSION_DENIED"?t("denied"):t("inaccessible")),true));
    }catch(e){setStatus(t("initFail")+" "+e.message,true)}
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();