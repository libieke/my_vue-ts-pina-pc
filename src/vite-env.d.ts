/// <reference types="vite/client" />
/// <reference types="vite-plugin-svg-icons/client" />
declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const vueComponent: DefineComponent<{}, {}, any>;
  export default vueComponent;
}
declare module 'mockjs'
declare module '@/*';
declare module 'virtual:svg-icons-register';