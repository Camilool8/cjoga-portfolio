// Author bio card — surfaces at the bottom of post pages. Gives every
// post the same trustworthy sign-off ("here's who wrote this").

import React from "react";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./styles.module.css";

export default function AuthorCard() {
  return (
    <aside className={styles.card} aria-label="About the author">
      <img
        className={styles.avatar}
        src={useBaseUrl("/img/camilo-avatar.webp")}
        alt=""
        width="80"
        height="80"
        decoding="async"
      />
      <div className={styles.body}>
        <p className={styles.name}>
          <span className={styles.muted}>Written by</span> José Camilo Joga
          Guerrero
        </p>
        <p className={styles.bio}>
          Senior Platform &amp; DevOps Engineer and co-founder of KodePull.{" "}
          <code>cjoga.cloud</code> runs on KodePull’s 6-node K3s cluster, split
          across Proxmox and bare metal; I write here when something’s worth
          sharing.
        </p>
        <div className={styles.links}>
          <Link to="https://cjoga.cloud" target="_self" className={styles.link}>
            Portfolio
          </Link>
          {/* The CV is generated on the portfolio: this lands on the
              section with its "Download CV" button, not on a file. */}
          <Link
            to="https://cjoga.cloud/#contact"
            target="_self"
            className={styles.link}
          >
            CV on cjoga.cloud
          </Link>
          <Link to="https://github.com/Camilool8" className={styles.link}>
            GitHub
          </Link>
          <Link to="https://www.linkedin.com/in/cjoga" className={styles.link}>
            LinkedIn
          </Link>
        </div>
      </div>
    </aside>
  );
}
