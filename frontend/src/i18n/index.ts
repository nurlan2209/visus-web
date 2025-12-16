import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import kk from './kk/common.json';
import ru from './ru/common.json';

type SupportedLanguage = 'ru' | 'kk';

const LANGUAGE_STORAGE_KEY = 'visus-language';
const LANGUAGE_TTL_MS = 10 * 60 * 1000; // keep the chosen language for ~10 minutes

interface StoredLanguage {
  value: SupportedLanguage;
  timestamp: number;
}

const isSupportedLanguage = (lng: string): lng is SupportedLanguage => lng === 'ru' || lng === 'kk';

const getStoredLanguage = (): SupportedLanguage | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawValue = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    const data = JSON.parse(rawValue) as StoredLanguage;
    const isFresh = Date.now() - data.timestamp < LANGUAGE_TTL_MS;

    if (isFresh && isSupportedLanguage(data.value)) {
      return data.value;
    }
  } catch (error) {
    // ignore malformed cache entries
  }

  return null;
};

const persistLanguage = (lng: SupportedLanguage) => {
  if (typeof window === 'undefined') {
    return;
  }

  const payload: StoredLanguage = {
    value: lng,
    timestamp: Date.now(),
  };

  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, JSON.stringify(payload));
};

const initialLanguage = getStoredLanguage() ?? 'ru';

i18n.use(initReactI18next).init({
  resources: {
    ru: { translation: ru },
    kk: { translation: kk },
  },
  lng: initialLanguage,
  fallbackLng: 'ru',
  interpolation: {
    escapeValue: false,
  },
  returnObjects: true,
});

if (typeof window !== 'undefined') {
  i18n.on('languageChanged', (lng) => {
    if (isSupportedLanguage(lng)) {
      persistLanguage(lng);
    }
  });
}

export default i18n;
