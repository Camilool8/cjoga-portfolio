import React from 'react';
import Link from '@docusaurus/Link';
import { FaArrowRight } from 'react-icons/fa';
import styles from './styles.module.css';

// Section card grid — for top-level index pages.
// Each card: icon + title + 1-line description, click anywhere → href.
//
// Usage:
//   <SectionCardGrid>
//     <SectionCard
//       href="/engineering/lab"
//       icon={SiKubernetes}
//       iconColor="#326CE5"
//       title="Lab"
//       description="The K3s cluster behind cjoga.cloud."
//     />
//   </SectionCardGrid>

export default function SectionCardGrid({ children }) {
  return <div className={styles.grid}>{children}</div>;
}

export function SectionCard({
  href,
  icon: Icon,
  iconColor,
  monogram,
  title,
  description,
}) {
  return (
    <Link to={href} className={styles.card}>
      {(Icon || monogram) && (
        <div className={styles.iconWrap}>
          {Icon ? (
            <Icon
              className={styles.icon}
              style={iconColor ? { color: iconColor } : undefined}
              aria-hidden="true"
            />
          ) : (
            <span
              className={styles.monogram}
              style={iconColor ? { color: iconColor } : undefined}
              aria-hidden="true"
            >
              {monogram}
            </span>
          )}
        </div>
      )}
      <div className={styles.body}>
        <h3 className={styles.title}>{title}</h3>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      <FaArrowRight className={styles.arrow} aria-hidden="true" />
    </Link>
  );
}
