---
name: deckcraft
description: Build, edit, theme, and validate Reveal.js decks. One HTML file per slide, manifest-driven order, design-token CSS, no build step. Activate for any folder with `manifest.json` + `content/*.html`, or when the user asks to make a slide deck / talk / conference presentation.
---

# deckcraft — Reveal.js modular deck framework

You are working in a project that uses (or wants to use) the **deckcraft**
framework: plain Reveal.js 5, no plugins beyond `RevealNotes`, no build
step, one HTML file per slide, slide order driven by `manifest.json`,
design system in `assets/deck.css`.

This skill is the rulebook. The interactive flows live in
`commands/deck-new.md`, `commands/deck-add.md`, `commands/deck-theme.md`,
`commands/deck-validate.md`, `commands/deck-serve.md`.

## Triage every request before you touch a file

Three kinds of requests dominate. Recognise which is which **before** you
write any HTML:

1. **"Build me a deck."** → `/deck-new`. Scaffold a new folder at the
   user's project root (`./<short-name>/`) — no `slides/` wrapper. Ask
   the design questions first.
2. **"Edit my deck."** → Iterate on an existing deck folder. Edit the
   fragment file, rerun the validator.
3. **"Improve the framework."** → Changes to the shell, validator, or
   token structure. Higher bar — get explicit agreement first.

If you can't tell which kind it is, **ask**. Don't guess.

## Hard guardrails (non-negotiable)

1. **NEW deck = NEW folder.** Never merge a new talk into an existing
   deck. The new folder (`./<short-name>/`) mirrors the bundled
   `templates/` layout. No `slides/` wrapper directory — the deck
   folder *is* the deck.
2. **No build step.** No `package.json`, no bundler, no transpiler, no
   CSS preprocessor. The shell loads Reveal.js and fonts from CDN.
3. **No Reveal.js plugins beyond `RevealNotes`.** The inline ES-module
   loader replaces external loaders. If a request implies a plugin, push
   back.
4. **No inline-style refactor.** Section bodies use `style=""` on
   purpose so any slide can diverge in one place. Resist "extract to
   utility classes" urges.
5. **One `<section>` per fragment file.** No vertical slide stacks
   (nested `<section>`s). The validator enforces this.
6. **Don't `file://` it.** The shell uses `fetch()`, blocked on file
   URIs. Always serve over HTTP. If the user reports a blank page,
   that's the first thing to check.

## Slide structure (load-bearing)

Every fragment file is a single, **headless** `<section>` — no `<html>`,
`<head>`, or `<body>`:

```html
<!--
  Slide N · Beat name
  Chapter: Chapter X · Title
-->
<section class="sheet" data-transition="fade">
  <div class="chrome">
    <div><span class="dot"></span>YOUR TALK · CH N</div>
    <span class="folio">12</span>
  </div>

  <div style="position:absolute;inset:0; /* layout */">
    <!-- slide body. inline styles. reference var(--token) for colours. -->
  </div>

  <aside class="notes">
    1–3 sentences spoken aloud.
  </aside>
</section>
```

Rules every slide follows:

- **Section variant** is one of: `sheet` (the light cream default — the
  title card, chapter openers, and ~all slides), `plate` (full-bleed
  images), or `dark` (an *opt-in* near-black moment for a single hero /
  quote, never the default). The deck is light by default; reach for
  `dark` deliberately, not out of habit. Don't invent new variants —
  strengthen inline styling on a `sheet`.
- **Chrome strip** appears on every slide: talk · chapter on the left,
  folio chip on the right — orientation only. The folio chip is the
  truth; it must match the manifest entry (the validator enforces this).
  Keep the strip to those two pieces; it is the slide's entire
  small-text budget, so don't echo it as on-slide eyebrows or captions.
- **Sub-folios.** Manifest folio uses `·` (e.g. `"24·B"`); the chip in
  HTML matches (raw `24·B` or escaped `24&middot;B` both work); the
  filename uses `-` (`24-B-…html`). The validator normalises both sides
  before comparing.
- **Speaker notes** in `<aside class="notes">`. 1–3 sentences. They're
  read live, not skimmed.
- **Use design tokens, not hex.** `var(--accent)`, never `#0f7aff`.
  Re-theming a fork should be a 10-line `:root` edit.
