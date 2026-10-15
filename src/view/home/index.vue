<template>
  <div class="home-container">
    <!-- 欢迎横幅 -->
    <div class="welcome-banner">
      <div class="welcome-left">
        <h2 class="welcome-title">{{ $t('home.welcomeTitle', { greeting }) }}</h2>
        <p class="welcome-desc">{{ $t('home.todayDesc', { date: currentDate }) }}</p>
      </div>
      <div class="welcome-right">
        <div class="weather-card">
          <el-icon class="weather-icon"><Sunny /></el-icon>
          <span class="weather-text">{{ $t('home.weather') }}</span>
        </div>
      </div>
    </div>

    <!-- 数据统计卡片 -->
    <div class="stat-row">
      <div
        v-for="item in statList"
        :key="item.label"
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
            <span v-if="item.live" class="stat-live-tag">
              {{ item.liveText }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 快捷入口 -->
    <div class="section-card">
      <div class="section-header">
        <h3 class="section-title">{{ $t('home.quickLinks') }}</h3>
        <el-link type="primary" :underline="false">{{ $t('home.allApps') }}</el-link>
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
        <h3 class="section-title">{{ $t('home.richTextEditor') }}</h3>
      </div>
      <RichText
        v-model="richTextContent"
        :height="220"
        :max-length="500"
        :show-image-upload="true"
        :placeholder="$t('home.richTextPlaceholder')"
      />
      <div class="preview-box">
        <div class="preview-title">{{ $t('home.contentPreview') }}</div>
        <div v-html="richTextContent" class="preview-content"></div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="chart-row">
      <div class="section-card chart-card">
        <div class="section-header">
          <h3 class="section-title">{{ $t('home.salesTrend') }}</h3>
          <el-radio-group v-model="chartPeriod" size="small">
            <el-radio-button value="week">{{ $t('home.periodWeek') }}</el-radio-button>
            <el-radio-button value="month">{{ $t('home.periodMonth') }}</el-radio-button>
            <el-radio-button value="year">{{ $t('home.periodYear') }}</el-radio-button>
          </el-radio-group>
        </div>
        <div class="chart-wrapper">
          <ChartBar />
        </div>
      </div>
      <div class="section-card chart-card">
        <div class="section-header">
          <h3 class="section-title">{{ $t('home.visitSource') }}</h3>
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
            {{ $t('home.notices') }}
          </h3>
          <el-link type="primary" :underline="false">{{ $t('home.more') }}</el-link>
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
              >{{ $t(item.tagKey) }}</el-tag
            >
            <span class="notice-title">{{ $t(item.titleKey) }}</span>
            <span class="notice-date">{{ item.date }}</span>
          </li>
        </ul>
      </div>

      <!-- 待办事项 -->
      <div class="section-card">
        <div class="section-header">
          <h3 class="section-title">
            <el-icon class="title-icon"><List /></el-icon>
            {{ $t('home.todos') }}
          </h3>
          <el-link type="primary" :underline="false">{{ $t('home.all') }}</el-link>
        </div>
        <ul class="todo-list">
          <li v-for="(item, index) in todoList" :key="index" class="todo-item">
            <el-checkbox v-model="item.done" />
            <span class="todo-text" :class="{ done: item.done }">{{
              $t(item.textKey)
            }}</span>
            <span class="todo-priority" :class="item.priority">{{
              $t(item.priorityKey)
            }}</span>
          </li>
        </ul>
      </div>

      <!-- 热门排行 -->
      <div class="section-card">
        <div class="section-header">
          <h3 class="section-title">
            <el-icon class="title-icon"><Trophy /></el-icon>
            {{ $t('home.rank') }}
          </h3>
          <el-link type="primary" :underline="false">{{ $t('home.more') }}</el-link>
        </div>
        <ul class="rank-list">
          <li v-for="(item, index) in rankList" :key="index" class="rank-item">
            <span class="rank-num" :class="{ top: index < 3 }">{{
              index + 1
            }}</span>
            <span class="rank-name">{{ $t(item.nameKey) }}</span>
            <span class="rank-value">{{ item.value }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ShoppingCart,
  Money,
  Sunny,
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
import { useVisitCounter } from "@/hooks";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const router = useRouter();

const richTextContent = ref(
  "<p>欢迎使用 <strong>通用富文本组件</strong>，支持 <em>加粗</em>、<u>下划线</u>、列表和链接等基础编辑能力。</p>",
);

// 问候语（随语言切换自动更新）
const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 6) return t("home.greetingDawn");
  if (hour < 9) return t("home.greetingMorning");
  if (hour < 12) return t("home.greetingForenoon");
  if (hour < 14) return t("home.greetingNoon");
  if (hour < 18) return t("home.greetingAfternoon");
  return t("home.greetingEvening");
});

// 当前日期
const currentDate = computed(() => {
  const now = new Date();
  return t("home.dateFormat", {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
    week: t(`home.weekDay${now.getDay()}`),
  });
});

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);

