<template>
  <div class="virtual-list-root">
    <div
      v-if="searchable || showAutoScrollToggle || showSpeedControl"
      class="virtual-list__toolbar"
    >
      <el-input
        v-if="searchable"
        v-model="searchKeyword"
        class="virtual-list__search"
        :placeholder="searchPlaceholder"
        clearable
        size="default"
      >
      </el-input>

      <span class="virtual-list__result"> {{ filteredItems.length }} 条 </span>

      <div class="virtual-list__controls">
        <el-button
          v-if="showAutoScrollToggle"
          size="default"
          :type="autoScroll ? 'primary' : 'default'"
          plain
          @click="toggleAutoScroll"
        >
          {{ autoScroll ? "暂停滚动" : "开始滚动" }}
        </el-button>

        <el-select
          v-if="showSpeedControl"
          :model-value="autoScrollSpeed"
          class="virtual-list__speed-select"
          size="default"
          @update:model-value="handleSpeedChange"
        >
          <el-option
            v-for="option in speedOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </div>
    </div>

    <div
      v-if="hasColumns"
      class="virtual-list__header"
      :style="{ paddingRight: `${scrollbarWidth}px` }"
    >
      <div
        v-for="column in columns"
        :key="column.key"
        class="virtual-list__cell virtual-list__cell--header"
        :style="cellStyle(column)"
      >
        {{ column.label }}
      </div>
    </div>

    <div
      ref="containerRef"
      class="virtual-list"
      @scroll.passive="handleScroll"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <div
        class="virtual-list__phantom"
        :style="{ height: `${totalHeight}px` }"
      />

      <div
        class="virtual-list__content"
        :style="{ transform: `translateY(${offsetY}px)` }"
      >
        <div
          v-for="(item, idx) in visibleItems"
          :key="getKey(item, startIndex + idx)"
          :ref="(el) => setItemRef(el, startIndex + idx)"
          class="virtual-list__item"
          :class="{
            'virtual-list__item--columns': hasColumns,
          }"
          :style="itemStyle"
          :data-index="startIndex + idx"
        >
          <slot
            v-if="!hasColumns"
            :item="item"
            :index="getSourceIndex(startIndex + idx)"
          />

          <template v-else>
            <div
              v-for="column in columns"
              :key="column.key"
              class="virtual-list__cell"
              :style="cellStyle(column)"
            >
              <slot
                :name="`cell-${column.key}`"
                :item="item"
                :index="getSourceIndex(startIndex + idx)"
                :column="column"
              >
                <span class="virtual-list__text">
                  {{ formatCell(item, column) }}
                </span>
              </slot>
            </div>
          </template>
        </div>
      </div>

      <div v-if="filteredItems.length === 0" class="virtual-list__empty">
        {{ searchKeyword ? "暂无匹配数据" : emptyText }}
      </div>
    </div>

    <div v-if="showAutoScrollToggle" class="virtual-list__status">
      <span
        class="virtual-list__status-dot"
        :class="{
          'is-running': isAutoScrolling,
          'is-paused': !isAutoScrolling,
        }"
      />
      {{ isAutoScrolling ? "自动滚动中" : "已暂停" }}

      <span v-if="isHovering" class="virtual-list__hover-tip">
        鼠标悬停，滚动已暂停
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";

import type { ComponentPublicInstance, CSSProperties } from "vue";

type ListItem = Record<string, any>;

export interface ColumnConfig {
  key: string;
  label?: string;
  width?: number | string;
  flex?: number;
  align?: "left" | "center" | "right";
}

interface Props {
  items?: ListItem[];

  itemSize?: number | null;

  estimatedItemSize?: number;
  overscan?: number;
  keyField?: string;
  columns?: ColumnConfig[];
  debug?: boolean;

  searchable?: boolean;
  searchFields?: string[];
  searchPlaceholder?: string;

  searchFormatter?: (
    item: ListItem,
    field: string,
  ) => string | number | null | undefined;

  autoScroll?: boolean;
  autoScrollSpeed?: number;
  autoScrollLoop?: boolean;

  showAutoScrollToggle?: boolean;
  showSpeedControl?: boolean;

  emptyText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  itemSize: null,
  estimatedItemSize: 50,
  overscan: 3,
  keyField: "id",
  columns: () => [],
  debug: false,

  searchable: false,
  searchFields: () => [],
  searchPlaceholder: "请输入搜索内容",

  autoScroll: true,
  autoScrollSpeed: 30,
  autoScrollLoop: true,

  showAutoScrollToggle: false,
  showSpeedControl: false,

