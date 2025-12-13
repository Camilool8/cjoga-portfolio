import { useTranslation } from "react-i18next";
import { FaFolder } from "react-icons/fa";

function Projects() {
  const { t } = useTranslation();

  // Project data from i18n
  const projects = [
    "cicd",
    "iac",
    "monitoring",
    "infrastructure",
    "portal",
    "containerization",
  ];

  // Get tech stack icons based on name
  const getTechIcon = (tech) => {
    return <span className="tech-name">{tech}</span>;
  };

  return (
    <section id="projects" className="py-20">
      <div className="section-inner">
        <h2 className="section-title">
          <span className="number">03.</span> {t("projects.title")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((projectKey, index) => (
            <div
              key={projectKey}
              className="group bg-light-secondary dark:bg-dark-secondary rounded-md p-6 flex flex-col transform transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:border-t-2 border-transparent hover:border-light-accent dark:hover:border-dark-accent h-full relative overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Subtle gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-b from-light-accent/5 to-transparent dark:from-dark-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              <div className="flex justify-between items-center mb-6 relative z-10">
                <FaFolder className="text-light-accent dark:text-dark-accent text-4xl group-hover:scale-110 transition-transform duration-300" />
              </div>

              <h3 className="text-xl font-semibold mb-2 text-light-text-primary dark:text-dark-text-primary relative z-10 group-hover:text-light-accent dark:group-hover:text-dark-accent transition-colors">
                {t(`projects.${projectKey}.title`)}
              </h3>

              <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6 flex-grow relative z-10">
                {t(`projects.${projectKey}.description`)}
              </p>

              <footer className="relative z-10">
                <ul className="flex flex-wrap mt-2 gap-x-3 gap-y-2">
                  {t(`projects.${projectKey}.tech`, {
                    returnObjects: true,
                  }).map((tech, index) => (
                    <li
                      key={index}
                      className="text-xs font-mono text-light-text-secondary dark:text-dark-text-secondary"
                    >
                      {getTechIcon(tech)}
                    </li>
                  ))}
                </ul>
              </footer>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Projects;
