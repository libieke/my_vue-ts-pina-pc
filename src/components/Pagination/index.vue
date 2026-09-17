<template>
  <div
    v-if="!hidden && (!hideOnSinglePage || total > pageSize)"
    class="pagination-container"
    :style="paginationStyle"
  >
    <el-pagination
      v-bind="$attrs"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :background="background"
      :layout="layout"
      :page-sizes="pageSizes"
      :total="total"
      :small="small"
      :hide-on-single-page="hideOnSinglePage"
      :prev-text="prevText"
      :next-text="nextText"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup lang="ts">
import type { PropType } from "vue";
import { computed } from "vue";

const props = defineProps({
  total: {
    type: Number,
    required: true,
    default: 0,
  },
  currentPage: {
    type: Number,
    default: 1,
  },
  pageSize: {
    type: Number,
    default: 20,
  },
  pageSizes: {
    type: Array as PropType<number[]>,
    default: () => [10, 20, 30, 50],
  },
  layout: {
    type: String,
    default: "total, sizes, prev, pager, next, jumper",
  },
  background: {
    type: Boolean,
    default: true,
  },
  small: {
    type: Boolean,
    default: false,
  },
  hidden: {
    type: Boolean,
    default: false,
  },
  hideOnSinglePage: {
    type: Boolean,
    default: false,
  },
  align: {
    type: String as PropType<"left" | "center" | "right">,
    default: "center",
  },
  page: {
    type: Number,
    default: undefined,
  },
  limit: {
    type: Number,
    default: undefined,
  },
});

const prevText = "<";
const nextText = ">";

const emit = defineEmits([
  "update:currentPage",
  "update:pageSize",
  "update:page",
  "update:limit",
  "change",
  "size-change",
  "current-change",
  "pagination",
]);

const currentPage = computed({
  get: () => props.currentPage ?? props.page ?? 1,
  set: (val: number) => {
    emit("update:currentPage", val);
    emit("update:page", val);
  },
});

const pageSize = computed({
  get: () => props.pageSize ?? props.limit ?? 20,
  set: (val: number) => {
    emit("update:pageSize", val);
    emit("update:limit", val);
  },
});

const alignmentMap = {
  left: "flex-start",
  center: "center",
  right: "flex-end",
} as const;

const paginationStyle = computed(() => ({
  justifyContent: alignmentMap[props.align] || "center",
}));

const handleSizeChange = (val: number) => {
  emit("size-change", val);
  emit("change", { currentPage: currentPage.value, pageSize: val });
  emit("pagination", { page: currentPage.value, limit: val });
};

const handleCurrentChange = (val: number) => {
  emit("current-change", val);
  emit("change", { currentPage: val, pageSize: pageSize.value });
  emit("pagination", { page: val, limit: pageSize.value });
};
</script>

<style lang="scss" scoped>
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px 0 8px;
  background: #fff;
}

:deep(.el-pagination) {
  padding: 2px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  color: #3d4b5a;

  .el-pagination__total {
    margin-right: 12px;
    font-size: 18px;
    color: #3d4b5a;
  }

  .el-pagination__sizes {
    margin-right: 10px;

    .el-select .el-input__wrapper {
      width: 120px;
      height: 38px;
      border: 1px solid #7ecaf9;
      border-radius: 8px;
      box-shadow: none;
      background: #fff;
    }
  }

  .btn-prev,
  .btn-next,
  .el-pager li {
    width: 38px;
    height: 38px;
    line-height: 38px;
    border-radius: 8px;
    margin: 0 4px;
    border: 1px solid #dfeaf5;
    background: #f5f8fb;
    color: #7f8ea3;
  }

  .btn-prev,
  .btn-next {
    border-color: #8bcaf8;
    color: #4d9df9;
    background: #fff;
  }

  .el-pager li {
    background: #edf3f9;
    border-color: #dfeaf5;
  }

  .el-pager li.is-active {
    background: #32a9f7;
    color: #fff;
    border-color: #32a9f7;
  }

  .el-pagination__jump {
    margin-left: 12px;
    color: #3d4b5a;

    .el-input__wrapper {
      width: 64px;
      height: 38px;
      border-radius: 8px;
      border: 1px solid #dfeaf5;
      box-shadow: none;
      background: #fff;
    }
  }
}
</style>
