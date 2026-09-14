<template>
  <div class="sidebar">
    <!-- 布局2使用 -->
    <!-- <div class="sidebar-logo flex-center">
      <svg-icon icon-class="logo" />
      <span>VitalityAdmin</span>
    </div> -->
    <el-menu
      active-text-color="#fff"
      background-color="#134C66"
      :default-active="$route.path"
      text-color="#fff"
      :unique-opened="true"
      router
    >
      <SidebarItem :routerList="routerList" />
    </el-menu>
  </div>
</template>

<script lang="ts" setup>
const router = useRouter().getRoutes();
const routerList = router.filter((v) => v.meta && v.meta.isShow);
</script>

<style lang="scss" scoped>
.sidebar {
  height: 100%;
  border-right: none;

  .el-menu {
    height: 100%;
    // 侧边栏渐变背景（从上到下：深蓝 → 蓝绿）
    background: linear-gradient(180deg, #0f172a 0%, #134c66 100%) !important;
    border-right: none;

    // 覆盖菜单项的内联背景色，使其透明以显示渐变
    :deep(.el-menu-item),
    :deep(.el-sub-menu__title) {
      background-color: transparent !important;
    }

    // hover 时的背景色
    :deep(.el-menu-item:hover),
    :deep(.el-sub-menu__title:hover) {
      background-color: rgba(255, 255, 255, 0.08) !important;
    }

    // 激活项的背景色
    :deep(.el-menu-item.is-active) {
      background-color: rgba(64, 158, 255, 0.25) !important;
    }
  }
}
</style>
