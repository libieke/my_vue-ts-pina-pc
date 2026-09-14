<template>
  <div ref="main" style="width: 100%; height: 100%"></div>
</template>

<script setup lang="ts">
import * as echarts from "echarts";

const main = ref(null);
onMounted(() => {
  initEcgarts();
});

const initEcgarts = () => {
  const massEchart = echarts.init(main.value);
  let option = {
    xAxis: {
      type: "category",
      data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        data: [150, 230, 224, 218, 135, 147, 260],
        type: "line",
      },
    ],
  };
  massEchart.setOption(option);
};
</script>
