<template>
  <ContentTitle>
    <template #title>图表文件</template>
    <div class="map-box">
      <div class="map-item l7-content">
        <h4>L7 地图</h4>
        <MapChartL7 />
      </div>

      <div class="map-item g2-content">
        <h4>G2 地图</h4>
        <MapChartG2 />
      </div>

      <div class="map-item g6-content">
        <h4>G6 地图</h4>
        <MapChartG6 />
      </div>
    </div>
  </ContentTitle>
</template>

<script lang="ts" setup></script>

<style scoped lang="scss">
.map-box {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(12px, 1.5vw, 20px);
  padding: clamp(8px, 1.2vw, 14px);
}

.map-item {
  min-width: 0;
  padding: clamp(12px, 1.4vw, 20px);
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 10%);

  h4 {
    margin-bottom: 12px;
    font-size: 16px;
    color: #333;
  }

  :deep(.chart-card) {
    padding: 0;
    background: transparent;
    border: none;
    border-radius: 0;
    box-shadow: none;
  }
}

.l7-content {
  grid-column: 1 / -1;
}

@media (max-width: 900px) {
  .map-box {
    grid-template-columns: 1fr;
  }
}
</style>
