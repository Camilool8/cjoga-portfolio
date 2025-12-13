import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaChevronDown } from "react-icons/fa";

function Hero() {
  const { t } = useTranslation();
  const [text, setText] = useState("");
  const [roleIndex, setRoleIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [delta, setDelta] = useState(100);
  const [scrollOpacity, setScrollOpacity] = useState(1);

  // Get roles from translation
  const roles = t("hero.roles", { returnObjects: true });
  const textArray = [...(Array.isArray(roles) ? roles : [])];

  const period = 2000; // Time to wait before deleting

  // Handle typing effect
  useEffect(() => {
    let ticker = setInterval(() => {
      tick();
    }, delta);

    return () => clearInterval(ticker);
  }, [text, delta, isDeleting, roleIndex, textArray]);

  const tick = () => {
    const i = roleIndex % textArray.length;
    const fullText = textArray[i];

    // Add some randomness to typing speed for "human" feel
    let nextDelta = 100 - Math.random() * 50;

    if (isDeleting) {
      setText(fullText.substring(0, text.length - 1));
      nextDelta = 50; // Consistent speed for deleting
    } else {
      setText(fullText.substring(0, text.length + 1));
    }

    setDelta(nextDelta);

    if (!isDeleting && text === fullText) {
      setIsDeleting(true);
      setDelta(period);
    } else if (isDeleting && text === "") {
      setIsDeleting(false);
      setRoleIndex(roleIndex + 1);
      setDelta(500);
    }
  };

  // Handle scroll opacity for the arrow
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Fade out within the first 300px
      const newOpacity = Math.max(0, 1 - scrollY / 300);
      setScrollOpacity(newOpacity);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      id="hero"
      className="min-h-screen flex flex-col justify-center relative overflow-hidden"
    >
      {/* Dynamic Background Blob - Made slower and more subtle */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-light-accent/5 dark:bg-dark-accent/5 blur-[120px] animate-blob" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/5 dark:bg-blue-900/5 blur-[120px] animate-blob animation-delay-4000" />

      <div className="section-inner relative z-10">
        <p className="font-mono text-light-accent dark:text-dark-accent text-base md:text-lg mb-4 opacity-0 fade-in">
          {t("hero.greeting")}
        </p>

        <h1 className="text-4xl md:text-7xl font-bold font-heading mb-4 text-light-text-primary dark:text-dark-text-primary opacity-0 fade-in delay-1">
          {t("hero.title")}
        </h1>

        {/* Fixed height container to prevent layout shift */}
        <div className="h-20 md:h-24 mb-6 flex items-center opacity-0 fade-in delay-2">
          <h2 className="text-2xl md:text-5xl font-bold font-heading text-light-text-secondary dark:text-dark-text-secondary">
            <span>{text}</span>
            <span className="animate-cursor text-light-accent dark:text-dark-accent ml-1 font-light">
              |
            </span>
          </h2>
        </div>

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

      {/* Scroll Indicator with Scroll-based Opacity */}
      <div
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        style={{ opacity: scrollOpacity }}
      >
        <a
          href="#about"
          aria-label="Scroll down"
          className="flex flex-col items-center animate-bounce text-light-text-secondary dark:text-dark-text-secondary hover:text-light-accent dark:hover:text-dark-accent transition-colors"
        >
          <span className="text-xs font-mono mb-2 hidden md:block opacity-70">
            Scroll
          </span>
          <FaChevronDown className="text-xl" />
        </a>
      </div>

      <style>{`
        @keyframes cursor-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-cursor {
          animation: cursor-blink 1s step-end infinite;
        }
      `}</style>
    </section>
  );
}

export default Hero;
