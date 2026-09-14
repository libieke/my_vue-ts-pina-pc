<template>
  <el-breadcrumb separator="/">
    <!-- <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item> -->
    <el-breadcrumb-item
      v-for="(item, index) in breadcrumbItems"
      :key="index"
      :to="{ path: item.path }"
    >
      {{ item.meta.title }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup>
const route = useRoute();
const breadcrumbItems = ref([]);

watch(
  () => route.matched,
  (matched) => {
    breadcrumbItems.value = matched.filter(
      (item) => item.meta && item.meta.title && item.path !== "/home",
    );
  },
  { immediate: true },
);
</script>

<style lang="scss" scoped>
.el-breadcrumb {
  padding: 4px 10px;
  margin: 10px 10px 0;
  .el-breadcrumb__item {
    padding: 5px 8px;
    margin-right: 14px;
    background-color: #cfe8ef;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background-color: #b3d4dd;
    }
  }
}
::v-deep(.el-breadcrumb__separator) {
  display: none;
}
</style>
