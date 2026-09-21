<template>
  <div class="page-shell">
    <div class="page-header">
      <div>
        <h2>订单管理</h2>
      </div>
      <el-button type="primary">新建订单</el-button>
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
        <h3>订单列表</h3>
        <el-input
          v-model="keyword"
          placeholder="搜索订单编号/客户名称"
          clearable
          style="width: 260px"
        />
      </div>

      <el-table :data="filteredList" stripe border style="width: 100%">
        <el-table-column prop="orderNo" label="订单编号" width="160" />
        <el-table-column prop="customer" label="客户" width="180" />
        <el-table-column prop="amount" label="金额" width="120" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag :type="statusType(scope.status)">{{ scope.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="time" label="下单时间" />
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

const keyword = ref("");

const stats = [
  { label: "总订单", value: "1,256", trend: 12.4 },
  { label: "待付款", value: "128", trend: 4.1 },
  { label: "已发货", value: "742", trend: -2.3 },
  { label: "已完成", value: "986", trend: 8.7 },
];

const list = ref([
  {
    orderNo: "OD-20240601",
    customer: "张三",
    amount: "¥2,300",
    status: "待支付",
    time: "2024-06-01 09:30",
  },
  {
    orderNo: "OD-20240602",
    customer: "李四",
    amount: "¥1,120",
    status: "已发货",
    time: "2024-06-02 12:15",
  },
  {
    orderNo: "OD-20240603",
    customer: "王五",
    amount: "¥3,980",
    status: "已完成",
    time: "2024-06-03 18:00",
  },
  {
    orderNo: "OD-20240604",
    customer: "赵六",
    amount: "¥840",
    status: "待支付",
    time: "2024-06-04 08:40",
  },
  {
    orderNo: "OD-20240605",
    customer: "孙七",
    amount: "¥4,520",
    status: "已完成",
    time: "2024-06-05 15:20",
  },
]);

const statusType = (status: string) => {
  if (status === "已完成") return "success";
  if (status === "已发货") return "primary";
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
