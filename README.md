# VICE CUT — One Photo, One Poster

[![make.fun](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/jonjet155/gta6-cover-art-01-vice-cut-v3-push-r5/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/jonjet155/gta6-cover-art-01-vice-cut-v3-push-r5/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

**VICE CUT** turns ONE photo into GTA-style movie-poster cover art in three
fast steps — an entry for the [make.fun GTA 6 cover art bounty](https://make.fun/bounty/gta6-cover-art-01).

## The poster

One huge face, full-bleed, graded warm sunset or neon night. A thin neon
diagonal — the CUT — slices across the lower third, **below the chin, never
over the face**. The lockup sits on the cut: **VICE** in solid white, **CUT**
in a neon pink-to-purple gradient, split by a slash glyph at 30°. Under it,
the tagline *Painted in Leonida.* in Caveat script, a five-star rating, the
round ORIGINAL COVER ART seal, a VOL. 06 mark, and a movie-poster billing
block along the foot. No panels, no collage, no grid — one photo, one poster,
readable at a glance even on a 768×480 contact sheet.

## Three steps

1. **Drop your photo** — drag it in or click to choose from your machine
   (read locally, never uploaded). Drag the poster to position it, use the
   zoom slider to crop it. Six sunset/neon samples are preloaded, so the
   first poster is already on screen with zero clicks.
2. **Grade, style & words** — four grades (Warm Sunset, Neon Night, Teal
   Coast, Ink Mono), four poster styles (Full-Bleed, Split, Duotone,
   Framed), and editable title, tagline and billing line, plus toggles for
   the stars and the seal.
3. **Export PNG** — exact post sizes: 1080 × 1080, 1080 × 1350 and
   1920 × 1080, through the real download path.

## Run it

```sh
node serve.ts        # http://localhost:8080
```

The app is plain static files under `app/` — it works offline, with no
network request of any kind. The hand-in program is `main.ts` (Node 22,
standard library only):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Files

- `app/index.html` — the studio page
- `app/style.css` — the dark studio theme
- `app/src/cover.js` — the poster painter: `drawCover`, `drawPhotoCover`,
  `applyGrade`, `drawNeonSlash`, `drawSlashGlyph`, `drawTitleLockup`,
  `drawTagline`, `drawSeal`, `drawStars`, `drawBillingBlock`
- `app/src/main.js` — the editor: `uploadPhoto`, `loadSamplePhoto`,
  `cropPhoto`, `positionPhoto`, `pickGrade`, `pickPosterStyle`, `editTitle`,
  `editTagline`, `editBilling`, `exportPNG`, `renderExport`
- `app/src/shots.js` — fixed screenshot scenes (`?shot=cover`, `?shot=editor`)
- `app/fonts/` — Bebas Neue + Caveat, SIL Open Font License
- `app/samples/` — six free-license photos (see credits below)

## Credits

Sample photos (all CC BY 2.0, via Openverse / Flickr — free to use with
attribution):

- `sunset.jpg` — “Patricia Heal” by Jayson Ignacio —
  https://www.flickr.com/photos/24922831@N04/4099113951
- `beach.jpg` — “I don't know about you, but I'm feeling 22!” by
  2 million+ views. Humbled and thanks! —
  https://www.flickr.com/photos/61732052@N02/18230082861
- `portrait.jpg` — “sunset-m-028” by katya_alagich —
  https://www.flickr.com/photos/9494672@N03/8543478176
- `yacht.jpg` — “Sunset with yachts near Phuket island, Thailand” by
  Phuketian.S — https://www.flickr.com/photos/124790945@N06/45592749491
- `field.jpg` — “golden hour” by haylee -
  https://www.flickr.com/photos/46527593@N04/5625584764
- `boulevard.jpg` — “Golden girl” by Ernst Moeksis —
  https://www.flickr.com/photos/16961193@N06/1846504959

Fonts: Bebas Neue (SIL OFL) and Caveat (SIL OFL), served as local
`.woff2` files under `app/fonts/`. No Rockstar Games logo, artwork or font
is used anywhere in this entry — the lettering and the VC slashed-square
mark are original work drawn in code.

## License

MIT — see `LICENSE`.
