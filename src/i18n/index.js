import { createI18n } from "vue-i18n";
import en from "./locales/en.json";
import zhCN from "./locales/zh-CN.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import de from "./locales/de.json";
import ja from "./locales/ja.json";

const messages = {
  en,
  "zh-CN": zhCN,
  es,
  fr,
  de,
  ja,
};

// Get saved language from localStorage or default to browser language
const savedLanguage = localStorage.getItem("language");
const browserLanguage = navigator.language || navigator.userLanguage;
const defaultLanguage =
  savedLanguage || (browserLanguage.startsWith("zh") ? "zh-CN" : "en");

const i18n = createI18n({
  legacy: false,
  locale: defaultLanguage,
  fallbackLocale: "en",
  messages,
  globalInjection: true,
});

export default i18n;
