# deckcraft

A Claude Code plugin for building **Reveal.js decks** the editorial way:
one HTML file per slide, slide order in `manifest.json`, design system
in one CSS file, no build step, no bundler, no Reveal.js plugins beyond
`RevealNotes`.

You answer a handful of design questions and Claude scaffolds a deck
you can host on any HTTP server.

## Install

### Prerequisites

- Claude Code installed and signed in (`claude --version`)
- Python 3 on your `PATH` (for the deck validator)

### 1. Install the plugin

From any Claude Code session, add this repo as a marketplace and install the
plugin:

```text
/plugin marketplace add soul0101/deckcraft
/plugin install deckcraft@deckcraft
/reload-plugins
```

`soul0101/deckcraft` is the GitHub repo; `deckcraft@deckcraft` means the
`deckcraft` plugin from the `deckcraft` marketplace. To pull updates later:

```text
/plugin marketplace update deckcraft
```

### 2. Verify

In a new Claude Code session:

```text
/deck-new
```

You should see the interactive scaffold prompt.

## Commands

| Command            | What it does                                                  |
|--------------------|---------------------------------------------------------------|
| `/deck-new`        | Interactive scaffold. Asks 6 design questions, writes a deck. |
| `/deck-add`        | Add a slide (or chapter) to an existing deck.                 |
| `/deck-theme`      | Re-theme an existing deck — palette, type, animation level.   |
| `/deck-validate`   | Run the deck validator (`bin/check.py`).                      |
| `/deck-serve`      | Print the local serve command and open in a browser.          |

A `deckcraft` skill is also auto-loaded so Claude stays on-style across
long edits — no need to invoke it manually.

## How `/deck-new` works

When you run `/deck-new`, Claude will ask, in order:

1. **Topic & duration.** What's the talk? 10 / 30 / 60 min?
2. **Audience.** Who's in the room?
3. **Aesthetic.** Editorial print? Slick conference? Hand-drawn? An image
   reference or a one-line vibe is fine. **The template's look is a
   starting seed, not a house style** — your answers here drive what
   the deck actually ships with.
4. **Palette.** Four colours: accent, ink, paper, and one state colour
   (good/warn). Hex values. If you're undecided, Claude proposes two
   contrasting options. Your choice gets written into the semantic
   `:root` tokens (`--accent`, `--ink`, `--paper`, …).
5. **Type stack.** Body, mono, display/italic. Three families max. Any
   Google Font works; self-hosted stacks supported via `@font-face`.
6. **Existing draft.** Outline, bullets, past slides — drop them in.
   Otherwise Claude proposes a 5-beat structure first.
7. **Interactivity.** `static` or **`interactive`** (default).
   `interactive` enables fade transitions and four polished,
   keyboard-accessible widgets — `steps` (in-place progressive reveal),
   `toggle` (before/after), `counter` (audience tally), and `reveal`
   (held answer); add new factories to `assets/widgets.js` as you go.
   `static` strips both for a print-clean deck.
8. **Images folder.** Where you'll drop raster assets (Claude wires the
   path; you fill the folder).

Claude then scaffolds `<your-name>/` from the bundled templates,
rewrites the `:root` block + `font-family` declarations to match your
theme, drafts your slides as stubs, and runs the validator.

Serve the result:

```bash
python3 -m http.server 8000
# open http://127.0.0.1:8000/<your-name>/
```

## Plugin layout

```
deckcraft/
├── .claude-plugin/
│   ├── plugin.json          ← plugin manifest
│   └── marketplace.json     ← lets the repo be added as a marketplace
├── commands/                ← slash commands
│   ├── deck-new.md
│   ├── deck-add.md
│   ├── deck-theme.md
│   ├── deck-validate.md
│   └── deck-serve.md
├── skills/deckcraft/
│   └── SKILL.md             ← framework rules, auto-loaded
└── templates/               ← copied verbatim by /deck-new
    ├── index.html           ← ~80-line shell, minimal Reveal init
    ├── manifest.json        ← starter (two stub slides)
    ├── assets/
    │   ├── deck.css         ← semantic colour + font tokens, chrome, variants
    │   └── widgets.js       ← widget loader + steps / toggle / counter / reveal
    ├── bin/check.py         ← validator (8 checks, see below)
    ├── content/00-intro/    ← stub title + agenda slides
    └── images/.gitkeep      ← drop your photos here
```

The framework rulebook is [`skills/deckcraft/SKILL.md`](./skills/deckcraft/SKILL.md).

## Validation

Every command that writes files ends by running:

```bash
python3 <your-deck>/bin/check.py
```

**Fails (exit non-zero):**

1. Every manifest path resolves to an existing file.
2. Every `content/*.html` is referenced exactly once.
3. Each fragment contains exactly one `<section>`.
4. Folios are unique.
5. The folio chip in HTML matches the manifest folio.
6. No inline `<script>` tags inside fragments — they don't execute
   (the shell injects via `insertAdjacentHTML`). Use `data-widget`.

**Warns (printed, never fails):**

7. Hex colour literals in fragment bodies — prefer `var(--token)`.
8. Left-over scaffold placeholders (`YOUR TALK`, `Your Name`, …).

Green output = ready to ship.

## Design promise

If re-theming a deck takes more than editing the `:root` block at the
top of `assets/deck.css` — the colour tokens **and** the three
`--font-*` tokens (`--font-body`, `--font-mono`, `--font-display`) — plus
loading the new font in the Google Fonts `<link>`, then something is
hard-coded that shouldn't be (a literal hex or `font-family` leaked into
a slide). Open an issue.

Decks are **light cream by default**. A fully dark deck is a supported
choice (`/deck-theme`), just not the default — the `dark` section
variant is reserved for one-off hero / quote moments.

## Hard guardrails (non-negotiable)

- No build step. No `package.json`, no bundler, no preprocessor.
- No Reveal.js plugins beyond `RevealNotes`.
- No vertical slide stacks (nested `<section>`s).
- No `file://` — the shell uses `fetch()`. Always serve over HTTP.
- One `<section>` per fragment file.

If a request implies breaking any of these, Claude will push back.

## Credits

Extracted from a real conference deck built on this exact framework.
