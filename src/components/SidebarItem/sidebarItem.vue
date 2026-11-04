
<template>
  <template v-for="item in props.routerList" :key="item.path">
    <el-sub-menu :index="item.path" v-if="item.children && item.children.length > 0">
      <template #title v-if="item.meta.icon">
        <el-icon><svg-icon :name="item.meta.icon" :fill="item.meta.iconColor" /></el-icon>
        <span>{{ $t(item.meta.title || '') }}</span>
      </template>
      <template #title v-else>{{ $t(item.meta.title || '') }}</template>
      <sidebarItem :routerList="( item.children as CustomRouteRecordRaw[])" />
    </el-sub-menu>
    <el-menu-item :index="item.path" v-else>
      <template v-if="item.meta.icon">
        <el-icon><svg-icon :name="item.meta.icon" :fill="item.meta.iconColor" /></el-icon>
        <span>{{ $t(item.meta.title || '') }}</span>
      </template>
      <template v-else>
        {{ $t(item.meta.title || '') }}
      </template>
    </el-menu-item>
  </template>
</template>

<script setup lang="ts">
import { RouteRecordRaw } from "vue-router";
type CustomRouteRecordRaw = RouteRecordRaw & {
  meta: {
    isShow?: boolean;
    title?: string;
  };
};
const props = defineProps({
  routerList: {
    type: Array as () => CustomRouteRecordRaw[],
    required: true,
  },
});
</script>
<style scoped lang="scss">
.is-active {
  background: #409eff;
  font-weight: 700;
}

.el-menu-item {
  &:hover {
    color: #fff;
    font-weight: 700;
  }
}

.el-menu--collapse {
  .el-menu-item {
    justify-content: center;
  }
}

.el-menu--horizontal {
  .el-menu-item.is-active {
    background-color: transparent !important;
    border-bottom: 2px solid #409eff !important;

    .el-icon,
    span {
      color: #409eff !important;
    }
  }

  .el-sub-menu.is-active {
    .el-sub-menu__title {
      border: 0 !important;
    }

    .el-icon,
    span {
      color: #409eff !important;
    }
  }
}
</style>
