// Bellissima voce — скрипты сайта

var header = document.querySelector('.header');

// Шапка: при прокрутке становится светлой и показывает маленький логотип
(function () {
  if (!header) return;
  function update() { header.classList.toggle('is-scrolled', window.scrollY > 8); }
  update();
  window.addEventListener('scroll', update, { passive: true });
})();

// Мобильное меню: открыть/закрыть по кнопке, по пункту меню, по Esc и по клику мимо
(function () {
  var burger = document.getElementById('burger');
  var menu = document.getElementById('mnav');
  if (!burger || !menu) return;

  function setOpen(open) {
    menu.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    header.classList.toggle('menu-open', open);
    document.dispatchEvent(new CustomEvent('menu:toggle', { detail: open }));
  }
  burger.addEventListener('click', function () { setOpen(menu.hidden); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !menu.hidden) { setOpen(false); burger.focus(); }
  });
  document.addEventListener('click', function (e) {
    if (!menu.hidden && !header.contains(e.target)) setOpen(false);
  });
  // на широком экране меню в шапке — мобильное закрываем
  var wide = window.matchMedia('(min-width: 1360px)');
  (wide.addEventListener ? wide.addEventListener.bind(wide, 'change') : wide.addListener.bind(wide))(function (m) { if (m.matches) setOpen(false); });
  window.addEventListener('resize', function () { if (wide.matches && !menu.hidden) setOpen(false); });
})();

// Карточки «метафора → физиология»: переворот по нажатию (и с клавиатуры — это кнопки)
document.querySelectorAll('.flip').forEach(function (card) {
  card.addEventListener('click', function () {
    card.setAttribute('aria-pressed', card.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
  });
});

// Антракт: занавес открывается, когда блок появился на экране
(function () {
  var box = document.getElementById('stagebox');
  if (!box) return;
  function check() {
    var r = box.getBoundingClientRect();
    if (r.top < window.innerHeight * .7 && r.bottom > 0) {
      box.classList.add('is-open');
      window.removeEventListener('scroll', check);
    }
  }
  window.addEventListener('scroll', check, { passive: true });
  check();
})();

// Плеер «до / после»: две записи с YouTube. Видео грузится только по нажатию (быстрее страница,
// без cookie — youtube-nocookie). При переключении текущее видео останавливается.
(function () {
  var player = document.getElementById('player');
  if (!player) return;
  var boxes = player.querySelectorAll('.player__video');

  function stopAll() {
    boxes.forEach(function (box) {
      var f = box.querySelector('iframe');
      if (f) { f.remove(); box.querySelector('.player__poster').hidden = false; }
    });
  }
  boxes.forEach(function (box) {
    var poster = box.querySelector('.player__poster');
    poster.addEventListener('click', function () {
      stopAll();
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + box.dataset.youtube + '?autoplay=1&rel=0&modestbranding=1&playsinline=1';
      f.title = poster.getAttribute('aria-label');
      f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      f.allowFullscreen = true;
      poster.hidden = true;
      box.appendChild(f);
    });
  });

  player.querySelectorAll('.switch__btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var take = btn.dataset.take;
      if (player.dataset.take === take) return;
      stopAll();
      player.dataset.take = take;
      player.querySelectorAll('.switch__btn').forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      boxes.forEach(function (box) { box.hidden = box.dataset.take !== take; });
    });
  });
})();
// «Скопировать» готовое сообщение: буфер обмена, а если он недоступен (старый браузер,
// открытие файла двойным кликом) — выделяем текст и копируем по-старинке
(function () {
  var btn = document.getElementById('copyMessage'), text = document.getElementById('firstMessage'), status = document.getElementById('copyStatus');
  if (!btn || !text) return;
  function done(ok) {
    status.textContent = ok ? 'Скопировано — откройте Telegram и вставьте сообщение' : 'Выделите текст и скопируйте его вручную';
    if (ok) { btn.textContent = 'Скопировано ✓'; setTimeout(function () { btn.textContent = 'Скопировать'; }, 2500); }
  }
  function fallback() {
    var r = document.createRange(); r.selectNodeContents(text);
    var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
    var ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
    done(ok);
  }
  btn.addEventListener('click', function () {
    var value = text.innerText.trim();
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(value).then(function () { done(true); }, fallback);
    } else { fallback(); }
  });
})();

// Появление блоков при прокрутке: элементы получают .rv, при входе в экран — .is-in.
// Соседям даём небольшую задержку (--d), чтобы они появлялись «лесенкой».
(function () {
  var groups = [
    '.section__head',
    '.pains__list li', '.pains__bridge',
    '.flip-hint', '.flip', '.lineage',
    '.stagebox', '.proof__cta',
    '.letter',
    '.results__list li',
    '.programme',
    '.ticket', '.tickets__terms', '.message',
    '.faq__item', '.faq__cta',
    '.finale .invite'
  ];
  var els = [];
  groups.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el, i) {
      el.classList.add('rv');
      if (/li$|\.flip$|\.ticket$|\.faq__item$/.test(sel)) el.style.setProperty('--d', Math.min(i, 5) * 0.09 + 's');
      els.push(el);
    });
  });
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function check() {
    var h = window.innerHeight;
    els = els.filter(function (el) {
      var r = el.getBoundingClientRect();
      // на экране или уже выше него (например, после перехода по меню) — показываем
      if (reduce || r.top < h * 0.92) { el.classList.add('is-in'); return false; }
      return true;
    });
    if (!els.length) { window.removeEventListener('scroll', check); window.removeEventListener('resize', check); }
  }
  window.addEventListener('scroll', check, { passive: true });
  window.addEventListener('resize', check);
  // переход по якорю из меню — сразу показать всё, что выше и на экране
  window.addEventListener('hashchange', function () { setTimeout(check, 50); });
  check();
})();

// Год в подвале
(function () { var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear(); })();

// Липкая кнопка (телефон): прячется, когда видна другая кнопка записи или открыто меню
(function () {
  var sticky = document.getElementById('stickyCta');
  if (!sticky) return;
  // все кнопки записи внутри страницы (не в шапке и не сама липкая)
  var ctas = [].slice.call(document.querySelectorAll('main a[href*="t.me/oxanna23"]'));
  var menuOpen = false;
  function anyVisible() {
    var h = window.innerHeight;
    return ctas.some(function (a) { var r = a.getBoundingClientRect(); return r.bottom > 0 && r.top < h - 70; });
  }
  // проверка дешёвая (несколько кнопок), поэтому прямо на прокрутке
  function update() { sticky.classList.toggle('is-hidden', menuOpen || anyVisible()); }
  document.addEventListener('menu:toggle', function (e) { menuOpen = e.detail; update(); });
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
