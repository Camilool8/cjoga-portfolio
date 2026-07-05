import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";
import en from "../../public/locales/en/translation.json";

export const SUPPORTED_LANGUAGES = ["en", "es"];
export const DEFAULT_LANGUAGE = "en";

// Language is derived from the URL path prefix (`/es`), not from
// localStorage or the browser — crawlers and deep links must resolve
// deterministically. localStorage only stores the user's explicit
// toggle as a first-visit hint; it never triggers a redirect.
export function getLangFromPath(pathname = "/") {
  return pathname === "/es" || pathname.startsWith("/es/") ? "es" : "en";
}

// "/es/terminal" → "/terminal", "/es" → "/", "/terminal" → "/terminal"
export function stripLangPrefix(pathname = "/") {
  if (pathname === "/es" || pathname === "/es/") return "/";
  if (pathname.startsWith("/es/")) return pathname.slice(3);
  return pathname;
}

// Equivalent path in the target language, e.g. ("/terminal", "es")
// → "/es/terminal"; ("/es/terminal", "en") → "/terminal".
export function localizePath(pathname, lang) {
  const base = stripLangPrefix(pathname);
  if (lang !== "es") return base;
  return base === "/" ? "/es" : `/es${base}`;
}

const initialLng =
  typeof window !== "undefined"
    ? getLangFromPath(window.location.pathname)
    : DEFAULT_LANGUAGE;

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    lng: initialLng,
    fallbackLng: "en",
    supportedLngs: SUPPORTED_LANGUAGES,
    debug: import.meta.env.DEV,
    interpolation: {
      escapeValue: false,
    },
    // English ships in the bundle so the first render never blocks on a
    // translation fetch; Spanish still loads over HTTP on demand.
    resources: {
      en: { translation: en },
    },
    partialBundledLanguages: true,
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
  });

export default i18n;
