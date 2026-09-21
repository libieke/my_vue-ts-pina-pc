<template>
  <ContentTitle>
    <div class="page-shell">
      <div class="page-header">
        <div>
          <h2>数据分析</h2>
        </div>
        <el-button type="primary">导出报表</el-button>
      </div>

      <div class="stat-grid">
        <div v-for="item in stats" :key="item.label" class="stat-card">
          <div class="stat-label">{{ item.label }}</div>
          <div class="stat-value">{{ item.value }}</div>
          <div class="stat-note">{{ item.note }}</div>
        </div>
      </div>

      <div class="panel-row">
        <div class="analysis-card">
          <h3>增长趋势</h3>
          <div class="chart-placeholder">
            <div class="bar-group">
              <span
                v-for="n in 9"
                :key="n"
                class="bar"
                :style="{ height: `${40 + ((n * 8) % 60)}%` }"
              />
            </div>
          </div>
        </div>

        <div class="analysis-card">
          <h3>渠道占比</h3>
          <ul class="channel-list">
            <li v-for="item in channels" :key="item.name">
              <div class="channel-name">
                <span class="dot" :style="{ background: item.color }" />
                {{ item.name }}
              </div>
              <strong>{{ item.percent }}</strong>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </ContentTitle>
</template>

<script setup lang="ts">
const stats = [
  { label: "新增用户", value: "2,438", note: "较上周 +18.2%" },
  { label: "活跃率", value: "68.4%", note: "较昨日 +1.7%" },
  { label: "转化率", value: "5.3%", note: "较上月 +0.8%" },
  { label: "GMV", value: "¥246.8K", note: "较上月 +11.9%" },
];

const channels = [
  { name: "自然流量", percent: "42%", color: "#409EFF" },
  { name: "搜索引擎", percent: "24%", color: "#67C23A" },
  { name: "社媒", percent: "18%", color: "#E6A23C" },
  { name: "推广渠道", percent: "16%", color: "#F56C6C" },
];
</script>

<style scoped lang="scss">
.page-shell {
  padding: 20px;
  background: #f5f7fb;
  min-height: calc(100vh - 90px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background-color: #fff;
  padding: 16px;
  border-radius: 12px;
}

.eyebrow {
  margin: 0 0 6px;
  color: #8a93a6;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h2 {
  margin: 0;
  font-size: 28px;
  color: #1f2430;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card,
.analysis-card {
  background: #fff;
  border-radius: 14px;
  padding: 18px 20px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.04);
}

.stat-label {
  color: #8a93a6;
  font-size: 13px;
}

.stat-value {
  margin-top: 10px;
  font-size: 30px;
  font-weight: 700;
  color: #1d2129;
}

.stat-note {
  margin-top: 8px;
  color: #2bb673;
  font-size: 13px;
}

.panel-row {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 20px;
}

.analysis-card h3 {
  margin: 0 0 18px;
  font-size: 18px;
  color: #1f2430;
}

.chart-placeholder {
  height: 230px;
  display: flex;
  align-items: flex-end;
}

.bar-group {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-end;
  gap: 10px;
}

.bar {
  flex: 1;
  border-radius: 8px 8px 0 0;
  background: linear-gradient(180deg, #9ec5ff 0%, #409eff 100%);
  min-height: 30px;
}

.channel-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.channel-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #374151;
  font-size: 14px;
}

.channel-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}
</style>
