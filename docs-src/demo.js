// Erzeugt die Demo-Seiten in docs/ (Übersicht + Projektseiten)
const P = [
  { t: 'Alpenhütte', k: 'Architektur', y: 2026, id: 1018, c: '#3d5a45' },
  { t: 'Küstenweg', k: 'Fotografie', y: 2026, id: 1043, c: '#5d7f9c' },
  { t: 'Winterwald', k: 'Kampagne', y: 2025, id: 1036, c: '#7c8794' },
  { t: 'Flusstal', k: 'Branding', y: 2025, id: 1015, c: '#4f6b57' },
  { t: 'Stadtlicht', k: 'Website', y: 2024, id: 1067, c: '#8a6a4a' },
  { t: 'Felsküste', k: 'Editorial', y: 2024, id: 1044, c: '#6b6f8c' },
];
const file = (i) => `projekt-${i + 1}.html`;
const img = (p, w, h) => `https://picsum.photos/id/${p.id}/${w}/${h}`;

const CSS = `
:root { --bg:#f3f4f7; --surface:#fff; --ink:#141824; --muted:#5d6476; --line:#dde0e8; --accent:#2f4cf5; --code:#eef0f6;
  --display:"Bricolage Grotesque","Helvetica Neue",Arial,sans-serif; --body:"IBM Plex Sans","Helvetica Neue",Arial,sans-serif; --mono:"IBM Plex Mono",ui-monospace,Menlo,monospace; }
@media (prefers-color-scheme: dark) { :root { --bg:#0f121a; --surface:#171b26; --ink:#e8eaf2; --muted:#9aa1b4; --line:#272d3b; --accent:#7f93ff; --code:#1d2230; color-scheme:dark; } }
* { box-sizing:border-box; }
body { margin:0; background:var(--bg); color:var(--ink); font:16px/1.6 var(--body); }
a { color:inherit; }
h1,h2,h3 { font-family:var(--display); line-height:1.08; margin:0; text-wrap:balance; }
code,pre { font-family:var(--mono); font-size:.84rem; }
p code, td code, li code { background:var(--code); padding:1px 6px; border-radius:4px; }
pre { background:var(--code); border:1px solid var(--line); border-radius:8px; padding:14px 16px; overflow-x:auto; margin:0; }
img { display:block; max-width:100%; color:transparent; }
.header { position:fixed; inset:0 0 auto 0; z-index:10; display:flex; justify-content:space-between; align-items:center; padding:14px clamp(16px,4vw,40px);
  background:color-mix(in srgb, var(--bg) 82%, transparent); backdrop-filter:blur(10px); border-bottom:1px solid var(--line); font-weight:600; }
.header a { text-decoration:none; } .header nav { display:flex; gap:20px; font-size:.92rem; color:var(--muted); }
.wrap { max-width:1180px; margin:0 auto; padding:110px clamp(16px,4vw,40px) 100px; display:grid; gap:64px; }
.eyebrow { font-family:var(--mono); font-size:.8rem; color:var(--accent); }
.lead h1 { font-size:clamp(2.4rem,6vw,4.2rem); font-weight:800; letter-spacing:-.02em; margin:10px 0 14px; } .lead h1 em { font-style:normal; color:var(--accent); }
.lead p { max-width:64ch; color:var(--muted); margin:0; font-size:1.06rem; }
.chips { display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
.chips .label { font-size:.78rem; color:var(--muted); text-transform:uppercase; letter-spacing:.08em; margin-right:4px; }
.chip { border:1px solid var(--line); background:var(--surface); color:var(--ink); border-radius:999px; padding:7px 14px; font:600 .85rem var(--body); cursor:pointer; }
.chip[aria-pressed="true"] { background:var(--accent); color:#fff; border-color:var(--accent); }
.note { color:var(--muted); font-size:.9rem; margin:8px 0 0; }
.grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:24px; }
@media (max-width:900px) { .grid { grid-template-columns:repeat(2,minmax(0,1fr)); } } @media (max-width:560px) { .grid { grid-template-columns:1fr; } }
.teaser { display:grid; gap:12px; text-decoration:none; }
.teaser .ph { aspect-ratio:4/5; border-radius:12px; overflow:hidden; }
.teaser img { width:100%; height:100%; object-fit:cover; }
.teaser h3 { font-size:1.25rem; justify-self:start; } .teaser span { color:var(--muted); font:.8rem var(--mono); }
section > h2 { font-size:1.7rem; border-bottom:1px solid var(--line); padding-bottom:12px; margin-bottom:20px; }
table { border-collapse:collapse; width:100%; font-size:.9rem; display:block; overflow-x:auto; } tbody,thead { display:table; width:100%; }
th,td { text-align:left; padding:8px 10px; border-bottom:1px solid var(--line); vertical-align:top; } th { color:var(--muted); font-size:.76rem; text-transform:uppercase; letter-spacing:.06em; }
td:first-child { white-space:nowrap; }
ol.steps { margin:0 0 20px; padding-left:1.3em; display:grid; gap:8px; max-width:74ch; }
.stack { display:grid; gap:20px; }
/* Projektseite */
.hero { height:min(68vh,620px); margin-top:57px; overflow:hidden; } .hero img { width:100%; height:100%; object-fit:cover; }
.article { max-width:820px; margin:0 auto; padding:48px clamp(16px,4vw,40px) 80px; display:grid; gap:22px; }
.article h1 { font-size:clamp(2.4rem,7vw,4.6rem); font-weight:800; letter-spacing:-.02em; justify-self:start; }
.article p { margin:0; color:var(--muted); font-size:1.08rem; }
.back { font:.85rem var(--mono); color:var(--accent); text-decoration:none; }
.pager { display:grid; grid-template-columns:1fr; gap:16px; padding:0 clamp(16px,4vw,40px) 100px; max-width:1180px; margin:0 auto; }
.prev { justify-self:start; text-decoration:none; color:var(--muted); font-size:.95rem; }
.next { position:relative; display:block; border-radius:14px; overflow:hidden; text-decoration:none; color:#fff; height:min(46vh,380px); }
.next img { width:100%; height:100%; object-fit:cover; }
.next .cap { position:absolute; inset:auto 0 0 0; padding:28px; display:grid; gap:4px; justify-items:start; background:linear-gradient(transparent, rgba(0,0,0,.6)); }
.next .cap small { font:.8rem var(--mono); opacity:.85; } .next .cap strong { font:800 clamp(1.8rem,5vw,3rem)/1 var(--display); }
`;

