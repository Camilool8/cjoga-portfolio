// Client module: code blocks. A line longer than the block scrolls
// sideways; the edge where code is hidden fades out, the same cue the
// diagrams use, so a clipped line reads as "more this way". The mask
// itself is CSS (custom.css, "Code blocks"); this only flags which edges
// hide code and how tall the scrollbar is (kept out of the fade). Plain
// attributes on the existing <pre>, so nothing moves.
//
// It also confirms a copy. The stock button swaps its icon for a check for
// a second and renames itself "Copied", which a screen reader doesn't
// announce. Once the copy has actually landed (the button gains its
// "copied" class), the button holds data-copied for two seconds, which
// shows a visible "Copied" on the block's top edge (custom.css), and one
// shared polite live region says "Copied to clipboard". When the copied
// command still holds placeholders (<ns>, <server2>), both say so, so a
// pasted command isn't run with them in it: "Copied · fill in <ns>", or
// "Copied · fill in 3 placeholders", held a second longer. When a block
// in a sheet uses the sheet's shorthand (CKAD: `k`, `$do`), they say that
// too, since in a fresh shell `k` is not found and an unset `$do`
// creates the object for real: "Copied · needs k and $do from Terminal
// setup · fill in 2 placeholders", shortened to what fits on the block's
// edge; the live region always says all of it.
//
// And it makes word wrap a choice, remembered, in two scopes. The stock
// button wraps its own block until the page changes. Here a toggle on a
// block in a cert guide's sheet sets html[data-code-wrap-sheet], and on
// any other block html[data-code-wrap-prose] ("on" or "off"); every
// block in that scope follows it (the wrapping itself is CSS, custom.css
// "Code blocks"), and it is stored for the next page and the next visit.
// Kept apart because the two differ by default (sheet code wraps, other
// code scrolls), so a tap in one never overrides the other. The button
// becomes a real toggle (aria-pressed), and the change is said once in
// the live region, with its scope, since it also reaches blocks off
// screen.
//
// Heading links share the live region. With a mouse or a keyboard the
// "#" stays a link: it moves to its heading, and the context menu copies
// it. A tap has neither a hover to find it nor a menu that is easy to hit
// on a 1em mark, so on touch a tap on "#" copies the heading's absolute
// URL instead, says "Link copied" beside the mark and in the live region,
// and puts the hash in the address bar the way the link would, without
// the jump or a new history entry.

import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import {definesTerm, usesTerm} from '../components/DomainSheet/shorthand';

const COPIED_MS = 2000;
const COPIED_NOTE_MS = 3000;
let liveRegion = null;

// Placeholders as the sheet paints them (DomainSheet). Counted only in
// shell, config and plain-text blocks: in markup or a typed language,
// <div> or List<String> is the code itself.
const PLACEHOLDER = /<[A-Za-z][\w.-]*>/g;
const FILL_IN = /\blanguage-(bash|sh|shell|shell-session|console|zsh|fish|powershell|ps1|ini|conf|toml|ya?ml|text|txt|plaintext|properties|dotenv|env|none)\b/;

function placeholdersIn(block) {
  if (!block || !FILL_IN.test(block.className)) return [];
  const text = block.querySelector('pre code')?.textContent ?? '';
  return [...new Set(text.match(PLACEHOLDER) ?? [])];
}

// The sheet's shorthand this block's code uses (DomainSheet puts the
// terms, and the domain that sets them up, on the sheet). A block that
// sets them up doesn't need them.
function shorthandIn(block) {
  const sheet = block?.closest('.domain-sheet[data-shorthand]');
  if (!sheet) return null;
  const text = block.querySelector('pre code')?.textContent ?? '';
  const all = sheet.dataset.shorthand.split(' ');
  if (all.some((term) => definesTerm(text, term))) return null;
  const terms = all.filter((term) => usesTerm(text, term));
  return terms.length ? {terms, setup: sheet.dataset.shorthandSetup} : null;
}

