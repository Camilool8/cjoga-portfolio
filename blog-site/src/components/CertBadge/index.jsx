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
import styles from './styles.module.css';

// Spectro Cloud has no react-icon: its mark (stacked diamonds) from the
// official logo in spectrocloud/librarium, in one colour.
function SpectroMark(props) {
  return (
    <svg viewBox="0 0 274 334" {...props}>
      <path fill="currentColor" d="M125.78,329.6L4.95,234.22c-6.42-5.07-6.43-14.8-.01-19.88l120.83-95.61c6.59-5.21,15.89-5.21,22.47,0l120.83,95.61c6.41,5.08,6.41,14.81-.01,19.88l-120.83,95.39c-6.58,5.19-15.86,5.19-22.44,0Z" />
      <path fill="currentColor" opacity="0.45" d="M268.86,214.21s-.01,0-.02-.01l-122.78-96.83c-5.88-4.63-13.14-7.16-20.62-7.17l-115.83-.2c-5.07-.02-7.62-.92-8.71-4.39-.57,1.56-.78,3.06-.78,4.23,0,2.33.57,6.7,5,10.2,0,0,0,0,0,0l122.78,96.93c5.88,4.65,13.16,7.17,20.66,7.18l116.12.11c4.85.05,7.33.99,8.4,4.38.57-1.56.78-3.06.78-4.23,0-2.34-.57-6.71-5.01-10.21Z" />
      <path fill="currentColor" d="M269.06,100.02L148.24,4.41c-6.59-5.21-15.89-5.21-22.47,0L4.94,100.02c-6.42,5.08-6.41,14.81.01,19.88l119.88,94.64c.14.16.31.33.53.51,6.77,5.44,10.23,6.76,14.77,8.01,4.54,1.25,8.44,1.1,10.05,1.1h6.03c-4.04-.54-5.79-3-6.37-4.98-.75-2.55.49-5.28,2.88-7.45l116.33-91.83c6.42-5.07,6.43-14.8.01-19.88Z" />
      <path fill="currentColor" opacity="0.7" d="M152.72,211.73l56.47-44.58-63.12-49.78c-5.88-4.63-13.14-7.16-20.62-7.17l-115.83-.2c-5.07-.02-7.63-.95-8.72-4.41-.82,2.38-.88,4.15-.65,6,.23,1.91,1.05,4.13,2.3,5.82.67.91,1.52,1.79,2.59,2.64,0,0,0,0,0,0l119.7,94.49s0,0,0,0c0,0,2.85,2.46,5.51,4.17,3.06,1.97,6.4,3.47,9.9,4.38.06.02.11.03.17.04,2.65.67,5.39,1.02,8.17,1.03h7.64c-4.04-.54-5.79-2.99-6.37-4.97-.75-2.55.49-5.28,2.88-7.45Z" />
    </svg>
  );
}

// Issuer → react-icon + brand color. Mirrors the portfolio's
// src/components/Certifications.jsx so the blog stays brand-consistent.
const VENDOR_ICONS = {
  'The Linux Foundation': { Icon: SiKubernetes, color: '#326ce5' },
  'Amazon Web Services': { Icon: FaAws, color: '#ff9900' },
  HashiCorp: { Icon: SiTerraform, color: '#7f4dff' },
  'Red Hat': { Icon: FaRedhat, color: '#ee0000' },
  Dynatrace: { Icon: SiDynatrace, color: '#73be28' },
  GitLab: { Icon: SiGitlab, color: '#fc6d26' },
  'Technology Partners': { Icon: FaAward, color: null },
  'Spectro Cloud': { Icon: SpectroMark, color: '#2bb3a3' },
};

export default function CertBadge({
  name,
  issuer,
  year,
  href,
  status,
  note,
  noteHref,
}) {
  const vendor = VENDOR_ICONS[issuer];
  const Icon = vendor?.Icon;
  const iconColor = vendor?.color || 'var(--accent)';


  return (
    <div className={styles.badge}>
      <div className={styles.logoWrap}>
        {Icon ? (
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
