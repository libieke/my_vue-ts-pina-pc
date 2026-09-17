<template>
  <ContentTitle>
    <div class="user-set-page">
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
  </ContentTitle>
</template>

<script setup>
import Search from "../../components/Search/index.vue";
import Pagination from "../../components/Pagination/index.vue";
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

const handlePageChange = ({ page, limit }) => {
  currentPage.value = page;
  pageSize.value = limit;
};

const handleEdit = (row) => {
  console.log("编辑 :>> ", row);
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
.user-set-page {
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
  padding: 16px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

:deep(.pagination-container) {
  padding: 12px 16px 18px;
  background: #fff;
}
</style>
