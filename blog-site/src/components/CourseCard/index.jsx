import React from 'react';
import { FaArrowUpRightFromSquare } from 'react-icons/fa6';
import styles from './styles.module.css';

// Course card — bordered tile, matches the SectionCardGrid visual language.
// Whole card is a clickable external link when `link` is provided.
//
// Usage:
//   <CourseCardGrid>
//     <CourseCard
//       title="..."
//       instructor="..."
//       platform="Udemy"
//       year={2023}
//       hours={64}
//       takeaway="..."
//       link="https://..."
//     />
//   </CourseCardGrid>

export function CourseCardGrid({ children }) {
  return <div className={styles.grid}>{children}</div>;
}

export default function CourseCard({
  title,
  instructor,
  platform = 'Udemy',
  year,
  hours,
  takeaway,
  link,
  image,
}) {
  const Wrapper = link ? 'a' : 'div';
  const wrapperProps = link
    ? {
        href: link,
        target: '_blank',
        rel: 'noopener noreferrer',
        className: `${styles.card} ${styles.cardLink}`,
      }
    : { className: styles.card };

  return (
    <Wrapper {...wrapperProps}>
      {image && (
        <div className={styles.thumbnail}>
          <img src={image} alt={title} loading="lazy" />
        </div>
      )}

      <div className={styles.body}>
        <div className={styles.meta}>
          <span className={styles.platform}>{platform}</span>
          {year ? (
            <>
              <span className={styles.dot} aria-hidden="true">·</span>
              <span className={styles.year}>{year}</span>
            </>
          ) : null}
          {hours ? (
            <>
              <span className={styles.dot} aria-hidden="true">·</span>
              <span className={styles.hours}>{hours}h</span>
            </>
          ) : null}
        </div>

        <h3 className={styles.title}>{title}</h3>
        {instructor && <p className={styles.instructor}>{instructor}</p>}
        {takeaway && <p className={styles.takeaway}>{takeaway}</p>}

        {link && (
          <span className={styles.linkAffordance} aria-hidden="true">
            <span>View course</span>
            <FaArrowUpRightFromSquare />
          </span>
        )}
      </div>
    </Wrapper>
  );
}
