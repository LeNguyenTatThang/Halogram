import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import en from '../locales/en'
import vi from '../locales/vi'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    load: 'languageOnly',
    ns: ['translation', 'navigation', 'profile', 'auth', 'settings', 'chat', 'notifications'],
    defaultNS: 'translation',

    interpolation: {
      escapeValue: false,
    },

    resources: {
      en,
      vi
    }
  })

export default i18n