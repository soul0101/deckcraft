---
description: Add a slide (or a chapter) to an existing deckcraft deck.
argument-hint: "<deck-folder> [slide-or-chapter description]"
---

# /deck-add — add a slide or chapter

Add new content to an existing deck without breaking validation.

## Process

### Step 1 — locate the deck

The user passes the deck folder as the first arg (e.g. `my-talk` or
`./my-talk/`) or you ask. Confirm it has `manifest.json` + `content/` +
`assets/deck.css`. If multiple decks exist and the user didn't specify,
list them and ask.

### Step 2 — clarify intent

Ask, if not obvious from `$ARGUMENTS`:

1. **Slide or chapter?** A single slide, or a new chapter with N slides?
2. **Where?** After which existing folio? (Or: "at the end".)
3. **Beat name + 1-line intent.** What does this slide *do* for the
   audience?
4. **Section variant.** `sheet` (light default — including chapter
   openers), `plate` (full-bleed image), or `dark` (opt-in for a single
   hero / quote moment)?
5. **Speaker notes.** 1–3 sentences. Write a draft if the user provides
   bullets.

### Step 3 — write the fragment(s)

For each new slide:

- Filename: `content/<chapter>/<folio>-<slug>.html`. Slug is
  kebab-case from the beat name. Folio matches the planned manifest
  position.
- Body: a single `<section class="<variant>" data-transition="<level>">`
  with the standard chrome strip (talk · chapter on the left, folio chip
  on the right — orientation only), an inline-styled body, and
  `<aside class="notes">`.
- Reference colours via `var(--token)`, never hex; reference type via
  `var(--font-body)` / `var(--font-mono)` / `var(--font-display)`, never
  a literal `font-family`.
- **Match the deck's restraint:** match the existing slides. No eyebrows
  or tiny labels unless the slide genuinely needs one (one small-text
  element max), and no on-stage keyboard hints. See the micro-text
  budget in `SKILL.md`.
- Reference images as `images/<filename>` (the user drops files into
  `<deck>/images/`).

For a new chapter, create the folder `content/<NN-chapter-slug>/` and
add a chapter opener as the first slide — a light `sheet` by default;
use `dark` only if the user explicitly wants that one beat to go
near-black.

### Step 4 — update the manifest

Insert the new entry (or entries) at the right position in the
`slides` array. **Re-number subsequent folios** if you inserted in the
middle:

- Update the `folio` field in each manifest entry.
- Update the `<span class="folio">N</span>` chip in each affected
  fragment file. (The validator catches mismatches.)
- Rename the affected fragment filenames if the new folio changes the
  prefix (preserve the slug).

If you inserted at the end, no renumbering needed.

### Step 5 — validate

```bash
python3 <deck>/bin/check.py
```

Fix any reds. Hand back with a one-line summary:

```text
✓ Added <N> slide(s) to <deck>. Folios <range>. Validator green.
```

## Constraints

- **One section per fragment file.**
- **Folio chip in HTML must match manifest.** Manifest folio uses `·`
  (e.g. `"24·B"`); chip uses the same (raw `24·B` or escaped
  `24&middot;B`); filename uses `-` (`24-B-…html`). The validator
  normalises both sides before comparing.
- **No inline `<script>` in fragments.** Use `data-widget` and register
  a factory in `assets/widgets.js`. The validator fails on stray scripts.
- **Don't widen the variant set.** `sheet` / `dark` / `plate` only.
- **Don't touch the loader or validator.**

$ARGUMENTS