const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">`;

// Nur für die Demo: gewählter Effekt gilt auf allen Seiten
const HEAD = (title) => `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title}</title>
${FONTS}
<link rel="stylesheet" href="demo.css">
<script>try{window.WFPageTransitionConfig={transition:localStorage.getItem('wfpt-demo')||'sheet',radius:localStorage.getItem('wfpt-demo-radius')||'24'}}catch(e){}</script>
<script src="wf-page-transition.min.js"></script>
</head>`;

const HEADER = `<header class="header" data-page-keep="header">
  <a href="./">WF . Page Transition</a>
  <nav><a href="./">Projekte</a><a href="./#einbau">Einbau</a><a href="./#attribute">Attribute</a></nav>
</header>`;

const index = (v) => `${HEAD('WF Page Transition')}
<body>
${HEADER}
<div class="wrap">
  <div class="lead">
    <div class="eyebrow">WF Page Transition · v${v} · View Transitions des Browsers</div>
    <h1>Seitenwechsel mit <em>Übergang</em>.</h1>
    <p>Jede Seite hier ist eine eigene Datei mit eigener URL. Klick auf ein Projekt: Bild und Titel verwandeln sich in den Kopf der Projektseite, der Rest wechselt mit dem gewählten Effekt. Der Zurück-Button spielt alles rückwärts. Auf den Projektseiten blätterst du unten zum nächsten Projekt.</p>
  </div>
  <div>
    <div class="chips" id="chips">
      <span class="label">Effekt</span>
      ${['fade', 'slide', 'slide-up', 'zoom', 'sheet', 'none'].map((e) => `<button class="chip" data-v="${e}" aria-pressed="false">${e}</button>`).join('\n      ')}
    </div>
    <div class="chips" id="radius" style="margin-top:10px">
      <span class="label">Ecken bei sheet</span>
      <button class="chip" data-v="0" aria-pressed="false">eckig (0)</button>
      <button class="chip" data-v="16" aria-pressed="false">16</button>
      <button class="chip" data-v="24" aria-pressed="false">24</button>
      <button class="chip" data-v="40" aria-pressed="false">40</button>
    </div>
    <p class="note">Gilt für den Weg in ein Projekt. Das Blättern zwischen Projekten schiebt immer seitlich. Zum Zusehen in Zeitlupe: <a href="?wfpt-debug=slow">Zeitlupe an</a> · <a href="?wfpt-debug=off">aus</a>. In Firefox siehst du den normalen Seitenwechsel.</p>
  </div>
  <div class="grid">
    ${P.map((p, i) => `<a class="teaser" href="${file(i)}">
      <div class="ph" style="background:${p.c}"><img data-page-morph="bild" src="${img(p, 1200, 800)}" alt=""></div>
      <h3 data-page-morph="titel">${p.t}</h3>
      <span>${p.k} · ${p.y}</span>
    </a>`).join('\n    ')}
  </div>

  <section id="einbau">
    <h2>Einbau</h2>
    <ol class="steps">
      <li><strong>Head Code:</strong> Inhalt von <code>webflow/head-code.html</code> in Site Settings → Custom Code → <strong>Head Code</strong> einfügen. Er muss auf jeder Seite liegen, deshalb in den Site-Code, nicht in eine einzelne Seite.</li>
      <li><strong>Veröffentlichen.</strong> Ab jetzt blendet jeder interne Seitenwechsel weich über.</li>
      <li><strong>Optional:</strong> am <code>body</code> einen anderen Standard setzen, Teaser und Kopfbereich mit <code>data-page-morph</code> verbinden, Header mit <code>data-page-keep</code> stehen lassen.</li>
    </ol>
    <div class="stack">
      <pre>&lt;script src="https://cdn.jsdelivr.net/gh/rakete13/wf-page-transition@${v}/src/wf-page-transition.min.js"&gt;&lt;/script&gt;</pre>
      <p class="note">Alternative zum eingebetteten Head Code: diese eine Zeile im Head Code. GSAP wird nicht gebraucht.</p>
      <pre>Übersicht                                   Projektseite (CMS-Vorlage)
collection-item (Link Block)                hero-bild     data-page-morph="bild"
  ├── bild       data-page-morph="bild"     seitentitel   data-page-morph="titel"
  └── titel      data-page-morph="titel"

navbar          data-page-keep="header"     navbar        data-page-keep="header"</pre>
    </div>
  </section>

  <section id="attribute">
    <h2>Attribute</h2>
    <div class="stack">
    <table>
      <thead><tr><th>Attribut</th><th>Wo</th><th>Werte</th><th>Wirkung</th></tr></thead>
      <tbody>
        <tr><td><code>data-page-transition</code></td><td>body</td><td><code>fade</code> (Standard), <code>slide</code>, <code>slide-up</code>, <code>zoom</code>, <code>sheet</code>, <code>none</code></td><td>Standard für alle Seitenwechsel</td></tr>
        <tr><td><code>data-page-transition</code></td><td>Link oder ein Element darum</td><td>wie oben</td><td>anderer Effekt nur für diesen Link, <code>none</code> = ohne Übergang</td></tr>
        <tr><td><code>data-page-duration</code></td><td>body</td><td>Sekunden, Standard <code>0.5</code></td><td>Dauer</td></tr>
        <tr><td><code>data-page-ease</code></td><td>body</td><td>CSS-Easing, z. B. <code>ease-in-out</code> oder <code>cubic-bezier(.7,0,.2,1)</code></td><td>Verlauf der Bewegung</td></tr>
        <tr><td><code>data-page-scale</code> · <code>-dim</code> · <code>-radius</code></td><td>body</td><td><code>0.92</code> · <code>0.5</code> · <code>24</code></td><td>nur <code>sheet</code>: Größe und Abdunkeln der hinteren Seite, Eckenradius in px. Die hintere Seite rundet ihre Ecken ab, die neue kommt mit runden Ecken und wird beim Ankommen eckig. <code>0</code> = ohne runde Ecken</td></tr>
        <tr><td><code>data-page-morph</code></td><td>Teaser-Element und Gegenstück auf der Zielseite</td><td>frei, z. B. <code>bild</code>, <code>titel</code></td><td>Elemente mit gleichem Namen verwandeln sich ineinander</td></tr>
        <tr><td><code>data-page-item</code></td><td>Teaser-Wrapper</td><td>ohne Wert</td><td>nur nötig, wenn der Teaser kein Collection Item und kein Link Block ist</td></tr>
        <tr><td><code>data-page-keep</code></td><td>Header, Footer</td><td>Name, z. B. <code>header</code></td><td>bleibt beim Wechsel stehen (auf beiden Seiten setzen)</td></tr>
        <tr><td><code>data-page-list</code></td><td>Collection List auf der CMS-Vorlage (darf versteckt sein)</td><td>ohne Wert</td><td>Reihenfolge für das Blättern; <code>data-page-loop</code> = nach dem letzten wieder von vorn</td></tr>
        <tr><td><code>data-page-next</code> · <code>data-page-prev</code></td><td>Link oder Block mit Link</td><td>ohne Wert</td><td>bekommt den Link zum nächsten bzw. vorherigen Eintrag; ohne Nachbar ausgeblendet</td></tr>
        <tr><td><code>data-page-field</code></td><td>in der Liste und im Next/Prev-Block</td><td>Name, z. B. <code>titel</code>, <code>bild</code></td><td>Inhalt wird aus dem Nachbar-Eintrag übernommen (Text oder Bild)</td></tr>
        <tr><td><code>data-page-fallback</code></td><td>body</td><td><code>fade</code></td><td>Browser ohne View Transitions blenden die Seite wenigstens ein</td></tr>
      </tbody>
    </table>
    <pre>Debug:  ?wfpt-debug an die Adresse (bleibt für den Tab an) · ?wfpt-debug=slow Zeitlupe · ?wfpt-debug=off
API:    WFPageTransition.finished (Promise) · WFPageTransition.last · Ereignis "wfpt:done" am document
Vorher: window.WFPageTransitionConfig = { transition: 'fade', duration: 0.5, ease: '' }</pre>
    </div>
  </section>
</div>
<script>
(() => {
  const cur = (window.WFPageTransition && WFPageTransition.config.transition) || 'sheet';
  const chips = document.getElementById('chips');
  const mark = (v) => chips.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.v === v)));
  mark(cur);
  chips.addEventListener('click', (e) => {
    const b = e.target.closest('.chip');
    if (!b) return;
    try { localStorage.setItem('wfpt-demo', b.dataset.v); } catch (_) {}
    if (window.WFPageTransition) WFPageTransition.config.transition = b.dataset.v;
    mark(b.dataset.v);
  });
  const rad = document.getElementById('radius');
  const markR = (v) => rad.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.v === String(v))));
  markR((window.WFPageTransition && WFPageTransition.config.radius) || '24');
  rad.addEventListener('click', (e) => {
    const b = e.target.closest('.chip');
    if (!b) return;
    try { localStorage.setItem('wfpt-demo-radius', b.dataset.v); } catch (_) {}
    if (window.WFPageTransition) WFPageTransition.config.radius = b.dataset.v;
    markR(b.dataset.v);
  });
})();
</script>
</body>
</html>
`;

