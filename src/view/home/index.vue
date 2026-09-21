<template>
  <div class="home-container">
    <!-- 欢迎横幅 -->
    <div class="welcome-banner">
      <div class="welcome-left">
        <h2 class="welcome-title">{{ greeting }}，欢迎回来 👋</h2>
        <p class="welcome-desc">今天是 {{ currentDate }}，祝您工作愉快！</p>
      </div>
      <div class="welcome-right">
        <div class="weather-card">
          <el-icon class="weather-icon"><Sunny /></el-icon>
          <span class="weather-text">晴 26°C</span>
        </div>
      </div>
    </div>

    <!-- 数据统计卡片 -->
    <div class="stat-row">
      <div
        v-for="(item, index) in statList"
        :key="index"
        class="stat-card"
        :class="item.bgClass"
      >
        <div class="stat-icon">
          <el-icon :size="28"><component :is="item.icon" /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ item.value }}</div>
          <div class="stat-label-row">
            <span class="stat-label">{{ item.label }}</span>
            <span v-if="item.label === '总用户数'" class="stat-live-tag">
              {{ item.liveText }}
            </span>
          </div>
        </div>
        <div class="stat-trend" :class="item.trend > 0 ? 'up' : 'down'">
          <el-icon
            ><CaretTop v-if="item.trend > 0" /><CaretBottom v-else
          /></el-icon>
          <span>{{ Math.abs(item.trend) }}%</span>
        </div>
      </div>
    </div>

    <!-- 快捷入口 -->
    <div class="section-card">
      <div class="section-header">
        <h3 class="section-title">快捷入口</h3>
        <el-link type="primary" :underline="false">全部应用</el-link>
      </div>
      <div class="quick-actions">
        <div
          v-for="(item, index) in quickActions"
          :key="index"
          class="quick-item"
          @click="handleQuickAction(item)"
        >
          <div class="quick-icon" :style="{ background: item.bgColor }">
            <el-icon :size="22" color="#fff"
              ><component :is="item.icon"
            /></el-icon>
          </div>
          <span class="quick-label">{{ item.label }}</span>
        </div>
      </div>
    </div>

    <!-- 富文本示例 -->
    <div class="section-card rich-text-demo">
      <div class="section-header">
        <h3 class="section-title">富文本编辑器</h3>
      </div>
      <RichText
        v-model="richTextContent"
        :height="220"
        :max-length="500"
        :show-image-upload="true"
        placeholder="请输入公告内容..."
      />
      <div class="preview-box">
        <div class="preview-title">内容预览</div>
        <div v-html="richTextContent" class="preview-content"></div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="chart-row">
      <div class="section-card chart-card">
        <div class="section-header">
          <h3 class="section-title">销售趋势</h3>
          <el-radio-group v-model="chartPeriod" size="small">
            <el-radio-button value="week">本周</el-radio-button>
            <el-radio-button value="month">本月</el-radio-button>
            <el-radio-button value="year">本年</el-radio-button>
          </el-radio-group>
        </div>
        <div class="chart-wrapper">
          <ChartBar />
        </div>
      </div>
      <div class="section-card chart-card">
        <div class="section-header">
          <h3 class="section-title">访问来源</h3>
        </div>
        <div class="chart-wrapper">
          <PieChart />
        </div>
      </div>
    </div>

    <!-- 底部三栏 -->
    <div class="bottom-row">
      <!-- 通知公告 -->
      <div class="section-card">
        <div class="section-header">
          <h3 class="section-title">
            <el-icon class="title-icon"><Bell /></el-icon>
            通知公告
          </h3>
          <el-link type="primary" :underline="false">更多</el-link>
        </div>
        <ul class="notice-list">
          <li
            v-for="(item, index) in noticeList"
            :key="index"
            class="notice-item"
          >
            <el-tag
              :type="item.type"
              size="small"
              effect="light"
              class="notice-tag"
              >{{ item.tag }}</el-tag
            >
            <span class="notice-title">{{ item.title }}</span>
            <span class="notice-date">{{ item.date }}</span>
          </li>
        </ul>
      </div>

      <!-- 待办事项 -->
      <div class="section-card">
        <div class="section-header">
          <h3 class="section-title">
            <el-icon class="title-icon"><List /></el-icon>
            待办事项
          </h3>
          <el-link type="primary" :underline="false">全部</el-link>
        </div>
        <ul class="todo-list">
          <li v-for="(item, index) in todoList" :key="index" class="todo-item">
            <el-checkbox v-model="item.done" />
            <span class="todo-text" :class="{ done: item.done }">{{
              item.text
            }}</span>
            <span class="todo-priority" :class="item.priority">{{
              item.priorityText
            }}</span>
          </li>
        </ul>
      </div>

      <!-- 热门排行 -->
      <div class="section-card">
        <div class="section-header">
          <h3 class="section-title">
            <el-icon class="title-icon"><Trophy /></el-icon>
            热门排行
          </h3>
          <el-link type="primary" :underline="false">更多</el-link>
        </div>
        <ul class="rank-list">
          <li v-for="(item, index) in rankList" :key="index" class="rank-item">
            <span class="rank-num" :class="{ top: index < 3 }">{{
              index + 1
            }}</span>
            <span class="rank-name">{{ item.name }}</span>
            <span class="rank-value">{{ item.value }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  User,
  View,
  ShoppingCart,
  Money,
  Sunny,
  CaretTop,
  CaretBottom,
  Bell,
  List,
  Trophy,
  Setting,
  UserFilled,
  Document,
  DataAnalysis,
  Message,
  Folder,
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import ChartBar from "@/components/ChartBar/index.vue";
import PieChart from "@/components/PieChart/index.vue";
import RichText from "@/components/RichText/index.vue";
import {
  buildDashboardSubscribeMessage,
  DASHBOARD_WS_URL,
  parseDashboardMessage,
  type DashboardStats,
} from "@/api/websocket";
import { useWebSocket } from "@/hooks";

const router = useRouter();

const richTextContent = ref(
  "<p>欢迎使用 <strong>通用富文本组件</strong>，支持 <em>加粗</em>、<u>下划线</u>、列表和链接等基础编辑能力。</p>",
);

// 问候语
const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 6) return "凌晨好";
  if (hour < 9) return "早上好";
  if (hour < 12) return "上午好";
  if (hour < 14) return "中午好";
  if (hour < 18) return "下午好";
  return "晚上好";
});

