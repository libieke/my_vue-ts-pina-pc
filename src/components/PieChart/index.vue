<template>
  <div ref="pieRef" style="width: 100%; height: 100%"></div>
</template>

<script setup lang="ts">
import * as echarts from "echarts";

const pieRef = ref<HTMLElement | null>(null);

const initPieChart = () => {
  if (!pieRef.value) return;
  const myChart = echarts.init(pieRef.value);
  myChart.setOption({
    tooltip: {
      trigger: "item",
      formatter: "{a} <br/>{b}: {c} ({d}%)",
    },
    legend: {
      bottom: 0,
      left: "center",
      itemWidth: 12,
      itemHeight: 12,
      textStyle: {
        color: "#86909c",
        fontSize: 12,
      },
    },
    series: [
      {
        name: "访问来源",
        type: "pie",
        radius: ["40%", "70%"],
        center: ["50%", "45%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          show: false,
          position: "center",
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: "bold",
            color: "#1d2129",
          },
        },
        labelLine: {
          show: false,
        },
        data: [
          { value: 1048, name: "直接访问", itemStyle: { color: "#409eff" } },
          { value: 735, name: "搜索引擎", itemStyle: { color: "#67c23a" } },
          { value: 580, name: "邮件营销", itemStyle: { color: "#e6a23c" } },
          { value: 484, name: "联盟广告", itemStyle: { color: "#f56c6c" } },
          { value: 300, name: "其他", itemStyle: { color: "#909399" } },
        ],
      },
    ],
  });
};

onMounted(() => {
  initPieChart();
});
</script>
