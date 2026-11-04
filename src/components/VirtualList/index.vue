




<template>
  <div class="virtual-list-root">
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

    <div ref="containerRef" class="virtual-list" @scroll.passive="handleScroll">
      <div
        class="virtual-list__phantom"
        :style="{ height: totalHeight + 'px' }"
      ></div>

      <div
        class="virtual-list__content"
        :style="{ transform: `translateY(${offsetY}px)` }"
      >
        <div
          v-for="(item, idx) in visibleItems"
          :key="getKey(item, startIndex + idx)"
          :ref="(el) => setItemRef(el, startIndex + idx)"
          class="virtual-list__item"
          :class="{ 'virtual-list__item--columns': hasColumns }"
          :style="itemStyle ?? undefined"
          :data-index="startIndex + idx"
        >
          <slot v-if="!hasColumns" :item="item" :index="startIndex + idx" />

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
                :index="startIndex + idx"
                :column="column"
              >
                <span class="virtual-list__text">{{
                  formatCell(item, column)
                }}</span>
              </slot>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ComponentPublicInstance, CSSProperties } from "vue";

type ListItem = Record<string, any>;

export interface ColumnConfig {
  key: string;
  label?: string;
  width?: number | string;
  flex?: number;
  align?: "left" | "center" | "right";
}

interface Range {
  start: number;
  end: number;
}

interface Props {
  items?: ListItem[];
  itemSize?: number | null;
  estimatedItemSize?: number;
  overscan?: number;
  keyField?: string;
  columns?: ColumnConfig[];
  debug?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  itemSize: null,
  estimatedItemSize: 50,
  overscan: 3,
  keyField: "id",
  columns: () => [],
  debug: false,
});

const columns = computed<ColumnConfig[]>(() =>
  Array.isArray(props.columns) ? props.columns : [],
);
const hasColumns = computed<boolean>(() => columns.value.length > 0);

const scrollbarWidth = ref<number>(0);

function measureScrollbar(): void {
  const el = containerRef.value;
  if (!el) return;
  scrollbarWidth.value = Math.max(0, el.offsetWidth - el.clientWidth);
}

function cellStyle(column: ColumnConfig): CSSProperties {
  const style: CSSProperties = { minWidth: 0 };
  if (column.width) {
    style.width =
      typeof column.width === "number" ? `${column.width}px` : column.width;
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

const itemStyle = computed<CSSProperties | null>(() => {
  if (!hasColumns.value || !props.itemSize) return null;
  return { height: `${props.itemSize}px` };
});

function formatCell(item: ListItem, column: ColumnConfig): string {
  const value = item?.[column.key];
  return value === undefined || value === null ? "" : String(value);
}

const containerRef = ref<HTMLElement | null>(null);
const scrollTop = ref<number>(0);
const viewportHeight = ref<number>(0);
const itemRefs = new Map<number, HTMLElement>();

const measuredHeights = ref<Map<number, number>>(new Map());
const prefixSums = ref<number[]>([0]);

const totalHeight = computed<number>(() => {
  if (props.itemSize) {
    return props.items.length * props.itemSize;
  }
  return prefixSums.value[prefixSums.value.length - 1] || 0;
});

function computeRange(): Range {
  const count = props.items.length;
  if (count === 0) return { start: 0, end: 0 };

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

function findIndexByOffset(offset: number): number {
  const sums = prefixSums.value;
  let lo = 0;
  let hi = sums.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (sums[mid] <= offset) lo = mid;
    else hi = mid - 1;
  }
  return Math.min(lo, props.items.length - 1);
}

const range = computed<Range>(() => computeRange());

const startIndex = computed<number>(() => range.value.start);

const visibleItems = computed<ListItem[]>(() => {
  const { start, end } = range.value;
  return props.items.slice(start, end);
});

const offsetY = computed<number>(() => {
  if (props.itemSize) return startIndex.value * props.itemSize;
  return prefixSums.value[startIndex.value] || 0;
});

watch(
  () => props.items,
  (items) => {
    if (!props.debug) return;
    console.log(
      `[VirtualList] 数据源共 ${items.length} 条，首屏渲染 ${visibleItems.value.length} 条`,
      visibleItems.value,
    );
  },
  { immediate: true },
);

watch(startIndex, (start) => {
  if (!props.debug) return;
  const items = visibleItems.value;
  console.log(
    `[VirtualList] 滚动渲染第 ${start} ~ ${start + items.length - 1} 条（共 ${props.items.length} 条）`,
    items,
  );
});

let rafId: ReturnType<typeof requestAnimationFrame> | null = null;

function handleScroll(e: Event): void {
  if (rafId) return;
  const target = e.target as HTMLElement;
  rafId = requestAnimationFrame(() => {
    scrollTop.value = target.scrollTop;
    rafId = null;
  });
}

function setItemRef(
  el: Element | ComponentPublicInstance | null,
  index: number,
): void {
  if (!el || !(el instanceof HTMLElement)) {
    itemRefs.delete(index);
    return;
  }
  itemRefs.set(index, el);
}

function rebuildPrefixSums(): void {
  const sums: number[] = [0];
  for (let i = 0; i < props.items.length; i++) {
    const h = measuredHeights.value.get(i) ?? props.estimatedItemSize;
    sums.push(sums[i] + h);
  }
  prefixSums.value = sums;
}

function updateItemHeight(index: number, height: number): void {
  const prev = measuredHeights.value.get(index);
  if (prev !== undefined && Math.abs(prev - height) < 0.5) return;
  measuredHeights.value.set(index, height);
  rebuildPrefixSums();
}

let resizeObserver: ResizeObserver | null = null;

function observeRenderedItems(): void {
  if (props.itemSize) return;
  if (!resizeObserver) {
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const target = entry.target as HTMLElement;
        const index = Number(target.dataset.index);
        const height = target.getBoundingClientRect().height;
        updateItemHeight(index, height);
      }
    });
  }
  resizeObserver.disconnect();
  itemRefs.forEach((el) => resizeObserver!.observe(el));
}

