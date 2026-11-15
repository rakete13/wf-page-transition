/*!
 * WF Page Transition v1.4.0
 * Übergänge zwischen Seiten für Webflow, mit den View Transitions des Browsers.
 * Jede Seite behält ihre eigene URL, es wird nichts per Skript nachgeladen.
 *
 * Gehört in den Head Code (muss vor dem ersten Zeichnen der Seite laufen).
 * Benötigt nichts weiter. Browser ohne Unterstützung wechseln die Seite ganz normal.
 */
(() => {
  'use strict';
  if (window.WFPageTransition) return;

  const VERSION = '1.4.0';
  const html = document.documentElement;
  // order (mit Morph): 'morph-first' = nur das Bild bewegt sich, danach ist die Seite sofort da ·
  // 'morph-effect' = erst Morph, dann der Seiteneffekt (split = Anteil für den Morph) ·
  // 'together' = beides gleichzeitig. morphEase = Easing des Morphs.
  const cfg = Object.assign({ transition: 'fade', duration: 0.5, ease: '', radius: '', order: 'morph-first', split: 0.6, morphEase: '', debug: false }, window.WFPageTransitionConfig || {});
  const EFFECTS = ['fade', 'slide', 'slide-up', 'zoom', 'sheet', 'none'];
  const SCOPE = '[data-page-item],[data-page-next],[data-page-prev],.w-dyn-item';
  const supported = 'onpagereveal' in window;
  if (!supported) html.classList.add('wfpt-nosupport');

  /*@css*/

  /* ------------------------------------------------------------------ */
  /*  Helfer                                                             */
  /* ------------------------------------------------------------------ */
  const KEY = 'wfpt';
  const load = () => {
    try {
      return JSON.parse(sessionStorage.getItem(KEY)) || {};
    } catch (_) {
      return {};
    }
  };
  const save = (s) => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(s));
    } catch (_) {}
  };
  // Adresse vergleichbar machen: ohne #anker, ohne index.html, ohne Schrägstrich am Ende
  const norm = (u) => {
    try {
      const x = new URL(u, location.href);
      return x.origin + x.pathname.replace(/\/index\.html?$/, '/').replace(/(.)\/$/, '$1') + x.search;
    } catch (_) {
      return '';
    }
  };
  const here = () => norm(location.href);
  const valid = (e) => (EFFECTS.includes(e) ? e : 'fade');
  const flip = (d) => (d === 'back' ? 'forward' : 'back');
  const issues = [];
  const issue = (t) => issues.includes(t) || issues.push(t);

  const defaultEffect = () => valid((document.body && document.body.dataset.pageTransition) || cfg.transition);
  const morphEls = (scope) => {
    const list = Array.from(scope.querySelectorAll('[data-page-morph]'));
    if (scope.hasAttribute && scope.hasAttribute('data-page-morph')) list.unshift(scope);
    return list;
  };
  const morphName = (el) => (el.dataset.pageMorph || 'morph').trim();
  // Elemente der Seite selbst (Hero-Bild, Seitentitel), nicht in einem Teaser
  const pageMorphs = () => Array.from(document.querySelectorAll('[data-page-morph]')).filter((el) => !el.closest(SCOPE) && !el.closest('a[href]'));
  // Teaser, der auf eine Adresse zeigt und Morph-Elemente enthält
  const itemFor = (url) => {
    for (const a of document.querySelectorAll('a[href]')) {
      if (norm(a.href) !== url) continue;
      const scope = a.closest(SCOPE) || a;
      if (scope.getClientRects().length && morphEls(scope).length) return scope;
    }
    return null;
  };
  const inView = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth;
  };

  /* ------------------------------------------------------------------ */
  /*  Namen für den Browser vergeben (und wieder entfernen)              */
  /* ------------------------------------------------------------------ */
  let named = [];
  const setName = (el, name, cls) => {
    el.style.viewTransitionName = name;
    el.style.viewTransitionClass = cls;
    named.push(el);
  };
  const clearNames = () => {
    named.forEach((el) => {
      el.style.viewTransitionName = '';
      el.style.viewTransitionClass = '';
    });
    named = [];
  };
  const nameMorphs = (els, only) => {
    const used = new Set();
    const done = [];
    els.forEach((el) => {
      const n = morphName(el);
      if (only && !only.includes(n)) return;
      if (used.has(n)) return issue(`data-page-morph="${n}" kommt mehrfach vor, nur das erste Element wird verwendet.`);
      used.add(n);
      const img = el.tagName === 'IMG' || el.tagName === 'VIDEO' || el.tagName === 'PICTURE' || !!el.querySelector('img,video');
      setName(el, 'wfpt-' + n.replace(/[^a-zA-Z0-9_-]/g, '-'), img ? 'wfpt-morph wfpt-img' : 'wfpt-morph');
      // Bilder im Morph sofort laden (Webflow setzt loading="lazy"), damit sie rechtzeitig da sind
      (el.tagName === 'IMG' ? [el] : Array.from(el.querySelectorAll('img'))).forEach((im) => {
        if (im.loading === 'lazy') im.loading = 'eager';
        im.fetchPriority = 'high';
      });
      done.push(n);
    });
    return done;
  };
  const nameKeeps = (onlyVisible) => {
    const used = new Set();
    document.querySelectorAll('[data-page-keep]').forEach((el, i) => {
      const n = 'wfpt-keep-' + (el.dataset.pageKeep || i).toString().replace(/[^a-zA-Z0-9_-]/g, '-');
      if (used.has(n)) return issue('data-page-keep: gleicher Name mehrfach auf der Seite.');
      if (onlyVisible && !inView(el)) return;
      used.add(n);
      setName(el, n, 'wfpt-keep');
    });
  };

  /* ------------------------------------------------------------------ */
  /*  Klick merken: welcher Link, welcher Effekt, welcher Teaser         */
  /* ------------------------------------------------------------------ */
  let clicked = null;
  document.addEventListener(
    'click',
    (e) => {
      if (e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest && e.target.closest('a[href]');
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      let u;
      try {
        u = new URL(a.href);
      } catch (_) {
        return;
      }
      if (u.origin !== location.origin || norm(u.href) === here()) return;
      const holder = a.closest('[data-page-transition]');
      let effect = holder && holder !== document.body ? holder.dataset.pageTransition : '';
      let dir = 'forward';
      const nav = a.closest('[data-page-next],[data-page-prev]');
      if (nav) {
        if (!effect) effect = 'slide';
        if (nav.hasAttribute('data-page-prev')) dir = 'back';
      }
      clicked = a.closest(SCOPE) || a;
      const s = load();
      s.click = { to: norm(u.href), effect: valid(effect || defaultEffect()), dir, names: morphEls(clicked).map(morphName), t: Date.now() };
      save(s);
    },
    true
  );

  /* ------------------------------------------------------------------ */
  /*  Alte Seite: kurz vor dem Verlassen                                  */
  /* ------------------------------------------------------------------ */
  window.addEventListener('pageswap', (e) => {
    const s = load();
    const url = here();
    const vt = e.viewTransition;
    if (vt) {
      clearNames();
      const c = s.click && Date.now() - s.click.t < 5000 ? s.click : null;
      const act = e.activation;
      let effect = defaultEffect();
      if (c) {
        effect = c.effect;
        if (effect !== 'none' && clicked) nameMorphs(morphEls(clicked));
      } else if (!act || act.navigationType === 'traverse') {
        const back = act && act.entry && act.from ? act.entry.index < act.from.index : true;
        if (back) {
          // zurück: so, wie wir hergekommen sind, nur umgekehrt
          const info = s.enter && s.enter[url];
          if (info) {
            effect = info.effect;
            if (effect !== 'none' && info.names && info.names.length) nameMorphs(pageMorphs(), info.names);
          }
        } else {
          const dest = act && act.entry && act.entry.url ? norm(act.entry.url) : '';
          const info = dest && s.enter && s.enter[dest];
          if (info) {
            effect = info.effect;
            const it = effect !== 'none' && itemFor(dest);
            if (it) nameMorphs(morphEls(it));
          }
        }
      }
      if (effect === 'none') vt.skipTransition();
      else nameKeeps(true);
    }
    s.left = { url, t: Date.now() };
    save(s);
  });

  /* ------------------------------------------------------------------ */
  /*  Neue Seite: kurz vor dem ersten Zeichnen                            */
  /* ------------------------------------------------------------------ */
  let restored = false;
  let done;
  const api = { version: VERSION, supported, config: cfg, last: null, issues };
  api.finished = new Promise((r) => (done = r));
  window.WFPageTransition = api;

  // Wie sind wir hier angekommen? Aktualisiert auch den gemerkten Verlauf.
  const arrive = (s) => {
    const url = here();
    const c = s.click && s.click.to === url && Date.now() - s.click.t < 10000 ? s.click : null;
    const act = window.navigation && navigation.activation;
    let type = act && act.navigationType;
    if (!type) {
      const p = performance.getEntriesByType('navigation')[0];
      type = restored ? 'traverse' : c ? 'push' : p && p.type === 'back_forward' ? 'traverse' : p && p.type === 'reload' ? 'reload' : 'push';
    }
    s.stack = s.stack || [];
    s.enter = s.enter || {};
    if (s.pos === undefined) s.pos = -1;
    const left = s.left ? s.left.url : '';
    const r = { type, effect: defaultEffect(), dir: 'forward', names: [], item: '' };
    if (type === 'reload') return r;
    if (type === 'traverse') {
      let back;
      if (act && act.from && act.entry) back = act.entry.index < act.from.index;
      else back = s.stack[s.pos - 1] === url || s.stack[s.pos + 1] !== url;
      if (back) {
        const info = s.enter[left];
        r.dir = 'back';
        if (info) {
          r.effect = info.effect;
          r.dir = flip(info.dir);
          r.names = info.names || [];
        }
        r.item = left;
      } else {
        const info = s.enter[url];
        if (info) {
          r.effect = info.effect;
          r.dir = info.dir;
          r.names = info.names || [];
        }
      }
      const i = back ? s.stack.lastIndexOf(url, Math.max(0, s.pos - 1)) : s.stack.indexOf(url, s.pos + 1);
      if (i >= 0) s.pos = i;
    } else {
      if (c) {
        r.effect = c.effect;
        r.dir = c.dir;
        r.names = c.names || [];
      }
      s.stack = s.stack.slice(0, s.pos + 1);
      s.stack.push(url);
      if (s.stack.length > 50) s.stack = s.stack.slice(-50);
      s.pos = s.stack.length - 1;
      s.enter[url] = { effect: r.effect, dir: r.dir, names: r.names };
      Object.keys(s.enter).forEach((k) => s.stack.includes(k) || delete s.enter[k]);
    }
    s.click = null;
    return r;
  };

  const debugOn = () => {
    try {
      const m = /[?&]wfpt-debug(?:=(\w+))?/.exec(location.search);
      if (m) {
        if (m[1] === 'off') sessionStorage.removeItem('wfpt-debug');
        else sessionStorage.setItem('wfpt-debug', m[1] || '1');
      }
      return sessionStorage.getItem('wfpt-debug') || (cfg.debug ? '1' : '');
    } catch (_) {
      return cfg.debug ? '1' : '';
    }
  };

  // Übliche Easings mit GSAP-Namen, als CSS-Kurven (CSS-Werte wie ease-in-out oder cubic-bezier(…) gehen auch)
  const B = (a, b, c, d) => `cubic-bezier(${a}, ${b}, ${c}, ${d})`;
  const EASES = {
    none: 'linear', linear: 'linear',
    'sine.in': B(0.12, 0, 0.39, 0), 'sine.out': B(0.61, 1, 0.88, 1), 'sine.inout': B(0.37, 0, 0.63, 1),
    'power1.in': B(0.11, 0, 0.5, 0), 'power1.out': B(0.5, 1, 0.89, 1), 'power1.inout': B(0.45, 0, 0.55, 1),
    'power2.in': B(0.32, 0, 0.67, 0), 'power2.out': B(0.33, 1, 0.68, 1), 'power2.inout': B(0.65, 0, 0.35, 1),
    'power3.in': B(0.5, 0, 0.75, 0), 'power3.out': B(0.25, 1, 0.5, 1), 'power3.inout': B(0.76, 0, 0.24, 1),
    'power4.in': B(0.64, 0, 0.78, 0), 'power4.out': B(0.22, 1, 0.36, 1), 'power4.inout': B(0.83, 0, 0.17, 1),
    'expo.in': B(0.7, 0, 0.84, 0), 'expo.out': B(0.16, 1, 0.3, 1), 'expo.inout': B(0.87, 0, 0.13, 1),
    'circ.in': B(0.55, 0, 1, 0.45), 'circ.out': B(0, 0.55, 0.45, 1), 'circ.inout': B(0.85, 0, 0.15, 1),
    'back.in': B(0.36, 0, 0.66, -0.56), 'back.out': B(0.34, 1.56, 0.64, 1), 'back.inout': B(0.68, -0.6, 0.32, 1.6),
  };
  const toEase = (v) => {
    if (!v) return '';
    const k = String(v).trim().toLowerCase().replace(/-/g, '');
    if (EASES[k]) return EASES[k];
    if (/^(power[1-4]|sine|expo|circ|back)$/.test(k)) return EASES[k + '.out']; // GSAP: ohne Zusatz = .out
    if (/^[a-z]+\.(in|out|inout)$/.test(k)) issue(`Unbekanntes Easing "${v}", es gilt der Standard.`);
    return /^[a-z]+\.(in|out|inout)$/.test(k) ? '' : String(v).trim();
  };
  api.eases = Object.keys(EASES);

  const applyVars = () => {
    const b = document.body ? document.body.dataset : {};
    let d = parseFloat(b.pageDuration);
    if (!Number.isFinite(d)) d = cfg.duration;
    if (debugOn() === 'slow') d *= 6;
    const st = html.style;
    st.setProperty('--wfpt-duration', d + 's');
    const ease = toEase(b.pageEase || cfg.ease);
    if (ease) st.setProperty('--wfpt-ease', ease);
    if (b.pageScale) st.setProperty('--wfpt-scale', b.pageScale);
    if (b.pageDim) st.setProperty('--wfpt-dim', b.pageDim);
    const mease = toEase(b.pageMorphEase || cfg.morphEase);
    if (mease) st.setProperty('--wfpt-morph-ease', mease);
    const split = parseFloat(b.pageSplit !== undefined ? b.pageSplit : cfg.split);
    if (Number.isFinite(split)) st.setProperty('--wfpt-split', String(Math.min(0.9, Math.max(0.1, split))));
    const radius = b.pageRadius !== undefined ? b.pageRadius : cfg.radius;
    if (radius !== undefined && radius !== '') st.setProperty('--wfpt-radius', /^[\d.]+$/.test(String(radius)) ? radius + 'px' : radius);
  };

  window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
      restored = true;
      clearNames();
    }
  });

  window.addEventListener('pagereveal', (e) => {
    const vt = e.viewTransition;
    const s = load();
    setupNav(); // Links zum nächsten Eintrag müssen stehen, bevor Teaser gesucht werden
    const r = arrive(s);
    save(s);
    restored = false;
    api.last = { effect: r.effect, direction: r.dir, type: r.type, morph: [], ran: false, status: 'kein Übergang' };
    if (!vt) return done();
    if (r.effect === 'none' || r.type === 'reload') {
      vt.skipTransition();
      return done();
    }
    clearNames();
    applyVars();
    html.dataset.wfpt = r.effect;
    html.dataset.wfptDir = r.dir;
    html.classList.add('wfpt-running');
    nameKeeps(false);
    if (r.names.length) {
      if (r.item) {
        // zurück auf die Übersicht: der Teaser, von dem wir kamen
        const it = itemFor(r.item);
        if (it) api.last.morph = nameMorphs(morphEls(it), r.names);
      } else {
        api.last.morph = nameMorphs(pageMorphs(), r.names);
        r.names.forEach((n) => api.last.morph.includes(n) || issue(`Kein Gegenstück für data-page-morph="${n}" auf dieser Seite gefunden.`));
      }
    }
    // Bilder im Morph, die noch nicht geladen sind: neues Abbild erst einblenden, wenn sie da sind
    const pending = named
      .filter((el) => el.style.viewTransitionClass.includes('wfpt-img'))
      .flatMap((el) => (el.tagName === 'IMG' ? [el] : Array.from(el.querySelectorAll('img'))))
      .filter((im) => !(im.complete && im.naturalWidth));
    if (pending.length) {
      html.classList.add('wfpt-wait');
      const ready = (im) =>
        new Promise((res) => {
          const go = () => (im.decode ? im.decode().catch(() => {}).then(res) : res());
          if (im.complete && im.naturalWidth) go();
          else {
            im.addEventListener('load', go, { once: true });
            im.addEventListener('error', res, { once: true });
          }
        });
      // Weiter: angehaltene Einblendungen auf den Stand ihres Morphs bringen, dann fortsetzen
      const resume = () => {
        if (!html.classList.contains('wfpt-wait')) return;
        try {
          const all = document.getAnimations().filter((x) => x.effect && x.effect.pseudoElement);
          all.forEach((x) => {
            const m = /^::view-transition-new\((wfpt-[^)]+)\)$/.exec(x.effect.pseudoElement);
            if (!m) return;
            const g = all.find((y) => y.effect.pseudoElement === `::view-transition-group(${m[1]})`);
            if (!g || g.currentTime === null) return;
            const end = x.effect.getComputedTiming().endTime;
            x.currentTime = Math.min(g.currentTime, end);
          });
        } catch (_) {}
        html.classList.remove('wfpt-wait');
      };
      Promise.all(pending.map(ready)).then(resume);
      setTimeout(resume, 3000 + parseFloat(getComputedStyle(html).getPropertyValue('--wfpt-duration')) * 1000);
    }
    const order = (document.body && document.body.dataset.pageOrder) || cfg.order;
    if (api.last.morph.length && order !== 'together') html.classList.add(order === 'morph-effect' ? 'wfpt-seqfx' : 'wfpt-seq');
    api.last.ran = true;
    api.last.status = 'läuft';
    vt.ready.catch((err) => {
      api.last.status = 'abgebrochen: ' + (err && err.message);
      issue('Übergang abgebrochen: ' + (err && err.message));
    });
    vt.finished.finally(() => {
      if (api.last.status === 'läuft') api.last.status = 'fertig';
      clearNames();
      delete html.dataset.wfpt;
      delete html.dataset.wfptDir;
      html.classList.remove('wfpt-seq', 'wfpt-seqfx');
      html.classList.remove('wfpt-wait');
      html.classList.remove('wfpt-running');
      done();
      document.dispatchEvent(new CustomEvent('wfpt:done', { detail: api.last }));
      if (debugOn()) report();
    });
  });

  /* ------------------------------------------------------------------ */
  /*  Blättern zwischen CMS-Einträgen: data-page-list, -next, -prev      */
  /* ------------------------------------------------------------------ */
  const setupNav = () => {
    const navs = document.querySelectorAll('[data-page-next],[data-page-prev]');
    if (!navs.length) return;
    const list = document.querySelector('[data-page-list]');
    if (!list) return issue('data-page-next / data-page-prev ohne Liste: Collection List mit data-page-list fehlt.');
    const items = [];
    list.querySelectorAll('a[href]').forEach((a) => {
      const url = norm(a.href);
      if (url && !items.some((x) => x.url === url)) items.push({ url, href: a.href, el: a.closest('.w-dyn-item,[data-page-item]') || a });
    });
    const i = items.findIndex((x) => x.url === here());
    if (i < 0) issue('Diese Seite kommt in der Liste (data-page-list) nicht vor.');
    const loop = list.hasAttribute('data-page-loop') && list.dataset.pageLoop !== 'false' && items.length > 1;
    navs.forEach((nav) => {
      let j = i < 0 ? -1 : i + (nav.hasAttribute('data-page-next') ? 1 : -1);
      if (loop && i >= 0) j = (j + items.length) % items.length;
      const it = items[j];
      nav.classList.toggle('is-hidden', !it);
      if (!it) {
        nav.style.display = 'none';
        return;
      }
      (nav.matches('a') ? [nav] : Array.from(nav.querySelectorAll('a'))).forEach((a) => (a.href = it.href));
      nav.querySelectorAll('[data-page-field]').forEach((t) => {
        const src = it.el.querySelector(`[data-page-field="${CSS.escape(t.dataset.pageField)}"]`);
        if (!src) return;
        if (t.tagName === 'IMG' && src.tagName === 'IMG') {
          ['src', 'srcset', 'sizes', 'alt'].forEach((k) => (src.hasAttribute(k) ? t.setAttribute(k, src.getAttribute(k)) : t.removeAttribute(k)));
        } else t.textContent = src.textContent;
      });
    });
  };

  /* ------------------------------------------------------------------ */
  /*  Debug: ?wfpt-debug (bleibt für den Tab an), ?wfpt-debug=slow,      */
  /*  ?wfpt-debug=off                                                    */
  /* ------------------------------------------------------------------ */
  let badge = null;
  const report = () => {
    if (!document.body) return;
    if (document.querySelector('[data-anim="preloader"]:not([data-anim-once="session"])'))
      issue('WF Anim Preloader ohne data-anim-once="session": Er würde bei jedem Seitenwechsel erscheinen.');
    const l = api.last || {};
    const text = !supported
      ? 'Browser ohne View Transitions, normaler Seitenwechsel'
      : `${l.effect || '–'} · ${l.direction || '–'} · ${l.status || '–'}${l.morph && l.morph.length ? ' · Morph: ' + l.morph.join(', ') : ''}`;
    console.groupCollapsed(`[WFPageTransition] Debug · ${text}`);
    console.log('Letzter Übergang', l);
    console.log('Elemente der Seite (data-page-morph)', pageMorphs());
    console.log('Stehen bleibend (data-page-keep)', document.querySelectorAll('[data-page-keep]'));
    issues.forEach((t) => console.warn(t));
    console.groupEnd();
    if (!badge) {
      badge = document.createElement('div');
      badge.setAttribute('style', 'position:fixed;left:12px;bottom:12px;z-index:2147483647;font:600 12px/1.4 system-ui,sans-serif;color:#fff;padding:8px 12px;border-radius:8px;box-shadow:0 6px 20px rgba(0,0,0,.3);pointer-events:none;max-width:70vw');
      document.body.appendChild(badge);
    }
    badge.textContent = 'WF Page Transition Debug · ' + text + (issues.length ? ` · ${issues.length} Hinweis(e) in der Konsole` : '');
    badge.style.background = issues.length ? '#b4231b' : '#141824';
  };

  const ready = () => {
    setupNav();
    if (!supported) done();
    if (debugOn()) report();
  };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', ready) : ready();
})();
