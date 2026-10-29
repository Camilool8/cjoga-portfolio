import { useTranslation } from "react-i18next";
import { m } from "framer-motion";
import { FiArrowUpRight } from "react-icons/fi";
import SectionHeading from "./SectionHeading";
import {
  sectionVariants,
  itemVariants,
  viewportConfig,
} from "../hooks/useMotion";

// The writing lives at blog.cjoga.cloud. Here: what it is in one line,
// and the four pages a visitor is most likely to want, as direct links.

const HANDBOOK_URL = "https://blog.cjoga.cloud";

const LINKS = [
  { path: "/me/who-i-am", labelKey: "handbook.paths.hiring.whoIAm" },
  { path: "/engineering/work", labelKey: "handbook.paths.hiring.whatBuilt" },
  { path: "/engineering/lab/overview", labelKey: "handbook.paths.lab.k3s" },
  { path: "/learn/rhcsa", labelKey: "handbook.paths.studying.rhcsa" },
];

export default function HandbookCallout() {
  const { t } = useTranslation();

  return (
    <section id="handbook" className="handbook-section" aria-labelledby="handbook-title">
      <m.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        className="handbook-section-inner handbook-band"
      >
        <div>
          <SectionHeading id="handbook-title" title={t("handbook.heading")} />
          <m.p variants={itemVariants} className="section-lede handbook-band__lede">
            {t("handbook.subheading")}
          </m.p>
        </div>

        <m.ul variants={itemVariants} className="handbook-links">
          {LINKS.map(({ path, labelKey }) => (
            <li key={path}>
              <a href={`${HANDBOOK_URL}${path}`} target="_blank" rel="noopener noreferrer" className="handbook-link">
                <span>{t(labelKey)}</span>
                <span className="handbook-link__path">blog.cjoga.cloud{path}</span>
                <FiArrowUpRight aria-hidden="true" className="handbook-link__icon" />
                <span className="sr-only">{t("certifications.opensInNewTab")}</span>
              </a>
            </li>
          ))}
        </m.ul>
      </m.div>
    </section>
  );
}
