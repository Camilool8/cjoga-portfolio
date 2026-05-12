// Landing for blog.cjoga.cloud. Audience-first "start here" index:
// hiring managers, learners, and homelab-curious readers each see the
// path that's actually useful to them. Keeps the existing styling
// (hero, orbs, typographic rows) intact.

import React from "react";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "./index.module.css";

const PATHS = [
  {
    eyebrow: "If you're hiring",
    rows: [
      { to: "/me/who-i-am", label: "Who I am" },
      { to: "/engineering/work", label: "What I've built" },
    ],
  },
  {
    eyebrow: "If you're studying",
    intro:
      "Honest cert guides — my experience, my tips, and the runbooks I'd hand to a friend.",
    rows: [{ to: "/learn/rhcsa", label: "RHCSA (EX200) guide" }],
  },
  {
    eyebrow: "If you're curious about the lab",
    rows: [{ to: "/engineering/lab/overview", label: "The K3s setup" }],
  },
];

function PathBlock({ path }) {
  return (
    <section className={styles.pathBlock}>
      <div className={styles.eyebrow}>
        <span className={styles.eyebrowDot} aria-hidden="true" />
        {path.eyebrow}
      </div>
      {path.intro ? <p className={styles.pathIntro}>{path.intro}</p> : null}
      <nav className={styles.sections} aria-label={path.eyebrow}>
        {path.rows.map((row) => (
          <Link key={row.to} to={row.to} className={styles.row}>
            <div className={styles.rowLabel}>{row.label}</div>
            <div className={styles.rowArrow} aria-hidden="true">→</div>
          </Link>
        ))}
      </nav>
    </section>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <main className={styles.main}>
        <div className={styles.backdrop} aria-hidden="true">
          <div className={`${styles.orb} ${styles.orbAccent}`} />
          <div className={`${styles.orb} ${styles.orbBlue}`} />
        </div>

        <section className={styles.hero}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowDot} aria-hidden="true" />
            cjoga.cloud / handbook
          </div>
          <h1 className={styles.title}>
            This is where I write things down.
          </h1>
          <p className={styles.lede}>
            A working handbook — opinions, the K3s lab that runs{" "}
            <code>cjoga.cloud</code>, the consulting work that pays the bills,
            and cert guides for the certs I think are worth your time. Nothing
            here is for sale. Read whatever's useful.
          </p>
        </section>

        <div className={styles.paths}>
          {PATHS.map((path) => (
            <PathBlock key={path.eyebrow} path={path} />
          ))}
        </div>

        <footer className={styles.signoff}>
          <p>
            New pages land when they're ready, not on a schedule. If something
            here is wrong, or you want to talk about the work,{" "}
            <Link to="/me/who-i-am#how-to-reach-me" className={styles.signoffLink}>
              email is the right channel
            </Link>
            .
          </p>
        </footer>
      </main>
    </Layout>
  );
}
