// Landing for blog.cjoga.cloud. Audience-first "start here" index:
// learners, hiring managers, and cluster-curious readers each see the
// path that's actually useful to them; the lede names the sections in
// the same order as the reader paths below it. The intro sits over a quiet
// orbital band: the portfolio's planet scene seen as a horizon, masked
// away from the copy (see OrbitalScene, synced from the portfolio), with a
// CSS still of the same horizon for the moment before JavaScript.

import React, { useEffect, useState } from "react";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import PlanetScene from "@site/src/components/OrbitalScene/PlanetScene";
import ReaderPaths from "@site/src/components/ReaderPaths";
import RecentlyUpdated from "@site/src/components/ReaderPaths/RecentlyUpdated";
import styles from "./index.module.css";

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  // The band ships a CSS still of the horizon in the static HTML, so it is
  // never an empty strip before (or without) JavaScript; once the canvas
  // scene mounts, the still fades out under it.
  const [sceneLive, setSceneLive] = useState(false);
  useEffect(() => setSceneLive(true), []);
  return (
    <Layout
      // Docusaurus appends " | Camilo's handbook" (siteConfig.title)
      // automatically, so no site name here: a descriptive homepage title
      // instead of the bare domain, which collided with the portfolio in SERPs.
      title="Cert Guides, K3s Cluster & DevOps Opinions"
      description={siteConfig.tagline}
    >
      <main className={styles.main}>
        <section className={styles.intro} aria-labelledby="handbook-title">
          <div className={styles.scene} aria-hidden="true">
            <div
              className={`${styles.poster} ${sceneLive ? styles.posterGone : ""}`}
            />
            <PlanetScene variant="horizon" sink={0.86} />
          </div>
          <div className={styles.inner}>
            <h1 id="handbook-title" className={styles.title}>
              {/* No-break spaces: "I" and "A" never end a line on their own. */}
              This is where I{"\u00a0"}write things down.{" "}
              <span className={styles.titleMuted}>A{"\u00a0"}working handbook.</span>
            </h1>
            <p className={styles.lede}>
              Cert guides for the certs I think are worth your time, the
              consulting work that pays the bills, the K3s cluster that runs{" "}
              <code>cjoga.cloud</code>, and opinions. Nothing here is for sale.
              Read whatever’s useful.
            </p>
          </div>
        </section>

        <div className={styles.inner}>
          <ReaderPaths />
          <RecentlyUpdated />

          <p className={styles.signoff}>
            New pages land when they’re ready, not on a schedule. If something
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
