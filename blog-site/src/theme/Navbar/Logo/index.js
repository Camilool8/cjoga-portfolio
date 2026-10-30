/**
 * Navbar brand (swizzled from theme-classic Navbar/Logo).
 *
 * The wordmark is two-tone, after the two-tone headings: the domain from
 * themeConfig.navbar.title in full ink, then "/handbook" in the muted tone.
 * "/handbook" used to be a CSS ::after, which screen readers and copy and
 * paste could not see; here it is real text. The slash is visual only and
 * a hidden space takes its place, so the link reads "cjoga.cloud handbook".
 *
 * The mark is decorative (empty alt) because the visible title names the
 * link. The same component renders in the bar and in the drawer header.
 */
import React from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {useThemeConfig} from '@docusaurus/theme-common';
import ThemedImage from '@theme/ThemedImage';

export default function NavbarLogo() {
  const {
    navbar: {title, logo},
  } = useThemeConfig();
  const logoLink = useBaseUrl(logo?.href || '/');
  const sources = {
    light: useBaseUrl(logo?.src),
    dark: useBaseUrl(logo?.srcDark || logo?.src),
  };

  return (
    <Link to={logoLink} className="navbar__brand">
      {logo && (
        <div className="navbar__logo">
          <ThemedImage
            sources={sources}
            width={logo.width}
            height={logo.height}
            alt=""
          />
        </div>
      )}
      <b className="navbar__title text--truncate">
        {title}
        <span className="navbar__title-suffix">
          <span className="navbar__title-gap"> </span>
          <span aria-hidden="true">/</span>handbook
        </span>
      </b>
    </Link>
  );
}
