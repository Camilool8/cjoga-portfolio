import React from 'react';
import { FaRedhat, FaAward, FaAws } from 'react-icons/fa';
import {
  SiDynatrace,
  SiGitlab,
  SiTerraform,
  SiKubernetes,
} from 'react-icons/si';
import styles from './styles.module.css';

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
};

export default function CertBadge({
  name,
  issuer,
  year,
  href,
  status,
  note,
}) {
  const vendor = VENDOR_ICONS[issuer];
  const Icon = vendor?.Icon;
  const iconColor = vendor?.color || 'var(--accent)';

  const TitleTag = href ? 'a' : 'span';
  const titleProps = href
    ? { href, target: '_blank', rel: 'noopener noreferrer' }
    : {};

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
        <div className={styles.meta}>
          {year && <span className={styles.year}>{year}</span>}
          {status && (
            <>
              <span className={styles.dot}>·</span>
              <span className={styles.status} data-status={status}>
                {status}
              </span>
            </>
          )}
        </div>
        <h3 className={styles.name}>
          <TitleTag className={styles.nameLink} {...titleProps}>
            {name}
          </TitleTag>
        </h3>
        <p className={styles.issuer}>{issuer}</p>
        {note && <p className={styles.note}>{note}</p>}
        {href && (
          <a
            className={styles.verify}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
          >
            Verify on Credly ↗
          </a>
        )}
      </div>
    </div>
  );
}

// Grid wrapper — pass children of <CertBadge /> inside.
export function CertBadgeGrid({ children }) {
  return <div className={styles.grid}>{children}</div>;
}
