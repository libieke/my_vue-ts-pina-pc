




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
          :style="itemStyle"
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

<script setup>
const props = defineProps({
  items: { type: Array, default: () => [] },
  itemSize: { type: Number, default: null },
  estimatedItemSize: { type: Number, default: 50 },
  overscan: { type: Number, default: 3 },
  keyField: { type: String, default: "id" },
  columns: { type: Array, default: () => [] },
});

const columns = computed(() =>
  Array.isArray(props.columns) ? props.columns : [],
);
const hasColumns = computed(() => columns.value.length > 0);

const scrollbarWidth = ref(0);

function measureScrollbar() {
  const el = containerRef.value;
  if (!el) return;
  scrollbarWidth.value = Math.max(0, el.offsetWidth - el.clientWidth);
}

function cellStyle(column) {
  const style = { minWidth: 0 };
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

const itemStyle = computed(() => {
  if (!hasColumns.value || !props.itemSize) return null;
  return { height: `${props.itemSize}px` };
});

function formatCell(item, column) {
  const value = item?.[column.key];
  return value === undefined || value === null ? "" : String(value);
}

const containerRef = ref(null);
const scrollTop = ref(0);
const viewportHeight = ref(0);
const itemRefs = new Map();

const measuredHeights = ref(new Map());
const prefixSums = ref([0]);

const totalHeight = computed(() => {
  if (props.itemSize) {
    return props.items.length * props.itemSize;
  }
  return prefixSums.value[prefixSums.value.length - 1] || 0;
});

function computeRange() {
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

function findIndexByOffset(offset) {
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

const range = computed(() => computeRange());

const startIndex = computed(() => range.value.start);

const visibleItems = computed(() => {
  const { start, end } = range.value;
  return props.items.slice(start, end);
});

const offsetY = computed(() => {
  if (props.itemSize) return startIndex.value * props.itemSize;
  return prefixSums.value[startIndex.value] || 0;
});

let rafId = null;
function handleScroll(e) {
  if (rafId) return;
  rafId = requestAnimationFrame(() => {
    scrollTop.value = e.target.scrollTop;
    rafId = null;
  });
}

function setItemRef(el, index) {
  if (!el) {
    itemRefs.delete(index);
    return;
  }
  itemRefs.set(index, el);
}

function rebuildPrefixSums() {
  const sums = [0];
  for (let i = 0; i < props.items.length; i++) {
    const h = measuredHeights.value.get(i) ?? props.estimatedItemSize;
    sums.push(sums[i] + h);
  }
  prefixSums.value = sums;
}

function updateItemHeight(index, height) {
  const prev = measuredHeights.value.get(index);
  if (prev !== undefined && Math.abs(prev - height) < 0.5) return;
  measuredHeights.value.set(index, height);
  rebuildPrefixSums();
}

let resizeObserver = null;
function observeRenderedItems() {
  if (props.itemSize) return;
  if (!resizeObserver) {
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const index = Number(entry.target.dataset.index);
        const height = entry.target.getBoundingClientRect().height;
        updateItemHeight(index, height);
      }
    });
  }
  resizeObserver.disconnect();
  itemRefs.forEach((el) => resizeObserver.observe(el));
}


onMounted(() => {
  viewportHeight.value = containerRef.value.clientHeight;
  rebuildPrefixSums();

  const containerObserver = new ResizeObserver(() => {
    viewportHeight.value = containerRef.value?.clientHeight || 0;
    measureScrollbar();
  });
  containerObserver.observe(containerRef.value);

  nextTick(() => {
    measureScrollbar();
    observeRenderedItems();
  });

  onBeforeUnmount(() => {
    containerObserver.disconnect();
    resizeObserver?.disconnect();
    if (rafId) cancelAnimationFrame(rafId);
  });
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

function getKey(item, index) {
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
  gap: 12px;
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
  gap: 12px;
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
