import { useTranslation } from "react-i18next";

function Hero() {
  const { t } = useTranslation();

  return (
    <section
      id="hero"
      className="min-h-screen flex flex-col justify-center pt-16"
    >
      <div className="section-inner">
        <p className="font-mono text-light-accent dark:text-dark-accent text-base md:text-lg mb-4 opacity-0 fade-in">
          {t("hero.greeting")}
        </p>

        <h1 className="text-4xl md:text-7xl font-bold mb-2 text-light-text-primary dark:text-dark-text-primary opacity-0 fade-in delay-1">
          {t("hero.title")}
        </h1>

        <h2 className="text-3xl md:text-5xl font-bold text-light-text-secondary dark:text-dark-text-secondary mb-6 opacity-0 fade-in delay-2">
          {t("hero.subtitle")}
        </h2>

        <p className="max-w-xl text-lg text-light-text-secondary dark:text-dark-text-secondary mb-12 opacity-0 fade-in delay-3">
          {t("hero.description")}
        </p>

        <div className="flex flex-wrap gap-4 opacity-0 fade-in delay-4">
          <a href="#projects" className="cta-button">
            {t("hero.cta.work")}
          </a>
          <a href="#contact" className="cta-button">
            {t("hero.cta.contact")}
          </a>
        </div>
      </div>
    </section>
  );
}

export default Hero;
