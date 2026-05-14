import React from 'react';
import styles from './styles.module.css';

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
  const TitleTag = link ? 'a' : 'span';
  const titleProps = link
    ? { href: link, target: '_blank', rel: 'noopener noreferrer' }
    : {};

  return (
    <div className={styles.card}>
      {image && (
        <div className={styles.thumbnail}>
          <img src={image} alt={title} loading="lazy" />
        </div>
      )}
      <div className={styles.body}>
        <div className={styles.meta}>
          <span className={styles.platform}>{platform}</span>
          {year && <span className={styles.dot}>·</span>}
          {year && <span className={styles.year}>{year}</span>}
          {hours && <span className={styles.dot}>·</span>}
          {hours && <span className={styles.hours}>{hours}h</span>}
        </div>
        <h3 className={styles.title}>
          <TitleTag className={styles.titleLink} {...titleProps}>
            {title}
          </TitleTag>
        </h3>
        {instructor && <p className={styles.instructor}>{instructor}</p>}
        {takeaway && <p className={styles.takeaway}>{takeaway}</p>}
      </div>
    </div>
  );
}
