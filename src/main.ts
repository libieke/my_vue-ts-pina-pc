import { createApp } from 'vue';
import './style.scss';
import 'element-plus/dist/index.css';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import 'virtual:svg-icons-register';
import router from "@/routes/index";
import App from './App.vue';
import { createPinia } from 'pinia';
const pinia = createPinia();
import ElementPlus from 'element-plus';
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
import i18n from '@/lang';
const app = createApp(App);
app.use(ElementPlus, {
  locale: zhCn
});
app.use(i18n);
app.use(router);
app.use(pinia);
app.mount('#app');