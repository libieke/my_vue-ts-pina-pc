<template>
  <div class="scatter-page">
    <header class="toolbar">
      <div>
        <h2>WebGL 高性能散点图</h2>
        <p>GPU 批量渲染 · 支持平移和缩放</p>
      </div>

      <div class="stats">
        <div class="stat">
          <span>数据总量</span>
          <strong>{{ pointCount.toLocaleString() }}</strong>
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

    <div class="scatter-stage">
      <div ref="containerRef" class="scatter-container"></div>
      <div v-if="loading" class="scatter-mask">
        <span class="spinner"></span>
        <span>正在获取散点数据…</span>
      </div>
    </div>

    <div v-if="loadError || errorMessage" class="error">
      {{ loadError || errorMessage }}
    </div>

    <footer>
      <span>● 蓝紫色渐变代表不同数值</span>
      <span>鼠标拖动平移 · 滚轮缩放</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import * as THREE from "three";
import { useScatterData } from "@/hooks";
import type { ScatterPoint } from "@/mock/scatterData";

const {
  data,
  loading,
  error: loadError,
  pointCount,
  reload,
} = useScatterData({ count: 5000 });

const containerRef = ref<HTMLDivElement | null>(null);
const zoom = ref("100%");
const errorMessage = ref("");

let scene: THREE.Scene | null = null;
let camera: THREE.OrthographicCamera | null = null;
let renderer: THREE.WebGLRenderer | null = null;
let points: THREE.Points | null = null;
let animationId = 0;
let resizeObserver: ResizeObserver | null = null;

let isDragging = false;
let lastX = 0;
let lastY = 0;
let scale = 1;

const MIN_SCALE = 0.2;
const MAX_SCALE = 10;


function renderPoints(list: ScatterPoint[]) {
  if (!scene) return;

  if (points) {
    scene.remove(points);
    points.geometry.dispose();
    (points.material as THREE.Material).dispose();
    points = null;
  }

  if (list.length === 0) return;

  const positions = new Float32Array(list.length * 3);
  const colors = new Float32Array(list.length * 3);

  const colorA = new THREE.Color("#20d6ff");
  const colorB = new THREE.Color("#7c4dff");
  const tmpColor = new THREE.Color();

  list.forEach((point, index) => {
    const offset = index * 3;

    positions[offset] = point.x;
    positions[offset + 1] = point.y;
    positions[offset + 2] = 0;

    tmpColor.copy(colorA).lerp(colorB, point.value);

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

  zoom.value = `${Math.round(scale * 100)}%`;
}

function resetView() {
  if (!camera) return;

  scale = 1;
  camera.zoom = 1;
  camera.position.set(0, 0, 1000);
  camera.updateProjectionMatrix();
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

.scatter-stage {
  position: relative;
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

.error {
  padding: 12px;
  color: #ffb4b4;
}
</style>
