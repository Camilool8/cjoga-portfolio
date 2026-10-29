// Landing for blog.cjoga.cloud. Audience-first "start here" index:
// hiring managers, learners, and homelab-curious readers each see the
// path that's actually useful to them. The intro sits over a quiet
// orbital band: the portfolio's planet scene seen as a horizon, masked
// away from the copy (see OrbitalScene, synced from the portfolio).

import React from "react";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { FiArrowRight } from "react-icons/fi";
import PlanetScene from "@site/src/components/OrbitalScene/PlanetScene";
import styles from "./index.module.css";

const PATHS = [
  {
    id: "hiring",
    title: "If you're hiring",
    rows: [
      { to: "/me/who-i-am", label: "Who I am" },
      { to: "/engineering/work", label: "What I've built" },
    ],
  },
  {
    id: "studying",
    title: "If you're studying",
    intro:
      "Honest cert guides — my experience, my tips, and the runbooks I'd hand to a friend.",
    rows: [
      { to: "/learn/ckad", label: "CKAD guide" },
      { to: "/learn/rhcsa", label: "RHCSA (EX200) guide" },
      { to: "/learn/rhce", label: "RHCE (EX294) guide" },
    ],
  },
  {
    id: "lab",
    title: "If you're curious about the lab",
    rows: [
      { to: "/engineering/lab/overview", label: "The K3s setup" },
      { to: "/learn/kubestronaut-sim", label: "kubestronaut-sim" },
    ],
  },
];

function PathBlock({ path }) {
  const headingId = `path-${path.id}`;
  return (
    <section className={styles.path} aria-labelledby={headingId}>
      <div className={styles.pathHead}>
        <h2 id={headingId} className={styles.pathTitle}>
          {path.title}
        </h2>
        {path.intro ? <p className={styles.pathIntro}>{path.intro}</p> : null}
      </div>
      <ul className={styles.links}>
        {path.rows.map((row) => (
          <li key={row.to}>
            <Link to={row.to} className={styles.link}>
              <span className={styles.linkLabel}>{row.label}</span>
              <span className={styles.linkPath}>{row.to}</span>
              <FiArrowRight className={styles.linkIcon} aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      // Docusaurus appends " | cjoga.cloud" (siteConfig.title) automatically,
      // so no site name here — a descriptive homepage title instead of the
      // bare domain, which collided with the portfolio in SERPs.
      title="Camilo's Handbook — DevOps Opinions, K3s Lab & Cert Guides"
      description={siteConfig.tagline}
    >
      <main className={styles.main}>
        <section className={styles.intro} aria-labelledby="handbook-title">
          <div className={styles.scene} aria-hidden="true">
            <PlanetScene variant="horizon" />
          </div>
          <div className={styles.inner}>
            <h1 id="handbook-title" className={styles.title}>
              This is where I write things down.{" "}
              <span className={styles.titleMuted}>A working handbook.</span>
            </h1>
            <p className={styles.lede}>
              Opinions, the K3s lab that runs <code>cjoga.cloud</code>, the
              consulting work that pays the bills, and cert guides for the
              certs I think are worth your time. Nothing here is for sale.
              Read whatever's useful.
            </p>
          </div>
        </section>

        <div className={styles.inner}>
          <div className={styles.paths}>
            {PATHS.map((path) => (
              <PathBlock key={path.id} path={path} />
            ))}
          </div>

          <p className={styles.signoff}>
            New pages land when they're ready, not on a schedule. If something
            here is wrong, or you want to talk about the work,{" "}
            <Link to="/me/who-i-am#how-to-reach-me" className={styles.signoffLink}>
              email is the right channel
            </Link>
            .
          </p>
        </div>
      </main>
    </Layout>
  );
}