  emptyText: "暂无数据",
});

const emit = defineEmits<{
  (e: "update:autoScroll", value: boolean): void;
  (e: "update:autoScrollSpeed", value: number): void;
  (e: "auto-scroll-change", value: boolean): void;
  (e: "search-change", value: string): void;
}>();


const columns = computed(() => props.columns || []);

const hasColumns = computed(() => columns.value.length > 0);

const containerRef = ref<HTMLElement | null>(null);

const scrollTop = ref(0);

const viewportHeight = ref(0);

const scrollbarWidth = ref(0);

const searchKeyword = ref("");

const isHovering = ref(false);

const speedOptions = [
  { label: "慢速", value: 15 },
  { label: "较慢", value: 20 },
  { label: "标准", value: 30 },
  { label: "快速", value: 50 },
  { label: "极速", value: 80 },
];

const itemStyle = computed<CSSProperties | undefined>(() => {
  if (!props.itemSize) return undefined;

  return {
    height: `${props.itemSize}px`,
  };
});


const filteredItems = computed<ListItem[]>(() => {
  const keyword = searchKeyword.value.trim().toLowerCase();

  if (!keyword) {
    return props.items;
  }

  return props.items.filter((item) => {
    const fields = props.searchFields.length
      ? props.searchFields
      : Object.keys(item || {});

    return fields.some((field) => {
      const value = props.searchFormatter
        ? props.searchFormatter(item, field)
        : item?.[field];

      if (value === null || value === undefined) {
        return false;
      }

      return String(value).toLowerCase().includes(keyword);
    });
  });
});

watch(searchKeyword, (keyword) => {
  emit("search-change", keyword.trim());
});

watch(
  filteredItems,
  async () => {
    measuredHeights.clear();
    rebuildPrefixSums();

    await nextTick();
    resetScrollPosition();
    observeRenderedItems();

    if (props.debug) {
      console.log(
        "[VirtualList] 搜索结果：",
        filteredItems.value.length,
        filteredItems.value,
      );
    }
  },
  { flush: "post" },
);


const baseHeight = computed(() => {
  if (!props.itemSize) return 0;

  return filteredItems.value.length * props.itemSize;
});

const shouldLoop = computed(() => {
  return (
    Boolean(props.itemSize) &&
    props.autoScrollLoop &&
    filteredItems.value.length > 0 &&
    baseHeight.value > viewportHeight.value
  );
});

const displayItems = computed<ListItem[]>(() => {
  if (shouldLoop.value) {
    return [
      ...filteredItems.value,
      ...filteredItems.value,
      ...filteredItems.value,
    ];
  }

  return filteredItems.value;
});

function getSourceIndex(displayIndex: number): number {
  const count = filteredItems.value.length;

  if (count === 0) return 0;

  return shouldLoop.value ? displayIndex % count : displayIndex;
}


const measuredHeights = new Map<number, number>();

const prefixSums = ref<number[]>([0]);

function rebuildPrefixSums() {
  const sums = [0];

  filteredItems.value.forEach((_, index) => {
    const height = measuredHeights.get(index) ?? props.estimatedItemSize;

    sums.push(sums[index] + height);
  });

  prefixSums.value = sums;
}

function findIndexByOffset(offset: number): number {
  const sums = prefixSums.value;

  let low = 0;
  let high = sums.length - 1;

  while (low < high) {
    const mid = Math.floor((low + high + 1) / 2);

    if (sums[mid] <= offset) {
      low = mid;
    } else {
      high = mid - 1;
    }
  }

  return Math.min(low, filteredItems.value.length - 1);
}


interface Range {
  start: number;
  end: number;
}

function computeRange(): Range {
  const count = displayItems.value.length;

  if (count === 0) {
    return { start: 0, end: 0 };
  }

  const top = scrollTop.value;
  const bottom = top + viewportHeight.value;

  if (props.itemSize) {
    const start = Math.max(
      0,
      Math.floor(top / props.itemSize) - props.overscan,
    );

    const visibleCount = Math.ceil(viewportHeight.value / props.itemSize);

    const end = Math.min(count, start + visibleCount + props.overscan * 2);

    return { start, end };
  }

  const start = Math.max(0, findIndexByOffset(top) - props.overscan);

  const end = Math.min(count, findIndexByOffset(bottom) + props.overscan + 1);

  return { start, end };
}

const range = computed(() => computeRange());

const startIndex = computed(() => range.value.start);

const visibleItems = computed(() => {
  const { start, end } = range.value;

  return displayItems.value.slice(start, end);
});

