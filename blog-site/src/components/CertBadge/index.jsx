import React from 'react';
import { FaRedhat, FaAward, FaAws } from 'react-icons/fa';
import { FiArrowUpRight, FiArrowRight } from 'react-icons/fi';
import {
  SiDynatrace,
  SiGitlab,
  SiTerraform,
  SiKubernetes,
} from 'react-icons/si';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

// Issuer → react-icon + brand color. Mirrors the portfolio's
// src/components/certifications/certData.js so the blog stays brand-consistent.
const VENDOR_ICONS = {
  'The Linux Foundation': { Icon: SiKubernetes, color: '#326ce5' },
  'Amazon Web Services': { Icon: FaAws, color: '#ff9900' },
  HashiCorp: { Icon: SiTerraform, color: '#7b42bc' },
  'Red Hat': { Icon: FaRedhat, color: '#ee0000' },
  Dynatrace: { Icon: SiDynatrace, color: '#1496ff' },
  GitLab: { Icon: SiGitlab, color: '#fc6d26' },
  'Technology Partners': { Icon: FaAward, color: null },
  // No react-icon: Spectro Cloud's official mark, in its own colours.
  'Spectro Cloud': { image: '/img/logos/spectrocloud-mark.svg' },
};

// `logo` overrides the issuer's mark with a product's own (Palette for a
// Spectro Cloud credential): the badge names the product, so it shows it.
export default function CertBadge({
  name,
  issuer,
  year,
  href,
  status,
  note,
  noteHref,
  logo,
}) {
  const vendor = VENDOR_ICONS[issuer];
  const image = logo || vendor?.image;
  const imageUrl = useBaseUrl(image || '/');
  const Icon = vendor?.Icon;
  const iconColor = vendor?.color || 'var(--accent)';


  return (
    <div className={styles.badge}>
      <div className={styles.logoWrap}>
        {image ? (
          <img className={styles.logo} src={imageUrl} alt="" />
        ) : Icon ? (
          <Icon
            className={styles.logo}
            style={{ color: iconColor }}
            aria-hidden="true"
          />
        ) : (
          <span className={styles.logoFallback} aria-hidden="true">
            {issuer?.[0] ?? '?'}
          </span>
        )}
      </div>
      <div className={styles.body}>
        <h3 className={styles.name}>{name}</h3>
        {/* Year and issuer on one caption line. "Earned" is what the whole
            list is, so the status shows only when it says something else
            (lapsed). */}
        <p className={styles.issuer}>
          {year && <span className={styles.year}>{year}</span>}
          {year && issuer && <span className={styles.dot}> · </span>}
          {issuer}
          {status && status !== 'earned' && (
            <>
              <span className={styles.dot}> · </span>
              <span className={styles.status} data-status={status}>
                {status}
              </span>
            </>
          )}
        </p>
        {(href || note) && (
          <div className={styles.actions}>
            {href && (
              // The name starts with the visible label (WCAG 2.5.3), then
              // says which credential: every card has the same link text.
              <a
                className={styles.link}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Verify on Credly: ${name} (opens in a new tab)`}
              >
                Verify on Credly
                <FiArrowUpRight aria-hidden="true" />
              </a>
            )}
            {/* A space for text readers (search excerpts); flex drops it. */}
            {href && note ? ' ' : null}
            {note &&
              (noteHref ? (
                // Same pattern as Verify: visible label first, then which
                // credential, so three "Study guide" links stay distinct.
                <Link
                  className={styles.link}
                  to={noteHref}
                  aria-label={`${note}: ${name}`}
                >
                  {note}
                  <FiArrowRight aria-hidden="true" />
                </Link>
              ) : (
                <span className={styles.note}>{note}</span>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Grid wrapper — pass children of <CertBadge /> inside.
export function CertBadgeGrid({ children }) {
  return <div className={styles.grid}>{children}</div>;
}
