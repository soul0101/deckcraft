---
description: Interactively scaffold a new Reveal.js deck from the deckcraft templates.
argument-hint: "[optional short-name for the deck folder]"
---

# /deck-new — interactive deck scaffold

You are scaffolding a brand-new deck for the user using the **deckcraft**
framework. The skill `deckcraft/SKILL.md` is your rulebook. Follow it.

## Goal

End state: `<short-name>/` exists at the user's project root, mirrors the
bundled `templates/` layout, has the user's palette in `:root`, has stub
slides for every beat in their outline, and `python3 <short-name>/bin/check.py`
prints `OK: N slides, all checks passed`. No `slides/` wrapper directory —
the deck folder *is* the deck.

## Process — do this in order

### Step 1 — gather requirements (interactive)

Ask the user the questions below. **Ask in batches of 2–3** so it doesn't
feel like a form. Don't write any HTML until you have answers (or
explicit "you choose") for at least 4 of these:

1. **Topic & duration.** What's the talk about? 10 / 30 / 60 min?
   (Sets chapter count and slide budget — roughly 1 slide per minute.)
2. **Audience & venue.** Who's in the room? Conference, internal review,
   classroom? Sets formality and shared vocabulary.
3. **Aesthetic reference.** Editorial print? Slick conference deck?
   Hand-drawn? Ask for an image URL, a reference deck, or a one-line
   vibe ("New Yorker but for engineers").
4. **Palette.** Four colours, not twelve: primary accent, ink (text),
   paper (background), and a secondary state colour (good/warn). Hex
   values. The template ships a warm cream + terracotta seed, but it's
   only a seed — always ask. If the user is undecided, propose two
   contrasting options (e.g. "warm editorial cream + terracotta" vs
   "cool slate + electric blue") and let them pick. The chosen palette
   gets written into the `:root` tokens (`--paper`, `--ink`, `--accent`,
   `--good`, `--warn`) — the *values* change, the token names don't.
5. **Type stack.** Body, mono, display/italic. Three families max. The
   template wires Geist + Geist Mono + Newsreader by default, but ask
   what the user actually wants. Any Google Font works; for self-hosted
   stacks, the user provides files and you wire `@font-face`. The
   chosen stack replaces the `font-family` declarations on `html`,
   `body`, and `.chrome` and the `<link>` to Google Fonts in
   `index.html`.
6. **Existing draft.** Outline? Bullets? Past slides? Slide notes?
   - If yes → use them verbatim as slide content.
   - If no → propose a 5-beat structure (hook → context → tension →
     resolution → close) and **get explicit sign-off before scaffolding**.
7. **Interactivity.** Two options. **Default to `interactive`.**

   - **`static`** — no transitions, no widgets. Print-friendly, PDF-clean.
     Sets `transition:'none'` and deletes `assets/widgets.js`.
   - **`interactive`** *(default)* — fade transitions plus widgets where
     they earn their keep. The bundled `widgets.js` ships four polished,
     keyboard-accessible, on-theme widgets: **`steps`** (in-place
     progressive reveal — build an argument one beat at a time),
     **`toggle`** (before/after), **`counter`** (audience tally), and
     **`reveal`** (held answer). Drop a `data-widget` marker on a slide
     that genuinely invites interaction; aim for one or two strong
     moments across the deck, not one per slide. Add new factories to
     `widgets.js` as it grows — same bar: purposeful, accessible,
     token-driven, calm.

   Phrase the question as: *"Interactivity? `static` (print-first, no
   motion) or `interactive` (default, fade transitions + optional
   widgets)."*

8. **Images folder.** Tell the user: "Drop any photos / illustrations
   into `<short-name>/images/`. Reference them in slides as
   `images/<filename>`." Don't block on them being there yet.
9. **Folder name.** A short slug for `<slug>/` at the project root. If
   the user passed `$ARGUMENTS`, use that. Otherwise propose one from
   the topic.

### Step 2 — confirm shape before writing

Echo a concise summary of the answers and the planned slide list (folio
+ chapter + title for each beat). Wait for the user to say "go" /
"looks good" / similar. **Do not proceed without confirmation.**

### Step 3 — preview each slide as text, then confirm

Before writing **any** HTML, draft a per-slide text preview of the whole
deck and show it to the user. The preview is prose, not markup — it's
the editorial pass that catches structural problems while they're cheap
to fix.

For every slide in the confirmed outline, print a block like:

