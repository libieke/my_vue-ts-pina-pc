declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const vueComponent: DefineComponent<{}, {}, any>;
  export default vueComponent;
}
declare module 'mockjs';
declare module '@/*';
declare module 'virtual:svg-icons-register';
declare module 'element-plus/dist/locale/zh-cn.mjs';
declare module 'element-plus/dist/locale/en.mjs';