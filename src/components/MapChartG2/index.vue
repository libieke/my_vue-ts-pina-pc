

<template>
  <div class="chart-card">
    <div class="chart-header">
      <div class="header-left">
        <div class="chart-title">
          <span class="title-icon"></span>
          <span>近 7 日资金流水趋势</span>
        </div>

        <div class="chart-subtitle">收入与支出变化趋势</div>
      </div>

      <div class="header-right">
        <span class="unit-label">单位：万元</span>
      </div>
    </div>

    <div class="chart-body">
      <div ref="containerRef" class="chart-container"></div>

      <div v-if="loading" class="chart-mask">
        <span class="loading-spinner"></span>
        <span>正在加载趋势数据...</span>
      </div>

      <div v-else-if="error" class="chart-mask is-error">
        <span>{{ error }}</span>

        <button class="retry-btn" type="button" @click="reload">
          ↻ 重新加载
        </button>
      </div>

      <div v-else-if="!trendData?.length" class="chart-mask">
        暂无资金流水数据
      </div>
    </div>

    <div class="chart-footer">
      <div class="legend-list">
        <div class="legend-item">
          <span class="legend-dot income"></span>
          <span>收入金额</span>
        </div>

        <div class="legend-item">
          <span class="legend-dot expense"></span>
          <span>支出金额</span>
        </div>
      </div>

      <div class="footer-tip">
        <span class="tip-dot"></span>
        鼠标悬停查看每日详细数据
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch, nextTick } from "vue";

import { Chart } from "@antv/g2";

import { useFundTrend } from "@/hooks";

const { data: trendData, loading, error, reload } = useFundTrend();


const containerRef = ref<HTMLDivElement | null>(null);

let chart: Chart | null = null;

let isUnmounted = false;

let renderVersion = 0;

const COLORS = {
  income: "#3478F6",
  expense: "#F56C6C",
};


interface TrendPoint {
  date: string;
  type: string;
  value: number;
}

type TooltipRenderOptions = {
  title?: string;
  items?: Array<{ name?: string; value?: unknown; color?: string }>;
};

function formatAmount(value: unknown): string {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "-";
  }

  return number.toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getDayFundData(date: string) {
  const list = trendData.value ?? [];

  const dayList = list.filter((item: TrendPoint) => item.date === date);

  const incomeItem = dayList.find((item: TrendPoint) => item.type === "收入");

  const expenseItem = dayList.find((item: TrendPoint) => item.type === "支出");

  const income = Number(incomeItem?.value ?? 0);
  const expense = Number(expenseItem?.value ?? 0);

  const difference = income - expense;

  return {
    income,
    expense,
    difference,
  };
}

function renderTooltipHtml(
  _event: unknown,
  params: TooltipRenderOptions,
): string {
  const date = String(params?.title ?? "");

  if (!date) {
    return "";
  }

  const dayData = getDayFundData(date);

  const incomeText = formatAmount(dayData.income);
  const expenseText = formatAmount(dayData.expense);
  const differenceText = formatAmount(dayData.difference);

  const differenceColor = dayData.difference >= 0 ? "#16A36A" : "#F56C6C";

  const safeDate = escapeHtml(date);

  return `
    <div class="fund-tooltip">

      <!-- Tooltip 标题 -->
      <div class="fund-tooltip-header">

        <div class="fund-tooltip-date">
          ${safeDate}
        </div>

        <div class="fund-tooltip-unit">
          单位：万元
        </div>

      </div>

      <!-- Tooltip 数据 -->
      <div class="fund-tooltip-content">

        <!-- 收入 -->
        <div class="fund-tooltip-item">

          <div class="fund-tooltip-label">
            <span class="fund-tooltip-dot income"></span>
            <span>收入金额</span>
          </div>

          <div class="fund-tooltip-value income-text">
            ${incomeText}
          </div>

        </div>

        <!-- 支出 -->
        <div class="fund-tooltip-item">

          <div class="fund-tooltip-label">
            <span class="fund-tooltip-dot expense"></span>
            <span>支出金额</span>
          </div>

          <div class="fund-tooltip-value expense-text">
            ${expenseText}
          </div>

        </div>

        <!-- 收支差额 -->
        <div class="fund-tooltip-item difference-item">

          <div class="fund-tooltip-label">
            <span>收支差额</span>
          </div>

          <div
            class="fund-tooltip-value"
            style="color: ${differenceColor}"
          >
            ${differenceText}
          </div>

        </div>

      </div>

    </div>
  `;
}

