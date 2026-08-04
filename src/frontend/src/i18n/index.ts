import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import vi from './locales/vi.json';
import zh from './locales/zh.json';
import ja from './locales/ja.json';

export const SUPPORTED_LANGS = [
  { code: 'en', label: 'English', short: 'EN', flag: '🇺🇸' },
  { code: 'vi', label: 'Tiếng Việt', short: 'VI', flag: '🇻🇳' },
  { code: 'zh', label: '中文', short: '中文', flag: '🇨🇳' },
  { code: 'ja', label: '日本語', short: 'JP', flag: '🇯🇵' },
] as const;

export type AppLanguage = (typeof SUPPORTED_LANGS)[number]['code'];

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      vi: { translation: vi },
      zh: { translation: zh },
      ja: { translation: ja },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'vi', 'zh', 'ja'],
    nonExplicitSupportedLngs: true,
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'huflit.lang',
    },
    react: { useSuspense: false },
  });

i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
});

document.documentElement.lang = i18n.language || 'en';

export default i18n;
