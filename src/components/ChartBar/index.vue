<template>
  <div ref="main" style="width: 100%; height: 100%"></div>
</template>

<script setup lang="ts">
import * as echarts from "echarts";

const main = ref<HTMLElement | null>(null);

const initEcharts = () => {
  if (!main.value) return;
  const myChart = echarts.init(main.value);
  myChart.setOption({
    title: {
      text: "柱状图示例",
    },
    tooltip: {},
    xAxis: {
      data: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
    },
    yAxis: {},
    series: [
      {
        name: "销量",
        type: "bar",
        data: [5, 20, 36, 10, 10, 20, 5],
      },
    ],
  });
};

onMounted(() => {
  initEcharts();
});
</script>