- **`data-transition`** controls per-slide animation. Honour the deck's
  interactivity level (`static` / `subtle` / `rich`) — set when the deck
  is scaffolded.

## Interactive widgets

Inline `<script>` tags inside slide fragments **do not execute** (the
shell injects fragments with `insertAdjacentHTML`, which strips script
behaviour). The framework solves this with declarative widget markers
plus a single, shared registry in `assets/widgets.js`.

Pattern:

1. A factory function lives in `assets/widgets.js`:
   ```js
   function createMyWidget(root, options) {
     root.innerHTML = `<button>${options.label}</button>`;
     root.querySelector('button').addEventListener('click', /* ... */);
   }
   window.deckWidgets.myWidget = createMyWidget;
   ```
2. A slide places a marker element:
   ```html
   <div data-widget="myWidget"
        data-widget-options='{"label":"Click me"}'></div>
   ```
3. The shell's loader calls `window.deckWidgetsInit(slidesEl)` after
   every fragment is in the DOM and **before** `Reveal.initialize`.
   That scan replaces each marker with the widget the factory builds.

Bundled widgets (in the templates) — all keyboard-accessible, on-theme,
and calm by design:

- **`steps`** — in-place progressive reveal. Build an argument one beat
  at a time on a single slide; advance by click or `→`/`Space`, retreat
  with `←`. Options: `{ "items": ["First point", "Second", "Third"] }`.
  This is usually the right tool when you'd otherwise reach for Reveal
  fragments — it's self-contained and styled.
- **`toggle`** — before/after (or any two states) on one slide, swapped
  via a segmented control. Options:
  `{ "options": [{"label":"Before","body":"…"}, {"label":"After","body":"…"}] }`.
- **`counter`** — audience tally / live count. Options:
  `{ "start": 0, "label": "clicks" }`.
- **`reveal`** — hold an answer until you ask for it. Options:
  `{ "prompt": "Click to show", "answer": "42" }`.

**What "good" means here** (the bar for any widget you add or place):

- **Purposeful.** One or two interactive moments per deck, each making a
  point a static slide can't. Interactivity is a tool, not decoration —
  a deck where every slide flashes is worse than a quiet one.
- **Accessible.** Real `<button>`s, keyboard works, focus is visible
  (the `:focus-visible` ring in `deck.css`), state changes announce via
  `aria-live`. New factories inherit these or they don't ship.
- **On-theme.** Colour via `var(--token)`, type via `var(--font-mono)` /
  `var(--font-body)` / `var(--font-display)` — never a hardcoded hex or
  font name, so the widget re-themes with the deck.
- **Calm.** Transitions ≤ `.25s`, no bounce, no spinners.

**Don't** put inline `<script>` tags in slide fragments. **Don't**
reach across slides — each widget owns only its marker. **Don't**
introduce a build step or framework (React, Vue, …) for widgets; vanilla
DOM is the whole point.

## Style principles (taste-agnostic)

The template ships a default seed theme (warm cream + terracotta
accent + Geist/Newsreader stack), but **every deck picks its own
aesthetic** during `/deck-new`. The principles below apply regardless
of the palette and font stack you end up with.

### Composition

- **One restrained accent.** Whatever `--accent` is in the user's
  palette, use it sparingly: usually one emphasis moment per slide
  (a coloured word in a headline, a short rule, a chip). Never paint
  whole blocks in `--accent`. `--good` and `--warn` are for semantic
  states only, not decoration.
- **Hierarchy via weight + size, not colour.** A bigger, heavier
  headline is louder than a coloured one.
- **Hairlines, not gradients.** Default divider is `<hr class="rule">`
  or a 1px border on `var(--rule)`. The subtle `::before` glows on
  `sheet` / `dark` are the only gradients the framework provides; don't
  add more.
- **Tokens, not hex.** Slide bodies reference `var(--accent)`,
  `var(--ink)`, etc. Never inline a hex literal — the validator warns.
  This is what makes a re-theme a 10-line edit.

### Micro-text budget (default to silence)

The framework's single biggest failure mode is sprinkling tiny mono
labels everywhere — eyebrows, kickers that restate the headline,
captions, helper hints, sub-labels. They read as clutter and fight the
one thing the slide is trying to say. Hold the line:

