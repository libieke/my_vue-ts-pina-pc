<template>
  <div class="scatter-page">
    <header class="toolbar">
      <div>
        <h2>WebGL 高性能散点图</h2>
        <p>渠道销售量分布 · GPU 批量渲染</p>
      </div>

      <div class="stats">
        <div class="stat">
          <span>数据总量</span>
          <strong>{{ pointCount.toLocaleString() }}</strong>
        </div>
        <div class="stat">
          <span>渠道数</span>
          <strong>{{ channelCount }}</strong>
        </div>
        <div class="stat">
          <span>缩放比例</span>
          <strong>{{ zoom }}</strong>
        </div>
        <button class="ghost" :disabled="loading" @click="reload">
          {{ loading ? "加载中…" : "刷新数据" }}
        </button>
        <button @click="resetView">重置视图</button>
      </div>
    </header>

    <div v-if="channelNames.length" class="channels">
      <span v-for="name in channelNames" :key="name" class="channel-chip">{{ name }}</span>
    </div>

    <div class="scatter-stage">
      <div ref="containerRef" class="scatter-container"></div>

      <svg v-if="showAxes" class="axis-layer" :width="stageSize.width" :height="stageSize.height">
        <g class="axis-grid">
          <line
            v-for="tick in xTicks"
            :key="`gx-${tick.value}`"
            :x1="tick.pos"
            :x2="tick.pos"
            y1="0"
            :y2="stageSize.height"
          />
          <line
            v-for="tick in yTicks"
            :key="`gy-${tick.value}`"
            :y1="tick.pos"
            :y2="tick.pos"
            x1="0"
            :x2="stageSize.width"
          />
        </g>

        <g class="axis-lines">
          <line x1="0" :x2="stageSize.width" :y1="stageSize.height" :y2="stageSize.height" />
          <line x1="0" x2="0" y1="0" :y2="stageSize.height" />
        </g>

        <g class="axis-labels">
          <text
            v-for="tick in xTicks"
            :key="`tx-${tick.value}`"
            :x="tick.pos"
            :y="stageSize.height - 10"
            text-anchor="middle"
          >
            {{ tick.label }}
          </text>
          <text
            v-for="tick in yTicks"
            :key="`ty-${tick.value}`"
            x="10"
            :y="tick.pos - 6"
          >
            {{ tick.label }}
          </text>
        </g>
      </svg>

      <div v-if="loading" class="scatter-mask">
        <span class="spinner"></span>
        <span>正在获取散点数据…</span>
      </div>
    </div>

    <div v-if="loadError || errorMessage" class="error">
      {{ loadError || errorMessage }}
    </div>

    <footer>
      <span class="legend">
        <i class="legend-swatch" :style="{ background: legendGradient }" aria-hidden="true"></i>
        <span>颜色越紫，毛利率越高</span>
      </span>
      <span>X：当日销量（件） · Y：客单价（元）</span>
      <span>鼠标拖动平移 · 滚轮缩放</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import * as THREE from "three";
import { useScatterData } from "@/hooks";
import type { ScatterPoint } from "@/mock/scatterData";
import { buildAxisTicks } from "./axis";

const {
  data,
  loading,
  error: loadError,
  pointCount,
  reload,
} = useScatterData({ count: 5000 });

const channelCount = computed(() => new Set(data.value.map((point) => point.channel)).size);
const channelNames = computed(() => Array.from(new Set(data.value.map((point) => point.channel))));

const containerRef = ref<HTMLDivElement | null>(null);
const zoom = ref("100%");
const errorMessage = ref("");

const COLOR_LOW = "#20d6ff";
const COLOR_HIGH = "#7c4dff";
const legendGradient = `linear-gradient(135deg, ${COLOR_LOW}, ${COLOR_HIGH})`;

let scene: THREE.Scene | null = null;
let camera: THREE.OrthographicCamera | null = null;
let renderer: THREE.WebGLRenderer | null = null;
let points: THREE.Points | null = null;
let animationId = 0;
let resizeObserver: ResizeObserver | null = null;
let bounds: { minX: number; maxX: number; minY: number; maxY: number } | null = null;
let userAdjusted = false;

let isDragging = false;
let lastX = 0;
let lastY = 0;
let scale = 1;

const MIN_SCALE = 0.05;
const MAX_SCALE = 10;
const FIT_PADDING = 0.06;

const stageSize = ref({ width: 0, height: 0 });
const viewState = ref({ centerX: 0, centerY: 0, zoom: 1 });
const AXIS_TICK_TARGET = 6;

const showAxes = computed(() => stageSize.value.width > 0 && data.value.length > 0);

const xTicks = computed(() =>
  buildAxisTicks({
    axis: "x",
    width: stageSize.value.width,
    height: stageSize.value.height,
    centerX: viewState.value.centerX,
    centerY: viewState.value.centerY,
    zoom: viewState.value.zoom,
    target: AXIS_TICK_TARGET,
  }),
);
const yTicks = computed(() =>
  buildAxisTicks({
    axis: "y",
    width: stageSize.value.width,
    height: stageSize.value.height,
    centerX: viewState.value.centerX,
    centerY: viewState.value.centerY,
    zoom: viewState.value.zoom,
    target: AXIS_TICK_TARGET,
  }),
);

