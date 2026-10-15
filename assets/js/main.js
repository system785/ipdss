/* ИП Девятова С.С. — интерактив и анимации */
(function () {
  'use strict';

  var doc = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Шапка + прогресс чтения ---------- */
  var header = doc.querySelector('[data-header]');
  var progress = doc.querySelector('[data-progress]');
  var toTop = doc.querySelector('[data-to-top]');

  function onScroll() {
    var y = window.pageYOffset || doc.documentElement.scrollTop;
    if (header) header.classList.toggle('is-stuck', y > 8);
    if (progress) {
      var h = doc.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    }
    if (toTop) toTop.classList.toggle('is-show', y > 640);
    parallax(y);
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Лёгкий параллакс ---------- */
  var pxEls = [].slice.call(doc.querySelectorAll('[data-parallax]'));
  var ticking = false;
  function parallax(y) {
    if (reduce || !pxEls.length || ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      pxEls.forEach(function (el) {
        var speed = parseFloat(el.getAttribute('data-parallax')) || 0.1;
        var r = el.getBoundingClientRect();
        if (r.bottom > 0 && r.top < window.innerHeight) {
          var offset = (window.innerHeight - r.top) * speed;
          el.style.setProperty('--px', offset.toFixed(1) + 'px');
          el.style.transform = 'translate3d(0,' + (-offset * 0.35).toFixed(1) + 'px,0)';
        }
      });
      ticking = false;
    });
  }

  /* ---------- Меню-бургер ---------- */
  var burger = doc.querySelector('[data-burger]');
  var menu = doc.querySelector('[data-menu]');
  function closeMenu() {
    if (!burger || !menu) return;
    burger.classList.remove('is-open');
    menu.classList.remove('is-open');
    doc.body.style.overflow = '';
  }
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = !menu.classList.contains('is-open');
      burger.classList.toggle('is-open', open);
      menu.classList.toggle('is-open', open);
      doc.body.style.overflow = open ? 'hidden' : '';
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') closeMenu();
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ---------- Появление блоков при скролле ---------- */
  var revealEls = [].slice.call(doc.querySelectorAll('[data-reveal]'));
  if (!('IntersectionObserver' in window) || reduce) {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Счётчики ---------- */
  var counters = [].slice.call(doc.querySelectorAll('[data-count]'));
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var dur = 1400;
    var start = null;
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.round(target * eased);
      el.textContent = val.toLocaleString('ru-RU');
      if (p < 1) window.requestAnimationFrame(frame);
      else el.textContent = target.toLocaleString('ru-RU');
    }
    window.requestAnimationFrame(frame);
  }
  if (counters.length) {
    if (reduce || !('IntersectionObserver' in window)) {
      counters.forEach(function (el) { el.textContent = parseFloat(el.getAttribute('data-count')).toLocaleString('ru-RU'); });
    } else {
      var co = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { animateCount(e.target); co.unobserve(e.target); }
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { co.observe(el); });
    }
  }

  /* ---------- Карусели (прокрутка в обе стороны) ---------- */
  function setupCarousel(root) {
    var track = root.querySelector('[data-track]');
    if (!track) return;
    var prev = root.querySelector('[data-prev]');
    var next = root.querySelector('[data-next]');
    var dotsBox = root.querySelector('[data-dots]');
    var dots = [];

    function slideW() {
      var first = track.children[0];
      if (!first) return 320;
      var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || 20) || 20;
      return first.getBoundingClientRect().width + gap;
    }
    function maxScroll() { return Math.max(0, track.scrollWidth - track.clientWidth); }
    function atStart() { return track.scrollLeft <= 4; }
    function atEnd() { return track.scrollLeft >= maxScroll() - 4; }

    function buildDots() {
      if (!dotsBox) return;
      dotsBox.innerHTML = '';
      dots = [];
      var pages = Math.max(1, Math.ceil(track.scrollWidth / track.clientWidth));
      if (pages > 12) pages = 12;
      for (var i = 0; i < pages; i++) {
        var b = doc.createElement('button');
        b.type = 'button';
        b.className = 'dot';
        b.setAttribute('aria-label', 'Слайд ' + (i + 1));
        (function (idx) {
          b.addEventListener('click', function () {
            track.scrollTo({ left: idx * track.clientWidth, behavior: reduce ? 'auto' : 'smooth' });
          });
        })(i);
        dotsBox.appendChild(b);
        dots.push(b);
      }
      syncDots();
    }
    function syncDots() {
      if (!dots.length) return;
      var idx = Math.round(track.scrollLeft / track.clientWidth);
      dots.forEach(function (d, i) { d.classList.toggle('is-active', i === idx); });
    }
    function syncArrows() {
      if (prev) prev.disabled = atStart();
      if (next) next.disabled = atEnd();
    }
    function go(dir) {
      var w = slideW();
      var left = track.scrollLeft + dir * w;
      if (dir > 0 && atEnd()) left = 0;
      if (dir < 0 && atStart()) left = maxScroll();
      track.scrollTo({ left: left, behavior: reduce ? 'auto' : 'smooth' });
    }

    if (prev) prev.addEventListener('click', function () { go(-1); pause(); });
    if (next) next.addEventListener('click', function () { go(1); pause(); });

    var raf;
    track.addEventListener('scroll', function () {
      if (raf) return;
      raf = window.requestAnimationFrame(function () { syncArrows(); syncDots(); raf = null; });
    }, { passive: true });

    /* перетаскивание мышью */
    var isDown = false, startX = 0, startLeft = 0, moved = 0;
    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      isDown = true; moved = 0;
      startX = e.clientX; startLeft = track.scrollLeft;
      track.classList.add('is-dragging');
      pause();
    });
    window.addEventListener('pointermove', function (e) {
      if (!isDown) return;
      var dx = e.clientX - startX;
      moved = Math.abs(dx);
      track.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!isDown) return;
      isDown = false;
      track.classList.remove('is-dragging');
      if (moved > 6) {
        var w = slideW();
        var target = Math.round(track.scrollLeft / w) * w;
        track.scrollTo({ left: target, behavior: reduce ? 'auto' : 'smooth' });
      }
    });
    track.addEventListener('click', function (e) {
      if (moved > 6) { e.preventDefault(); e.stopPropagation(); moved = 0; }
    }, true);

    /* автопрокрутка */
    var timer = null;
    var delay = parseInt(root.getAttribute('data-autoplay'), 10) || 0;
    function start() {
      if (!delay || reduce) return;
      stop();
      timer = window.setInterval(function () {
        if (doc.hidden) return;
        if (atEnd()) track.scrollTo({ left: 0, behavior: 'smooth' });
        else go(1);
      }, delay);
    }
    function stop() { if (timer) { window.clearInterval(timer); timer = null; } }
    function pause() { stop(); window.setTimeout(start, 9000); }
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    root.addEventListener('focusin', stop);

    buildDots();
    syncArrows();
    start();
    window.addEventListener('resize', function () { buildDots(); syncArrows(); });
  }
  [].slice.call(doc.querySelectorAll('[data-carousel]')).forEach(setupCarousel);

  /* ---------- FAQ-аккордеон ---------- */
  [].slice.call(doc.querySelectorAll('[data-faq] .faq__q')).forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq__item');
      var answer = item.querySelector('.faq__a');
      var open = item.classList.contains('is-open');
      var box = item.parentElement;
      box.querySelectorAll('.faq__item.is-open').forEach(function (other) {
        if (other !== item) {
          other.classList.remove('is-open');
          other.querySelector('.faq__a').style.maxHeight = 0;
          other.querySelector('.faq__q').setAttribute('aria-expanded', 'false');
        }
      });
      item.classList.toggle('is-open', !open);
      answer.style.maxHeight = open ? 0 : answer.scrollHeight + 'px';
      btn.setAttribute('aria-expanded', String(!open));
    });
  });

  /* ---------- Формы (демо-отправка) ---------- */
  [].slice.call(doc.querySelectorAll('[data-form]')).forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = form.querySelector('.form__ok');
      if (ok) ok.classList.add('is-show');
      form.reset();
      window.setTimeout(function () { if (ok) ok.classList.remove('is-show'); }, 7000);
    });
  });

  /* ---------- Модальное окно заявки ---------- */
  var modal = doc.querySelector('[data-modal]');
  if (modal) {
    var mTitle = modal.querySelector('[data-modal-title]');
    var mProd = modal.querySelector('[data-modal-product]');
    var mSub = modal.querySelector('[data-modal-sub]');
    function openModal(title, prod) {
      if (mTitle) mTitle.textContent = title;
      if (mProd) mProd.value = prod || title;
      if (mSub) mSub.textContent = prod && prod !== title
        ? 'Продукт: ' + prod + '. Менеджер перезвонит в течение 15 минут в рабочее время.'
        : 'Менеджер перезвонит в течение 15 минут в рабочее время.';
      modal.hidden = false;
      doc.body.style.overflow = 'hidden';
      var first = modal.querySelector('input');
      if (first) window.setTimeout(function () { first.focus(); }, 60);
    }
    function closeModal() {
      modal.hidden = true;
      doc.body.style.overflow = '';
      var ok = modal.querySelector('.form__ok');
      if (ok) ok.classList.remove('is-show');
    }
    doc.addEventListener('click', function (ev) {
      var trigger = ev.target.closest('[data-lead]');
      if (trigger) {
        ev.preventDefault();
        openModal(trigger.getAttribute('data-lead'), trigger.getAttribute('data-product'));
      }
    });
    modal.querySelectorAll('[data-modal-close]').forEach(function (el) {
      el.addEventListener('click', closeModal);
    });
    doc.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && !modal.hidden) closeModal();
    });
    var mForm = modal.querySelector('[data-form]');
    if (mForm) mForm.addEventListener('submit', function () {
      window.setTimeout(closeModal, 2600);
    });
  }

  /* ---------- Уведомление о cookies ---------- */
  var cookie = doc.querySelector('[data-cookie]');
  if (cookie) {
    var key = 'ipdss_policy_ok';
    var accepted = false;
    try { accepted = window.localStorage.getItem(key) === '1'; } catch (err) { accepted = false; }
    if (!accepted) window.setTimeout(function () { cookie.classList.add('is-show'); }, 1400);
    cookie.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () {
        cookie.classList.remove('is-show');
        try { window.localStorage.setItem(key, '1'); } catch (err) {}
      });
    });
  }

  /* ---------- Активный пункт меню + год ---------- */
  var page = doc.body.getAttribute('data-page');
  if (page) {
    [].slice.call(doc.querySelectorAll('[data-nav]')).forEach(function (a) {
      if (a.getAttribute('data-nav') === page) a.classList.add('is-active');
    });
  }
  [].slice.call(doc.querySelectorAll('[data-year]')).forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- Клик по e-mail: подсказка, если окно письма не открылось ---------- */
  var mailToast = doc.querySelector('[data-mail-toast]');
  if (mailToast) {
    var mtShowT = null, mtHideT = null, mtWatchT = null;
    var mtEmail = mailToast.getAttribute('data-email') || '';

    function mtHide() {
      mailToast.classList.remove('is-show');
      doc.body.classList.remove('mail-toast-open');
      window.clearTimeout(mtShowT);
      window.clearTimeout(mtHideT);
      mtHideT = window.setTimeout(function () { mailToast.hidden = true; }, 340);
    }
    function mtShow() {
      mailToast.hidden = false;
      window.clearTimeout(mtHideT);
      /* форсируем reflow, чтобы плавная анимация проигрывалась и в фоновой вкладке */
      void mailToast.offsetHeight;
      mailToast.classList.add('is-show');
      doc.body.classList.add('mail-toast-open');
      window.clearTimeout(mtShowT);
      mtShowT = window.setTimeout(mtHide, 20000);
    }
    /* Если почтовая программа открылась, вкладка обычно теряет фокус
       или уходит в background — тогда подсказка не нужна. */
    function mtWatch() {
      var opened = false;
      function off() {
        window.removeEventListener('blur', onBlur);
        window.removeEventListener('visibilitychange', onVis);
        window.clearTimeout(mtWatchT);
      }
      function onBlur() { opened = true; off(); }
      function onVis() { if (doc.hidden) { opened = true; off(); } }
      window.addEventListener('blur', onBlur);
      window.addEventListener('visibilitychange', onVis);
      window.clearTimeout(mtWatchT);
      mtWatchT = window.setTimeout(function () {
        off();
        if (!opened) mtShow();
      }, 1100);
    }
    doc.addEventListener('click', function (ev) {
      var t = ev.target;
      if (!t || !t.closest) return;
      if (t.closest('a[href^="mailto:"]')) mtWatch();
    });
    var mtCopy = mailToast.querySelector('[data-mail-copy]');
    if (mtCopy) {
      mtCopy.addEventListener('click', function () {
        function ok() {
          mtCopy.textContent = 'Скопировано ✓';
          mtCopy.classList.add('is-ok');
          window.setTimeout(function () {
            mtCopy.textContent = 'Скопировать адрес';
            mtCopy.classList.remove('is-ok');
          }, 3200);
        }
        function fallback() {
          var ta = doc.createElement('textarea');
          ta.value = mtEmail;
          ta.setAttribute('readonly', '');
          ta.style.cssText = 'position:fixed;top:-100px;opacity:0';
          doc.body.appendChild(ta);
          ta.select();
          try { doc.execCommand('copy'); ok(); } catch (err) {}
          doc.body.removeChild(ta);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(mtEmail).then(ok, fallback);
        } else { fallback(); }
      });
    }
    var mtClose = mailToast.querySelector('[data-mail-close]');
    if (mtClose) mtClose.addEventListener('click', mtHide);
  }

  onScroll();
})();