- **Eyebrows default to OFF.** Most slides have none. Add an `.eyebrow`
  only when a slide needs a category label its headline genuinely can't
  carry — never to restate the headline or the chapter (the chrome strip
  already orients the room).
- **One small-text element per slide, maximum.** Count eyebrows,
  kickers, standalone captions, and meta lines together. Placed two?
  Delete one.
- **No on-stage UI helper text.** Never print "Press S for notes",
  "Click to continue", "Esc for overview", keyboard hints, or build
  instructions on a slide. The audience doesn't need stage directions.
- **Body copy beats labels.** Tempted to add a tiny tracked label? Ask
  whether a normal-size line of text would say it better. It usually
  does. Tiny ≠ refined.
- **Captions must add information.** A caption under a figure that
  repeats the figure is noise; one that adds a fact earns its place.

### Typography roles

Three font roles, three families, wired as the `--font-body`,
`--font-mono`, and `--font-display` tokens. Names depend on the user's
chosen stack — what matters is keeping the *roles* distinct:

- **Body** (`--font-body`) — headlines, paragraphs, list items. Sans is
  the safe default; serif works if the deck wants gravitas.
- **Display / italic** (`--font-display`) — the **one** expressive line
  per slide (subtitle, pull-quote, a single emphasised word). Apply via
  `class="kicker"` or `<em class="kicker">…</em>`. Not for body
  paragraphs, and not on every slide.
- **Mono** (`--font-mono`) — chrome, folio chips, numerals, and the rare
  eyebrow. Small and tracked, so it's the easiest type to overuse — see
  the micro-text budget above. Never for prose.

### Layout

- **Generous whitespace.** Slide padding around `120px` reads calm;
  under `72px` looks broken.
- **Gap, not margin.** Use flex/grid `gap` between siblings — composes
  cleanly, survives reordering.
- **Cap measure.** No line of body copy beyond `~960px`
  (`max-width:920px` for `<p>`, `1080px` for `<h1>`).
- **One headline per slide.** Two headlines = two slides.

### Restraint rules (apply to any aesthetic)

- Light by default. The deck reads as a light cream deck; the `dark`
  variant is an opt-in for one dramatic beat, not the default for
  openers or titles.
- No more than one small-text label per slide (see the micro-text
  budget); default to zero.
- No drop shadows on type.
- No clip-art icons. SVG line icons in `currentColor`, hairline weight.
- No animations longer than `.25s`.
- No more than one accent moment per slide.
- No background images on `sheet`. Imagery goes on `plate` slides.

### When you're tempted to deviate

You can. Every slide's body wrapper accepts `style=""` for divergence.
But ask yourself: *is this slide making a different argument, or am I
just bored?* If it's the latter, restraint wins.

### Default seed theme (replace per deck)

What ships in `templates/`:

- Mood: **light cream** — a light page surround (`--page`) with cream
  slide sheets. The title card and openers are light `sheet`s.
- Palette: warm cream paper, deep warm ink, terracotta accent.
- Type: Geist (`--font-body`), Geist Mono (`--font-mono`), Newsreader
  (`--font-display`).

This is **a starting point, not a house style**. `/deck-new` asks the
user for palette + type and rewrites the `:root` block in `deck.css` —
both the colour tokens and the three `--font-*` tokens. That `:root`
edit is the *whole* re-theme; nothing else hardcodes a colour or font.
Don't treat the seed as canonical — if the user wants a slick dark
conference deck, a hand-drawn zine, or pure Helvetica greyscale, deliver
that (a fully dark deck is a legitimate ask — just not the default).

## Manifest contract

`manifest.json` is the **single source of truth** for slide order:

```json
{
  "description": "...",
  "slides": [
    {
      "folio": "01",
      "chapter": "Prelude",
      "title": "Title card",
      "path": "content/00-intro/01-title-card.html"
    }
  ]
}
```

- Required keys per entry: `folio`, `path`. `chapter` and `title` are
  for humans and the validator.
- **Reorder** = edit the JSON array. Don't touch fragment files.
- **Add** = drop a fragment file, append a manifest entry.
- **Remove** = delete the manifest entry. The validator will flag the
  orphan; decide whether to delete the file or keep it parked.

