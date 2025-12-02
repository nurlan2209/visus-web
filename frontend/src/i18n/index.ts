import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import kk from './kk/common.json';
import ru from './ru/common.json';

i18n.use(initReactI18next).init({
  resources: {
    ru: { translation: ru },
    kk: { translation: kk },
  },
  lng: 'ru',
  fallbackLng: 'ru',
  interpolation: {
    escapeValue: false,
  },
  returnObjects: true,
});

export default i18n;
