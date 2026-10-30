/**
 * Drawer header (swizzled from theme-classic Navbar/MobileSidebar/Header).
 *
 * Two rows. The first is the bar's own brand ("cjoga.cloud /handbook") and
 * the close button. The second is pinned above the menu panels, so it stays
 * put when the drawer slides to the doc sidebar: the way back to the
 * portfolio (same tab, like the navbar item) and the theme toggle. Moving
 * the toggle down gives the full wordmark room at 360px.
 */
import React from 'react';
import {useNavbarMobileSidebar} from '@docusaurus/theme-common/internal';
import {translate} from '@docusaurus/Translate';
import NavbarColorModeToggle from '@theme/Navbar/ColorModeToggle';
import IconClose from '@theme/Icon/Close';
import NavbarLogo from '@theme/Navbar/Logo';

function CloseButton() {
  const mobileSidebar = useNavbarMobileSidebar();
  return (
    <button
      type="button"
      aria-label={translate({
        id: 'theme.docs.sidebar.closeSidebarButtonAriaLabel',
        message: 'Close navigation bar',
        description: 'The ARIA label for close button of mobile sidebar',
      })}
      className="clean-btn navbar-sidebar__close"
      onClick={() => mobileSidebar.toggle()}>
      <IconClose color="currentColor" />
    </button>
  );
}

export default function NavbarMobileSidebarHeader() {
  return (
    <>
      <div className="navbar-sidebar__brand">
        <NavbarLogo />
        <CloseButton />
      </div>
      <div className="navbar-sidebar__utility">
        <a className="navbar-sidebar__portfolio" href="https://cjoga.cloud">
          Portfolio
        </a>
        <NavbarColorModeToggle className="navbar-sidebar__theme" />
      </div>
    </>
  );
}