```text
[01] Chapter · Beat title
  Variant: sheet (default light) | plate (full-bleed image) | dark (opt-in drama)
  Headline: <the one line that lands>
  Body:    <2–4 sentences describing what the slide actually says /
            shows — bullets, quote, diagram intent, image idea, etc.>
  Widget:  <none | steps [a, b, c] | toggle Before/After | counter "label"
            | reveal "prompt → answer" | new: <name> — <one-line behaviour>>
            (interactive decks only)
  Notes:   <1–3 sentences the speaker will say aloud>
```

Rules for the preview:

- **One block per slide**, in manifest order. Cover the entire deck.
- **Default to the light `sheet`.** Use `dark` only where a single beat
  genuinely wants a near-black hero/quote moment — not for openers by
  default. The title card and chapter openers are light.
- **Be specific.** "Three bullets contrasting X and Y" beats "some
  points about the topic." If the user gave a draft, quote it.
- **No micro-text by default.** Don't plan eyebrows, kickers, or tiny
  labels unless a slide truly needs one — and never more than one small
  label per slide. No on-stage keyboard hints or "click to continue"
  text. (See the micro-text budget in `SKILL.md`.)
- **Flag widgets explicitly.** If `interactive` and the beat earns one,
  name which (`steps` for progressive points, `toggle` for before/after,
  `counter`, `reveal`, or a new factory you'd add). Aim for one or two
  strong interactive moments across the deck, not one per slide. If
  `static`, omit the `Widget:` line.
- **Don't write HTML yet.** No `<section>`, no inline styles, no tokens.
- **Plate / dark variant slides** still get a Body line describing the
  imagery or tone.

After the preview, ask: *"Want any of these reshaped before I build? Or
say 'go' to scaffold."* Iterate on the text preview until the user
signs off. Cheap to rewrite a paragraph; expensive to rewrite 30 HTML
files.

**Do not proceed to Step 4 without explicit sign-off on the previews.**

### Step 4 — scaffold the folder

Copy the bundled templates into the new deck folder. The plugin's
templates live at `<plugin-root>/templates/` (sibling of this file's
parent). From the user's project root:

```bash
mkdir -p <slug>
cp -R <plugin-root>/templates/. <slug>/
```

(Find `<plugin-root>` by walking up from this command file:
`commands/deck-new.md` → `<plugin-root>/commands/...`, so
`<plugin-root>/templates/` is the right path. If that path doesn't
exist, ask the user to point you at the plugin root.)

The templates contain:

```
templates/
├── index.html          ← shell (you'll edit title + chrome label)
├── manifest.json       ← starter, one slide
├── assets/deck.css     ← design system (you'll edit :root tokens)
├── bin/check.py        ← validator (untouched)
├── content/00-intro/   ← stub title + agenda slides
└── images/.gitkeep     ← drop photos here
```

### Step 5 — apply the user's choices

In `<slug>/`:

1. **`index.html`** — change `<title>`, the chrome label
   (`YOUR TALK · CH N` placeholder), and the Google Fonts `<link>` if
   the user chose a different type stack.
2. **`assets/deck.css`** — edit only the `:root` block at the top.
   Map the user's palette to the existing semantic tokens (`--page`,
   `--paper`, `--paper-2`, `--paper-3`, `--ink`, `--ink-2`, `--ink-3`,
   `--muted`, `--rule`, `--rule-soft`, `--accent`, `--accent-deep`,
   `--accent-soft`, `--good`, `--warn`, `--warn-deep`, `--stage`,
   `--stage-2`, `--ink-on-dark`, `--muted-on-dark`). Keep the deck
   **light by default** — `--page` and `--paper*` stay light unless the
   user explicitly asked for a fully dark deck. Then set the type stack
   by editing the three `--font-*` tokens (`--font-body`, `--font-mono`,
   `--font-display`) in that same `:root` block. Don't rename tokens —
   the stubs and `widgets.js` reference them. **The whole theme lives in
   `:root`; no other CSS edits.**
3. **`content/00-intro/01-title-card.html`** — fill in the talk title,
   subtitle, speaker name. **Keep it on the light `sheet` variant** (the
   default) unless the user explicitly wants a dark title card. Set
   `data-transition` per the interactivity choice (`static` → `none`,
   otherwise → `fade`).
4. **`content/00-intro/02-agenda.html`** — list the chapters from the
   confirmed outline.
