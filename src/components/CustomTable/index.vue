
<template>
  <el-table
    ref="refTable"
    :data="safeTableData"
    :style="{ width: '100%', ...cellStyle }"
    :header-cell-style="headerCellStyle"
    :cell-style="cellStyle"
    :row-style="{ height: '32px', padding: '0' }"
    border
    :max-height="tableHeight"
    @selection-change="handleSelectionChange"
    @select="handleSelectChange"
    @select-all="handleSelectAllChange"
  >
    <el-table-column v-if="selectShow" type="selection" width="55" />
    <el-table-column v-if="sort" label="Top" align="center" width="100">
      <template v-slot="scope">
        <slot>{{ scope.$index + 1 }}</slot>
      </template>
    </el-table-column>
    <el-table-column
      v-for="item in safeTitles"
      :key="item.prop"
      :prop="item.prop"
      :label="item.title"
      :width="item.width"
      show-overflow-tooltip
    >
      <template v-if="item.isBotton" v-slot="scope">
        <div style="display: flex; justify-content: space-between">
          <span style="padding-top: 7px">{{ scope.row[scope.column.property] }} </span>
          <div class="inner-btn" @click="resetFn(scope.row)">{{ $t('common.reset') }}</div>
        </div>
      </template>
      <template v-else v-slot="scope">
        <span v-if="item.formatter"
          >{{
            item.formatter(
              scope.row,
              scope.column,
              scope.row[scope.column.property],
              scope.$index
            )
          }}
        </span>
        <span v-else
          >{{
            scope.row[scope.column.property] ? scope.row[scope.column.property] : "- -"
          }}
        </span>
      </template>
    </el-table-column>
    <slot name="actionColumn" />
  </el-table>
</template>
<script setup>
import { color } from "echarts";

let props = defineProps({
  tableData: {
    type: Object,
    default: () => {
      return { data: [], titles: [] };
    },
  },
  tableHeight: {
    type: Number,
    default: 500,
  },
  headerCellStyle: {
    type: Object,
    default: () => {
      return { color: "#232932", background: "#fff", height: "40px" };
    },
  },
  cellStyle: {
    type: Object,
    default: () => {
      return { color: "#646a73", background: "#fff" };
    },
  },
  selectShow: {
    type: Boolean,
    default: true,
  },
  sort: {
    type: Boolean,
    default: false,
  },
});
let emit = defineEmits([
  "selectionChange",
  "delete",
  "selectChange",
  "selectAllChange",
  "resetFn",
]);

const safeTableData = computed(() => {
  return Array.isArray(props.tableData?.data) ? props.tableData.data : [];
});

const safeTitles = computed(() => {
  return Array.isArray(props.tableData?.titles) ? props.tableData.titles : [];
});

const handleSelectionChange = (selection) => {
  emit("selectionChange", selection);
};

const handleSelectChange = (selection, row) => {
  emit("selectChange", selection, row);
};

const handleSelectAllChange = (selection) => {
  emit("selectAllChange", selection);
};

const resetFn = (row) => {
  emit("resetFn", row);
};
const refTable = ref();
const handleEcho = (echoData) => {
  clearSelection();
  if (echoData && echoData.length) {
    for (const row of echoData) {
      refTable.value.toggleRowSelection(row, true);
    }
  }
};
const clearSelection = () => {
  refTable.value.clearSelection();
};
defineExpose({ handleEcho, clearSelection });
</script>

<style lang="scss" scoped>
.inner-btn {
  width: 80px;
  height: 30px;
  cursor: pointer;
  text-align: center;
  line-height: 30px;
  color: #00d8f4;
  border-radius: 4px 4px 4px 4px;
  border: 1px solid #00d8f4;
  &:hover {
    background-color: #888585;
    color: #fff;
  }
}

::v-deep(.el-table__cell) {
  padding: 4px 0 !important;
}

::v-deep(.el-table__body tr:hover > td) {
  background-color: #e5e5e5 !important;
}

::v-deep(.el-table__body-wrapper) {
  &::-webkit-scrollbar {
    width: 0 !important;
    background: transparent;
    border: none;
  }

  &::-webkit-scrollbar-track {
    border: none !important;
  }
  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
}
</style>
