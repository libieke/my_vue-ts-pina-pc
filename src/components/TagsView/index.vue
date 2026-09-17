<template>
  <div class="tags-view">
    <div class="tags-scroll">
      <div
        v-for="tag in visitedViews"
        :key="tag.path"
        class="tag-item"
        :class="{ active: isActive(tag.path) }"
        @click="handleClick(tag)"
      >
        <span class="tag-title">{{ tag.title }}</span>
        <!-- 首页标签固定不可关闭 -->
        <el-icon
          v-if="tag.path !== '/home'"
          class="tag-close"
          @click.stop="handleClose(tag)"
        >
          <Close />
        </el-icon>
      </div>
    </div>
    <el-dropdown trigger="click" class="tags-actions" @command="handleCommand">
      <span class="actions-btn">
        <el-icon><ArrowDown /></el-icon>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="closeOthers">关闭其他</el-dropdown-item>
          <el-dropdown-item command="closeAll">关闭所有</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { Close, ArrowDown } from "@element-plus/icons-vue";
import useTagsStore from "@/store/tags";

const route = useRoute();
const router = useRouter();
const tagsStore = useTagsStore();
const { visitedViews } = storeToRefs(tagsStore);

// 判断是否是当前激活的标签
const isActive = (path: string) => route.path === path;

// 点击标签跳转
const handleClick = (tag: { path: string }) => {
  if (route.path !== tag.path) {
    router.push(tag.path);
  }
};

// 关闭标签
const handleClose = (tag: { path: string; title: string }) => {
  tagsStore.delView(tag.path);
  // 如果关闭的是当前页，跳转到最后一个标签
  if (route.path === tag.path) {
    const lastTag = visitedViews.value[visitedViews.value.length - 1];
    router.push(lastTag ? lastTag.path : "/home");
  }
};

// 下拉菜单操作
const handleCommand = (command: string) => {
  if (command === "closeOthers") {
    tagsStore.delOtherViews(route.path);
  } else if (command === "closeAll") {
    tagsStore.delAllViews();
    router.push("/home");
  }
};
</script>

<style lang="scss" scoped>
.tags-view {
  display: flex;
  align-items: center;
  min-height: 52px;
  padding: 10px 12px;
  background: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.04);
  box-sizing: border-box;

  .tags-scroll {
    flex: 1;
    display: flex;
    align-items: center;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }

    .tag-item {
      display: inline-flex;
      align-items: center;
      height: 28px;
      padding: 0 12px;
      margin-right: 8px;
      background: #fff;
      border: 1px solid #dcdfe6;
      border-radius: 14px;
      font-size: 13px;
      color: #606266;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s;
      flex-shrink: 0;

      &:hover {
        color: #409eff;
        border-color: #409eff;
        background: #ecf5ff;
      }

      &.active {
        background: #409eff;
        border-color: #409eff;
        color: #fff;
        box-shadow: 0 2px 6px rgba(64, 158, 255, 0.35);

        .tag-close {
          color: #fff;

          &:hover {
            background: rgba(255, 255, 255, 0.3);
          }
        }
      }

      .tag-close {
        margin-left: 6px;
        font-size: 12px;
        border-radius: 50%;
        transition: all 0.2s;

        &:hover {
          background: rgba(0, 0, 0, 0.1);
        }
      }
    }
  }

  .tags-actions {
    margin-left: 10px;
    padding: 0 10px;
    height: 28px;
    display: flex;
    align-items: center;
    cursor: pointer;
    border: 1px solid #dcdfe6;
    border-radius: 14px;
    color: #606266;
    flex-shrink: 0;
    background: #fff;
    transition: all 0.2s;

    &:hover {
      color: #409eff;
      border-color: #409eff;
      background: #ecf5ff;
    }

    .actions-btn {
      display: flex;
      align-items: center;
    }
  }
}
</style>
