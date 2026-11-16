# WF Page Transition

Übergänge zwischen Seiten für Webflow, passend zu [WF Anim](https://github.com/rakete13/wf-anim) und [WF Slider](https://github.com/rakete13/wf-slider). Nutzt die View Transitions des Browsers: Jede Seite behält ihre eigene URL, es wird nichts per Skript nachgeladen, und Browser ohne Unterstützung wechseln die Seite ganz normal.

Demo und Doku: **https://rakete13.github.io/wf-page-transition/**

## Einbau

1. Inhalt von [`webflow/head-code.html`](webflow/head-code.html) in *Site Settings → Custom Code → **Head Code*** einfügen. Er muss auf jeder Seite liegen (beide Seiten eines Wechsels müssen mitmachen) und im Head stehen, weil er vor dem ersten Zeichnen der Seite laufen muss.
2. Veröffentlichen. Jeder interne Seitenwechsel blendet jetzt weich über.

Alternative, eine Zeile im Head Code (lädt von jsDelivr, IP-Adresse der Besucher geht dorthin):

```html
<script src="https://cdn.jsdelivr.net/gh/rakete13/wf-page-transition@1.6.0/src/wf-page-transition.min.js"></script>
```

GSAP wird nicht gebraucht. Der Head Code hat rund 18.000 Zeichen.

## Effekte

`data-page-transition` am **body** setzt den Standard, an einem **Link** (oder einem Element darum) gilt es nur für diesen Link.

| Wert | Wirkung |
|---|---|
| `fade` | weiches Überblenden (Standard) |
| `slide` | alte Seite schiebt nach links raus, neue kommt von rechts |
| `slide-up` | dasselbe nach oben |
| `zoom` | alte Seite weicht zurück, neue kommt nach vorn |
| `sheet` | alte Seite rückt nach hinten, wird kleiner, dunkler (Hintergrundfarbe und Stärke einstellbar, siehe unten) und bekommt runde Ecken; die neue fährt mit runden Ecken von unten darüber und wird beim Ankommen eckig (wie bei iOS) |
| `none` | kein Übergang |

Der Zurück-Button spielt den Übergang, mit dem man gekommen ist, rückwärts ab.

Am body einstellbar: `data-page-duration` (Sekunden, Standard `0.5`), `data-page-ease` (Easing, siehe unten), für `sheet` außerdem `data-page-scale` (`0.92`), `data-page-dim` (`0.5`), `data-page-background` (`#000`) und `data-page-radius` (Eckenradius in px, Standard `24`, `0` = ohne runde Ecken).

### Hintergrund und Abdunkeln bei `sheet` (ab 1.6)

| Config | Attribut am body | Standard | Wirkung |
|---|---|---|---|
| `background` | `data-page-background` | `'#000'` | Farbe hinter den Seiten: sichtbar an den Rändern, in den runden Ecken und beim Abdunkeln. Jeder CSS-Farbwert, auch Webflow-Variablen, z. B. `'var(--brand)'` |
| `dim` | `data-page-dim` | `0.5` | Wie stark die hintere Seite in die Hintergrundfarbe übergeht: `0` bis `1` (oder `0` bis `100` als Prozent). `0` oder `false` = aus |
| `scale` | `data-page-scale` | `0.92` | Größe der hinteren Seite |

Das Abdunkeln blendet die hintere Seite zur Hintergrundfarbe hin. Bei Schwarz wird sie dunkler (wie bisher), bei einer Markenfarbe nimmt sie deren Ton an. Soll sie nur kleiner werden, ohne sich einzufärben: `dim: 0`.

```html
<script>
  window.WFPageTransitionConfig = { transition: 'sheet', background: '#1d3cff', dim: 0.3 };
</script>
```

### Easing (ab 1.4)

`ease` bzw. `data-page-ease` (Seitenübergänge) und `morphEase` bzw. `data-page-morph-ease` (Morph) verstehen die üblichen GSAP-Namen, wie in WF Anim und WF Slider:

| Familie | Werte |
|---|---|
| sanft bis kräftig | `power1` `power2` `power3` `power4` |
| weitere | `sine` `expo` `circ` `back` (schwingt leicht über) |
| Zusatz | `.in` (langsam los), `.out` (langsam aus), `.inOut` (beides), z. B. `power3.inOut`. Ohne Zusatz gilt `.out` |
| linear | `linear` bzw. `none` |

Daneben gehen alle CSS-Werte wie `ease-in-out` oder `cubic-bezier(0.7, 0, 0.2, 1)`. Ohne Angabe gilt `cubic-bezier(0.7, 0, 0.2, 1)`, etwa wie `power3.inOut`. Ein unbekannter Name meldet der Debug-Modus.

## Elemente verwandeln: `data-page-morph`

Elemente mit demselben Namen im Teaser und auf der Zielseite verwandeln sich ineinander:

```
Übersicht                                   Projektseite (CMS-Vorlage)
collection-item (Link Block)                img-wrapper   data-page-morph="bild"
  ├── img-wrapper  data-page-morph="bild"     └── img
  │     └── img                               seitentitel   data-page-morph="titel"
  └── titel        data-page-morph="titel"
```

- In Listen dürfen alle Teaser dieselben Namen tragen. Die Library vergibt den Namen erst beim Klick an den angeklickten Teaser und beim Zurückgehen an den Teaser, von dem man kam.
- Als Teaser gilt ein Collection Item, ein Link Block oder ein Element mit `data-page-item`.
- Auf der Zielseite dürfen die Gegenstücke nicht in einem Link oder Collection Item liegen.
- **Bei Bildern an den Wrapper, nicht an das `img`:** Der Wrapper gibt Größe, Seitenverhältnis, Ecken und den Beschnitt vor, und genau diese Form verwandelt sich. Am `img` selbst ginge der Beschnitt des Wrappers während des Übergangs verloren (z. B. bei einem höheren Parallax-Bild aus WF Anim). Pro Paar nur ein Element markieren, nicht Wrapper und Bild zugleich.
- Am besten haben beide Bilder dasselbe Motiv. Unterschiedliche Seitenverhältnisse werden beschnitten, nicht verzerrt.
- **Bilder (ab 1.5):** Es wird nicht zwischen zwei Abbildern überblendet. Vorwärts füllt das Bild der Zielseite die wachsende Fläche allein (mit `object-fit: cover`), zurück das Bild der Ausgangsseite die schrumpfende. Ist es in Teaser und Stage dasselbe Bild, sieht es am Anfang aus wie der Teaser und zeigt beim Wachsen immer mehr vom Bild, ohne Zoom, auch bei unterschiedlichen Seitenverhältnissen (Teaser hochkant, Stage quer). Ist das Bild der Zielseite noch nicht geladen (Webflow lädt Bilder mit `loading="lazy"`), scheint so lange das Teaser-Bild durch, und der Übergang wartet am Ende darauf. Bilder im Morph lädt die Library sofort und mit hoher Priorität.

### Reihenfolge mit Morph (ab 1.3)

Gibt es einen Morph, bewegt sich standardmäßig **nur das Bild**: Es wächst über der stehenden alten Seite an seinen Platz. Ist es dort angekommen (und das Bild der Zielseite geladen), ist die neue Seite **sofort** da, ohne Fade und ohne Seiteneffekt. Beim Zurück-Button ist die Übersicht sofort da, und das große Bild schrumpft darüber in seinen Teaser. Der gewählte Effekt (`data-page-transition`) gilt dann nur für Seitenwechsel ohne Morph, z. B. im Menü.

| `data-page-order` (body) bzw. `order` (Config) | Wirkung |
|---|---|
| `morph-first` | Standard: nur das Bild bewegt sich, danach ist die Seite sofort da |
| `morph-effect` | erst der Morph, danach der Seiteneffekt; `data-page-split` bzw. `split` (Standard `0.6`) = Anteil der Dauer für den Morph |
| `together` | Morph und Seiteneffekt gleichzeitig |

Easing des Morphs: `data-page-morph-ease` bzw. `morphEase` (CSS-Easing, z. B. `cubic-bezier(.7,0,.2,1)`), sonst gilt `data-page-ease`. Die Dauer ist `data-page-duration`.

Lädt das Bild der Zielseite länger als die Animation, hält der Übergang am Ende an (Teaser-Bild in voller Größe) und schließt ab, sobald es da ist, höchstens rund 3 Sekunden.

## Stehen bleiben: `data-page-keep`

`data-page-keep="header"` an der Navbar (auf beiden Seiten, gleicher Name): Sie bleibt beim Wechsel ruhig, nur der Inhalt wechselt. Am besten für fixierte oder sticky Header.

## Blättern zwischen CMS-Einträgen

Webflow hat keinen eingebauten Link zum nächsten Eintrag. Auf der CMS-Vorlage:

```
collection-list   data-page-list  (alle Projekte in der gewünschten Reihenfolge, darf Display none sein)
  └── item → Link zur Projektseite, darin z. B. Titel data-page-field="titel", Bild data-page-field="bild"

next-block (Link) data-page-next
  ├── bild        data-page-field="bild"   data-page-morph="bild"
  └── titel       data-page-field="titel"  data-page-morph="titel"
prev-link         data-page-prev
```

- Die Library sucht die aktuelle Seite in der Liste, setzt die Links und füllt Text und Bild aus dem Nachbar-Eintrag.
- Am Anfang bzw. Ende wird der Block ausgeblendet (Klasse `is-hidden`). Mit `data-page-loop` an der Liste geht es wieder von vorn los.
- Diese Links schieben standardmäßig seitlich (`slide`): weiter nach links, zurück nach rechts.
- Eine Collection List zeigt höchstens 100 Einträge.

## Was passiert, wenn …

- **Firefox / ältere Browser:** normaler Seitenwechsel. Mit `data-page-fallback="fade"` am body blendet die Seite dort wenigstens ein.
- **„Bewegung reduzieren“:** kein Übergang.
- **Langsame Verbindung:** Die alte Seite bleibt stehen, bis die neue da ist. Dauert es zu lange, lässt der Browser den Übergang weg.
- **Externe Links, neuer Tab, Cmd-Klick, Ankerlinks, Downloads:** unberührt.
- **Neu laden:** kein Übergang.

## Zusammenspiel mit WF Anim

- Der Preloader sollte `data-anim-once="session"` tragen, sonst erscheint er bei jedem Seitenwechsel (der Debug-Modus meldet das).
- Intro-Animationen (`data-anim-intro`) laufen derzeit parallel zum Übergang. Zum Koppeln stellt die Library `WFPageTransition.finished` (Promise) und das Ereignis `wfpt:done` bereit.

## Debug und API

- `?wfpt-debug` an die Adresse: Hinweise in der Konsole und ein Hinweisfeld unten links. Bleibt für den Tab an. `?wfpt-debug=slow` zeigt alles in Zeitlupe, `?wfpt-debug=off` schaltet ab.
- `WFPageTransition.last` (Effekt, Richtung, Morph-Namen, Status), `WFPageTransition.finished`, `WFPageTransition.supported`.
- Voreinstellungen vor dem Skript (gelten für die ganze Site, Attribute am body überschreiben sie pro Seite): `window.WFPageTransitionConfig = { transition: 'fade', duration: 0.5, ease: '', radius: 24, order: 'morph-first', morphEase: '', split: 0.6, background: '#000', dim: 0.5, scale: 0.92 }`.

## Aufbau

```
src/wf-page-transition.js      Skript
src/wf-page-transition.css     Effekte
src/wf-page-transition.min.js  beides in einer Datei (für jsDelivr)
webflow/head-code.html         fertiger Head Code
docs/                          Demo (GitHub Pages), wird von build.js erzeugt
docs-src/demo.js               Vorlage der Demo-Seiten
build.js                       node build.js (braucht esbuild)
```
