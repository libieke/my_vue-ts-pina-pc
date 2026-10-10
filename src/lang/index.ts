import { createI18n } from 'vue-i18n';
import zhCN from './zh-CN';
import en from './en';
export const messages = {
  'zh-CN': zhCN,
  en: en
};
const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: localStorage.getItem('locale') || 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages
});
export const setLocale = (locale: 'zh-CN' | 'en') => {
  i18n.global.locale.value = locale;
  localStorage.setItem('locale', locale);
};
export default i18n;