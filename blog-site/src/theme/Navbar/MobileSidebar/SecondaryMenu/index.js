/**
 * Drawer secondary panel (swizzled from theme-classic
 * Navbar/MobileSidebar/SecondaryMenu). Same behaviour; the back control
 * draws its arrow as an SVG instead of the "←" glyph in the label, and is
 * a full-width 44px row (see custom.css, .navbar-sidebar__back). Which
 * panel shows is the drawer Layout's state, so the row goes back through
 * it.
 */
import React from 'react';
import {useThemeConfig} from '@docusaurus/theme-common';
import {useNavbarSecondaryMenu} from '@docusaurus/theme-common/internal';
import {useDrawerPanel} from '@theme/Navbar/MobileSidebar/Layout';

function SecondaryMenuBackButton(props) {
  return (
    <button {...props} type="button" className="clean-btn navbar-sidebar__back">
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
        <path d="M13 8H3M7.5 3.5L3 8l4.5 4.5" />
      </svg>
      Back to main menu
    </button>
  );
}

export default function NavbarMobileSidebarSecondaryMenu() {
  const isPrimaryMenuEmpty = useThemeConfig().navbar.items.length === 0;
  const secondaryMenu = useNavbarSecondaryMenu();
  const {showMain} = useDrawerPanel();
  return (
    <>
      {/* edge-case: prevent returning to the primaryMenu when it's empty */}
      {!isPrimaryMenuEmpty && (
        <SecondaryMenuBackButton onClick={showMain} />
      )}
      {secondaryMenu.content}
    </>
  );
}
