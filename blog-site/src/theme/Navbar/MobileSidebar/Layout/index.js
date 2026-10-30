/**
 * Drawer layout (swizzled from theme-classic Navbar/MobileSidebar/Layout).
 *
 * Same markup and panels as the original, plus the focus management a
 * modal drawer needs (phones, and desktop at 200% zoom, below 997px):
 *
 * - Opening it moves focus to the close button and marks the drawer as a
 *   modal dialog.
 * - Everything behind it is `inert`: the page, the footer and the rest of
 *   the navbar. The drawer itself and the backdrop (which closes it on a
 *   tap) stay live; they are the drawer's ancestors' only exceptions.
 * - Tab and Shift+Tab cycle inside the drawer. Esc closes it.
 * - Closing it any way (close button, Esc, backdrop) returns focus to the
 *   menu button. Following a link closes it too; Docusaurus then moves
 *   focus to the top of the new page, which runs after this and wins.
 * - Switching between the main menu and the doc sidebar panel moves focus
 *   to the first control of the panel that slid in, since the panel that
 *   held focus has just become inert.
 *
 * It always opens on the main menu. Docusaurus opens it on the current
 * section's doc sidebar instead, which hides Learn, Engineering and Me
 * behind "Back to main menu"; a reader reaching for the menu often wants
 * another section. The current section is marked in the main menu, and
 * its doc tree is one tap away: the "This section" row at the top slides
 * the doc sidebar in. The row only shows when that tree lists pages the
 * section's menu doesn't (Learn's tree is its menu, so there it would
 * open the same list again). Which panel shows is kept here, not in
 * Docusaurus' secondary-menu state, which re-arms the doc sidebar on
 * every close.
 *
 * In the main menu a section's label ("Learn") is the link to its index
 * page and the caret beside it opens the list, as in the doc sidebar. So
 * the index's own row, which the desktop dropdown needs (there the label
 * only opens the menu), is hidden here (custom.css), and the list doesn't
 * say "Learn" twice. Docusaurus marks that label role="button" and
 * aria-current="page" on every page of the section; it is a link, and the
 * current page only on the index itself (see useHonestSectionLinks).
 */
import React, {createContext, useContext, useEffect, useRef, useState} from 'react';
import clsx from 'clsx';
import {
  useNavbarMobileSidebar,
  useNavbarSecondaryMenu,
} from '@docusaurus/theme-common/internal';
import {ThemeClassNames, useThemeConfig} from '@docusaurus/theme-common';
import {useLocation} from '@docusaurus/router';

// The panel switch, for the doc sidebar's back row (SecondaryMenu).
const DrawerPanelContext = createContext({showMain() {}});
export function useDrawerPanel() {
  return useContext(DrawerPanelContext);
}

// The section the page is in: the navbar dropdown whose base path it is
// under (Learn, Engineering, Me).
function useSection() {
  const {pathname} = useLocation();
  const {items} = useThemeConfig().navbar;
  return items.find(
    (item) =>
      item.type === 'dropdown' &&
      item.activeBasePath &&
      (pathname === item.activeBasePath ||
        pathname.startsWith(`${item.activeBasePath}/`)),
  );
}

// The pages a doc sidebar lists, categories' own pages included.
function sidebarHrefs(items, out = new Set()) {
  for (const item of items ?? []) {
    if (item.href) out.add(item.href);
    if (item.items) sidebarHrefs(item.items, out);
  }
  return out;
}

// Top row of the main menu on a doc page: where the reader is, and the
// way into that section's doc tree.
function SectionRow({label, onClick}) {
  return (
    <button type="button" className="clean-btn navbar-sidebar__section" onClick={onClick}>
      <span className="navbar-sidebar__section-text">
        {label ? (
          <>
            <span className="navbar-sidebar__section-prefix">This section: </span>
            {label}
          </>
        ) : (
          'Pages in this section'
        )}
      </span>
      <svg
        aria-hidden="true"
        focusable="false"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round">
        <path d="M6 3.5L10.5 8 6 12.5" />
      </svg>
    </button>
  );
}
const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function focusableIn(container) {
  if (!container) return [];
  return Array.from(container.querySelectorAll(FOCUSABLE)).filter(
    (el) =>
      !el.closest('[inert]') &&
      el.getClientRects().length > 0 &&
      getComputedStyle(el).visibility !== 'hidden',
  );
}

// Marks every sibling of `keep` and of each of its ancestors as inert, up
// to <body>, and returns a function that undoes exactly what it changed.
// Elements that someone else already made inert are left alone. The
// backdrop is skipped so a tap on it still closes the drawer.
function inertOutside(keep) {
  const changed = [];
  let node = keep;
  while (node && node.parentElement && node !== document.body) {
    for (const sibling of node.parentElement.children) {
      if (
        sibling === node ||
        sibling.inert ||
        sibling.classList.contains('navbar-sidebar__backdrop') ||
        ['SCRIPT', 'STYLE', 'LINK', 'TEMPLATE'].includes(sibling.tagName)
      ) {
        continue;
      }
      sibling.inert = true;
      changed.push(sibling);
    }
    node = node.parentElement;
  }
  return () => {
    for (const el of changed) el.inert = false;
  };
}

const SECTION_LINK = 'a[href][class*="dropdownNavbarItemMobile"]';

const samePath = (a, b) => a.replace(/\/$/, '') === b.replace(/\/$/, '');

