// Landing page for cjoga.cloud docs. Deliberately quiet — its job is to
// say "this is my docs site, dig in" without trying to sell anything or
// privilege one section over another. All four sections are equal.

import React from "react";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "./index.module.css";

const SECTIONS = [
  {
    href: "/about/who-i-am",
    label: "About",
    description:
      "Who I am, what I work on, and where I stand on infrastructure decisions.",
  },
  {
    href: "/homelab/overview",
    label: "Homelab",
    description:
      "The K3s cluster behind cjoga.cloud — hardware, networking, deployment, distributed evolution.",
  },
  {
    href: "/work",
    label: "Work",
    description:
      "Current engagements, client solutions, and the kinds of problems I solve for a living.",
  },
  {
    href: "/certifications/overview",
    label: "Certifications",
    description:
      "Field-tested study notes for the 11 certifications I hold and the ones I'm working toward.",
  },
];

function SectionRow({ section }) {
  return (
    <Link to={section.href} className={styles.row}>
      <div className={styles.rowLabel}>{section.label}</div>
      <div className={styles.rowDescription}>{section.description}</div>
      <div className={styles.rowArrow} aria-hidden="true">→</div>
    </Link>
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
            A working handbook — opinions, the homelab that runs{" "}
            <code>cjoga.cloud</code>, the consulting work that pays the bills,
            and the study notes for certifications I'm earning. Nothing here is
            for sale. Read whatever's useful.
          </p>
        </section>

        <nav className={styles.sections} aria-label="Handbook sections">
          {SECTIONS.map((section) => (
            <SectionRow key={section.href} section={section} />
          ))}
        </nav>

        <footer className={styles.signoff}>
          <p>
            New chapters land continuously. If something here is wrong, or you
            want to talk about the work,{" "}
            <Link to="/about/who-i-am#how-to-reach-me" className={styles.signoffLink}>
              email is the right channel
            </Link>
            .
          </p>
        </footer>
      </main>
    </Layout>
  );
}
