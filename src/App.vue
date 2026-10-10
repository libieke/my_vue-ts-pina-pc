<template>
  <el-config-provider :locale="elementLocale">
    <div id="app">
      <router-view />
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import zhCn from "element-plus/dist/locale/zh-cn.mjs";
import en from "element-plus/dist/locale/en.mjs";

const { locale } = useI18n();

// ElementPlus 组件内置文案跟随 i18n 语言切换
const elementLocale = computed(() => (locale.value === "zh-CN" ? zhCn : en));
</script>

<style>
#app {
  width: 100vw;
  height: 100vh;
  background-color: #fff;
  overflow: hidden;
  -webkit-user-select: none; /* Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE/Edge */
  user-select: none;
}
</style>
