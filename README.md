# WF Page Transition

Übergänge zwischen Seiten für Webflow, passend zu [WF Anim](https://github.com/rakete13/wf-anim) und [WF Slider](https://github.com/rakete13/wf-slider). Nutzt die View Transitions des Browsers: Jede Seite behält ihre eigene URL, es wird nichts per Skript nachgeladen, und Browser ohne Unterstützung wechseln die Seite ganz normal.

Demo und Doku: **https://rakete13.github.io/wf-page-transition/**

## Einbau

1. Inhalt von [`webflow/head-code.html`](webflow/head-code.html) in *Site Settings → Custom Code → **Head Code*** einfügen. Er muss auf jeder Seite liegen (beide Seiten eines Wechsels müssen mitmachen) und im Head stehen, weil er vor dem ersten Zeichnen der Seite laufen muss.
2. Veröffentlichen. Jeder interne Seitenwechsel blendet jetzt weich über.

Alternative, eine Zeile im Head Code (lädt von jsDelivr, IP-Adresse der Besucher geht dorthin):

```html
<script src="https://cdn.jsdelivr.net/gh/rakete13/wf-page-transition@1.2.1/src/wf-page-transition.min.js"></script>
```

GSAP wird nicht gebraucht. Der Head Code hat rund 15.500 Zeichen.

## Effekte

`data-page-transition` am **body** setzt den Standard, an einem **Link** (oder einem Element darum) gilt es nur für diesen Link.

| Wert | Wirkung |
|---|---|
| `fade` | weiches Überblenden (Standard) |
| `slide` | alte Seite schiebt nach links raus, neue kommt von rechts |
| `slide-up` | dasselbe nach oben |
| `zoom` | alte Seite weicht zurück, neue kommt nach vorn |
| `sheet` | alte Seite rückt nach hinten, wird kleiner, dunkler und bekommt runde Ecken; die neue fährt mit runden Ecken von unten darüber und wird beim Ankommen eckig (wie bei iOS) |
| `none` | kein Übergang |

Der Zurück-Button spielt den Übergang, mit dem man gekommen ist, rückwärts ab.

Am body einstellbar: `data-page-duration` (Sekunden, Standard `0.5`), `data-page-ease` (CSS-Easing), für `sheet` außerdem `data-page-scale` (`0.92`), `data-page-dim` (`0.5`) und `data-page-radius` (Eckenradius in px, Standard `24`, `0` = ohne runde Ecken).

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

### Reihenfolge (ab 1.2)

Gibt es einen Morph, läuft er **zuerst**: Das Bild wächst über der stehenden alten Seite an seinen Platz, erst danach wechselt die Seite drumherum mit dem gewählten Effekt. Beim Zurück-Button umgekehrt: erst wechselt die Seite um das große Bild, dann schrumpft es in seinen Teaser. Die Gesamtdauer bleibt `data-page-duration`.

- `data-page-split` am body bzw. `split` im Config (Standard `0.6`): Anteil der Dauer für den Morph.
- `data-page-order="together"` am body bzw. `order: 'together'` im Config: Morph und Seitenwechsel laufen wieder gleichzeitig.
- Ohne Morph (z. B. Klick im Menü) gilt die volle Dauer für den Seitenwechsel.

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
- Voreinstellungen vor dem Skript (gelten für die ganze Site, Attribute am body überschreiben sie pro Seite): `window.WFPageTransitionConfig = { transition: 'fade', duration: 0.5, ease: '', radius: 24, order: 'morph-first', split: 0.6 }`.

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
