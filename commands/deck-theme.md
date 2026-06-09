---
description: Re-theme an existing deckcraft deck — palette, type stack, animation level.
argument-hint: "<deck-folder>"
---

# /deck-theme — retheme an existing deck

Change palette, typography, or animation level **without touching slide
content**. The whole point of the design-token structure is that this is
a 10-line edit.

## Process

### Step 1 — locate the deck

Confirm the target deck folder (`<name>/` at the project root). If
`$ARGUMENTS` is empty and there's only one deck folder in the repo, use
it. Otherwise list and ask.

### Step 2 — ask what to change

Pick at least one:

1. **Palette.** Four colours: accent, ink, paper, and one state
   colour (good or warn). Hex only. If they want a "brand kit" with
   twelve swatches, ask which four matter most. The values overwrite
   the existing `:root` token *values* — token names stay the same.
2. **Type stack.** Body, mono, display/italic. Three families max.
   Free Google Fonts unless they want self-hosted.
3. **Interactivity level.** `static` / `interactive`.
   - `static` → no transitions, no widgets. Strips `widgets.js` and
     all `data-widget` markers.
   - `interactive` → fade transitions plus widgets where they help.
     Existing `data-widget` markers stay.

### Step 3 — apply

#### Palette

Open `<deck>/assets/deck.css` and edit **only** the `:root` block at the
top. Map the new colours to the existing semantic tokens (`--page`,
`--paper`, `--ink`, `--accent`, `--good`, `--warn`, plus their
`-2`/`-3`/`-deep`/`-soft` variants and the dark-stage tokens). Keep the
deck **light by default** — `--page`/`--paper*` stay light unless the
user explicitly wants a fully dark deck. Don't rename tokens — slides
and `widgets.js` reference them; renaming is a wider edit.

#### Type stack

Two places only:

1. The Google Fonts `<link>` in `<deck>/index.html` (load the new
   families).
2. The three `--font-*` tokens (`--font-body`, `--font-mono`,
   `--font-display`) in the `:root` block of `assets/deck.css`.

Every `font-family` in the deck routes through those three tokens. If
you find a literal `font-family` anywhere else — a slide body,
`widgets.js`, or `deck.css` outside `:root` — that's a hard-coded leak;
flag it to the user.

#### Interactivity level

Two coupled changes — transitions and widgets.

**Transitions.** Edit `transition: '...'` in `Reveal.initialize` inside
`<deck>/index.html`:

- `static` → `transition: 'none'`. Then sweep `<deck>/content/` and
  rewrite every `data-transition="..."` to `data-transition="none"`
  (or remove the attribute entirely — it inherits the global default).
- `interactive` → `transition: 'fade'`. Slides already saying
  `data-transition="fade"` stay; anything else gets normalised.

**Widgets.**

- Going to `static` → remove the `<script src="assets/widgets.js">`
  tag and the `deckWidgetsInit(slidesEl)` call from `index.html`,
  then delete `<deck>/assets/widgets.js`. **Strip `data-widget`
  markers from every slide** (they'd be inert dead weight).
- Going to `interactive` → ensure `widgets.js` is wired (re-add the
  `<script>` tag + `deckWidgetsInit` call if missing) and surface the
  available factories to the user (`window.deckWidgets` keys). Don't
  add new `data-widget` markers without the user pointing at specific
  slides.

### Step 4 — validate

```bash
python3 <deck>/bin/check.py
```

Open the deck and eyeball the title card and one chapter opener — the
re-theme is mostly visual, the validator won't catch ugliness.

### Step 5 — hand off

```text
✓ Re-themed <deck>.
   Palette: <summary>
   Type:    <summary>
   Motion:  <summary>
Open http://127.0.0.1:8000/<deck>/ to review.
```

## Constraints

- **Don't edit slide bodies** to retheme. If a slide uses hex instead
  of `var(--token)`, fix the *slide* in a separate pass — but flag it
  before doing so.
- **Don't add new tokens** unless the user explicitly asks for a
  capability the current set can't express.
- **Don't touch `bin/check.py` or `index.html`'s loader.**

$ARGUMENTS
