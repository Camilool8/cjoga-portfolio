// Author bio card — surfaces at the bottom of post pages. Gives every
// post the same trustworthy sign-off ("here's who wrote this").

import React from "react";
import Link from "@docusaurus/Link";
import styles from "./styles.module.css";

export default function AuthorCard() {
  return (
    <aside className={styles.card} aria-label="About the author">
      <img
        className={styles.avatar}
        src="https://github.com/Camilool8.png"
        alt="Jose Camilo Joga Guerrero"
        width="80"
        height="80"
        loading="lazy"
      />
      <div className={styles.body}>
        <div className={styles.eyebrow}>Written by</div>
        <div className={styles.name}>Jose Camilo Joga Guerrero</div>
        <p className={styles.bio}>
          DevOps &amp; Cloud Engineer based in the Dominican Republic. I run{" "}
          <code>cjoga.cloud</code> on a 3-node K3s cluster of repurposed
          laptops and write here when I learn something worth sharing.
        </p>
        <div className={styles.links}>
          <Link to="https://cjoga.cloud" className={styles.link}>
            Portfolio
          </Link>
          <span aria-hidden="true">·</span>
          <Link to="https://github.com/Camilool8" className={styles.link}>
            GitHub
          </Link>
          <span aria-hidden="true">·</span>
          <Link to="https://www.linkedin.com/in/cjoga" className={styles.link}>
            LinkedIn
          </Link>
        </div>
      </div>
    </aside>
  );
}