function renderChart() {
  const el = containerRef.value;

  if (!el || !trendData.value) {
    return;
  }

  if (!trendData.value.length) {
    chart?.destroy();
    chart = null;
    return;
  }

  if (!chart) {
    chart = new Chart({
      container: el,
      autoFit: true,
    });
  }

  const commonScale = {
    x: { type: "time" as const },
    color: {
      domain: ["收入", "支出"],
      range: [COLORS.income, COLORS.expense],
    },
  };

  chart.options({
    type: "view",

    data: trendData.value,

    paddingLeft: 48,
    paddingRight: 20,
    paddingTop: 20,
    paddingBottom: 40,

    scale: commonScale,

    interaction: {
      tooltip: {
        render: renderTooltipHtml,

        crosshairs: true,

        css: {
          ".g2-tooltip": {
            "max-width": "none",
            padding: "0",
            background: "transparent",
            "box-shadow": "none",
            border: "none",
          },
        },
      },
    },

    legend: false,

    children: [
      {
        type: "area",

        encode: {
          x: "date",
          y: "value",
          color: "type",
        },

        style: {
          fillOpacity: 0.12,
          shape: "smooth",
        },

        axis: false,

        tooltip: false,
      },

      {
        type: "line",

        encode: {
          x: "date",
          y: "value",
          color: "type",
        },

        style: {
          lineWidth: 2.8,
          shape: "smooth",
        },

        tooltip: {
          title: (d: TrendPoint) => d.date,

          items: [
            (d: TrendPoint) => ({
              name: `${d.type}金额`,
              value: formatAmount(d.value),
              color: d.type === "收入" ? COLORS.income : COLORS.expense,
            }),
          ],
        },

        axis: {
          y: {
            title: false,

            grid: true,

            gridLineDash: [3, 4],

            gridStroke: "#edf1f7",

            labelFill: "#9099a8",

            labelFontSize: 11,

            labelFormatter: (value: number) =>
              Number(value).toLocaleString("zh-CN"),
          },

          x: {
            title: false,

            labelFill: "#9099a8",

            labelFontSize: 11,

            labelAutoRotate: false,

            labelFormatter: (value: string) => String(value).slice(5),
          },
        },
      },

      {
        type: "point",

        encode: {
          x: "date",
          y: "value",
          color: "type",
        },

        style: {
          size: 4,
          stroke: "#ffffff",
          lineWidth: 2,
        },

        tooltip: false,
      },
    ],
  });

  chart.render();
}

async function refreshChart() {
  const currentVersion = ++renderVersion;

  await nextTick();

  if (isUnmounted) {
    return;
  }

  if (currentVersion !== renderVersion) {
    return;
  }

  renderChart();
}


onMounted(() => {
  refreshChart();
});

watch(
  trendData,
  () => {
    refreshChart();
  },
  {
    flush: "post",
  },
);

onBeforeUnmount(() => {
  isUnmounted = true;

  renderVersion++;

  chart?.destroy();

  chart = null;
});
</script>

<style scoped>
.chart-card {
  min-width: 0;
  padding: 18px 20px 14px;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #edf0f5;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgb(31 45 61 / 4%);
  transition: box-shadow 0.25s ease;
}

.chart-card:hover {
  box-shadow: 0 8px 24px rgb(31 45 61 / 7%);
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}

.header-left {
  min-width: 0;
}

.chart-title {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 16px;
  font-weight: 650;
  color: #263445;
}

.title-icon {
  width: 4px;
  height: 17px;
  background: linear-gradient(180deg, #4388ff, #2463eb);
  border-radius: 4px;
}

.chart-subtitle {
  margin-top: 6px;
  padding-left: 13px;
  font-size: 12px;
  color: #9aa4b2;
}

.unit-label {
  padding: 5px 10px;
  font-size: 12px;
  color: #7c8797;
  background: #f5f7fa;
  border-radius: 5px;
}

.chart-body {
  position: relative;
  min-width: 0;
}

.chart-container {
  width: 100%;
  height: clamp(300px, 38vh, 390px);
}

.chart-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 10px;
  border-top: 1px solid #f1f3f6;
}

.legend-list {
  display: flex;
  align-items: center;
  gap: 22px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  color: #697586;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.legend-dot.income {
  background: #3478f6;
  box-shadow: 0 0 0 3px rgb(52 120 246 / 10%);
}

.legend-dot.expense {
  background: #f56c6c;
  box-shadow: 0 0 0 3px rgb(245 108 108 / 10%);
}

.footer-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #a0a9b6;
}

.tip-dot {
  width: 5px;
  height: 5px;
  background: #aab4c2;
  border-radius: 50%;
}

.chart-mask {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: #8b95a3;
  background: rgb(255 255 255 / 88%);
}

.chart-mask.is-error {
  color: #e66b6b;
}

.loading-spinner {
  width: 22px;
  height: 22px;
  border: 2px solid #e7efff;
  border-top-color: #3478f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.retry-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  font-size: 12px;
  color: #3478f6;
  cursor: pointer;
  background: #f1f6ff;
  border: 1px solid #d9e7ff;
  border-radius: 5px;
  transition: all 0.2s;
}

.retry-btn:hover {
  color: #ffffff;
  background: #3478f6;
  border-color: #3478f6;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .chart-card {
    padding: 14px 12px 12px;
  }

  .chart-container {
    height: 260px;
  }

  .chart-footer {
    align-items: flex-start;
    flex-direction: column;
  }

  .footer-tip {
    display: none;
  }
}
</style>
