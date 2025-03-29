import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

function Experience() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState("arroyo");
  const [companies, setCompanies] = useState([]);

  // Dynamically get company list from translations
  useEffect(() => {
    // This generates the company list from the translation keys
    const companyKeys = ["arroyo", "flBetances", "shadowSoft"];
    const companyList = companyKeys.map((key) => ({
      id: key,
      name: t(`experience.${key}.company`),
    }));
    setCompanies(companyList);

    // Set first company as active if none selected
    if (!activeTab && companyList.length > 0) {
      setActiveTab(companyList[0].id);
    }
  }, [t, i18n.language]);

  return (
    <section id="experience" className="py-20">
      <div className="section-inner">
        <h2 className="section-title">
          <span className="number">02.</span> {t("experience.title")}
        </h2>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Company tabs - vertical on desktop, horizontal on mobile */}
          <div className="flex overflow-x-auto md:flex-col md:min-w-[200px] border-b md:border-b-0 md:border-l border-light-accent/20 dark:border-dark-accent/20">
            {companies.map((company) => (
              <button
                key={company.id}
                onClick={() => setActiveTab(company.id)}
                className={`px-4 py-3 text-left font-mono text-sm whitespace-nowrap transition-all duration-300 
                  ${
                    activeTab === company.id
                      ? "text-light-accent dark:text-dark-accent border-light-accent dark:border-dark-accent"
                      : "text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-secondary dark:hover:bg-dark-secondary"
                  }
                  ${
                    activeTab === company.id
                      ? "border-b-2 md:border-b-0 md:border-l-2"
                      : "border-b-0 md:border-l-0"
                  }`}
              >
                {company.name}
              </button>
            ))}
          </div>

          {/* Job details with fixed height */}
          <div className="py-2 px-1 md:px-6 flex-1">
            <div className="min-h-[350px] relative">
              {companies.map((company) => (
                <div
                  key={company.id}
                  className={`job absolute top-0 left-0 w-full transition-opacity duration-300 ${
                    activeTab === company.id
                      ? "opacity-100 z-10"
                      : "opacity-0 z-0"
                  }`}
                  style={{
                    pointerEvents: activeTab === company.id ? "auto" : "none",
                  }}
                >
                  <h3 className="text-xl font-semibold mb-1">
                    {t(`experience.${company.id}.title`)}{" "}
                    <span className="text-light-accent dark:text-dark-accent">
                      @ {t(`experience.${company.id}.company`)}
                    </span>
                  </h3>
                  <p className="font-mono text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4">
                    {t(`experience.${company.id}.period`)}
                  </p>
                  <div className="job-description">
                    <ul>
                      {t(`experience.${company.id}.responsibilities`, {
                        returnObjects: true,
                      }).map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Experience;
