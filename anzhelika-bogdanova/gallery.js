/* The artist's 25 supplied images, arranged as chapters. No autoplay or external gallery service. */
(() => {
  const exhibition = document.getElementById('artExhibition');
  if (!exhibition) return;

  const picture = (file, title, titleEn, note, noteEn, alt, altEn) => ({
    src: `./assets/${file}.webp`, title, titleEn, note, noteEn, alt, altEn
  });
  const chapters = {
    words: {
      name: 'Книги и слово', nameEn: 'Books & words',
      works: [
        picture('art-19','Книга оживает','A book comes alive','Там, где слово встречается с воображением.','Where words meet the imagination.','Волшебная раскрытая книга под светящимися деревьями','An open book among luminous trees'),
        picture('book-and-nature','За пределами страницы','Beyond the page','У каждой истории есть свой пейзаж.','Every story has a landscape of its own.','Раскрытая книга перед зелёной долиной','An open book overlooking a green valley'),
        picture('art-21','Время читать','Time to read','Тишина, удобное кресло и новая глава.','A quiet room, a comfortable chair, a new chapter.','Женщина читает книгу в мягком кресле','A woman reads in a comfortable armchair'),
        picture('art-24','Письмо от руки','Writing by hand','Когда мысли находят дорогу на бумагу.','When thoughts find their way onto paper.','Женщина делает записи в блокноте при вечернем свете','A woman writes in her notebook in warm evening light'),
        picture('art-15','Перо вдохновения','The feather of inspiration','Лёгкая мысль, из которой может родиться история.','A small thought that might become a story.','Яркое акварельное перо на голубом фоне','A bright watercolor feather on blue'),
        picture('writer-at-desk','Свой голос','Finding your voice','У каждого автора есть свой способ начать.','Every writer finds their own beginning.','Женщина работает за компьютером у окна','A woman works at a computer beside a window')
      ]
    },
    aromas: {
      name: 'Ароматы и природа', nameEn: 'Aromas & nature',
      works: [
        picture('art-13','Язык ароматов','The language of scents','Цветы, травы и масла — красота маленьких деталей.','Flowers, herbs and oils — the beauty of small details.','Красочные пузырьки с эфирными маслами, веточками и цветами','Colorful essential-oil bottles with flowers and herbs'),
        picture('art-23','Цитрусовое настроение','A citrus mood','Светлые краски, листья и пряные ноты.','Bright colors, green leaves and warm spice.','Лаймы, зелёные листья и палочки корицы','Limes, fresh leaves and cinnamon sticks'),
        picture('art-16','Солнечная пауза','A sunlit pause','Лимоны, цветы и чашка чая среди зелени.','Lemons, flowers and a cup of tea in the garden.','Букет полевых цветов, лимоны и чай на столе','Wildflowers, lemons and tea on a table')
      ]
    },
    relations: {
      name: 'Близость и отношения', nameEn: 'Closeness & relationships',
      works: [
        picture('love-and-support','Навстречу','Meeting each other','Иногда достаточно протянуть руку.','Sometimes reaching out is enough.','Улыбающаяся пара держится за руки среди цветов','A smiling couple holding hands among flowers'),
        picture('thoughtful-conversation','Услышать друг друга','Listening to each other','Внимание к другому начинается с разговора.','Caring begins with listening.','Мужчина и женщина разговаривают на скамейке','A couple having a thoughtful talk on a bench'),
        picture('warm-embrace','Близость','Closeness','Тепло, для которого не нужны слова.','Warmth that needs no words.','Мужчина обнимает женщину в розовом','A man embraces a woman dressed in pink'),
        picture('honest-talk','Разговор','A conversation','Говорить искренне и не бояться услышать ответ.','To speak honestly and be ready to listen.','Сидящая пара бережно держится за руки','A seated couple gently holding hands'),
        picture('mutual-trust','Доверие','Trust','Две истории, которые решили быть рядом.','Two stories choosing to meet.','Молодая пара смотрит друг на друга в парке','A young couple looking at each other in a park'),
        picture('art-20','Нежность','Tenderness','Тихое мгновение взаимной заботы.','A quiet moment of mutual care.','Молодая пара нежно касается друг друга лбами','A young couple gently touching foreheads'),
        picture('art-17','Сказать цветами','Say it with flowers','Букет как маленькая история внимания.','A bouquet as a little gesture of care.','Мужчина с букетом роз в городе','A man holding a bouquet of roses in a city')
      ]
    },
    moments: {
      name: 'Моменты жизни', nameEn: 'Moments of life',
      works: [
        picture('art-10','Взгляд внутрь','Looking inward','Остановиться и прислушаться к себе.','Pause and listen to yourself.','Акварельный портрет светловолосой женщины','A watercolor portrait of a fair-haired woman'),
        picture('art-18','О чём я думаю','What am I thinking?','Мысли, которым нужно немного пространства.','Thoughts that need a little room.','Задумчивая молодая женщина смотрит вдаль','A thoughtful young woman looking into the distance'),
        picture('art-12','Дождь за окном','Rain at the window','Иногда пауза становится началом перемен.','Sometimes a pause marks a new beginning.','Женщина у окна с каплями дождя','A woman beside a rain-streaked window'),
        picture('art-14','Можно выдохнуть','Room to breathe','Разрешить себе просто отдохнуть.','Giving yourself permission to rest.','Женщина отдыхает на кровати у окна','A woman resting on a bed by the window'),
        picture('art-22','Зимняя тишина','Winter silence','В холодном воздухе тоже есть своя нежность.','There is tenderness in the winter air, too.','Женщина в шарфе среди зимних деревьев','A woman wrapped in a scarf among winter trees'),
        picture('art-9','Осенняя дорога','An autumn path','Дорога, на которой хочется замедлить шаг.','A path that invites you to slow down.','Яркая осенняя аллея среди деревьев','A bright autumn path among trees'),
        picture('art-11','Обычный день','An ordinary day','Небольшие дела, из которых складывается жизнь.','The small errands that make up everyday life.','Женщина с сумками идёт по солнечной улице','A woman carrying shopping bags on a sunny street'),
        picture('quiet-tea','Чашка тишины','A cup of quiet','Несколько минут только для себя.','A few moments just for yourself.','Женщина пьёт чай у окна','A woman drinking tea beside a window'),
        picture('art-25','Просто радость','Simple joy','Иногда хорошее настроение смотрит прямо на нас.','Sometimes happiness looks right at us.','Рыжая улыбающаяся собака на зелёном фоне','A happy golden dog against a green background')
      ]
    }
  };

  const tabs = [...exhibition.querySelectorAll('[data-gallery-group]')];
  const stage = document.getElementById('artStage');
  const feature = document.getElementById('artFeatureOpen');
  const img = document.getElementById('artFeatureImage');
  const title = document.getElementById('artFeatureTitle');
  const note = document.getElementById('artFeatureText');
  const chapterLabel = document.getElementById('artChapterName');
  const position = document.getElementById('artPosition');
  const strip = document.getElementById('artFilmstrip');
  let current = 'words';
  let index = 0;
  const english = () => window.siteI18n?.language === 'en';
  const localized = (work, key) => english() ? work[key + 'En'] : work[key];

  function selectPicture(next, keepThumbs = true) {
    const group = chapters[current];
    index = (next + group.works.length) % group.works.length;
    const work = group.works[index];
    img.src = work.src;
    img.alt = localized(work, 'alt');
    feature.setAttribute('aria-label', english() ? 'Enlarge “' + localized(work,'title') + '”' : 'Увеличить картину «' + localized(work,'title') + '»');
    title.textContent = localized(work, 'title');
    note.textContent = localized(work, 'note');
    chapterLabel.textContent = english() ? group.nameEn : group.name;
    position.textContent = String(index + 1).padStart(2, '0') + ' / ' + String(group.works.length).padStart(2, '0');
    if (!keepThumbs) drawThumbs();
    [...strip.children].forEach((button, i) => {
      button.classList.toggle('is-active', i === index);
      button.setAttribute('aria-pressed', String(i === index));
    });
    const selected = strip.children[index];
    if (selected && keepThumbs) selected.scrollIntoView({block:'nearest',inline:'nearest',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  }

  function drawThumbs() {
    const fragment = document.createDocumentFragment();
    chapters[current].works.forEach((work,i) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'art-thumb';
      button.setAttribute('aria-label', (english() ? 'Select ' : 'Выбрать картину «') + localized(work,'title') + (english() ? '' : '»'));
      const thumb = document.createElement('img');
      thumb.src = work.src;
      thumb.alt = '';
      thumb.loading = 'lazy';
      thumb.width = 1024;
      thumb.height = 1024;
      button.append(thumb);
      button.addEventListener('click', () => selectPicture(i));
      fragment.append(button);
    });
    strip.replaceChildren(fragment);
  }

  function selectChapter(key, focusTab = false) {
    if (!chapters[key]) return;
    current = key;
    index = 0;
    tabs.forEach(button => {
      const active = button.dataset.galleryGroup === key;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
      if (active) stage.setAttribute('aria-labelledby', button.id);
      if (active && focusTab) button.focus();
    });
    strip.scrollLeft = 0;
    selectPicture(0, false);
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => selectChapter(tab.dataset.galleryGroup));
    tab.addEventListener('keydown', event => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      event.preventDefault();
      const next = (tabs.indexOf(tab) + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      selectChapter(tabs[next].dataset.galleryGroup, true);
    });
  });
  document.getElementById('artPrev').addEventListener('click', () => selectPicture(index - 1));
  document.getElementById('artNext').addEventListener('click', () => selectPicture(index + 1));
  stage.addEventListener('keydown', event => {
    if (event.target.closest('.art-filmstrip') || !['ArrowRight','ArrowLeft'].includes(event.key)) return;
    event.preventDefault();
    selectPicture(index + (event.key === 'ArrowRight' ? 1 : -1));
  });
  let startX = 0, startY = 0;
  feature.addEventListener('touchstart', event => {startX=event.changedTouches[0].screenX;startY=event.changedTouches[0].screenY},{passive:true});
  feature.addEventListener('touchend', event => {
    const dx=event.changedTouches[0].screenX-startX,dy=event.changedTouches[0].screenY-startY;
    if(Math.abs(dx)>65 && Math.abs(dx)>Math.abs(dy)*1.4){event.preventDefault();selectPicture(index + (dx<0?1:-1));}
  },{passive:false});
  document.addEventListener('site:language-change', () => selectPicture(index,false));
  selectChapter('words');
})();