let containerObserver: ResizeObserver | null = null;

onMounted(() => {
  viewportHeight.value = containerRef.value?.clientHeight ?? 0;
  rebuildPrefixSums();

  containerObserver = new ResizeObserver(() => {
    viewportHeight.value = containerRef.value?.clientHeight || 0;
    measureScrollbar();
  });
  if (containerRef.value) {
    containerObserver.observe(containerRef.value);
  }

  nextTick(() => {
    measureScrollbar();
    observeRenderedItems();
  });
});

onBeforeUnmount(() => {
  containerObserver?.disconnect();
  resizeObserver?.disconnect();
  if (rafId) cancelAnimationFrame(rafId);
});

watch(
  () => props.items,
  () => {
    measuredHeights.value.clear();
    itemRefs.clear();
    rebuildPrefixSums();
    nextTick(() => {
      measureScrollbar();
      observeRenderedItems();
    });
  },
);

watch(startIndex, () => {
  nextTick(observeRenderedItems);
});

function getKey(item: ListItem, index: number): string | number {
  return item?.[props.keyField] ?? index;
}
</script>

<style scoped>
.virtual-list-root {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.virtual-list__header {
  box-sizing: border-box;
  display: flex;
  flex: none;
  gap: 14px;
  align-items: center;
  height: 38px;
  font-size: 12px;
  color: #86909c;
  background: #fafbfc;
  border-bottom: 1px solid #eef0f3;
}

.virtual-list {
  position: relative;
  flex: 1 1 0;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  contain: strict;
}

.virtual-list::-webkit-scrollbar {
  width: 6px;
}

.virtual-list::-webkit-scrollbar-thumb {
  background: #dcdfe6;
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
}

.virtual-list__item--columns {
  display: flex;
  gap: 18px;
  align-items: center;
  font-size: 13px;
  color: #1d2129;
  border-bottom: 1px solid #f2f3f5;
}

.virtual-list__cell {
  display: flex;
  align-items: center;
  min-width: 0;
  overflow: hidden;
}

.virtual-list__cell--header {
  font-weight: 400;
  white-space: nowrap;
}

.virtual-list__text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
