
<template>
  <div class="sidebar">
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
import useUserStore from '@/store/home'

const userStore = useUserStore()
const router = useRouter().getRoutes();
const routerList = router.filter((v) => {
  const meta = v.meta as { isShow?: boolean; roles?: string[] } | undefined
  if (!meta || !meta.isShow) return false
  if (!meta.roles) return true
  return meta.roles.includes(userStore.role)
});
</script>

<style lang="scss" scoped>
.sidebar {
  height: 100%;
  border-right: none;

  .el-menu {
    height: 100%;
    background: linear-gradient(180deg, #0f172a 0%, #134c66 100%) !important;
    border-right: none;

    :deep(.el-menu-item),
    :deep(.el-sub-menu__title) {
      background-color: transparent !important;
    }

    :deep(.el-menu-item:hover),
    :deep(.el-sub-menu__title:hover) {
      background-color: rgba(255, 255, 255, 0.08) !important;
    }

    :deep(.el-menu-item.is-active) {
      background-color: rgba(64, 158, 255, 0.25) !important;
    }
  }
}
</style>