// The drawer's section labels say what they are: a link (no role="button"),
// "page" when it is the page open, "true" (the current section) on the
// section's other pages. React set these attributes from props that don't
// change between renders, so it never writes them back; this re-applies
// on every route change, after the menu has rendered.
function useHonestSectionLinks(rootRef, pathname) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    for (const link of root.querySelectorAll(SECTION_LINK)) {
      link.removeAttribute('role');
      if (samePath(link.getAttribute('href'), pathname)) {
        link.setAttribute('aria-current', 'page');
      } else if (link.classList.contains('active')) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    }
  });
}

function NavbarMobileSidebarPanel({children, inert}) {
  return (
    <div
      className={clsx(
        ThemeClassNames.layout.navbar.mobileSidebar.panel,
        'navbar-sidebar__item menu',
      )}
      inert={inert}>
      {children}
    </div>
  );
}

export default function NavbarMobileSidebarLayout({
  header,
  primaryMenu,
  secondaryMenu,
}) {
  const {shown, toggle} = useNavbarMobileSidebar();
  const {content: secondaryContent} = useNavbarSecondaryMenu();
  const section = useSection();
  const [docsPanel, setDocsPanel] = useState(false);
  const hasDocs = secondaryContent != null;
  // The doc sidebar panel's element carries the sidebar it renders.
  const menuHrefs = new Set((section?.items ?? []).map((item) => item.to));
  const treeAddsPages = [...sidebarHrefs(secondaryContent?.props?.sidebar)].some(
    (href) => !menuHrefs.has(href),
  );
  const secondaryMenuShown = hasDocs && docsPanel;
  const rootRef = useRef(null);
  const {pathname} = useLocation();
  useHonestSectionLinks(rootRef, pathname);

  // Every opening starts on the main menu.
  useEffect(() => {
    if (!shown) setDocsPanel(false);
  }, [shown]);
  const itemsRef = useRef(null);

  // Open: focus in, background inert, Tab trapped, Esc closes.
  // Close: background restored, focus back on the menu button.
  useEffect(() => {
    const root = rootRef.current;
    if (!shown || !root) return undefined;

    const menuButton = document.querySelector('.navbar__toggle');
    const restoreInert = inertOutside(root);
    // The drawer may still be visibility: hidden on its first frame, where
    // focus() is a no-op, so retry for a few frames until it lands.
    let frame = 0;
    let tries = 0;
    const focusIn = () => {
      const target =
        root.querySelector('.navbar-sidebar__close') || focusableIn(root)[0];
      target?.focus();
      if (target && document.activeElement !== target && tries < 30) {
        tries += 1;
        frame = requestAnimationFrame(focusIn);
      }
    };
    frame = requestAnimationFrame(focusIn);

    // A section label is a link like the others: following it closes the
    // drawer. Docusaurus also flips its list open or shut on the same
    // click; a list that was open is opened again, so the section the
    // reader just went to isn't folded away the next time the drawer opens.
    const onClick = (event) => {
      const link = event.target.closest?.(SECTION_LINK);
      if (
        !link ||
        !root.contains(link) ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      const item = link.closest('.menu__list-item');
      const wasOpen = !item?.classList.contains('menu__list-item--collapsed');
      requestAnimationFrame(() => {
        if (wasOpen && item?.classList.contains('menu__list-item--collapsed')) {
          item.querySelector('.menu__caret')?.click();
        }
      });
      toggle();
    };
    root.addEventListener('click', onClick);

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        toggle();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusableIn(root);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (!root.contains(active) || active.closest('[inert]')) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown, true);

    return () => {
      cancelAnimationFrame(frame);
      root.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKeyDown, true);
      restoreInert();
      const active = document.activeElement;
      if (
        menuButton?.isConnected &&
        (!active || active === document.body || root.contains(active))
      ) {
        menuButton.focus();
      }
    };
  }, [shown, toggle]);

  // Panel switch while open: focus the first control of the panel that is
  // now live, if focus was left behind in the one that went inert.
  const previousSecondary = useRef(secondaryMenuShown);
  useEffect(() => {
    const changed = previousSecondary.current !== secondaryMenuShown;
    previousSecondary.current = secondaryMenuShown;
    if (!shown || !changed) return undefined;
    const frame = requestAnimationFrame(() => {
      const active = document.activeElement;
      const stranded =
        !active ||
        active === document.body ||
        !!active.closest('[inert]') ||
        !rootRef.current?.contains(active);
      if (stranded) focusableIn(itemsRef.current)[0]?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [secondaryMenuShown, shown]);

  return (
    <div
      ref={rootRef}
      className={clsx(
        ThemeClassNames.layout.navbar.mobileSidebar.container,
        'navbar-sidebar',
      )}
      {...(shown && {
        role: 'dialog',
        'aria-modal': 'true',
        'aria-label': 'Site menu',
      })}>
      {header}
      <DrawerPanelContext.Provider value={{showMain: () => setDocsPanel(false)}}>
        <div
          ref={itemsRef}
          className={clsx('navbar-sidebar__items', {
            'navbar-sidebar__items--show-secondary': secondaryMenuShown,
          })}>
          <NavbarMobileSidebarPanel inert={secondaryMenuShown}>
            {hasDocs && treeAddsPages && (
              <SectionRow label={section?.label} onClick={() => setDocsPanel(true)} />
            )}
            {primaryMenu}
          </NavbarMobileSidebarPanel>
          <NavbarMobileSidebarPanel inert={!secondaryMenuShown}>
            {secondaryMenu}
          </NavbarMobileSidebarPanel>
        </div>
      </DrawerPanelContext.Provider>
    </div>
  );
}
