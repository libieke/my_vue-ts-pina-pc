```vue
<template>
  <el-config-provider :locale="elementLocale">
    <div id="app">
      <router-view />

      <!-- 可拖动的智能助手悬浮按钮 -->
      <div
        class="chat-container"
        :style="chatPosition"
        @mousedown="startDrag"
        @touchstart.prevent="startTouchDrag"
        @click="handleClick"
      >
        <p>智能</p>
        <p>助手</p>
      </div>

      <!-- 保留原有弹窗和聊天组件 -->
      <Dialog
        v-model="dialogVisible"
        :title="'AI Agent 助手'"
        :showFooter="false"
        @cancel="handleDialogCancel"
      >
        <Chat />
      </Dialog>
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue";
import { useI18n } from "vue-i18n";
import zhCn from "element-plus/dist/locale/zh-cn.mjs";
import en from "element-plus/dist/locale/en.mjs";

// 根据你项目的实际路径引入 Dialog 和 Chat
// import Dialog from '@/components/Dialog.vue'
// import Chat from '@/components/Chat.vue'

const dialogVisible = ref(false);
const { locale } = useI18n();

const elementLocale = computed(() => (locale.value === "zh-CN" ? zhCn : en));

// 悬浮按钮初始位置：距离右侧、底部各 20px
const position = ref({
  right: 20,
  bottom: 20,
});

const chatPosition = computed(() => ({
  right: `${position.value.right}px`,
  bottom: `${position.value.bottom}px`,
}));

let dragging = false;
let moved = false;
let startX = 0;
let startY = 0;
let initialRight = 0;
let initialBottom = 0;

// 鼠标按下
function startDrag(event: MouseEvent) {
  if (event.button !== 0) return;

  dragging = true;
  moved = false;

  startX = event.clientX;
  startY = event.clientY;
  initialRight = position.value.right;
  initialBottom = position.value.bottom;

  window.addEventListener("mousemove", onDrag);
  window.addEventListener("mouseup", stopDrag);
}

// 触摸屏按下
function startTouchDrag(event: TouchEvent) {
  const touch = event.touches[0];
  if (!touch) return;

  dragging = true;
  moved = false;

  startX = touch.clientX;
  startY = touch.clientY;
  initialRight = position.value.right;
  initialBottom = position.value.bottom;

  window.addEventListener("touchmove", onTouchDrag, {
    passive: false,
  });
  window.addEventListener("touchend", stopDrag);
  window.addEventListener("touchcancel", stopDrag);
}

// 鼠标移动
function onDrag(event: MouseEvent) {
  if (!dragging) return;

  updatePosition(event.clientX, event.clientY);
}

// 触摸移动
function onTouchDrag(event: TouchEvent) {
  if (!dragging) return;

  event.preventDefault();

  const touch = event.touches[0];
  if (!touch) return;

  updatePosition(touch.clientX, touch.clientY);
}

// 更新位置，限制在浏览器可视区域内
function updatePosition(clientX: number, clientY: number) {
  const deltaX = clientX - startX;
  const deltaY = clientY - startY;

  if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
    moved = true;
  }

  const buttonSize = 58;

  const maxRight = Math.max(0, window.innerWidth - buttonSize);
  const maxBottom = Math.max(0, window.innerHeight - buttonSize);

  position.value = {
    right: Math.min(maxRight, Math.max(0, initialRight - deltaX)),
    bottom: Math.min(maxBottom, Math.max(0, initialBottom - deltaY)),
  };
}

// 松开鼠标或手指
function stopDrag() {
  dragging = false;

  window.removeEventListener("mousemove", onDrag);
  window.removeEventListener("mouseup", stopDrag);
  window.removeEventListener("touchmove", onTouchDrag);
  window.removeEventListener("touchend", stopDrag);
  window.removeEventListener("touchcancel", stopDrag);
}

// 拖动后不触发点击，避免拖动时误打开弹窗
function handleClick(event: MouseEvent) {
  if (moved) {
    event.stopPropagation();
    moved = false;
    return;
  }

  dialogVisible.value = true;
}

function handleDialogCancel() {
  dialogVisible.value = false;
}
onBeforeUnmount(() => {
  stopDrag();
});
</script>

<style>
#app {
  width: 100%;
  min-height: 100vh;
  background-color: #fff;
}

/* 智能助手拖动按钮 */
.chat-container {
  width: 58px;
  height: 58px;
  box-sizing: border-box;

  position: fixed;
  z-index: 9999;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  border-radius: 50%;
  padding: 4px 0;

  color: #fff;
  font-size: 13px;
  line-height: 18px;
  background-color: #11344b;

  text-align: center;
  cursor: grab;
  touch-action: none;
  user-select: none;

  box-shadow: 0 4px 12px rgb(0 0 0 / 20%);
  transition: box-shadow 0.2s;
}

.chat-container:active {
  cursor: grabbing;
  box-shadow: 0 6px 18px rgb(0 0 0 / 30%);
}

.chat-container p {
  margin: 0;
  padding: 0;
}
</style>
```