const listed = (items) =>
  items.length > 1
    ? `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
    : items[0];

// What the live region says, and the visible labels from fullest to
// shortest (the block shows the fullest that fits its edge).
function copiedMessages(names, shorthand) {
  const bare = names.map((name) => name.slice(1, -1));
  const fill =
    names.length === 0
      ? ''
      : names.length === 1
        ? ` Fill in the placeholder ${bare[0]}.`
        : ` Fill in ${names.length} placeholders: ${bare.join(', ')}.`;
  const fills =
    names.length === 0
      ? ['']
      : names.length === 1
        ? [` · fill in ${names[0]}`, '']
        : [` · fill in ${names.length} placeholders`, ` · ${names.length} to fill in`, ''];
  if (!shorthand) {
    return {
      labels: names.length ? fills.slice(0, 1).map((f) => `Copied${f}`) : ['Copied'],
      spoken: `Copied to clipboard.${fill}`,
    };
  }
  const {terms, setup} = shorthand;
  const needs = [
    setup ? ` · needs ${listed(terms)} from ${setup}` : null,
    ` · needs ${listed(terms)}`,
    ` · needs ${terms.join(', ')}`,
  ].filter(Boolean);
  // Fullest first: the setup's name goes before the placeholders do,
  // and the shorthand itself is never dropped.
  const labels = fills.flatMap((f) => needs.map((n) => `Copied${n}${f}`));
  return {
    labels,
    spoken: `Copied to clipboard. Uses ${listed(terms)}${
      setup ? `, set up in ${setup}` : ''
    }.${fill}`,
  };
}

// The fullest label that fits on the block's edge without an ellipsis:
// tried on a hidden twin of the label (custom.css, "Code blocks").
function fittingLabel(block, labels) {
  if (!block || labels.length < 2) return labels[0];
  const twin = document.createElement('span');
  twin.className = 'cb-copied-measure';
  twin.setAttribute('aria-hidden', 'true');
  block.append(twin);
  const fits = labels.find((label) => {
    twin.textContent = label;
    return twin.scrollWidth <= twin.clientWidth;
  });
  twin.remove();
  return fits ?? labels[labels.length - 1];
}

// Made as soon as a page has a copy button: a region has to be in the
// page before its text changes for that change to be announced.
function ensureLiveRegion() {
  if (!liveRegion || !liveRegion.isConnected) {
    liveRegion = document.createElement('div');
    // Visually hidden, still read.
    liveRegion.style.cssText =
      'position:absolute;width:1px;height:1px;margin:-1px;padding:0;' +
      'overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0';
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    document.body.appendChild(liveRegion);
  }
  return liveRegion;
}

function announce(message) {
  const region = ensureLiveRegion();
  // Cleared first, so a second copy in a row is announced again.
  region.textContent = '';
  window.setTimeout(() => {
    region.textContent = message;
  }, 50);
}

function confirmCopies(button) {
  button.setAttribute('data-copy-bound', '');
  ensureLiveRegion();
  let timer = 0;
  let wasCopied = false;
  new MutationObserver(() => {
    const copied = /copyButtonCopied/.test(button.className);
    if (copied && !wasCopied) {
      window.clearTimeout(timer);
      const block = button.closest('.theme-code-block');
      const names = placeholdersIn(block);
      const shorthand = shorthandIn(block);
      const {labels, spoken} = copiedMessages(names, shorthand);
      // The label is drawn by the block (custom.css), from this.
      block?.setAttribute('data-copied-label', fittingLabel(block, labels));
      button.setAttribute('data-copied', '');
      announce(spoken);
      timer = window.setTimeout(() => {
        button.removeAttribute('data-copied');
        block?.removeAttribute('data-copied-label');
        // Nothing stale for a reader who browses into the region later.
        ensureLiveRegion().textContent = '';
      }, names.length || shorthand ? COPIED_NOTE_MS : COPIED_MS);
    }
    wasCopied = copied;
  }).observe(button, {attributes: true, attributeFilter: ['class']});
}

// A per-viewer convenience: storage may be missing or throw (private
// windows, blocked site data), and then wrap just isn't remembered. The
// same keys are read before first paint by the inline script in
// docusaurus.config.js (headTags); a choice stored under the old single
// key counts for the "prose" scope.
const WRAP_KEY = 'handbook:code-wrap';
const SCOPES = ['sheet', 'prose'];

function read(key) {
  try {
    const value = window.localStorage.getItem(key);
    return value === 'on' || value === 'off' ? value : null;
  } catch {
    return null;
  }
}

function storedWrap(scope) {
  return (
    read(`${WRAP_KEY}:${scope}`) ?? (scope === 'prose' ? read(WRAP_KEY) : null)
  );
}

function setWrap(scope, value) {
  document.documentElement.setAttribute(`data-code-wrap-${scope}`, value);
  try {
    window.localStorage.setItem(`${WRAP_KEY}:${scope}`, value);
    if (scope === 'prose') window.localStorage.removeItem(WRAP_KEY);
  } catch {
    // Not remembered; this page still follows it.
  }
}

const scopeOf = (block) => (block.closest('.domain-sheet') ? 'sheet' : 'prose');

// Set as the bundle loads, before React takes over the page, so a block
// rendered on the client never flips after it shows. (The first paint
// of a fresh load comes from the inline script.)
if (ExecutionEnvironment.canUseDOM) {
  SCOPES.forEach((scope) => {
    const stored = storedWrap(scope);
    if (stored) {
      document.documentElement.setAttribute(`data-code-wrap-${scope}`, stored);
    }
  });
}

function isWrapped(pre) {
  const code = pre.querySelector('code');
  if (!code) return false;
  const style = getComputedStyle(code);
  return style.whiteSpace === 'pre-wrap' || style.textWrapMode === 'wrap';
}

// Would this block's longest line overflow it unwrapped?
function overflowsUnwrapped(pre) {
  const code = pre.querySelector('code');
  if (!code) return false;
  if (!isWrapped(pre)) return pre.scrollWidth - pre.clientWidth > 1;
  code.setAttribute('data-cb-measure', '');
  const over = pre.scrollWidth - pre.clientWidth > 1;
  code.removeAttribute('data-cb-measure');
  return over;
}

// The theme shows the wrap button only while the code overflows or its
// <code> carries a style attribute (its own "wrapped" mark). A block the
// CSS has wrapped no longer overflows, so it gets a harmless custom
// property as that mark, keeping the button there to unwrap it. The
// theme re-checks on window resize, so a changed mark is followed by one,
// a beat later: React detaches a replaced block's ref before it removes
// that block's resize listener, and a resize in between throws in the
// theme. (Code blocks are replaced as the browser takes over.)
const NUDGE_MS = 150;
let nudge = 0;
function markWrappable(pre) {
  const code = pre.querySelector('code');
  if (!code) return;
  pressWrapButton(pre);
  const can = overflowsUnwrapped(pre);
  if (can === code.style.getPropertyValue('--cb-wrappable').includes('1')) {
    return;
  }
  if (can) {
    code.style.setProperty('--cb-wrappable', '1');
  } else {
    code.style.removeProperty('--cb-wrappable');
    if (!code.getAttribute('style')) code.removeAttribute('style');
  }
  window.clearTimeout(nudge);
  nudge = window.setTimeout(() => {
    nudge = 0;
    window.dispatchEvent(new Event('resize'));
  }, NUDGE_MS);
}

function wrapButton(block) {
  return block
    .querySelector('[class*="wordWrapButtonIcon"]')
    ?.closest('button');
}

function pressWrapButton(pre) {
  const block = pre.closest('.theme-code-block');
  const button = block && wrapButton(block);
  if (button) button.setAttribute('aria-pressed', String(isWrapped(pre)));
}

// A toggle re-wraps every block in its scope, most of them off screen,
// and the ones above the reader change height. The toggled block keeps
// its place on the screen instead: its top is measured before the change
// and the page scrolled by however far it moved, at once, then again
// after the re-wrap settles (the sheet re-groups its words on the next
// frame, and the theme re-checks its buttons a beat later). A scroll or a
// touch by the reader in between ends it.
const HOLD_MS = NUDGE_MS + 200;
function holdPlace(block) {
  const want = block.getBoundingClientRect().top;
  // The browser's own scroll anchoring would hold some other element
  // still; this one is the reader's.
  const html = document.documentElement;
  html.style.overflowAnchor = 'none';
  const fix = () => {
    const moved = block.getBoundingClientRect().top - want;
    if (Math.abs(moved) > 0.5) {
      window.scrollBy({top: moved, behavior: 'instant'});
    }
  };
  let frame = 0;
  let timer = 0;
  const stop = () => {
    cancelAnimationFrame(frame);
    window.clearTimeout(timer);
    html.style.removeProperty('overflow-anchor');
    if (!html.getAttribute('style')) html.removeAttribute('style');
    ['wheel', 'touchstart', 'keydown'].forEach((type) =>
      window.removeEventListener(type, stop, true),
    );
  };
  return () => {
    fix();
    ['wheel', 'touchstart', 'keydown'].forEach((type) =>
      window.addEventListener(type, stop, {capture: true, passive: true}),
    );
    frame = requestAnimationFrame(() => {
      fix();
      frame = requestAnimationFrame(fix);
    });
    timer = window.setTimeout(() => {
      fix();
      stop();
    }, HOLD_MS);
  };
}

// Ahead of React (a capture listener on the document runs before the
// root's), so the stock per-block toggle never runs.
function onWrapClick(event) {
  const button = event.target.closest?.('.theme-code-block button');
  const block = button?.closest('.theme-code-block');
  if (!block || wrapButton(block) !== button) return;
  event.stopPropagation();
  event.preventDefault();
  const pre = block.querySelector('pre');
  const next = pre && isWrapped(pre) ? 'off' : 'on';
  const scope = scopeOf(block);
  const release = holdPlace(block);
  setWrap(scope, next);
  document.querySelectorAll('.theme-code-block pre').forEach(markWrappable);
  release();
  // Named by scope: "outside the sheet" only where a sheet is there to
  // be outside of.
  const where =
    scope === 'sheet'
      ? 'sheet code blocks'
      : document.querySelector('.domain-sheet')
        ? 'code blocks outside the sheet'
        : 'code blocks';
  announce(`Word wrap ${next} for ${where}`);
}

// A tap, not a click: the event's own pointer when the browser names it
// (a mouse on a tablet still navigates), the primary pointer when it
// doesn't (a screen reader's activation, older Safari).
function isTouchClick(event) {
  const type = event.pointerType;
  if (type) return type === 'touch' || type === 'pen';
  return window.matchMedia('(pointer: coarse)').matches;
}

const LINK_COPIED_MS = 2000;
let linkNote = null;
let linkTimer = 0;

// "Link copied", drawn on the page by the "#" it came from (custom.css,
// "Heading anchors"): on the mark's line, after it. Where the line has
// no room for that, "Copied", as the code blocks shorten theirs. With no
// room for either (the mark at the column's edge), it goes just above
// the mark's line, against the right gutter, where the line above is
// shortest; the fullest label that clears that line's words is used.
// Placed in the page's own coordinates, so it rides along with a scroll.
// Empty to a screen reader: the live region says it.
const LINK_LABELS = ['Link copied', 'Copied'];

function showLinkCopied(link) {
  window.clearTimeout(linkTimer);
  document.querySelector('.hash-link[data-copied]')?.removeAttribute('data-copied');
  linkNote?.remove();
  const note = document.createElement('span');
  note.className = 'hash-copied';
  note.setAttribute('aria-hidden', 'true');
  document.body.append(note);
  linkNote = note;
  link.setAttribute('data-copied', '');
  // The mark is the link's last box with a width (a heading may wrap
  // before it, and its zero-width space may sit alone on an empty line).
  const rects = [...link.getClientRects()].filter((rect) => rect.width > 0);
  const mark = rects[rects.length - 1] ?? link.getBoundingClientRect();
  const gutter = 16;
  const gap = 6;
  const room = document.documentElement.clientWidth - gutter;
  const widthOf = (label) => {
    note.textContent = label;
    return note.getBoundingClientRect().width;
  };
  const beside = LINK_LABELS.find((label) => mark.right + gap + widthOf(label) <= room);
  let left = mark.right + gap;
  let top;
  if (beside) {
    note.textContent = beside;
    top = mark.top + (mark.height - note.offsetHeight) / 2;
  } else {
    // Where the heading's words end on the line above the mark's (none
    // above, a one-line heading: its margin is clear).
    const words = document.createRange();
    words.selectNodeContents(link.parentElement);
    const above = [...words.getClientRects()].filter(
      (rect) => rect.width > 0 && rect.bottom <= mark.top + 1 && rect.bottom > mark.top - mark.height,
    );
    const end = above.length ? Math.max(...above.map((rect) => rect.right)) : -Infinity;
    const label =
      LINK_LABELS.find((text) => room - widthOf(text) >= end + gap) ?? LINK_LABELS[LINK_LABELS.length - 1];
    note.textContent = label;
    left = Math.max(gutter, room - note.offsetWidth);
    top = mark.top - note.offsetHeight - 2;
  }
  note.style.left = `${left + window.scrollX}px`;
  note.style.top = `${top + window.scrollY}px`;
  linkTimer = window.setTimeout(() => {
    note.remove();
    link.removeAttribute('data-copied');
    if (linkNote === note) linkNote = null;
    ensureLiveRegion().textContent = '';
  }, LINK_COPIED_MS);
}

// Ahead of React and the router (a capture listener on the document), so
// a tap that copies never also navigates. Where the clipboard is out of
// reach (an insecure origin, a refusal), the tap is the plain link.
function onHashLinkClick(event) {
  if (event.defaultPrevented || event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const link = event.target.closest?.('a.hash-link');
  if (!link || !link.hash || !isTouchClick(event)) return;
  if (!navigator.clipboard?.writeText) return;
  event.preventDefault();
  event.stopPropagation();
  const {origin, pathname, search} = window.location;
  const heading = link.closest('h1, h2, h3, h4, h5, h6');
  const name = heading?.textContent.replace(/\u200b/g, '').trim();
  navigator.clipboard.writeText(`${origin}${pathname}${link.hash}`).then(
    () => {
      window.history.replaceState(window.history.state, '', `${pathname}${search}${link.hash}`);
      showLinkCopied(link);
      announce(name ? `Link to ${name} copied to clipboard` : 'Link copied to clipboard');
    },
    () => {
      window.location.hash = link.hash;
    },
  );
}

function track(pre) {
  pre.setAttribute('data-fade-bound', '');
  let frame = 0;
  const update = () => {
    frame = 0;
    const x = pre.scrollLeft;
    const max = pre.scrollWidth - pre.clientWidth;
    const overflows = pre.clientWidth > 0 && max > 1;
    pre.toggleAttribute('data-fade-start', overflows && x > 1);
    pre.toggleAttribute('data-fade-end', overflows && x < max - 1);
    pre.style.setProperty(
      '--cb-scrollbar',
      `${Math.max(0, pre.offsetHeight - pre.clientHeight)}px`,
    );
    markWrappable(pre);
  };
  const schedule = () => {
    if (!frame) frame = window.requestAnimationFrame(update);
  };
  pre.addEventListener('scroll', schedule, {passive: true});
  if (typeof ResizeObserver !== 'undefined') {
    const observer = new ResizeObserver(schedule);
    observer.observe(pre);
    // Word wrap changes the code's width, not the block's.
    if (pre.firstElementChild) observer.observe(pre.firstElementChild);
  }
  update();
}

let pending = 0;
function bindAll() {
  pending = 0;
  document
    .querySelectorAll('.theme-code-block pre:not([data-fade-bound])')
    .forEach(track);
  // The copy button has no class of its own (only "copied" while it
  // shows the check), so it is found by its icons.
  document
    .querySelectorAll('.theme-code-block [class*="copyButtonIcons"]')
    .forEach((icons) => {
      const button = icons.closest('button');
      if (button && !button.hasAttribute('data-copy-bound')) confirmCopies(button);
    });
  // Wrap buttons come and go with the theme's overflow check.
  document
    .querySelectorAll('.theme-code-block pre[data-fade-bound]')
    .forEach((pre) => {
      const button = wrapButton(pre.closest('.theme-code-block'));
      if (button && !button.hasAttribute('aria-pressed')) pressWrapButton(pre);
    });
}
function scheduleBind() {
  if (!pending) pending = window.requestAnimationFrame(bindAll);
}

// Docusaurus remounts every code block once the browser takes over (its
// CodeBlock is keyed on "is browser"), and tabs mount theirs later, so a
// pass at route time alone would bind blocks that are about to go. New
// blocks are picked up as they arrive instead.
let watching = false;
export function onRouteDidUpdate() {
  if (!ExecutionEnvironment.canUseDOM) {
    return;
  }
  if (!watching && typeof MutationObserver !== 'undefined') {
    watching = true;
    document.addEventListener('click', onWrapClick, true);
    document.addEventListener('click', onHashLinkClick, true);
    new MutationObserver(scheduleBind).observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
  scheduleBind();
}
