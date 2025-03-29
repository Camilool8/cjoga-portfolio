import { useTranslation } from "react-i18next";
import { FaAws, FaMicrosoft, FaDocker } from "react-icons/fa";
import {
  SiTerraform,
  SiAnsible,
  SiKubernetes,
  SiGitlab,
  SiJenkins,
  SiDynatrace,
  SiPowershell,
} from "react-icons/si";
import { TbBrandVscode } from "react-icons/tb";

function About() {
  const { t } = useTranslation();

  // Technology skills with corresponding icons
  const skills = [
    { name: t("skills.aws"), icon: <FaAws className="tech-icon" /> },
    { name: t("skills.azure"), icon: <FaMicrosoft className="tech-icon" /> },
    {
      name: t("skills.terraform"),
      icon: <SiTerraform className="tech-icon" />,
    },
    { name: t("skills.ansible"), icon: <SiAnsible className="tech-icon" /> },
    {
      name: t("skills.kubernetes"),
      icon: <SiKubernetes className="tech-icon" />,
    },
    { name: t("skills.eks"), icon: <FaAws className="tech-icon" /> },
    { name: t("skills.aks"), icon: <FaMicrosoft className="tech-icon" /> },
    { name: t("skills.docker"), icon: <FaDocker className="tech-icon" /> },
    { name: t("skills.gitlab"), icon: <SiGitlab className="tech-icon" /> },
    {
      name: t("skills.azureDevops"),
      icon: <FaMicrosoft className="tech-icon" />,
    },
    { name: t("skills.jenkins"), icon: <SiJenkins className="tech-icon" /> },
    { name: t("skills.argo"), icon: <SiKubernetes className="tech-icon" /> },
    {
      name: t("skills.dynatrace"),
      icon: <SiDynatrace className="tech-icon" />,
    },
    {
      name: t("skills.powershell"),
      icon: <SiPowershell className="tech-icon" />,
    },
  ];

  return (
    <section id="about" className="py-20">
      <div className="section-inner">
        <h2 className="section-title">
          <span className="number">01.</span> {t("about.title")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-2">
            <p className="mb-4 text-light-text-secondary dark:text-dark-text-secondary">
              {t("about.paragraph1")}
            </p>
            <p className="mb-6 text-light-text-secondary dark:text-dark-text-secondary">
              {t("about.paragraph2")}
            </p>
            <p className="mb-2 text-light-text-secondary dark:text-dark-text-secondary">
              {t("about.skills")}
            </p>

            <ul className="skills-list">
              {skills.map((skill, index) => (
                <li key={index}>
                  {skill.icon} {skill.name}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="w-full max-w-xs mx-auto">
              <div className="relative group">
                {/* Main image with overlay */}
                <div className="relative rounded-md overflow-hidden border-2 border-light-accent dark:border-dark-accent">
                  <img
                    src="/images/og-image.webp"
                    alt="Jose Camilo Joga Guerrero"
                    className="w-full transition-all duration-500 grayscale hover:grayscale-0"
                    style={{ filter: "grayscale(1)" }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.filter = "grayscale(0)")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.filter = "grayscale(1)")
                    }
                  />
                </div>

                {/* Decorative frame */}
                <div className="absolute w-full h-full border-2 border-light-accent dark:border-dark-accent rounded-md top-4 left-4 -z-10 transition-transform duration-300 group-hover:translate-x-1 group-hover:translate-y-1"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