const totalHeight = computed(() => {
  if (props.itemSize) {
    return displayItems.value.length * props.itemSize;
  }

  return prefixSums.value[prefixSums.value.length - 1] || 0;
});

const offsetY = computed(() => {
  if (props.itemSize) {
    return startIndex.value * props.itemSize;
  }

  return prefixSums.value[startIndex.value] || 0;
});


function cellStyle(column: ColumnConfig): CSSProperties {
  const style: CSSProperties = {
    minWidth: 0,
  };

  if (column.width) {
    style.width =
      typeof column.width === "number" ? `${column.width}px` : column.width;

    style.flex = "none";
  }

  if (column.flex) {
    style.flex = `${column.flex} 1 0`;
  }

  if (column.align === "right") {
    style.justifyContent = "flex-end";
    style.textAlign = "right";
  } else if (column.align === "center") {
    style.justifyContent = "center";
    style.textAlign = "center";
  }

  return style;
}

function formatCell(item: ListItem, column: ColumnConfig): string {
  const value = item?.[column.key];

  return value === undefined || value === null ? "" : String(value);
}

function getKey(item: ListItem, index: number): string | number {
  const sourceKey = item?.[props.keyField] ?? index;

  return `${String(sourceKey)}-${index}`;
}


function normalizeScrollPosition() {
  const el = containerRef.value;

  if (!el || !shouldLoop.value) return;

  const height = baseHeight.value;
  const top = el.scrollTop;

  if (top >= height * 2) {
    el.scrollTop = top - height;
  }


  scrollTop.value = el.scrollTop;
}

function resetScrollPosition() {
  const el = containerRef.value;

  if (!el) return;

  el.scrollTop = 0;

  scrollTop.value = 0;
}

function handleScroll(event: Event) {
  const el = event.target as HTMLElement;


  scrollTop.value = el.scrollTop;
}


const isAutoScrolling = computed(() => {
  return props.autoScroll && !isHovering.value && shouldLoop.value;
});

let rafId: number | null = null;

let lastFrameTime = 0;
let scrollRemainder = 0;

function autoScrollFrame(time: number) {
  if (!isAutoScrolling.value) {
    stopAutoScroll();
    return;
  }

  const el = containerRef.value;

  if (!el) {
    stopAutoScroll();
    return;
  }

  if (!lastFrameTime) {
    lastFrameTime = time;
  }

  const delta = Math.min(time - lastFrameTime, 50);

  lastFrameTime = time;

  const distance = (props.autoScrollSpeed * delta) / 1000;

  scrollRemainder += distance;

  const movePixels = Math.floor(scrollRemainder);

  if (movePixels >= 1) {
    el.scrollTop += movePixels;

    scrollRemainder -= movePixels;

    normalizeScrollPosition();

    scrollTop.value = el.scrollTop;
  }

  rafId = requestAnimationFrame(autoScrollFrame);
}

function startAutoScroll() {
  if (rafId !== null || !isAutoScrolling.value) {
    return;
  }

  lastFrameTime = 0;
  scrollRemainder = 0;

  rafId = requestAnimationFrame(autoScrollFrame);
}

function stopAutoScroll() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  lastFrameTime = 0;
  scrollRemainder = 0;
}

function toggleAutoScroll() {
  const nextValue = !props.autoScroll;

  emit("update:autoScroll", nextValue);
  emit("auto-scroll-change", nextValue);
}

function handleSpeedChange(value: number) {
  emit("update:autoScrollSpeed", Number(value));
}

function handleMouseEnter() {
  isHovering.value = true;
}

function handleMouseLeave() {
  isHovering.value = false;
}

watch(
  [() => props.autoScroll, () => props.autoScrollSpeed, isHovering, shouldLoop],
  () => {
    stopAutoScroll();
    startAutoScroll();
  },
);


const itemRefs = new Map<number, HTMLElement>();

let resizeObserver: ResizeObserver | null = null;

let containerObserver: ResizeObserver | null = null;

function setItemRef(
  el: Element | ComponentPublicInstance | null,
  index: number,
) {
  if (!el || !(el instanceof HTMLElement)) {
    itemRefs.delete(index);
    return;
  }

  itemRefs.set(index, el);
}

function observeRenderedItems() {
  if (props.itemSize || typeof ResizeObserver === "undefined") {
    return;
  }

  if (!resizeObserver) {
    resizeObserver = new ResizeObserver((entries) => {
      let changed = false;

      for (const entry of entries) {
        const el = entry.target as HTMLElement;
        const index = Number(el.dataset.index);

        const height = el.getBoundingClientRect().height;

        const previous = measuredHeights.get(index);

        if (previous === undefined || Math.abs(previous - height) >= 0.5) {
          measuredHeights.set(index, height);
          changed = true;
        }
      }

      if (changed) {
        rebuildPrefixSums();
      }
    });
  }

  resizeObserver.disconnect();

  itemRefs.forEach((el) => {
    resizeObserver?.observe(el);
  });
}