const project = (p, i) => `${HEAD(p.t + ' · WF Page Transition')}
<body>
${HEADER}
<div class="hero" style="background:${p.c}"><img data-page-morph="bild" src="${img(p, 1200, 800)}" alt=""></div>
<article class="article">
  <a class="back" href="./">← Alle Projekte</a>
  <h1 data-page-morph="titel">${p.t}</h1>
  <p>${p.k} · ${p.y}. Diese Seite ist eine eigene Datei mit eigener Adresse. Lade sie neu, teile den Link oder nutze den Zurück-Button: alles verhält sich wie bei jedem normalen Seitenwechsel.</p>
  <p>Das Bild oben und dieser Titel tragen dieselben Namen wie im Teaser auf der Übersicht. Mehr braucht es nicht, damit der Browser beide ineinander verwandelt. Unten geht es zum nächsten Projekt: Der Link wird aus einer versteckten Liste aller Projekte gefüllt.</p>
</article>
<div class="pager">
  <a class="prev" data-page-prev href="#">← <span data-page-field="titel">Vorheriges Projekt</span></a>
  <a class="next" data-page-next href="#">
    <img data-page-field="bild" data-page-morph="bild" alt="">
    <span class="cap"><small>Nächstes Projekt</small><strong data-page-field="titel" data-page-morph="titel"></strong></span>
  </a>
</div>
<!-- In Webflow: eine Collection List aller Projekte, auf Display none -->
<div data-page-list data-page-loop hidden>
  ${P.map((q, j) => `<div data-page-item><a href="${file(j)}"><span data-page-field="titel">${q.t}</span></a><img data-page-field="bild" loading="lazy" src="${img(q, 1200, 800)}" alt=""></div>`).join('\n  ')}
</div>
</body>
</html>
`;

module.exports = (write, version) => {
  write('docs/demo.css', CSS.trim() + '\n');
  write('docs/index.html', index(version));
  P.forEach((p, i) => write('docs/' + file(i), project(p, i)));
};
