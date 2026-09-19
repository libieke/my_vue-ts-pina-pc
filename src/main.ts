import { createApp } from 'vue'
import './style.scss';
import 'element-plus/dist/index.css'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import 'virtual:svg-icons-register'
import router from "@/routes/index";
import App from './App.vue'
import { createPinia } from 'pinia'
const pinia = createPinia()
import ElementPlus from 'element-plus'


const app = createApp(App)


app.use(ElementPlus)
app.use(router)
app.use(pinia)
app.mount('#app')