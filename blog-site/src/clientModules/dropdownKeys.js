// Client module: keyboard support for the navbar dropdowns (Learn,
// Engineering, Me), after the WAI-ARIA APG disclosure navigation
// pattern: a trigger that shows a list of links, not an ARIA menu.
//
// Docusaurus already opens and closes a dropdown with Enter or Space on its
// trigger, shows it on hover, and closes it when focus leaves. This adds:
//
// - ArrowDown on the trigger opens the dropdown and moves to its first
//   link; ArrowUp opens it on its last link.
// - ArrowDown / ArrowUp move between the links, stopping at the ends;
//   Home / End jump to the first / last.
// - Esc closes it and puts focus back on the trigger. A pointer still
//   resting on it doesn't hold it open: hover stays off until the pointer
//   leaves (data-dismissed, see custom.css "Navbar dropdowns").
//
// Open state stays Docusaurus's: the module opens and closes a dropdown by
// sending its trigger the Enter key the theme already listens for, so
// aria-expanded and the class that shows the menu never disagree.
//
// It also brings the trigger's ARIA to the disclosure pattern: an
// aria-controls pointing at the list, and no aria-haspopup (which
// announces a menu widget that the links are not).

const DROPDOWN = '.navbar__item.dropdown';
const TRIGGER = `${DROPDOWN} > .navbar__link`;

function partsOf(target) {
  const dropdown = target?.closest?.(DROPDOWN);
  if (!dropdown || !dropdown.closest('.navbar')) return null;
  const trigger = dropdown.querySelector(':scope > .navbar__link');
  const links = Array.from(
    dropdown.querySelectorAll(':scope > .dropdown__menu a[href]'),
  );
  return {dropdown, trigger, links};
}

const isOpen = (trigger) => trigger.getAttribute('aria-expanded') === 'true';

function toggle(trigger) {
  trigger.dispatchEvent(
    new KeyboardEvent('keydown', {key: 'Enter', bubbles: true, cancelable: true}),
  );
}

// The menu turns visible in the frame after it opens; focus() on a
// still-hidden link is a no-op, so retry for a few frames.
function focusSoon(el, tries = 10) {
  el.focus();
  if (document.activeElement !== el && tries > 0) {
    requestAnimationFrame(() => focusSoon(el, tries - 1));
  }
}

// Esc with focus elsewhere on the page (not in a field, which has its own
// Esc) still closes a dropdown that the pointer alone is holding open.
function dismissHovered(event) {
  if (event.key !== 'Escape' || event.target?.closest?.('input, textarea, select, [role="dialog"]')) {
    return;
  }
  const hovered = document.querySelector(`.navbar ${DROPDOWN}.dropdown--hoverable:hover`);
  if (hovered && !hovered.classList.contains('dropdown--show')) {
    hovered.setAttribute('data-dismissed', '');
  }
}

function onKeyDown(event) {
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) {
    return;
  }
  const parts = partsOf(event.target);
  if (!parts) {
    dismissHovered(event);
    return;
  }
  if (parts.links.length === 0) return;
  const {dropdown, trigger, links} = parts;
  const onTrigger = event.target === trigger;
  const index = links.indexOf(event.target);
  if (!onTrigger && index === -1) return;

  const open = () => {
    dropdown.removeAttribute('data-dismissed');
    if (!isOpen(trigger)) toggle(trigger);
  };

  let next = null;
  switch (event.key) {
    case 'ArrowDown':
      if (onTrigger) open();
      next = onTrigger ? links[0] : links[Math.min(index + 1, links.length - 1)];
      break;
    case 'ArrowUp':
      if (onTrigger) open();
      next = onTrigger ? links[links.length - 1] : links[Math.max(index - 1, 0)];
      break;
    case 'Home':
      if (onTrigger) return;
      next = links[0];
      break;
    case 'End':
      if (onTrigger) return;
      next = links[links.length - 1];
      break;
    case 'Escape':
      if (isOpen(trigger)) toggle(trigger);
      // A pointer still over a dropdown would keep it on screen.
      dismissHovered(event);
      trigger.focus();
      event.preventDefault();
      return;
    default:
      return;
  }
  event.preventDefault();
  focusSoon(next);
}

// Hover comes back once the pointer has left the dismissed dropdown.
function onPointerLeave(event) {
  if (event.target?.matches?.(`${DROPDOWN}[data-dismissed]`)) {
    event.target.removeAttribute('data-dismissed');
  }
}

function linkTriggers() {
  document.querySelectorAll(TRIGGER).forEach((trigger, i) => {
    const list = trigger.parentElement.querySelector(':scope > .dropdown__menu');
    if (!list) return;
    if (!list.id) list.id = `navbar-dropdown-${i}`;
    trigger.setAttribute('aria-controls', list.id);
    trigger.removeAttribute('aria-haspopup');
  });
}

if (typeof document !== 'undefined') {
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('pointerleave', onPointerLeave, true);
}

export function onRouteDidUpdate() {
  linkTriggers();
}
