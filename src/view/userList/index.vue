<template>
  <ContentTitle>
    <div class="user-list-page">
      <div class="search-panel">
        <Search
          :fields="searchFields"
          v-model="searchForm"
          @search="handleSearch"
          @reset="handleSearchReset"
        />
      </div>
      <div class="table-panel">
        <CustomTable
          ref="tableList"
          :table-data="pagedTableData"
          :selectShow="false"
          :table-height="appManageHeight"
          @resetFn="handleReset"
          @selection-change="handleSelectionChange"
        >
          <template v-slot:actionColumn>
            <el-table-column label="操作" align="center" width="200">
              <template v-slot="{ row }">
                <span class="pointer" @click="handleEdit(row)">编辑</span>
                <span class="pointer red mr10" @click="handleDel(row)"
                  >删除</span
                >
              </template>
            </el-table-column>
          </template>
        </CustomTable>

        <Pagination
          :total="filteredTableData.data.length"
          v-model:currentPage="currentPage"
          v-model:pageSize="pageSize"
          @pagination="handlePageChange"
        />
      </div>
    </div>

    <Dialog
      v-model="dialogVisible"
      title="编辑用户"
      width="520px"
      @confirm="handleDialogConfirm"
      @cancel="handleDialogCancel"
    >
      <el-form :model="editForm" label-width="90px">
        <el-form-item label="用户：">
          <el-input v-model="editForm.nickName" />
        </el-form-item>
        <el-form-item label="登录账号：">
          <el-input v-model="editForm.username" />
        </el-form-item>
        <el-form-item label="角色：">
          <el-select v-model="editForm.type" style="width: 100%">
            <el-option :value="0" label="管理员" />
            <el-option :value="1" label="普通用户" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属企业：">
          <el-input v-model="editForm.orgName" />
        </el-form-item>
      </el-form>
    </Dialog>
  </ContentTitle>
</template>

<script setup>
import { watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import Search from "../../components/Search/index.vue";
import Pagination from "../../components/Pagination/index.vue";
import Dialog from "../../components/Dialog/index.vue";
import { useDialog, useApprovalStatus, useTable } from "@/hooks";
import { mockUserListApi } from "@/mock/userData";
import { debounce } from "lodash";

const searchFields = [
  {
    prop: "nickName",
    label: "用户",
    type: "input",
  },
  {
    prop: "username",
    label: "登录账号",
    type: "input",
  },
  {
    prop: "type",
    label: "角色",
    type: "select",
    options: [
      { label: "全部", value: "" },
      { label: "管理员", value: 0 },
      { label: "普通用户", value: 1 },
    ],
  },
  {
    prop: "orgName",
    label: "所属企业",
    type: "input",
  },
];

const {
  currentPage,
  pageSize,
  searchForm,
  filteredData,
  pagedData,
  resetPage,
  setData,
} = useTable({
  initialData: [],
  pageSize: 10,
});

const { visible: dialogVisible, open: openDialog, close: closeDialog } = useDialog(false);
const { getStatusLabel } = useApprovalStatus();
const approvalStatusLabel = computed(() => getStatusLabel(1));
const editForm = ref({
  nickName: "",
  username: "",
  type: 0,
  orgName: "",
});

const tableData = reactive({
  data: [],
  titles: [
    {
      title: "用户",
      prop: "nickName",
    },
    {
      title: "登录账号",
      prop: "username",
      isBotton: true,
    },
    {
      title: "角色",
      prop: "type",
      formatter: (row) => {
        return row.type == 0 ? "管理员" : "普通用户";
      },
    },
    {
      title: "所属企业",
      prop: "orgName",
    },
  ],
});

const loadUserList = async () => {
  // 这里先使用 mock 数据；后续接真实接口时直接替换为 request() 调用即可
  const res = await mockUserListApi();
  tableData.data = Array.isArray(res?.data) ? res.data : [];
};

watch(
  () => tableData.data,
  (val) => {
    setData(val);
  },
  { immediate: true, deep: true },
);

onMounted(() => {
  loadUserList();
});

const filteredTableData = computed(() => ({
  ...tableData,
  data: filteredData.value,
}));

const pagedTableData = computed(() => ({
  ...tableData,
  data: pagedData.value,
}));

const handlePageChange = ({ page, limit }) => {
  currentPage.value = page;
  pageSize.value = limit;
};

const handleSearch = () => {
  resetPage();
  console.log("查询条件：", { ...searchForm.value });
};

const handleSearchReset = () => {
  searchForm.value = {
    nickName: "",
    username: "",
    type: "",
    orgName: "",
  };
  resetPage();
};

const handleEdit = (row) => {
  editForm.value = { ...row };
  openDialog();
};

const handleDialogConfirm = () => {
  ElMessageBox.confirm(
    `确定保存对 “${editForm.value?.nickName || editForm.value?.username || '当前用户'}” 的修改吗？`,
    "确认保存",
    {
      confirmButtonText: "确定保存",
      cancelButtonText: "取消",
      type: "warning",
    },
  )
    .then(() => {
      const index = tableData.data.findIndex(
        (item) => item.username === editForm.value.username,
      );
      if (index !== -1) {
        tableData.data[index] = { ...editForm.value };
      }
      ElMessage.success("保存成功");
      closeDialog();
    })
    .catch(() => {
      ElMessage.info("已取消保存");
    });
};

const handleDialogCancel = () => {
  closeDialog();
};

const handleDel = (row) => {
  ElMessageBox.confirm(`确定删除用户 “${row?.nickName || row?.username || '当前用户'}” 吗？`, "确认删除", {
    confirmButtonText: "确定删除",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      const index = tableData.data.findIndex((item) => item.username === row.username);
      if (index !== -1) {
        tableData.data.splice(index, 1);
      }
      ElMessage.success("删除成功");
    })
    .catch(() => {
      ElMessage.info("已取消删除");
    });
};
// 表格内按钮
const handleReset = (row) => {
  ElMessageBox.confirm(`确定重置用户 “${row?.nickName || row?.username || '当前用户'}” 的状态吗？`, "确认重置", {
    confirmButtonText: "确认重置",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      const index = tableData.data.findIndex((item) => item.username === row.username);
      if (index !== -1) {
        tableData.data[index] = {
          ...tableData.data[index],
          type: 1,
        };
      }
      ElMessage.success("重置成功");
    })
    .catch(() => {
      ElMessage.info("已取消重置");
    });
};
// 选中项发生改变
const handleSelectionChange = debounce((val) => {
  console.log("val---", val);
}, 100);

const rightTable = ref();
const appManageHeight = ref(0);

onMounted(() => {
  appManageHeight.value = rightTable.value
    ? rightTable.value.clientHeight - 50
    : 500;
});
</script>

<style lang="scss" scoped>
.user-list-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: calc(100vh - 120px);
  padding: 16px;
  margin: 16px;
  background: #f3f5f7;
  box-sizing: border-box;
}

.search-panel {
  background: #f9fafb;
  border: 1px solid #e8edf3;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.table-panel {
  background: #ffffff;
  border: 1px solid #e8edf3;
  border-radius: 8px;
  overflow: hidden;
  padding: 18px 16px 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

:deep(.pagination-container) {
  padding: 12px 16px 18px;
  background: #fff;
}
</style>
