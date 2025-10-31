import { useTranslation } from "react-i18next";
import { FaRedhat, FaAward, FaAws } from "react-icons/fa";
import { SiDynatrace, SiGitlab } from "react-icons/si";

function Certifications() {
  const { t } = useTranslation();

  // Certification data keys from translations
  const certifications = [
    { key: "awsSolutionsArchitect", icon: <FaAws /> },
    { key: "rhcsa", icon: <FaRedhat /> },
    { key: "rhce", icon: <FaRedhat /> },
    { key: "dynatrace", icon: <SiDynatrace /> },
    { key: "gitlabMigration", icon: <SiGitlab /> },
    { key: "gitlabServices", icon: <SiGitlab /> },
    { key: "gitlabCicd", icon: <SiGitlab /> },
    { key: "gitlabImplementation", icon: <SiGitlab /> },
    { key: "partner", icon: <FaAward /> },
  ];

  return (
    <section id="certifications" className="py-20">
      <div className="section-inner">
        <h2 className="section-title">
          <span className="number">04.</span> {t("certifications.title")}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {certifications.map(({ key, icon }) => (
            <div
              key={key}
              className="bg-light-secondary dark:bg-dark-secondary rounded-md p-6 flex flex-col items-center text-center transform hover:-translate-y-2 transition-all duration-300"
            >
              <div className="text-5xl mb-4 text-light-accent dark:text-dark-accent">
                {icon}
              </div>

              <h3 className="text-lg font-medium mb-2 text-light-text-primary dark:text-dark-text-primary">
                {t(`certifications.${key}.name`)}
              </h3>

              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">
                {t(`certifications.${key}.issuer`)}
              </p>

              <p className="text-xs font-mono text-light-accent dark:text-dark-accent">
                {t(`certifications.${key}.date`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Certifications;
