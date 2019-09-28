import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';

import Backend from 'i18next-xhr-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
	.use(Backend)
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		debug: true,
		defaultNS: 'common',
		fallbackLng: 'en',
		ns: ['common', 'header'],

		detection: {
			lookupLocalStorage: 'lang',
			lookupQuerystring: 'lang',
			order: ['querystring', 'localStorage', 'navigator']
		},
		interpolation: {
			escapeValue: false
		},
		react: {
			useSuspense: false
		}
	});

export default i18n;