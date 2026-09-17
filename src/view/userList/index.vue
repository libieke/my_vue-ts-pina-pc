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
import Search from "../../components/Search/index.vue";
import Pagination from "../../components/Pagination/index.vue";
import Dialog from "../../components/Dialog/index.vue";
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

const searchForm = ref({
  nickName: "",
  username: "",
  type: "",
  orgName: "",
});

const currentPage = ref(1);
const pageSize = ref(10);
const dialogVisible = ref(false);
const editForm = ref({
  nickName: "",
  username: "",
  type: 0,
  orgName: "",
});

const tableData = reactive({
  data: [
    {
      nickName: "张三",
      username: "zhangsan",
      type: 0,
      orgName: "华为",
    },
    {
      nickName: "李四",
      username: "lisi",
      type: 1,
      orgName: "腾讯",
    },
    {
      nickName: "王五",
      username: "wangsu",
      type: 1,
      orgName: "阿里",
    },
    {
      nickName: "赵六",
      username: "zhaoliu",
      type: 0,
      orgName: "京东",
    },
  ],
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

const filteredTableData = computed(() => {
  const filterData = tableData.data.filter((row) => {
    const nickName = String(row.nickName || "");
    const username = String(row.username || "");
    const orgName = String(row.orgName || "");
    const type = Number(row.type);

    const matchNickName =
      !searchForm.value.nickName ||
      nickName.includes(searchForm.value.nickName);
    const matchUsername =
      !searchForm.value.username ||
      username.includes(searchForm.value.username);
    const matchType =
      searchForm.value.type === "" ||
      searchForm.value.type === null ||
      searchForm.value.type === undefined
        ? true
        : type === Number(searchForm.value.type);
    const matchOrgName =
      !searchForm.value.orgName || orgName.includes(searchForm.value.orgName);

    return matchNickName && matchUsername && matchType && matchOrgName;
  });

  return {
    ...tableData,
    data: filterData,
  };
});

const pagedTableData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;

  return {
    ...tableData,
    data: filteredTableData.value.data.slice(start, end),
  };
});

const handlePageChange = ({ page, limit }) => {
  currentPage.value = page;
  pageSize.value = limit;
};

const handleSearch = () => {
  currentPage.value = 1;
  console.log("查询条件：", { ...searchForm.value });
};

const handleSearchReset = () => {
  searchForm.value = {
    nickName: "",
    username: "",
    type: "",
    orgName: "",
  };
  currentPage.value = 1;
};

const handleEdit = (row) => {
  editForm.value = { ...row };
  dialogVisible.value = true;
};

const handleDialogConfirm = () => {
  const index = tableData.data.findIndex((item) => item.username === editForm.value.username);
  if (index !== -1) {
    tableData.data[index] = { ...editForm.value };
  }
  dialogVisible.value = false;
};

const handleDialogCancel = () => {
  dialogVisible.value = false;
};

const handleDel = (row) => {
  console.log("del :>> ", row);
};
// 表格内按钮
const handleReset = (row) => {
  console.log("resetFn :>> ", row);
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
  padding-top: 18px;
  padding-bottom: 18px;
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