function syncViewState() {
  if (!camera) return;
  viewState.value = {
    centerX: camera.position.x,
    centerY: camera.position.y,
    zoom: camera.zoom,
  };
}


function renderPoints(list: ScatterPoint[]) {
  if (!scene) return;

  if (points) {
    scene.remove(points);
    points.geometry.dispose();
    (points.material as THREE.Material).dispose();
    points = null;
  }

  if (list.length === 0) return;

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  let minValue = Infinity;
  let maxValue = -Infinity;

  for (const point of list) {
    if (point.x < minX) minX = point.x;
    if (point.x > maxX) maxX = point.x;
    if (point.y < minY) minY = point.y;
    if (point.y > maxY) maxY = point.y;
    if (point.value < minValue) minValue = point.value;
    if (point.value > maxValue) maxValue = point.value;
  }

  const valueSpan = maxValue - minValue || 1;

  const positions = new Float32Array(list.length * 3);
  const colors = new Float32Array(list.length * 3);

  const colorA = new THREE.Color(COLOR_LOW);
  const colorB = new THREE.Color(COLOR_HIGH);
  const tmpColor = new THREE.Color();

  list.forEach((point, index) => {
    const offset = index * 3;

    positions[offset] = point.x;
    positions[offset + 1] = point.y;
    positions[offset + 2] = 0;

    tmpColor.copy(colorA).lerp(colorB, (point.value - minValue) / valueSpan);

    colors[offset] = tmpColor.r;
    colors[offset + 1] = tmpColor.g;
    colors[offset + 2] = tmpColor.b;
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const pointSize = 3.5 * Math.min(window.devicePixelRatio, 2);

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uSize: { value: pointSize },
    },
    vertexShader: `
      uniform float uSize;
      varying vec3 vColor; // 将颜色传递给片元着色器
      
      void main() {
        vColor = color;
        // 标准 MVP 矩阵变换
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        // 正交相机下，点大小固定，不随距离衰减 (gl_PointSize 必须设置)
        gl_PointSize = uSize;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      
      void main() {
        // gl_PointCoord 是当前点内部的坐标，范围 [0, 1]，中心点为 (0.5, 0.5)
        // 计算当前像素距离中心点的距离
        float dist = length(gl_PointCoord - vec2(0.5));
        
        // 丢弃圆外的像素（将正方形裁剪为圆形）
        if (dist > 0.5) discard;
        
        // 边缘羽化 (抗锯齿)：在 0.4 到 0.5 的范围内做透明度渐变
        float alpha = 1.0 - smoothstep(0.4, 0.5, dist);
        
        // 输出颜色和透明度
        gl_FragColor = vec4(vColor, alpha);
      }
    `,
    transparent: true,
    vertexColors: true,
    depthWrite: false,
  });

  points = new THREE.Points(geometry, material);
  scene.add(points);

  bounds = { minX, maxX, minY, maxY };
  userAdjusted = false;
  fitCameraToBounds();
}


function fitCameraToBounds() {
  const el = containerRef.value;
  if (!el || !camera || !bounds) return;

  const width = el.clientWidth || 800;
  const height = el.clientHeight || 520;
  const spanX = Math.max(bounds.maxX - bounds.minX, 1);
  const spanY = Math.max(bounds.maxY - bounds.minY, 1);

  const usableWidth = width * (1 - FIT_PADDING * 2);
  const usableHeight = height * (1 - FIT_PADDING * 2);
  const fitScale = Math.min(usableWidth / spanX, usableHeight / spanY);

  scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, fitScale));
  camera.zoom = scale;
  camera.position.x = (bounds.minX + bounds.maxX) / 2;
  camera.position.y = (bounds.minY + bounds.maxY) / 2;
  camera.updateProjectionMatrix();

  stageSize.value = { width, height };
  syncViewState();

  zoom.value = `${Math.round(scale * 100)}%`;
}

function resize() {
  const el = containerRef.value;
  if (!el || !renderer || !camera) return;

  const width = el.clientWidth;
  const height = el.clientHeight;
  if (!width || !height) return;

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);

  camera.left = -width / 2;
  camera.right = width / 2;
  camera.top = height / 2;
  camera.bottom = -height / 2;
  camera.updateProjectionMatrix();

  stageSize.value = { width, height };
  syncViewState();

  if (!userAdjusted) fitCameraToBounds();
}

function onPointerDown(event: PointerEvent) {
  if (event.button !== 0) return;

  isDragging = true;
  lastX = event.clientX;
  lastY = event.clientY;

  renderer?.domElement.setPointerCapture(event.pointerId);
}

function onPointerMove(event: PointerEvent) {
  if (!isDragging || !camera) return;

  const dx = event.clientX - lastX;
  const dy = event.clientY - lastY;

  camera.position.x -= dx;
  camera.position.y += dy;
  userAdjusted = true;
  syncViewState();

  lastX = event.clientX;
  lastY = event.clientY;
}

