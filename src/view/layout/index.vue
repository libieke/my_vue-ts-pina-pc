<!-- 布局1 -->
<template>
  <div class="common-layout">
    <el-container>
      <el-header style="padding: 0">
        <headBar></headBar>
      </el-header>
      <el-container>
        <el-aside width="200px">
          <sideBar></sideBar>
        </el-aside>
        <el-main>
          <TagsView></TagsView>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script lang="ts" setup>
import { watch } from "vue";
import { useRoute } from "vue-router";
import useTagsStore from "@/store/tags";
import TagsView from "@/components/TagsView/index.vue";

const route = useRoute();
const tagsStore = useTagsStore();

// 监听路由变化，自动添加标签（去重）
watch(
  () => route.path,
  (path) => {
    if (path === "/login" || path === "/404") return;
    const title = (route.meta && route.meta.title) || "";
    if (title) {
      tagsStore.addView({ path, title: String(title), name: String(route.name || "") });
    }
  },
  { immediate: true }
);
</script>

<style scoped lang="scss">
.common-layout {
  width: 100%;
  height: 100%;

  :deep(.el-container) {
    height: 100%;
  }
}
.el-main {
  padding: 0;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
