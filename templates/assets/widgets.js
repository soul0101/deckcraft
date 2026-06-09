/*
 * widgets.js — interactive slide widgets for the modular deck.
 *
 * Why this file exists
 * ────────────────────
 * Reveal.js fragments loaded via fetch() + insertAdjacentHTML do NOT execute
 * inline <script> tags. The canonical pattern for rich slide content is:
 *
 *   1. Per-widget factory functions live in this file (one source of truth).
 *   2. Slides reference them declaratively via `data-widget="<name>"`
 *      (and optionally `data-widget-options='<json>'` for per-instance config).
 *   3. After every slide fragment is in the DOM, the shell calls
 *      `deckWidgetsInit(slidesEl)`. It scans for `[data-widget]` markers
 *      and invokes the matching factory, which mutates the marker in place.
 *
 * House rules for a *good* widget (these are the bar, not suggestions):
 *   • Purposeful. One or two interactive moments in a deck, each making a
 *     point that a static slide can't. Never interactivity for its own sake.
 *   • Accessible. Use real <button>s, keyboard works, focus is visible
 *     (the deck.css :focus-visible ring), state changes announce via aria.
 *   • On-theme. Reference var(--token) for colour and var(--font-*) for type
 *     so the widget re-themes with the deck. Never hardcode a hex or a font.
 *   • Calm. Transitions ≤ .25s, no bounce, no spinners. Match the editorial
 *     restraint of the slides around it.
 *   • Self-contained. A widget owns only its marker element. It never reaches
 *     across slides or into Reveal internals.
 *
 * Adding a new widget:
 *   1. Define `function createMyWidget(root, options) { … }` below.
 *   2. Register it on `window.deckWidgets` (`{ myWidget: createMyWidget }`).
 *   3. In a slide, mark a root element:
 *        <div data-widget="myWidget" data-widget-options='{"foo":1}'>…</div>
 *
 * No inline <script> tags in any slide. No clone-replace dance.
 */

