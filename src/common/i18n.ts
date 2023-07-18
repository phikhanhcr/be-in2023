import i18next, { i18n } from 'i18next';
import i18nMiddleware from 'i18next-http-middleware';
import path from 'path';
import fs from 'fs';

let i18nInstance: i18n;

const LANGUAGES = ['en', 'vi'];

export default {
    LANGUAGES,
    async getI18n(): Promise<i18n> {
        if (!i18nInstance) {
            await i18next.use(i18nMiddleware.LanguageDetector).init({
                preload: LANGUAGES,
                fallbackLng: 'en',
                resources: {
                    en: JSON.parse(fs.readFileSync(path.join(__dirname, '../../locales/en.json'), 'utf8')),
                    vi: JSON.parse(fs.readFileSync(path.join(__dirname, '../../locales/vi.json'), 'utf8')),
                },
                load: 'languageOnly',
            });
            i18nInstance = i18next;
        }
        return i18nInstance;
    },
};
