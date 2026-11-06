
<template>
  <div class="chart-card">
    <div class="chart-title">账户资金流向监控图谱</div>

    <div class="chart-body">
      <div ref="containerRef" class="chart-container"></div>

      <div v-if="loading" class="chart-mask">正在加载图谱数据…</div>
      <div v-else-if="error" class="chart-mask is-error">
        <span>{{ error }}</span>
        <button class="retry-btn" type="button" @click="reload">重新加载</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { Graph } from "@antv/g6";
import type { GraphData } from "@antv/g6";

import { useFundGraph } from "@/hooks";
import type { FundGraphData } from "@/mock/fundFlowData";

const { data, loading, error, reload } = useFundGraph();

const containerRef = ref<HTMLDivElement | null>(null);
let graph: Graph | null = null;
let resizeObserver: ResizeObserver | null = null;
let resizeFrame = 0;

const formatWan = (weight: number) => `${(weight / 10000).toFixed(0)}万`;

function toGraphData(source: FundGraphData): GraphData {
  const maxAmount = Math.max(...source.nodes.map((node) => node.amount), 1);
  const maxWeight = Math.max(...source.edges.map((edge) => edge.weight), 1);

  return {
    nodes: source.nodes.map((node) => ({
      id: node.id,
      data: node,
      style: {
        size: 26 + (node.amount / maxAmount) * 30,
        fill: node.risk === "high" ? "#ff4d4f" : "#1677ff",
        labelText: node.label,
      },
    })),
    edges: source.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      data: edge,
      style: {
        lineWidth: 1 + (edge.weight / maxWeight) * 5,
        stroke: edge.weight > 1000000 ? "#ff4d4f" : "#bfbfbf",
        endArrow: true,
        labelText: formatWan(edge.weight),
      },
    })),
  } as unknown as GraphData;
}

function renderGraph() {
  const el = containerRef.value;
  if (!el || !data.value) return;

  graph?.destroy();
  graph = new Graph({
    container: el,
    autoFit: "view",
    data: toGraphData(data.value),
    layout: {
      type: "d3-force",
      preventOverlap: true,
      link: { distance: 150 },
      collide: { radius: 50 },
    },
    node: {
      style: {
        labelPlacement: "bottom",
        labelFill: "#333",
        labelFontSize: 12,
      },
    },
    edge: {
      style: { strokeOpacity: 0.8 },
    },
    behaviors: ["drag-canvas", "zoom-canvas", "drag-element"],
  });

  graph.render();
}

function handleResize() {
  if (!graph) return;
  cancelAnimationFrame(resizeFrame);
  resizeFrame = requestAnimationFrame(() => {
    graph?.resize();
    void graph?.fitView();
  });
}

onMounted(() => {
  renderGraph();

  if (containerRef.value) {
    resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.value);
  }
});

watch(data, renderGraph);

onBeforeUnmount(() => {
  cancelAnimationFrame(resizeFrame);
  resizeObserver?.disconnect();
  graph?.destroy();
  graph = null;
});
</script>

<style scoped>
.chart-card {
  min-width: 0;
  padding: clamp(12px, 1.4vw, 20px);
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 5%);
}

.chart-title {
  margin-bottom: 12px;
  padding-left: 8px;
  font-size: 16px;
  font-weight: 700;
  color: #333;
  border-left: 4px solid #1677ff;
}

.chart-body {
  position: relative;
}

.chart-container {
  width: 100%;
  height: clamp(300px, 40vh, 420px);
}

.chart-mask {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: #8c8c8c;
  background: rgb(255 255 255 / 82%);
}

.chart-mask.is-error {
  color: #ff4d4f;
}

.retry-btn {
  padding: 4px 12px;
  font-size: 12px;
  color: #1677ff;
  cursor: pointer;
  background: #fff;
  border: 1px solid #1677ff;
  border-radius: 4px;
}

.retry-btn:hover {
  color: #fff;
  background: #1677ff;
}

@media (max-width: 768px) {
  .chart-container {
    height: 280px;
  }
}
</style>
