// Preview provider for design-sync cards.
// Components in this portfolio call useTranslation() (react-i18next) and some use
// react-router. In a static preview there is no HTTP backend to load locales and no
// Router in context, so t() returns raw keys and router hooks throw. This wrapper
// supplies an i18n instance preloaded with the English locale resources plus a
// MemoryRouter, so every component renders with real copy and routing context.
//
// Exposed on window.<globalName>.PreviewProvider via cfg.extraEntries and referenced
// by cfg.provider.component. Authored, committed sync input — not machine-generated.
import React from "react";
import { I18nextProvider, initReactI18next } from "react-i18next";
import i18next from "i18next";
import { MemoryRouter } from "react-router-dom";
import en from "../public/locales/en/translation.json";

const i18n = i18next.createInstance();
i18n.use(initReactI18next).init({
  lng: "en",
  fallbackLng: "en",
  supportedLngs: ["en"],
  resources: { en: { translation: en } },
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

// The preview scaffold hardcodes a white page background, but every component
// here is designed against the dark page theme (--bg-void). Painting it on a
// wrapper that collapses to content height keeps sections on-brand while leaving
// the floor-card "empty render" fallback intact for not-yet-composed previews.
export function PreviewProvider({ children }) {
  return (
    <I18nextProvider i18n={i18n}>
      <MemoryRouter>
        <div
          style={{
            background: "var(--bg-void)",
            color: "var(--text-primary)",
            fontFamily: "var(--font-body)",
          }}
        >
          {children}
        </div>
      </MemoryRouter>
    </I18nextProvider>
  );
}

export default PreviewProvider;