5. **`manifest.json`** — replace the starter array with one entry per
   beat, in narrative order. Keep folios as zero-padded `"01"`, `"02"`,
   etc. Use sub-folios (`"24·A"`, `"24·B"` — middot in the manifest
   value, hyphen in the filename `24-A-…html`) only if the user wants
   paired slides on the same beat. The manifest is the source of truth
   for the parallel build below — every fragment path must already be
   listed before subagents start.
6. **Build the slide fragments in parallel.** Once the title card,
   agenda, theme tokens, and `manifest.json` are wired (steps 1–5
   above), dispatch **one subagent per beat** to write its fragment in
   parallel. Batch the spawn calls in a single tool-call turn so they
   actually run concurrently — sequential subagents defeat the point.

   Each subagent gets a self-contained brief:

   - The signed-off **text preview** for that beat (from Step 3) —
     verbatim. That's the spec.
   - The **target path**: `content/<NN-chapter-slug>/<folio>-<slug>.html`.
   - The **chapter label** and **folio** for the chrome strip.
   - The **interactivity mode** (`static` / `interactive`) and the
     `data-transition` value to use (`none` / `fade`).
   - A pointer to `skills/deckcraft/SKILL.md` for slide structure rules
     and to `templates/content/00-intro/01-title-card.html` as a
     reference fragment.
   - The deck's design tokens are already in `assets/deck.css`; the
     subagent must reference colours via `var(--token)` (never hex) and
     type via `var(--font-body)` / `var(--font-mono)` / `var(--font-display)`
     (never a literal `font-family`).
   - **Light by default:** use the `sheet` variant unless the preview
     explicitly calls for `dark` or `plate`.
   - **Micro-text budget (hard rule):** no eyebrows, kickers, captions,
     or tiny labels unless the preview names one — and never more than
     one small-text element on a slide. No keyboard hints or "click to
     continue" text. The chrome strip (talk · chapter on the left, folio
     chip on the right) is orientation only — don't echo it on the slide.

   Each subagent produces exactly one file: a single
   `<section class="sheet|dark|plate" data-transition="...">` with the
   chrome strip, the body the preview describes, any approved
   `data-widget` marker, and `<aside class="notes">`. **No manifest
   edits from subagents** — you own the manifest.

   If a beat needs a new widget factory, the subagent flags it in its
   return; you append the factory to `assets/widgets.js` after the
   fragment lands. Don't let parallel subagents race on
   `widgets.js`.
7. **Apply the interactivity choice globally:**
   - **`static`** → in `index.html`, change `transition: 'fade'` to
     `transition: 'none'` in `Reveal.initialize`, and **remove** the
     `<script src="assets/widgets.js"></script>` line plus the
     `deckWidgetsInit` call. Delete `assets/widgets.js`. Strip every
     fragment's `data-transition` attribute (or set to `none`).
   - **`interactive`** *(default)* → keep everything as shipped. Keep
     `data-transition="fade"` on stubs. Lean into widgets where they
     earn their keep.

### Step 6 — validate

Run:

```bash
python3 <slug>/bin/check.py
```

If red, fix and rerun. Common fixes:

- **chip ≠ folio** → the `<span class="folio">N</span>` value must
  match `manifest.json`'s `folio` (display form: `·` instead of `-`).
- **orphan** → file in `content/` not referenced by manifest. Add it
  or delete it.
- **expected 1/1 section** → the fragment has zero, two, or nested
  sections. Flatten to one.

### Step 7 — hand off

Print, in this exact shape:

```text
✓ Scaffolded <slug>/ — N slides, validator green.

Run it:
    python3 -m http.server 8000
    open http://127.0.0.1:8000/<slug>/

Edit:
    Slides   → <slug>/content/<chapter>/<folio>-<slug>.html
    Order    → <slug>/manifest.json
    Theme    → <slug>/assets/deck.css (:root tokens)

Drop your photos into <slug>/images/ and reference them as
<img src="images/<filename>"> in any slide.
```

## Constraints

- **One section per fragment file.** No nesting.
- **No build step.** Don't add `package.json`, bundlers, preprocessors.
- **Inline styles are fine.** Don't extract them into classes.
- **Tokens, not hex**, in slide bodies.
- **Don't touch the validator** (`bin/check.py`).
- **Don't touch the loader** (`<script type="module">` in `index.html`)
  unless the user explicitly asks to change Reveal init options.

## Argument

If the user invoked this command with arguments, treat `$ARGUMENTS` as
the proposed deck slug. Confirm it before scaffolding.

$ARGUMENTS
