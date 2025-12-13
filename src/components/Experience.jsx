import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

function Experience() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState("arroyo");
  const [companies, setCompanies] = useState([]);
  const tabsContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

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

  // Handle scroll arrows visibility
  const handleScroll = () => {
    if (tabsContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5); // 5px buffer
    }
  };

  useEffect(() => {
    const container = tabsContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      // Check initial state
      handleScroll();
      
      // Also check on resize
      window.addEventListener("resize", handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
      window.removeEventListener("resize", handleScroll);
    };
  }, [companies]); // Re-run when companies load

  return (
    <section id="experience" className="py-20">
      <div className="section-inner">
        <h2 className="section-title">
          <span className="number">02.</span> {t("experience.title")}
        </h2>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Company tabs - vertical on desktop, horizontal on mobile */}
          <div className="relative md:min-w-[200px]">
            {/* Scroll Indicators (Mobile Only) */}
            <div className={`md:hidden absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-light-primary dark:from-dark-primary to-transparent z-10 pointer-events-none transition-opacity duration-300 ${showLeftArrow ? 'opacity-100' : 'opacity-0'}`} />
            <div className={`md:hidden absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-light-primary dark:from-dark-primary to-transparent z-10 pointer-events-none transition-opacity duration-300 ${showRightArrow ? 'opacity-100' : 'opacity-0'}`} />
            
            <div 
              ref={tabsContainerRef}
              className="flex overflow-x-auto md:flex-col border-b md:border-b-0 md:border-l border-light-accent/20 dark:border-dark-accent/20 scrollbar-hide pb-2 md:pb-0"
            >
              {companies.map((company) => (
                <button
                  key={company.id}
                  onClick={() => setActiveTab(company.id)}
                  className={`px-4 py-3 text-left font-mono text-sm whitespace-nowrap transition-all duration-300 flex-shrink-0
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
            {/* Helper text for mobile */}
            <div className="md:hidden text-center mt-2 text-xs text-light-text-secondary/50 dark:text-dark-text-secondary/50 font-mono">
              ← {t("common.swipe", "Swipe")} →
            </div>
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