function onPointerUp(event?: PointerEvent) {
  isDragging = false;
  if (renderer && event) {
    try {
      renderer.domElement.releasePointerCapture(event.pointerId);
    } catch (_) {}
  }
}

function onWheel(event: WheelEvent) {
  event.preventDefault();
  if (!camera) return;

  const factor = event.deltaY < 0 ? 1.1 : 1 / 1.1;

  scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale * factor));

  camera.zoom = scale;
  camera.updateProjectionMatrix();
  userAdjusted = true;
  syncViewState();

  zoom.value = `${Math.round(scale * 100)}%`;
}

function resetView() {
  if (!camera) return;

  userAdjusted = false;

  if (bounds) {
    fitCameraToBounds();
    return;
  }

  scale = 1;
  camera.zoom = 1;
  camera.position.set(0, 0, 1000);
  camera.updateProjectionMatrix();
  syncViewState();
  zoom.value = "100%";
}

function animate() {
  animationId = requestAnimationFrame(animate);
  if (!renderer || !scene || !camera) return;
  renderer.render(scene, camera);
}


watch(data, (list) => {
  renderPoints(list);
});

onMounted(() => {
  const el = containerRef.value;
  if (!el) return;

  try {
    scene = new THREE.Scene();
    scene.background = new THREE.Color("#0b1220");

    const width = el.clientWidth || 800;
    const height = el.clientHeight || 520;

    camera = new THREE.OrthographicCamera(
      -width / 2,
      width / 2,
      height / 2,
      -height / 2,
      0.1,
      5000,
    );

    camera.position.set(0, 0, 1000);
    camera.zoom = 1;
    camera.updateProjectionMatrix();

    stageSize.value = { width, height };
    syncViewState();

    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);

    el.appendChild(renderer.domElement);

    renderPoints(data.value);

    const canvas = renderer.domElement;
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });

    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(el);

    animate();
  } catch (error) {
    console.error(error);
    errorMessage.value = "WebGL 初始化失败，请检查浏览器是否支持 WebGL 2。";
  }
});

onBeforeUnmount(() => {
  cancelAnimationFrame(animationId);
  resizeObserver?.disconnect();

  if (renderer) {
    const canvas = renderer.domElement;

    canvas.removeEventListener("pointerdown", onPointerDown);
    canvas.removeEventListener("pointermove", onPointerMove);
    canvas.removeEventListener("pointerup", onPointerUp);
    canvas.removeEventListener("pointercancel", onPointerUp);
    canvas.removeEventListener("wheel", onWheel);

    if (points) {
      scene?.remove(points);
      points.geometry.dispose();
      (points.material as THREE.Material).dispose();
      points = null;
    }
    renderer.dispose();

    canvas.remove();
  }
});
</script>

<style scoped>
.scatter-page {
  width: 100%;
  overflow: hidden;
  color: #e5edf9;
  background: #101827;
  border: 1px solid #27364b;
  border-radius: 12px;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 20px;
}

h2 {
  margin: 0;
  font-size: 20px;
}

.toolbar p {
  margin: 8px 0 0;
  color: #91a4bf;
  font-size: 13px;
}

.stats {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 18px;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.stat span {
  color: #91a4bf;
  font-size: 12px;
}

.stat strong {
  font-size: 18px;
}

button {
  padding: 9px 14px;
  color: white;
  cursor: pointer;
  background: #2563eb;
  border: none;
  border-radius: 6px;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

button.ghost {
  color: #cfe0f5;
  background: transparent;
  border: 1px solid #3b4d69;
}

.channels {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 20px 14px;
}

.channel-chip {
  padding: 3px 10px;
  font-size: 12px;
  color: #b9cbe6;
  background: rgb(37 99 235 / 12%);
  border: 1px solid #27364b;
  border-radius: 999px;
}

.scatter-stage {
  position: relative;
}

.axis-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.axis-layer .axis-grid line {
  stroke: rgb(148 163 184 / 10%);
  stroke-width: 1;
}

.axis-layer .axis-lines line {
  stroke: rgb(148 163 184 / 40%);
  stroke-width: 1;
}

.axis-layer .axis-labels text {
  font-family: inherit;
  font-size: 11px;
  fill: #93a7c2;
}

.scatter-mask {
  position: absolute;
  inset: 0;
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: #cfe0f5;
  background: rgb(11 18 32 / 65%);
  backdrop-filter: blur(2px);
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgb(207 224 245 / 30%);
  border-top-color: #20d6ff;
  border-radius: 50%;
  animation: scatter-spin 0.8s linear infinite;
}

@keyframes scatter-spin {
  to {
    transform: rotate(360deg);
  }
}

.scatter-container {
  width: 100%;
  height: 520px;
  overflow: hidden;
  cursor: grab;
}

.scatter-container:active {
  cursor: grabbing;
}

.scatter-container :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
  touch-action: none;
}

footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 10px;
  padding: 14px 20px;
  color: #91a4bf;
  font-size: 12px;
  border-top: 1px solid #27364b;
}

.legend {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}

.legend-swatch {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  box-shadow: 0 0 8px rgb(32 214 255 / 55%);
}

.error {
  padding: 12px;
  color: #ffb4b4;
}
</style>