// 当前日期
const currentDate = computed(() => {
  const now = new Date();
  const weekDays = ["日", "一", "二", "三", "四", "五", "六"];
  return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 星期${weekDays[now.getDay()]}`;
});

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);

const dashboardStats = reactive<DashboardStats>({
  totalUsers: 12580,
  todayVisitors: 3842,
  orderTotal: 1256,
  totalSales: 98560,
});

const socketStatus = ref("离线");

const { status, send } = useWebSocket({
  url: DASHBOARD_WS_URL,
  autoConnect: true,
  reconnect: true,
  reconnectInterval: 15000,
  onOpen: () => {
    socketStatus.value = "实时";
    send(buildDashboardSubscribeMessage());
  },
  onMessage: (event) => {
    const nextStats = parseDashboardMessage(event.data);
    if (!nextStats) return;

    Object.assign(dashboardStats, nextStats);
    socketStatus.value = "实时";
  },
  onClose: () => {
    socketStatus.value = "离线";
  },
  onError: () => {
    socketStatus.value = "离线";
  },
});

const totalUsersLabel = computed(() => formatNumber(dashboardStats.totalUsers));
const todayVisitorsLabel = computed(() =>
  formatNumber(dashboardStats.todayVisitors),
);
const orderTotalLabel = computed(() => formatNumber(dashboardStats.orderTotal));
const totalSalesLabel = computed(
  () => `¥${formatNumber(dashboardStats.totalSales)}`,
);
const socketStatusText = computed(() =>
  status.value === "open" ? "实时" : socketStatus.value,
);

// 统计卡片数据
const statList = computed(() => [
  {
    icon: markRaw(User),
    label: "总用户数",
    value: totalUsersLabel.value,
    liveText: socketStatusText.value,
    trend: 12.5,
    bgClass: "bg-blue",
  },
  {
    icon: markRaw(View),
    label: "今日访问",
    value: todayVisitorsLabel.value,
    liveText: socketStatusText.value,
    trend: 8.3,
    bgClass: "bg-green",
  },
  {
    icon: markRaw(ShoppingCart),
    label: "订单总数",
    value: orderTotalLabel.value,
    liveText: socketStatusText.value,
    trend: -3.2,
    bgClass: "bg-orange",
  },
  {
    icon: markRaw(Money),
    label: "销售额",
    value: totalSalesLabel.value,
    liveText: socketStatusText.value,
    trend: 15.7,
    bgClass: "bg-violet",
  },
]);

// 快捷入口
const quickActions = ref([
  {
    label: "用户管理",
    icon: markRaw(UserFilled),
    bgColor: "#409EFF",
    path: "/userList",
  },
  {
    label: "订单管理",
    icon: markRaw(ShoppingCart),
    bgColor: "#67C23A",
    path: "/orderManage",
  },
  {
    label: "数据分析",
    icon: markRaw(DataAnalysis),
    bgColor: "#E6A23C",
    path: "/dataAnalysis",
  },
  {
    label: "消息通知",
    icon: markRaw(Message),
    bgColor: "#F56C6C",
    path: "/messageNotice",
  },
  {
    label: "文档中心",
    icon: markRaw(Document),
    bgColor: "#909399",
    path: "/docCenter",
  },
  {
    label: "文件管理",
    icon: markRaw(Folder),
    bgColor: "#155EE8",
    path: "/fileManage",
  },
  {
    label: "系统设置",
    icon: markRaw(Setting),
    bgColor: "#7052F8",
    path: "/userSet",
  },
  { label: "更多功能", icon: markRaw(Setting), bgColor: "#999999", path: "" },
]);

const handleQuickAction = (item: any) => {
  if (item.path) {
    router.push(item.path);
  } else {
    ElMessage.info(`${item.label} 功能开发中`);
  }
};

// 图表周期
const chartPeriod = ref("week");

// 通知公告
const noticeList = ref([
  {
    tag: "重要",
    type: "danger",
    title: "系统将于本周六凌晨进行版本升级维护",
    date: "09-12",
  },
  {
    tag: "通知",
    type: "warning",
    title: "国庆节放假安排通知，请提前做好工作安排",
    date: "09-10",
  },
  {
    tag: "公告",
    type: "primary",
    title: "新版后台管理系统已上线，欢迎体验",
    date: "09-08",
  },
  {
    tag: "活动",
    type: "success",
    title: "秋季促销活动开始，多款产品限时优惠",
    date: "09-05",
  },
  {
    tag: "通知",
    type: "warning",
    title: "请各部门及时提交本月工作总结报告",
    date: "09-03",
  },
]);

// 待办事项
const todoList = ref([
  {
    text: "审核新用户注册申请",
    done: false,
    priority: "high",
    priorityText: "紧急",
  },
  {
    text: "完成季度数据报表",
    done: false,
    priority: "medium",
    priorityText: "重要",
  },
  {
    text: "回复客户咨询邮件",
    done: true,
    priority: "low",
    priorityText: "普通",
  },
  {
    text: "参加下午3点产品评审会",
    done: false,
    priority: "high",
    priorityText: "紧急",
  },
  {
    text: "更新系统使用文档",
    done: false,
    priority: "low",
    priorityText: "普通",
  },
]);

// 热门排行
const rankList = ref([
  { name: "智能手机 Pro Max", value: "1,280" },
  { name: "无线蓝牙耳机", value: "986" },
  { name: "智能手表 Series", value: "752" },
  { name: "轻薄笔记本电脑", value: "645" },
  { name: "平板电脑 Air", value: "528" },
]);

onMounted(() => {
  // 预留接口调用位置
});
</script>

<style lang="scss" scoped>
.home-container {
  padding: 20px 20px 40px;
  background: #f0f2f5;
  min-height: calc(100vh - 90px);

  /* 欢迎横幅 */
  .welcome-banner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    padding: 24px 32px;
    margin-bottom: 20px;
    color: #fff;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

    .welcome-title {
      font-size: 22px;
      font-weight: 600;
      margin: 0 0 8px 0;
    }

    .welcome-desc {
      font-size: 14px;
      opacity: 0.9;
      margin: 0;
    }

    .weather-card {
      display: flex;
      align-items: center;
      background: rgba(255, 255, 255, 0.2);
      padding: 10px 20px;
      border-radius: 24px;
      backdrop-filter: blur(10px);

      .weather-icon {
        font-size: 24px;
        margin-right: 8px;
      }

      .weather-text {
        font-size: 15px;
        font-weight: 500;
      }
    }
  }

  /* 统计卡片 */
  .stat-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 20px;

    .stat-card {
      background: #fff;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      align-items: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      transition:
        transform 0.3s,
        box-shadow 0.3s;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      }

      .stat-icon {
        width: 56px;
        height: 56px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        margin-right: 16px;
        flex-shrink: 0;
      }

      .stat-info {
        flex: 1;

        .stat-value {
          font-size: 26px;
          font-weight: 700;
          color: #1d2129;
          line-height: 1.2;
        }

        .stat-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-top: 4px;
        }

        .stat-label {
          font-size: 13px;
          color: #86909c;
        }

        .stat-live-tag {
          font-size: 11px;
          padding: 2px 6px;
          border-radius: 999px;
          background: rgba(64, 158, 255, 0.1);
          color: #409eff;
          font-weight: 600;
        }
      }

      .stat-trend {
        font-size: 13px;
        font-weight: 500;
        display: flex;
        align-items: center;

        &.up {
          color: #00b42a;
        }

        &.down {
          color: #f53f3f;
        }
      }

      &.bg-blue .stat-icon {
        background: linear-gradient(135deg, #409eff, #66b1ff);
      }

      &.bg-green .stat-icon {
        background: linear-gradient(135deg, #67c23a, #85ce61);
      }

      &.bg-orange .stat-icon {
        background: linear-gradient(135deg, #e6a23c, #ebb563);
      }

      &.bg-violet .stat-icon {
        background: linear-gradient(135deg, #7052f8, #9d7fff);
      }
    }
  }

  /* 通用区块卡片 */
  .section-card {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    margin-bottom: 20px;

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      .section-title {
        font-size: 16px;
        font-weight: 600;
        color: #1d2129;
        margin: 0;
        display: flex;
        align-items: center;

        .title-icon {
          margin-right: 6px;
          color: #409eff;
        }
      }
    }
  }

  /* 快捷入口 */
  .quick-actions {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 16px;

    .quick-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      padding: 12px 8px;
      border-radius: 8px;
      transition: background 0.2s;

      &:hover {
        background: #f5f7fa;

        .quick-icon {
          transform: scale(1.1);
        }
      }

      .quick-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 8px;
        transition: transform 0.2s;
      }

      .quick-label {
        font-size: 13px;
        color: #4e5969;
      }
    }
  }

  /* 富文本示例 */
  .rich-text-demo {
    margin-bottom: 20px;

    .preview-box {
      margin-top: 16px;
      background: #f8fafc;
      border: 1px solid #eef2f7;
      border-radius: 8px;
      padding: 16px;

      .preview-title {
        font-size: 13px;
        font-weight: 600;
        color: #4b5563;
        margin-bottom: 10px;
      }

      .preview-content {
        min-height: 80px;
        line-height: 1.8;
        color: #1f2937;
        font-size: 14px;

        :deep(p) {
          margin: 0 0 8px;
        }

        :deep(ul),
        :deep(ol) {
          padding-left: 20px;
          margin: 8px 0;
        }
      }
    }
  }

  /* 图表区域 */
  .chart-row {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 20px;
    margin-bottom: 20px;

    .chart-card {
      margin-bottom: 0;

      .chart-wrapper {
        height: 320px;
      }
    }
  }

  /* 底部三栏 */
  .bottom-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    padding-bottom: 20px;
  }

  /* 通知公告 */
  .notice-list {
    list-style: none;
    padding: 0;
    margin: 0;

    .notice-item {
      display: flex;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f2f3f5;

      &:last-child {
        border-bottom: none;
      }

      .notice-tag {
        margin-right: 10px;
        flex-shrink: 0;
      }

      .notice-title {
        flex: 1;
        font-size: 14px;
        color: #1d2129;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        cursor: pointer;

        &:hover {
          color: #409eff;
        }
      }

      .notice-date {
        font-size: 12px;
        color: #86909c;
        margin-left: 10px;
        flex-shrink: 0;
      }
    }
  }

  /* 待办事项 */
  .todo-list {
    list-style: none;
    padding: 0;
    margin: 0;

    .todo-item {
      display: flex;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f2f3f5;

      &:last-child {
        border-bottom: none;
      }

      .todo-text {
        flex: 1;
        font-size: 14px;
        color: #1d2129;
        margin: 0 10px;

        &.done {
          text-decoration: line-through;
          color: #c9cdd4;
        }
      }

      .todo-priority {
        font-size: 12px;
        padding: 2px 8px;
        border-radius: 4px;
        flex-shrink: 0;

        &.high {
          background: #ffece8;
          color: #f53f3f;
        }

        &.medium {
          background: #fff7e8;
          color: #ff7d00;
        }

        &.low {
          background: #e8ffea;
          color: #00b42a;
        }
      }
    }
  }

  /* 热门排行 */
  .rank-list {
    list-style: none;
    padding: 0;
    margin: 0;

    .rank-item {
      display: flex;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f2f3f5;

      &:last-child {
        border-bottom: none;
      }

      .rank-num {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: #f2f3f5;
        color: #86909c;
        font-size: 12px;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
        flex-shrink: 0;

        &.top {
          background: linear-gradient(135deg, #ff7d00, #ff9d4d);
          color: #fff;
        }
      }

      .rank-name {
        flex: 1;
        font-size: 14px;
        color: #1d2129;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .rank-value {
        font-size: 14px;
        font-weight: 600;
        color: #409eff;
        flex-shrink: 0;
      }
    }
  }
}

/* 响应式适配 */
@media screen and (max-width: 1400px) {
  .home-container {
    .quick-actions {
      grid-template-columns: repeat(4, 1fr);
    }
  }
}

@media screen and (max-width: 1100px) {
  .home-container {
    .stat-row {
      grid-template-columns: repeat(2, 1fr);
    }

    .chart-row {
      grid-template-columns: 1fr;
    }

    .bottom-row {
      grid-template-columns: 1fr;
    }
  }
}
</style>