(function () {

  // Shared inline-style helpers (keep widgets on-theme + consistent).
  const MONO = "font-family:var(--font-mono);";
  const BODY = "font-family:var(--font-body);";
  const EASE = "transition:transform .12s ease, background-color .2s ease, color .2s ease, border-color .2s ease, opacity .2s ease;";

  // ── counter ─────────────────────────────────────────────────────────────
  // Audience tally / live count. <div data-widget="counter"
  //   data-widget-options='{"start":0,"label":"clicks"}'></div>
  function createCounter(root, options) {
    const start = Number.isFinite(options.start) ? options.start : 0;
    const label = options.label || 'clicks';
    let count = start;

    root.innerHTML = `
      <button type="button" class="dc-counter-btn"
        aria-label="${label}: ${count}, click to add one"
        style="display:inline-flex;align-items:center;gap:14px;
               padding:14px 22px;border-radius:999px;border:1px solid var(--rule);
               background:var(--paper-3);color:var(--ink);${MONO}font-size:18px;
               cursor:pointer;${EASE}box-shadow:0 2px 8px -4px color-mix(in srgb,var(--ink) 22%,transparent)">
        <span class="dc-counter-value" aria-hidden="true"
              style="font-weight:600;color:var(--accent);font-variant-numeric:tabular-nums">${count}</span>
        <span aria-hidden="true" style="color:var(--muted)">${label}</span>
      </button>`;
    const btn = root.querySelector('.dc-counter-btn');
    const val = root.querySelector('.dc-counter-value');
    btn.addEventListener('pointerdown', () => { btn.style.transform = 'scale(.96)'; });
    btn.addEventListener('pointerup',   () => { btn.style.transform = ''; });
    btn.addEventListener('pointerleave',() => { btn.style.transform = ''; });
    btn.addEventListener('click', () => {
      count += 1;
      val.textContent = count;
      btn.setAttribute('aria-label', `${label}: ${count}, click to add one`);
    });
  }

  // ── reveal ──────────────────────────────────────────────────────────────
  // Hold an answer until you ask for it. <div data-widget="reveal"
  //   data-widget-options='{"prompt":"Click to show","answer":"42"}'></div>
  function createReveal(root, options) {
    const prompt = options.prompt || 'Click to reveal';
    const answer = options.answer || '';

    root.innerHTML = `
      <button type="button" class="dc-reveal-btn" aria-expanded="false"
        style="display:inline-block;padding:16px 24px;border-radius:12px;
               border:1px dashed var(--rule);background:transparent;
               color:var(--muted);${MONO}font-size:15px;letter-spacing:.08em;
               text-transform:uppercase;cursor:pointer;${EASE}">
        ${prompt}
      </button>`;
    const btn = root.querySelector('.dc-reveal-btn');
    btn.addEventListener('click', () => {
      const out = document.createElement('div');
      out.setAttribute('role', 'status');
      out.style.cssText = `display:inline-block;padding:16px 24px;border-radius:12px;
        background:var(--paper-3);border:1px solid var(--rule);color:var(--ink);
        font-family:var(--font-display);font-style:italic;font-size:24px;
        line-height:1.3;animation:dc-fade-in .25s ease both`;
      out.textContent = answer;
      btn.replaceWith(out);
    });
  }

  // ── steps ───────────────────────────────────────────────────────────────
  // In-place progressive reveal — build an argument one beat at a time on a
  // single slide. Advance by click or → / Space, retreat with ←.
  // <div data-widget="steps"
  //   data-widget-options='{"items":["First point","Second point","Third"]}'></div>
  function createSteps(root, options) {
    const items = Array.isArray(options.items) ? options.items : [];
    const total = items.length;
    let shown = Math.max(0, Math.min(total, options.start | 0));

    const list = items.map((text, i) => `
      <li class="dc-step" data-i="${i}"
          style="display:grid;grid-template-columns:32px 1fr;gap:18px;
                 align-items:baseline;${BODY}font-size:26px;line-height:1.32;
                 color:var(--ink);opacity:0;transform:translateY(6px);
                 transition:opacity .25s ease, transform .25s ease">
        <span aria-hidden="true" style="${MONO}font-size:14px;letter-spacing:.14em;
              color:var(--accent);padding-top:8px">${String(i + 1).padStart(2, '0')}</span>
        <span>${text}</span>
      </li>`).join('');

    root.innerHTML = `
      <div class="dc-steps" tabindex="0" role="group"
           aria-label="Stepped points, ${total} total. Use arrow keys or click to advance."
           style="display:flex;flex-direction:column;gap:28px;outline:none;cursor:pointer">
        <ol aria-live="polite" style="list-style:none;padding:0;margin:0;
            display:flex;flex-direction:column;gap:18px">${list}</ol>
        <div style="display:flex;align-items:center;gap:16px">
          <button type="button" class="dc-steps-next"
            style="${MONO}font-size:13px;letter-spacing:.12em;text-transform:uppercase;
                   padding:10px 18px;border-radius:999px;border:1px solid var(--rule);
                   background:var(--paper-3);color:var(--ink);cursor:pointer;${EASE}">
            Next ›</button>
          <span class="dc-steps-count" aria-hidden="true"
                style="${MONO}font-size:12px;letter-spacing:.16em;color:var(--muted);
                       font-variant-numeric:tabular-nums"></span>
        </div>
      </div>`;

    const wrap  = root.querySelector('.dc-steps');
    const next  = root.querySelector('.dc-steps-next');
    const count = root.querySelector('.dc-steps-count');
    const steps = Array.from(root.querySelectorAll('.dc-step'));

    function render() {
      steps.forEach((li, i) => {
        const on = i < shown;
        li.style.opacity = on ? '1' : '0';
        li.style.transform = on ? 'none' : 'translateY(6px)';
      });
      count.textContent = `${shown} / ${total}`;
      next.textContent = shown >= total ? '⟲ Replay' : 'Next ›';
    }
    function advance() { shown = shown >= total ? 0 : shown + 1; render(); }
    function retreat() { if (shown > 0) { shown -= 1; render(); } }

    next.addEventListener('click', (e) => { e.stopPropagation(); advance(); });
    wrap.addEventListener('click', advance);
    wrap.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') { e.preventDefault(); advance(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); retreat(); }
    });
    render();
  }

  // ── toggle ──────────────────────────────────────────────────────────────
  // Before / after (or any two states) on one slide. Segmented control swaps
  // the panel with a quick fade. <div data-widget="toggle"
  //   data-widget-options='{"options":[{"label":"Before","body":"…"},{"label":"After","body":"…"}]}'></div>
  function createToggle(root, options) {
    const opts = Array.isArray(options.options) ? options.options.filter(Boolean) : [];
    if (opts.length < 2) { root.innerHTML = ''; return; }
    let active = Math.max(0, Math.min(opts.length - 1, options.start | 0));

    const tabs = opts.map((o, i) => `
      <button type="button" role="tab" class="dc-toggle-tab" data-i="${i}"
        aria-selected="${i === active}"
        style="${MONO}font-size:13px;letter-spacing:.1em;text-transform:uppercase;
               padding:10px 18px;border:0;background:transparent;cursor:pointer;${EASE}
               color:${i === active ? 'var(--paper-3)' : 'var(--ink-2)'};
               background-color:${i === active ? 'var(--accent)' : 'transparent'};
               border-radius:999px">${o.label || `Option ${i + 1}`}</button>`).join('');

    root.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:24px">
        <div role="tablist" aria-label="Toggle views"
             style="display:inline-flex;gap:4px;padding:4px;align-self:flex-start;
                    background:var(--paper-2);border-radius:999px;border:1px solid var(--rule)">
          ${tabs}
        </div>
        <div class="dc-toggle-panel" role="region" aria-live="polite"
             style="${BODY}font-size:26px;line-height:1.4;color:var(--ink-2);
                    max-width:920px;min-height:1.4em"></div>
      </div>`;

    const tablist = root.querySelector('[role="tablist"]');
    const panel = root.querySelector('.dc-toggle-panel');
    const tabEls = Array.from(root.querySelectorAll('.dc-toggle-tab'));

    function paint() {
      tabEls.forEach((t, i) => {
        const on = i === active;
        t.setAttribute('aria-selected', String(on));
        t.style.color = on ? 'var(--paper-3)' : 'var(--ink-2)';
        t.style.backgroundColor = on ? 'var(--accent)' : 'transparent';
      });
      panel.style.animation = 'none';
      // reflow so the fade re-triggers on every switch
      void panel.offsetWidth;
      panel.innerHTML = opts[active].body || '';
      panel.style.animation = 'dc-fade-in .25s ease both';
    }
    tablist.addEventListener('click', (e) => {
      const t = e.target.closest('.dc-toggle-tab');
      if (!t) return;
      active = Number(t.dataset.i);
      paint();
    });
    paint();
  }

  // ── Registry ─────────────────────────────────────────────────────────────
  window.deckWidgets = Object.assign(window.deckWidgets || {}, {
    counter: createCounter,
    reveal:  createReveal,
    steps:   createSteps,
    toggle:  createToggle,
  });

  // ── Initialiser called by index.html before Reveal boots ────────────────
  window.deckWidgetsInit = function (scope) {
    const root = scope || document;
    root.querySelectorAll('[data-widget]').forEach(el => {
      const name = el.getAttribute('data-widget');
      const factory = window.deckWidgets[name];
      if (!factory) {
        console.warn(`[widgets] unknown widget: ${name}`);
        return;
      }
      let options = {};
      const raw = el.getAttribute('data-widget-options');
      if (raw) {
        try { options = JSON.parse(raw); }
        catch (err) { console.warn(`[widgets] bad options on ${name}:`, err); }
      }
      try { factory(el, options); }
      catch (err) { console.error(`[widgets] ${name} failed:`, err); }
    });
  };

  // Tiny shared keyframe used by widgets above.
  if (!document.getElementById('dc-widgets-style')) {
    const style = document.createElement('style');
    style.id = 'dc-widgets-style';
    style.textContent = `@keyframes dc-fade-in { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:none; } }`;
    document.head.appendChild(style);
  }

})();
