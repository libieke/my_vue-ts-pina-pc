<template>
  <ContentTitle>
    <div class="page-shell">
      <div class="page-header">
        <div>
          <h2>{{ $t('menu.dataAnalysis') }}</h2>
        </div>
        <el-button type="primary">{{ $t('analysis.exportReport') }}</el-button>
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
          <h3>{{ $t('analysis.growthTrend') }}</h3>
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
          <h3>{{ $t('analysis.channelShare') }}</h3>
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
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

// 统计卡片与渠道列表（computed 包裹，切换语言自动更新）
const stats = computed(() => [
  { label: t("analysis.statNewUsers"), value: "2,438", note: t("analysis.noteUsers") },
  { label: t("analysis.statActiveRate"), value: "68.4%", note: t("analysis.noteActive") },
  { label: t("analysis.statConversion"), value: "5.3%", note: t("analysis.noteConversion") },
  { label: t("analysis.statGmv"), value: "¥246.8K", note: t("analysis.noteGmv") },
]);

const channels = computed(() => [
  { name: t("analysis.channelOrganic"), percent: "42%", color: "#409EFF" },
  { name: t("analysis.channelSearch"), percent: "24%", color: "#67C23A" },
  { name: t("analysis.channelSocial"), percent: "18%", color: "#E6A23C" },
  { name: t("analysis.channelPromotion"), percent: "16%", color: "#F56C6C" },
]);
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
