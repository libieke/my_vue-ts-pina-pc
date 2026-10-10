<template>
  <ContentTitle>
    <div class="page-shell">
      <div class="page-header">
        <div>
          <h2>{{ $t('menu.orderManage') }}</h2>
        </div>
        <el-button type="primary">{{ $t('order.create') }}</el-button>
      </div>

      <div class="stat-grid">
        <div v-for="item in stats" :key="item.label" class="stat-card">
          <div class="stat-label">{{ item.label }}</div>
          <div class="stat-value">{{ item.value }}</div>
          <div class="stat-trend" :class="item.trend >= 0 ? 'up' : 'down'">
            {{ item.trend >= 0 ? "+" : "" }}{{ item.trend }}%
          </div>
        </div>
      </div>

      <div class="content-card">
        <div class="content-header">
          <h3>{{ $t('order.listTitle') }}</h3>
          <el-input
            v-model="keyword"
            :placeholder="$t('order.searchPlaceholder')"
            clearable
            style="width: 260px"
          />
        </div>

        <el-table :data="filteredList" stripe border style="width: 100%">
          <el-table-column prop="orderNo" :label="$t('order.orderNo')" width="160" />
          <el-table-column prop="customer" :label="$t('order.customer')" width="180" />
          <el-table-column prop="amount" :label="$t('order.amount')" width="120" />
          <el-table-column prop="status" :label="$t('order.status')" width="120">
            <template #default="scope">
              <el-tag :type="statusType(scope.status)">{{
                statusText(scope.status)
              }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="time" :label="$t('order.time')" />
        </el-table>
      </div>
    </div>
  </ContentTitle>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const keyword = ref("");

// 统计卡片（computed 包裹，切换语言自动更新）
const stats = computed(() => [
  { label: t("order.statTotal"), value: "1,256", trend: 12.4 },
  { label: t("order.statPending"), value: "128", trend: 4.1 },
  { label: t("order.statShipped"), value: "742", trend: -2.3 },
  { label: t("order.statCompleted"), value: "986", trend: 8.7 },
]);

const list = ref([
  {
    orderNo: "OD-20240601",
    customer: "张三",
    amount: "¥2,300",
    status: "pending",
    time: "2024-06-01 09:30",
  },
  {
    orderNo: "OD-20240602",
    customer: "李四",
    amount: "¥1,120",
    status: "shipped",
    time: "2024-06-02 12:15",
  },
  {
    orderNo: "OD-20240603",
    customer: "王五",
    amount: "¥3,980",
    status: "completed",
    time: "2024-06-03 18:00",
  },
  {
    orderNo: "OD-20240604",
    customer: "赵六",
    amount: "¥840",
    status: "pending",
    time: "2024-06-04 08:40",
  },
  {
    orderNo: "OD-20240605",
    customer: "孙七",
    amount: "¥4,520",
    status: "completed",
    time: "2024-06-05 15:20",
  },
]);

// 状态编码 -> i18n key
const statusTextMap: Record<string, string> = {
  pending: "order.statusPending",
  shipped: "order.statusShipped",
  completed: "order.statusCompleted",
};

const statusText = (status: string) => t(statusTextMap[status] || status);

const statusType = (status: string) => {
  if (status === "completed") return "success";
  if (status === "shipped") return "primary";
  return "warning";
};

const filteredList = computed(() => {
  const value = keyword.value.trim().toLowerCase();
  if (!value) return list.value;
  return list.value.filter((item) => {
    return `${item.orderNo} ${item.customer}`.toLowerCase().includes(value);
  });
});
</script>

<style scoped lang="scss">
.page-shell {
  padding: 20px;
  background: #f5f7fb;
  min-height: calc(100vh - 90px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background-color: #fff;
  padding: 16px;
  border-radius: 12px;
}

.eyebrow {
  margin: 0 0 6px;
  color: #8a93a6;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h2 {
  margin: 0;
  font-size: 28px;
  color: #1f2430;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  border-radius: 14px;
  padding: 18px 20px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.04);
}

.stat-label {
  color: #8a93a6;
  font-size: 13px;
}

.stat-value {
  margin-top: 10px;
  font-size: 30px;
  font-weight: 700;
  color: #1d2129;
}

.stat-trend {
  margin-top: 10px;
  font-size: 13px;
  font-weight: 600;

  &.up {
    color: #2bb673;
  }
  &.down {
    color: #ee4d4d;
  }
}

.content-card {
  background: #fff;
  border-radius: 14px;
  padding: 18px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.04);
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.content-header h3 {
  margin: 0;
  font-size: 18px;
  color: #1f2430;
}
</style>