watch(startIndex, async () => {
  await nextTick();
  observeRenderedItems();
});

onMounted(async () => {
  const el = containerRef.value;

  if (!el) return;

  viewportHeight.value = el.clientHeight;

  if (typeof ResizeObserver !== "undefined") {
    containerObserver = new ResizeObserver(() => {
      viewportHeight.value = el.clientHeight;

      measureScrollbar();
    });

    containerObserver.observe(el);
  }

  await nextTick();

  measureScrollbar();

  resetScrollPosition();

  rebuildPrefixSums();

  observeRenderedItems();

  startAutoScroll();

  if (props.debug) {
    console.log(
      `[VirtualList] 原始数据 ${props.items.length} 条，搜索结果 ${filteredItems.value.length} 条`,
    );
  }
});

function measureScrollbar() {
  const el = containerRef.value;

  if (!el) return;

  scrollbarWidth.value = Math.max(0, el.offsetWidth - el.clientWidth);
}

watch(
  () => props.items,
  async () => {
    measuredHeights.clear();
    rebuildPrefixSums();

    await nextTick();

    resetScrollPosition();
    observeRenderedItems();

    if (props.debug) {
      console.log("[VirtualList] 数据源更新：", props.items.length);
    }
  },
  { deep: false },
);

watch(shouldLoop, async () => {
  await nextTick();
  resetScrollPosition();
});

onBeforeUnmount(() => {
  stopAutoScroll();

  resizeObserver?.disconnect();
  containerObserver?.disconnect();

  itemRefs.clear();
  measuredHeights.clear();
});
</script>

<style scoped>
.virtual-list-root {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.virtual-list__toolbar {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 56px;
  padding: 8px 16px;
  border-bottom: 1px solid #ebeef5;
}

.virtual-list__search {
  width: min(420px, 45%);
}

.virtual-list__result {
  flex: 1;
  color: #909399;
  font-size: 13px;
  text-align: center;
  white-space: nowrap;
}

.virtual-list__controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.virtual-list__speed-select {
  width: 150px;
}

.virtual-list__header {
  display: flex;
  flex: none;
  align-items: center;
  gap: 18px;
  box-sizing: border-box;
  height: 54px;
  padding: 0 16px;
  color: #86909c;
  font-size: 13px;
  background: #f8fafc;
  border-bottom: 1px solid #ebeef5;
}

.virtual-list__cell {
  display: flex;
  align-items: center;
  min-width: 0;
  overflow: hidden;
}

.virtual-list__cell--header {
  font-weight: 500;
  white-space: nowrap;
}

.virtual-list {
  position: relative;
  flex: 1 1 0;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  contain: strict;
}

.virtual-list::-webkit-scrollbar {
  width: 6px;
}

.virtual-list::-webkit-scrollbar-thumb {
  background: #c9cdd4;
  border-radius: 3px;
}

.virtual-list::-webkit-scrollbar-track {
  background: transparent;
}

.virtual-list__phantom {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  z-index: -1;
  pointer-events: none;
}

.virtual-list__content {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  will-change: transform;
}

.virtual-list__item {
  box-sizing: border-box;
  width: 100%;
}
.virtual-list__item:hover {
  background-color: #f2f3f5;
}

.virtual-list__item--columns {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 0 16px;
  color: #1d2129;
  font-size: 13px;
  border-bottom: 1px solid #f2f3f5;
}

.virtual-list__text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.virtual-list__empty {
  position: absolute;
  top: 50%;
  left: 50%;
  color: #909399;
  font-size: 14px;
  transform: translate(-50%, -50%);
}

.virtual-list__status {
  display: flex;
  flex: none;
  align-items: center;
  gap: 7px;
  padding: 7px 16px;
  color: #909399;
  font-size: 12px;
  border-top: 1px solid #ebeef5;
}

.virtual-list__status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #c0c4cc;
}

.virtual-list__status-dot.is-running {
  background: #67c23a;
  box-shadow: 0 0 5px rgb(103 194 58 / 45%);
}

.virtual-list__status-dot.is-paused {
  background: #e6a23c;
}

.virtual-list__hover-tip {
  margin-left: auto;
  color: #e6a23c;
}
</style>
