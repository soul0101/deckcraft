---
description: Run the deckcraft validator on a deck folder and explain any failures.
argument-hint: "<deck-folder>"
---

# /deck-validate — run the validator

Run `bin/check.py` on a deckcraft deck and translate any failures into
plain English with the file + line that needs fixing.

## Process

1. **Locate the deck.** `$ARGUMENTS` is the folder (e.g. `my-talk` or
   `./my-talk/`). If empty and only one deck folder exists in the repo,
   use it. Otherwise list and ask.
2. **Run:**
   ```bash
   python3 <deck>/bin/check.py
   ```
3. **If green**, print the validator output and stop.
4. **If red**, group the failures by category and explain each:

   - **`manifest: missing file <path>`** — manifest references a file
     that doesn't exist. Either create the file or remove the entry.
   - **`orphan: <path> not in manifest`** — file exists but no manifest
     entry. Either add an entry or delete the file.
   - **`<path>: expected 1/1 section, got N/M`** — fragment has wrong
     number of `<section>` blocks. Each fragment is exactly one
     `<section>`, no nesting.
   - **`duplicate folio <folio>: <a> and <b>`** — two slides claim the
     same folio. Renumber one.
   - **`<path>: chip 'X' != manifest folio 'Y'`** — the
     `<span class="folio">` in the HTML disagrees with `manifest.json`.
     Fix the chip (display form uses `·`) or fix the manifest.

5. **Offer to fix.** Don't fix automatically. Ask the user to confirm
   which fixes they want (some "orphans" are intentionally parked
   slides). After fixing, **rerun the validator**.

## Constraints

- **Never weaken the validator** to make a check pass. The validator
  is intentionally strict; that's the point.
- **Don't touch `bin/check.py`** unless the user is explicitly
  improving the framework.

$ARGUMENTS
