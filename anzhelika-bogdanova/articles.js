/* Curated links to original publications on Proza.ru; no copyrighted text is reproduced. */
(() => {
  const articles = [
    ['Почему психолог пишет статьи','Why Psychologists Write Articles','writing','https://proza.ru/2025/11/28/413'],
    ['Не увязнуть в самокопании при написании книги','How Not to Get Lost in Self-Analysis While Writing','writing','https://proza.ru/2025/08/14/273'],
    ['Техника «Визуализация места силы»','The Place of Strength Visualization','psychology','https://proza.ru/2025/01/27/725'],
    ['Красная Шапочка и Серый Волк: архетипические образы','Little Red Riding Hood and the Gray Wolf: Archetypes','creative','https://proza.ru/2025/11/27/389'],
    ['О чём писать?','What Should I Write About?','writing','https://proza.ru/2025/02/07/2014'],
    ['Почему я каждый раз наступаю на те же грабли','Why Do I Keep Making the Same Mistakes?','relationships','https://proza.ru/2025/12/04/485'],
    ['Сказка «Стоптанные башмачки» как метафора','The Worn-Out Dancing Shoes as a Metaphor','creative','https://proza.ru/2025/12/03/2124'],
    ['Рисуем вместе с нейросетью','Creating Art with AI','creative','https://proza.ru/2025/12/03/57'],
    ['Что заставляет партнёров уходить от меня','Why Do Partners Leave Me?','relationships','https://proza.ru/2025/12/02/2241'],
    ['Как понять, что у вас ОКР','How to Recognize OCD','psychology','https://proza.ru/2025/12/02/2110'],
    ['Ваш внутренний джаз','Your Inner Jazz','creative','https://proza.ru/2025/12/01/2215'],
    ['Первые признаки шизофрении','Early Signs of Schizophrenia','psychology','https://proza.ru/2025/12/01/440'],
    ['От каких женщин не уходят мужчины','What Makes Some Relationships Last?','relationships','https://proza.ru/2025/11/29/1800'],
    ['Почему я пишу','Why I Write','writing','https://proza.ru/2025/11/29/362'],
    ['Аромат чабреца — якорь спокойствия','The Scent of Thyme: An Anchor of Calm','aroma','https://proza.ru/2025/11/28/1311'],
    ['Запах успеха: энергия достижения цели','The Scent of Success and Motivation','aroma','https://proza.ru/2025/11/28/558'],
    ['Бессонница: ваш путь к здоровому сну','Insomnia: Finding Your Way to Better Sleep','psychology','https://proza.ru/2025/11/25/2223'],
    ['Панические атаки: теория и пять техник самопомощи','Panic Attacks and Five Self-Help Techniques','psychology','https://proza.ru/2025/11/25/2191'],
    ['Привычка страдать','The Habit of Suffering','psychology','https://proza.ru/2025/11/24/466'],
    ['Что говорит о вас рисунок дерева','What a Drawing of a Tree Might Say About You','creative','https://proza.ru/2025/11/23/762'],
    ['Биполярное расстройство у выдающихся личностей','Bipolar Disorder in Notable People','psychology','https://proza.ru/2025/11/19/1891'],
    ['Метафорические стили в писательстве','Metaphorical Styles in Writing','writing','https://proza.ru/2025/11/17/2017'],
    ['Ваша субличность в блоге','Your Subpersonality in a Blog','writing','https://proza.ru/2025/11/14/517'],
    ['Символический образ Дракона в психологии Юнга','The Symbol of the Dragon in Jungian Psychology','creative','https://proza.ru/2025/11/14/494'],
    ['Вместе пишем книгу','Writing a Book Together','writing','https://proza.ru/2025/09/04/860'],
    ['Важность общения','The Importance of Communication','psychology','https://proza.ru/2025/09/04/846'],
    ['10 креативных идей для вашей книги','Ten Creative Ideas for Your Book','writing','https://proza.ru/2025/09/04/571'],
    ['Свобода при написании книги','Freedom While Writing a Book','writing','https://proza.ru/2025/09/04/540'],
    ['Находим свои ресурсы','Finding Your Inner Resources','psychology','https://proza.ru/2025/09/04/524'],
    ['Пишем свою первую книгу','Writing Your First Book','writing','https://proza.ru/2025/08/14/319'],
    ['Выбор темы для книги','Choosing a Topic for Your Book','writing','https://proza.ru/2025/08/14/317'],
    ['Ритуалы ОКР как способ адаптации','OCD Rituals as a Form of Adaptation','psychology','https://proza.ru/2025/08/12/255'],
    ['Сила слова','The Power of Words','psychology','https://proza.ru/2025/07/14/1101'],
    ['Выгорание у тех, кто помогает животным','Burnout Among People Who Help Animals','psychology','https://proza.ru/2025/05/13/1958'],
    ['Вместе пишем книгу. Путь слова','Writing Together: The Path of Words','writing','https://proza.ru/2025/05/03/747'],
    ['Ароматы для радости','Scents for Joy','aroma','https://proza.ru/2025/04/28/1475'],
    ['Главы из курса по аромапсихологии','Chapters from an Aroma Psychology Course','aroma','https://proza.ru/2025/04/28/1398'],
    ['ОКР у детей: особенности проявления','OCD in Children: How It May Appear','psychology','https://proza.ru/2025/04/26/574'],
    ['ОКР отношений: когда любовь становится одержимостью','Relationship OCD: When Love Becomes Obsession','relationships','https://proza.ru/2025/04/24/1517'],
    ['Чем опасны нарциссы','The Risks of Narcissistic Behavior','relationships','https://proza.ru/2025/04/24/1264'],
    ['Чувствовать себя особенной','Feeling Special','psychology','https://proza.ru/2025/04/22/1619'],
    ['Вы автор своей жизни, можете стать автором текстов','You Are the Author of Your Life — and Can Write','writing','https://proza.ru/2025/04/18/1772'],
    ['Создание и раскрашивание свечей как арт-терапия','Making and Painting Candles as Art Therapy','creative','https://proza.ru/2025/04/18/1613'],
    ['Умей принимать неопределённость и давай передышку','Accepting Uncertainty and Giving Yourself a Break','psychology','https://proza.ru/2025/04/08/1647'],
    ['Когда тебе плохо в отношениях','When a Relationship Feels Painful','relationships','https://proza.ru/2025/02/22/1909'],
    ['Что мешает мне построить счастливые отношения','What Stops Me from Building a Happy Relationship?','relationships','https://proza.ru/2025/02/22/1902'],
    ['Мандала самоподдержки','A Mandala for Self-Support','creative','https://proza.ru/2025/12/20/1543'],
    ['Самоисполняющееся пророчество','The Self-Fulfilling Prophecy','psychology','https://proza.ru/2025/12/18/462'],
    ['Дежавю: загадочное чувство уже виденного','Déjà Vu: The Strange Feeling of Having Seen It Before','psychology','https://proza.ru/2025/12/17/770'],
    ['Как наши победы связаны с ощущением счастья','How Our Victories Relate to Happiness','psychology','https://proza.ru/2025/12/17/438'],
    ['Как к вам притягиваются люди, близкие по духу','How Like-Minded People Find Each Other','relationships','https://proza.ru/2025/12/16/1988'],
    ['SMS как зеркало души','Text Messages as a Mirror of the Soul','relationships','https://proza.ru/2025/12/15/1936'],
    ['Картины Моне: интерпретация психолога','Monet’s Paintings Through a Psychologist’s Eyes','creative','https://proza.ru/2025/12/14/1216'],
    ['Относись к жизни легко и радостно','Approaching Life with Ease and Joy','psychology','https://proza.ru/2025/12/14/424'],
    ['Как проявляется ОКР в отношениях','How OCD May Show Up in Relationships','relationships','https://proza.ru/2025/12/13/2036'],
    ['Когда тебе плохо, все сбегают','When You Feel Down, Everyone Seems to Leave','relationships','https://proza.ru/2025/12/12/1647'],
    ['Первый снег как ресурс для души','The First Snow as a Source of Comfort','psychology','https://proza.ru/2025/12/10/1473'],
    ['Связь тяги к розе с приходом любви в вашу жизнь','Roses, Longing and the Arrival of Love','aroma','https://proza.ru/2025/12/08/66']
  ].sort((a,b) => b[3].slice(17,27).localeCompare(a[3].slice(17,27)));

  const categories = [
    ['all','Все темы','All topics'],
    ['psychology','Психология','Psychology'],
    ['relationships','Отношения','Relationships'],
    ['writing','Писательство','Writing'],
    ['creative','Творчество','Creativity'],
    ['aroma','Ароматы','Scents']
  ];
  const grid=document.getElementById('articleGrid');
  const filters=document.getElementById('articleFilters');
  const counter=document.getElementById('articleCounter');
  const search=document.getElementById('articleSearch');
  const more=document.getElementById('showMoreArticles');
  if(!grid || !filters || !counter || !search || !more) return;
  let category='all';
  let limit=9;
  const isEnglish=()=>window.siteI18n?.language==='en';
  const label=(ru,en)=>isEnglish()?en:ru;
  const byCategory=key=>categories.find(item=>item[0]===key);
  const shortDate=url=>url.match(/\/(20\d\d)\//)?.[1]||'';
  function show() {
    const term=search.value.trim().toLocaleLowerCase();
    const subset=articles.filter(a=>(category==='all'||a[2]===category)&&(!term||(a[0]+' '+a[1]).toLocaleLowerCase().includes(term)));
    const visible=subset.slice(0,limit);
    grid.replaceChildren();
    for(const [ru,en,group,url] of visible) {
      const a=document.createElement('a');
      a.className='library-card spotlight-card';
      a.href=url;a.target='_blank';a.rel='noopener noreferrer';
      const categoryNode=document.createElement('span');categoryNode.className='library-category';categoryNode.textContent=label(byCategory(group)[1],byCategory(group)[2]);
      const year=document.createElement('span');year.className='library-year';year.textContent=shortDate(url);
      const h=document.createElement('h3');h.textContent=label(ru,en);
      const arrow=document.createElement('span');arrow.className='library-arrow';arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');
      const top=document.createElement('div');top.className='library-card-top';top.append(categoryNode,year);
      a.append(top,h,arrow);grid.appendChild(a);
    }
    counter.textContent=label(`Показано ${visible.length} из ${subset.length} статей`,`Showing ${visible.length} of ${subset.length} articles`);
    more.hidden=subset.length<=limit;
    if(!subset.length){const p=document.createElement('p');p.className='library-empty';p.textContent=label('По вашему запросу ничего не найдено. Попробуйте другое слово.','No articles found. Try another search term.');grid.appendChild(p)}
  }
  function renderFilters(){
    filters.replaceChildren();
    for(const [key,ru,en] of categories){
      const button=document.createElement('button');button.type='button';button.className='filter-chip';button.textContent=label(ru,en);
      button.setAttribute('aria-pressed',String(category===key));button.addEventListener('click',()=>{category=key;limit=9;renderFilters();show()});filters.appendChild(button);
    }
  }
  more.addEventListener('click',()=>{limit+=9;show()});
  search.addEventListener('input',()=>{limit=9;show()});
  document.addEventListener('site:language-change',()=>{renderFilters();show()});
  renderFilters();show();
})();