## Design tokens

Tokens are **semantic**, defined once in `assets/deck.css` `:root`, and
referenced by every slide:

```text
--page                            light surround behind the slide sheets
--paper / --paper-2 / --paper-3   sheet + panel backgrounds
--ink / --ink-2 / --ink-3         text hierarchy
--muted                           secondary text (labels, eyebrows)
--rule / --rule-soft              hairlines, dividers
--accent / --accent-deep / --accent-soft   primary accent (one)
--good                            success / positive state
--warn / --warn-deep              warm CTA / warning
--stage / --stage-2               dark-variant background (opt-in)
--ink-on-dark / --muted-on-dark   text on dark variants
--font-body / --font-mono / --font-display   the three type roles
```

The template's *values* are a default seed; the `:root` block is
rewritten per deck during `/deck-new` and `/deck-theme`. Don't rename
the tokens unless you also sweep every fragment + `widgets.js` that
references them.

If re-theming requires editing anything beyond the `:root` block
(colour tokens **and** the three `--font-*` tokens), something is
hard-coded that shouldn't be — a literal hex or `font-family` leaked
into a slide body, `widgets.js`, or `deck.css` outside `:root`. That's a
bug, fix it.

## Reveal.js usage

Init block in the shell is intentionally minimal:

```js
Reveal.initialize({
  width: 1280, height: 720, margin: 0,
  center: false, transition: 'fade',
  hash: true, slideNumber: 'c/t', showSlideNumber: 'speaker',
  overview: true, help: true,
  plugins: [ RevealNotes ],
});
```

**Used:** speaker view (`s`), overview (`esc`), hash routing,
auto-scaling, `RevealNotes`.

**Not used — don't add without explicit ask:**

- `class="fragment"` for in-slide reveals. One slide per beat is cleaner.
- `data-auto-animate`. Fights editorial layouts.
- Markdown / Highlight / Math / Search plugins.
- Vertical slide stacks (nested sections). Single-track only.

## Serving a deck

```bash
python3 -m http.server 8000
# then open http://127.0.0.1:8000/<deck-folder>/
```

Any HTTP server works. The deck uses relative paths, so the URL prefix
can be anything.

## Validation

Run after any non-trivial edit:

```bash
python3 <deck-folder>/bin/check.py
```

The validator enforces (`FAIL` exits non-zero):

1. Every manifest path resolves to a real file.
2. Every `content/*.html` is referenced exactly once.
3. Each fragment has exactly one `<section>`.
4. Folios are unique.
5. Folio chip in HTML matches the manifest folio (after middot
   normalisation).
6. **No inline `<script>` tags in fragments** — they don't execute
   (the shell injects via `insertAdjacentHTML`). Use `data-widget`.

It also warns (printed, never fails):

7. Hex colour literals in fragment bodies — prefer `var(--token)`.
8. Left-over scaffold placeholders (`YOUR TALK`, `Your Name`, …).

Green = ready. Red = fix before declaring done. Warnings are signals,
not blockers.

## Where the templates live

When you scaffold a deck, copy from `<plugin-root>/templates/` — that
directory holds the canonical starter files (`index.html`,
`assets/deck.css`, `bin/check.py`, `manifest.json`, a stub title slide,
and an empty `images/` folder).

## Prompt patterns that work

- **"On slide N, change X."** → Open the fragment, edit it, rerun
  `bin/check.py`.
- **"Reorder so the recap is last."** → Edit `manifest.json` only.
- **"Retheme to my brand colours {a, b, c, d}."** → Edit `:root` tokens.
- **"Add a chapter X with N slides about Y."** → Scaffold
  `content/<chapter>/`, draft each slide as a stub, append to manifest.
- **"Validate after my edits."** → Run `bin/check.py`, paste output.

## Prompt patterns that fail

- **"Build me a talk."** → Too vague. Run `/deck-new` and ask the
  design questions.
- **"Refactor inline styles into classes."** → Erodes per-slide
  flexibility. Push back.
- **"Add Vite / webpack / a bundler."** → Out of scope.
- **"Make my deck look exactly like the reference."** → Ambiguous. Ask
  what specifically (palette, layout, typography, motion) — then do
  that one thing.