// 首页访问数：使用独立的访问计数器，从 0 开始实时累加本次访问
const { count: visitCount, loaded, error } = useVisitCounter();

// 业务数据（订单总数 / 销售额）暂为占位，不蒜子不提供此类指标
const orderTotal = 1256;
const totalSales = 98560;

const formatStat = (value: number | null) =>
  value === null ? "-" : formatNumber(value);

const visitStatusText = computed(() => {
  if (loaded.value) return t("home.statusLive");
  return error.value ? t("home.statusOffline") : t("home.statusLoading");
});

const orderTotalLabel = computed(() => formatNumber(orderTotal));
const totalSalesLabel = computed(() => `¥${formatNumber(totalSales)}`);

// 统计卡片数据（首项为项目访问数，从 0 开始实时累加）
const statList = computed(() => [
  {
    icon: markRaw(DataAnalysis),
    label: t("home.statVisits"),
    value: formatStat(visitCount.value),
    liveText: visitStatusText.value,
    live: true,
    bgClass: "bg-cyan",
  },
  {
    icon: markRaw(ShoppingCart),
    label: t("home.statOrderTotal"),
    value: orderTotalLabel.value,
    bgClass: "bg-orange",
  },
  {
    icon: markRaw(Money),
    label: t("home.statSales"),
    value: totalSalesLabel.value,
    bgClass: "bg-violet",
  },
]);

// 快捷入口（computed 包裹，切换语言自动更新）
const quickActions = computed(() => [
  {
    label: t("menu.userList"),
    icon: markRaw(UserFilled),
    bgColor: "#409EFF",
    path: "/userList",
  },
  {
    label: t("menu.orderManage"),
    icon: markRaw(ShoppingCart),
    bgColor: "#67C23A",
    path: "/orderManage",
  },
  {
    label: t("menu.dataAnalysis"),
    icon: markRaw(DataAnalysis),
    bgColor: "#E6A23C",
    path: "/dataAnalysis",
  },
  {
    label: t("menu.messageNotice"),
    icon: markRaw(Message),
    bgColor: "#F56C6C",
    path: "/messageNotice",
  },
  {
    label: t("menu.docCenter"),
    icon: markRaw(Document),
    bgColor: "#909399",
    path: "/docCenter",
  },
  {
    label: t("menu.fileManage"),
    icon: markRaw(Folder),
    bgColor: "#155EE8",
    path: "/fileManage",
  },
  {
    label: t("home.systemSetting"),
    icon: markRaw(Setting),
    bgColor: "#7052F8",
    path: "/userSet",
  },
  { label: t("home.moreFeatures"), icon: markRaw(Setting), bgColor: "#999999", path: "" },
]);

const handleQuickAction = (item: any) => {
  if (item.path) {
    router.push(item.path);
  } else {
    ElMessage.info(t("home.devInProgress", { name: item.label }));
  }
};

// 图表周期
const chartPeriod = ref("week");

// 通知公告（存储 i18n key，模板中 $t 翻译，切换语言自动更新）
const noticeList = ref([
  {
    tagKey: "home.noticeTagImportant",
    type: "danger",
    titleKey: "home.notice1",
    date: "09-12",
  },
  {
    tagKey: "home.noticeTagNotice",
    type: "warning",
    titleKey: "home.notice2",
    date: "09-10",
  },
  {
    tagKey: "home.noticeTagAnnouncement",
    type: "primary",
    titleKey: "home.notice3",
    date: "09-08",
  },
  {
    tagKey: "home.noticeTagActivity",
    type: "success",
    titleKey: "home.notice4",
    date: "09-05",
  },
  {
    tagKey: "home.noticeTagNotice",
    type: "warning",
    titleKey: "home.notice5",
    date: "09-03",
  },
]);

// 待办事项
const todoList = ref([
  {
    textKey: "home.todo1",
    done: false,
    priority: "high",
    priorityKey: "home.priorityHigh",
  },
  {
    textKey: "home.todo2",
    done: false,
    priority: "medium",
    priorityKey: "home.priorityMedium",
  },
  {
    textKey: "home.todo3",
    done: true,
    priority: "low",
    priorityKey: "home.priorityLow",
  },
  {
    textKey: "home.todo4",
    done: false,
    priority: "high",
    priorityKey: "home.priorityHigh",
  },
  {
    textKey: "home.todo5",
    done: false,
    priority: "low",
    priorityKey: "home.priorityLow",
  },
]);

// 热门排行
const rankList = ref([
  { nameKey: "home.rank1", value: "1,280" },
  { nameKey: "home.rank2", value: "986" },
  { nameKey: "home.rank3", value: "752" },
  { nameKey: "home.rank4", value: "645" },
  { nameKey: "home.rank5", value: "528" },
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
    grid-template-columns: repeat(3, 1fr);
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

      &.bg-cyan .stat-icon {
        background: linear-gradient(135deg, #17c3ce, #4ad9e0);
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
