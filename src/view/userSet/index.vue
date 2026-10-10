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
            <el-table-column :label="$t('common.operation')" align="center" width="200">
              <template v-slot="{ row }">
                <span class="pointer" @click="handleEdit(row)">{{ $t('user.edit') }}</span>
                <span class="pointer red mr10" @click="handleDel(row)"
                  >{{ $t('user.delete') }}</span
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
      :title="$t('user.editUserSet')"
      width="520px"
      @confirm="handleDialogConfirm"
      @cancel="handleDialogCancel"
    >
      <el-form :model="editForm" label-width="90px">
        <el-form-item :label="$t('user.user')">
          <el-input v-model="editForm.nickName" />
        </el-form-item>
        <el-form-item :label="$t('user.account')">
          <el-input v-model="editForm.username" />
        </el-form-item>
        <el-form-item :label="$t('user.role')">
          <el-select v-model="editForm.type" style="width: 100%">
            <el-option :value="0" :label="$t('user.roleAdmin')" />
            <el-option :value="1" :label="$t('user.roleUser')" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('user.org')">
          <el-input v-model="editForm.orgName" />
        </el-form-item>
      </el-form>
    </Dialog>
  </ContentTitle>
</template>

<script setup>
import { ElMessage, ElMessageBox } from "element-plus";
import Search from "../../components/Search/index.vue";
import Pagination from "../../components/Pagination/index.vue";
import Dialog from "../../components/Dialog/index.vue";
import { mockUserSettingApi } from "@/mock/userData";
import { debounce } from "lodash";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

// 筛选字段使用 computed 包裹，切换语言时自动更新
const searchFields = computed(() => [
  {
    prop: "nickName",
    label: t("user.user"),
    type: "input",
  },
  {
    prop: "username",
    label: t("user.account"),
    type: "input",
  },
  {
    prop: "type",
    label: t("user.role"),
    type: "select",
    options: [
      { label: t("user.all"), value: "" },
      { label: t("user.roleAdmin"), value: 0 },
      { label: t("user.roleUser"), value: 1 },
    ],
  },
  {
    prop: "orgName",
    label: t("user.org"),
    type: "input",
  },
]);

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
  data: [],
});

// 表头使用 computed 包裹，切换语言时自动更新
const tableTitles = computed(() => [
  {
    title: t("user.user"),
    prop: "nickName",
  },
  {
    title: t("user.account"),
    prop: "username",
    isBotton: true,
  },
  {
    title: t("user.role"),
    prop: "type",
    formatter: (row) => {
      return row.type == 0 ? t("user.roleAdmin") : t("user.roleUser");
    },
  },
  {
    title: t("user.org"),
    prop: "orgName",
  },
]);

const loadUserSetList = async () => {
  // 这里先使用 mock 数据；后续接真实接口时直接替换为 request() 调用即可
  const res = await mockUserSettingApi();
  tableData.data = Array.isArray(res?.data) ? res.data : [];
};

onMounted(() => {
  loadUserSetList();
});

const filteredTableData = computed(() => {
  // 过滤列表时对 data 做安全兜底，避免空数据直接触发 filter 报错
  const sourceData = Array.isArray(tableData?.data) ? tableData.data : [];
  const filterData = sourceData.filter((row) => {
    const nickName = String(row?.nickName || "");
    const username = String(row?.username || "");
    const orgName = String(row?.orgName || "");
    const type = Number(row?.type);

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
    titles: tableTitles.value,
    data: filterData,
  };
});

const pagedTableData = computed(() => {
  // 分页切片也必须防止 undefined，空数据时返回 []，避免白屏
  const sourceData = Array.isArray(filteredTableData.value?.data)
    ? filteredTableData.value.data
    : [];
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;

  return {
    ...tableData,
    titles: tableTitles.value,
    data: sourceData.slice(start, end),
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
  editForm.value = { ...row };
  dialogVisible.value = true;
};

const handleDialogConfirm = () => {
  ElMessageBox.confirm(
    t("user.saveConfirmMsg", {
      name:
        editForm.value?.nickName ||
        editForm.value?.username ||
        t("user.currentUser"),
    }),
    t("user.saveConfirmTitle"),
    {
      confirmButtonText: t("user.saveBtn"),
      cancelButtonText: t("common.cancel"),
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
      ElMessage.success(t("user.saveSuccess"));
      dialogVisible.value = false;
    })
    .catch(() => {
      ElMessage.info(t("user.saveCancelled"));
    });
};

const handleDialogCancel = () => {
  dialogVisible.value = false;
};

const handleDel = (row) => {
  ElMessageBox.confirm(
    t("user.deleteConfirmMsg", {
      name: row?.nickName || row?.username || t("user.currentUser"),
    }),
    t("user.deleteConfirmTitle"),
    {
      confirmButtonText: t("user.deleteBtn"),
      cancelButtonText: t("common.cancel"),
      type: "warning",
    },
  )
    .then(() => {
      const index = tableData.data.findIndex((item) => item.username === row.username);
      if (index !== -1) {
        tableData.data.splice(index, 1);
      }
      ElMessage.success(t("user.deleteSuccess"));
    })
    .catch(() => {
      ElMessage.info(t("user.deleteCancelled"));
    });
};
// 表格内按钮
const handleReset = (row) => {
  ElMessageBox.confirm(
    t("user.resetConfirmMsg", {
      name: row?.nickName || row?.username || t("user.currentUser"),
    }),
    t("user.resetConfirmTitle"),
    {
      confirmButtonText: t("user.resetBtn"),
      cancelButtonText: t("common.cancel"),
      type: "warning",
    },
  )
    .then(() => {
      const index = tableData.data.findIndex((item) => item.username === row.username);
      if (index !== -1) {
        tableData.data[index] = {
          ...tableData.data[index],
          type: 1,
        };
      }
      ElMessage.success(t("user.resetSuccess"));
    })
    .catch(() => {
      ElMessage.info(t("user.resetCancelled"));
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
