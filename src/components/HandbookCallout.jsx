import { useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  FaArrowRight,
  FaCircle,
  FaExternalLinkAlt,
} from "react-icons/fa";
import {
  HiOutlineUser,
  HiOutlineCog6Tooth,
  HiOutlineBookOpen,
} from "react-icons/hi2";
import {
  sectionVariants,
  itemVariants,
  viewportConfig,
  useReducedMotion,
} from "../hooks/useMotion";

const HANDBOOK_URL = "https://blog.cjoga.cloud";

const SECTIONS = [
  {
    key: "me",
    Icon: HiOutlineUser,
    href: `${HANDBOOK_URL}/me`,
  },
  {
    key: "engineering",
    Icon: HiOutlineCog6Tooth,
    href: `${HANDBOOK_URL}/engineering/lab`,
  },
  {
    key: "learn",
    Icon: HiOutlineBookOpen,
    href: `${HANDBOOK_URL}/learn`,
  },
];

export default function HandbookCallout() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const windowRef = useRef(null);

  // 3D parallax tilt — disabled if user prefers reduced motion
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(
    useTransform(mouseY, [-0.5, 0.5], reduce ? [0, 0] : [4, -4]),
    { stiffness: 180, damping: 22 },
  );
  const rotateY = useSpring(
    useTransform(mouseX, [-0.5, 0.5], reduce ? [0, 0] : [-4, 4]),
    { stiffness: 180, damping: 22 },
  );

  const handleMouseMove = (e) => {
    const rect = windowRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section id="handbook" className="py-16 md:py-24 relative z-10">
      <div className="section-inner">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="mb-10"
        >
          <motion.div variants={itemVariants}>
            <span className="section-label">
              {t("handbook.label", "The handbook")}
            </span>
            <h2 className="section-heading">
              {t("handbook.heading", "A living technical handbook.")}
            </h2>
            <p
              className="max-w-2xl"
              style={{
                color: "var(--text-secondary)",
                fontSize: "1.05rem",
                lineHeight: "1.6",
                marginTop: "8px",
              }}
            >
              {t(
                "handbook.subheading",
                "Opinions, lab work, certification guides, and the path I'm walking right now — kept as a separate site so it can grow on its own.",
              )}
            </p>
          </motion.div>
        </motion.div>

        <motion.a
          ref={windowRef}
          href={HANDBOOK_URL}
          target="_blank"
          rel="noopener noreferrer"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          whileHover={reduce ? undefined : { y: -3 }}
          style={{
            rotateX,
            rotateY,
            transformPerspective: 1400,
            transformStyle: "preserve-3d",
          }}
          className="handbook-window block rounded-2xl overflow-hidden group relative"
          aria-label={t(
            "handbook.windowAriaLabel",
            "Visit the handbook at blog.cjoga.cloud",
          )}
        >
          {/* Browser chrome */}
          <div className="handbook-chrome">
            <div className="flex items-center gap-1.5">
              <span className="handbook-dot" style={{ background: "#ff5f56" }} />
              <span className="handbook-dot" style={{ background: "#ffbd2e" }} />
              <span className="handbook-dot" style={{ background: "#27c93f" }} />
            </div>
            <div className="handbook-urlbar">
              <FaCircle size={6} style={{ color: "#27c93f", opacity: 0.85 }} />
              <span>blog.cjoga.cloud</span>
            </div>
            <FaExternalLinkAlt
              size={11}
              style={{ color: "var(--text-tertiary)" }}
              aria-hidden="true"
            />
          </div>

          {/* Window content */}
          <div className="handbook-content">
            <div className="handbook-bg" aria-hidden="true" />

            <div className="handbook-headline">
              <span className="handbook-eyebrow">{t("handbook.eyebrow", "cjoga.cloud")}</span>
              <h3 className="handbook-title">
                {t("handbook.cardTitle", "The Handbook")}
              </h3>
              <p className="handbook-card-sub">
                {t(
                  "handbook.cardSubtitle",
                  "Five sections. One source of truth for what I work on, what I think, and what I'm learning.",
                )}
              </p>
            </div>

            <div className="handbook-grid">
              {SECTIONS.map(({ key, Icon, href }) => (
                <div key={key} className="handbook-tile" aria-hidden="true">
                  <div className="handbook-tile-icon">
                    <Icon />
                  </div>
                  <div className="handbook-tile-body">
                    <div className="handbook-tile-title">
                      {t(`handbook.sections.${key}.title`)}
                    </div>
                    <div className="handbook-tile-desc">
                      {t(`handbook.sections.${key}.desc`)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="handbook-cta">
              <span>
                {t("handbook.cta", "Visit blog.cjoga.cloud")}
              </span>
              <FaArrowRight />
            </div>
          </div>
        </motion.a>
      </div>
    </section>
  );
}
