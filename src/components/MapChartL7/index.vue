
<template>
  <div class="chart-card">
    <div class="chart-title">全国重点网点交易热度分布</div>

    <div class="chart-body">
      <div ref="containerRef" class="chart-container"></div>

      <div v-if="loading" class="chart-mask">正在加载网点数据…</div>
      <div v-else-if="error" class="chart-mask is-error">
        <span>{{ error }}</span>
        <button class="retry-btn" type="button" @click="reload">重新加载</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PointLayer, Popup, Scene } from "@antv/l7";
import { GaodeMap } from "@antv/l7-maps";

import { useBranchPoints } from "@/hooks";

const { data: branchData, loading, error, reload } = useBranchPoints();

const AMAP_TOKEN =
  (import.meta.env.VITE_AMAP_TOKEN as string | undefined) ||
  "b01f00a253ea2fc720aee69d8d1a78f3";

const containerRef = ref<HTMLDivElement | null>(null);
let scene: Scene | null = null;
let pointLayer: PointLayer | null = null;
let popup: Popup | null = null;
let sceneReady = false;
let popupVisible = false;
let resizeObserver: ResizeObserver | null = null;
let resizeFrame = 0;

function renderLayer() {
  if (!scene || !sceneReady || !branchData.value) return;

  if (popupVisible && popup) {
    scene.removePopup(popup);
    popupVisible = false;
  }

  if (pointLayer) {
    void scene.removeLayer(pointLayer);
    pointLayer = null;
  }

  const layer = new PointLayer({ zIndex: 2 })
    .source(branchData.value, {
      parser: { type: "json", x: "lng", y: "lat" },
    })
    .shape("circle")
    .size("amount", [10, 40])
    .color("type", ["#1677ff", "#52c41a", "#faad14"])
    .style({
      opacity: 0.8,
      strokeWidth: 1,
      stroke: "#fff",
    })
    .active(true);

  pointLayer = layer as PointLayer;
  scene.addLayer(layer);

  layer.on("mousemove", (e: any) => {
    if (!e.feature || !popup || !scene) return;

    const { name, type, amount } = e.feature;
    popup.setLnglat(e.lngLat).setHTML(`
      <div style="padding: 8px 12px; font-size: 13px; line-height: 1.6;">
        <strong>${name}</strong><br/>
        类型: ${type}<br/>
        交易额: ${amount} 万元
      </div>
    `);

    if (!popupVisible) {
      scene.addPopup(popup);
      popupVisible = true;
    }
  });

  layer.on("mouseleave", () => {
    if (popupVisible && popup && scene) {
      scene.removePopup(popup);
      popupVisible = false;
    }
  });
}

function handleResize() {
  cancelAnimationFrame(resizeFrame);
  resizeFrame = requestAnimationFrame(() => {
    const mapService = scene?.getMapService() as any;
    const nativeMap = mapService?.map;
    if (typeof nativeMap?.resize === "function") nativeMap.resize();
  });
}

onMounted(() => {
  if (!containerRef.value) return;

  scene = new Scene({
    id: containerRef.value,
    map: new GaodeMap({
      style: "light",
      center: [105, 35],
      zoom: 3.5,
      token: AMAP_TOKEN,
    }),
  });

  popup = new Popup({
    closeButton: false,
    closeOnClick: false,
  });

  scene.on("loaded", () => {
    sceneReady = true;
    renderLayer();
  });

  resizeObserver = new ResizeObserver(handleResize);
  resizeObserver.observe(containerRef.value);
});

watch(branchData, renderLayer);

onBeforeUnmount(() => {
  cancelAnimationFrame(resizeFrame);
  resizeObserver?.disconnect();
  scene?.destroy();
  scene = null;
  pointLayer = null;
  popup = null;
  sceneReady = false;
  popupVisible = false;
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
  height: clamp(320px, 48vh, 520px);
  overflow: hidden;
  border-radius: 6px;
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
    height: 300px;
  }
}
</style>
