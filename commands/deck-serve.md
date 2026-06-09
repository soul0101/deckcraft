---
description: Print the local-serve command for a deckcraft deck (and start it if asked).
argument-hint: "<deck-folder> [port]"
---

# /deck-serve — serve a deck locally

The deckcraft shell uses `fetch()`, which is blocked on `file://` URIs.
You always have to serve over HTTP. This command prints the right
command for the user's deck.

## Process

1. **Locate the deck.** `$ARGUMENTS` may contain the folder and an
   optional port. Defaults: only deck folder in the repo if there's
   just one; port `8000`.
2. **Print the commands** (don't auto-run unless the user explicitly
   asked you to):

   ```bash
   python3 -m http.server <port>
   # then open
   open http://127.0.0.1:<port>/<deck>/
   ```

3. **If the user asks you to start it**, run the server in the
   background, wait ~1s, and confirm it's listening. Don't block the
   conversation on a foreground server.

4. **Common gotchas to mention:**
   - Port already in use → bump to 8001.
   - Blank page in browser → check the dev console; usually a 404 on a
     manifest path or a `file://` mistake.
   - "Failed to fetch" → the user opened the deck via `file://`
     instead of `http://`.

## Constraints

- **Never suggest `file://`.** It's the #1 cause of "blank page" reports.
- **Any HTTP server works.** If `python3` isn't available, suggest
  `npx serve`, `caddy file-server`, or similar.

$ARGUMENTS
