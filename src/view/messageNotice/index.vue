<template>
  <ContentTitle>
    <div class="page-shell">
      <div class="page-header">
        <div>
          <!-- <p class="eyebrow">消息中心</p> -->
          <h2>{{ $t('menu.messageNotice') }}</h2>
        </div>
        <el-button type="primary">{{ $t('message.markAllRead') }}</el-button>
      </div>

      <div class="message-list">
        <div
          v-for="item in notices"
          :key="item.id"
          class="message-card"
          :class="{ unread: !item.read }"
        >
          <div class="message-icon" :style="{ background: item.color }">
            <el-icon><Bell /></el-icon>
          </div>
          <div class="message-main">
            <div class="message-top">
              <strong>{{ item.title }}</strong>
              <span class="badge" v-if="!item.read">{{ $t('message.new') }}</span>
            </div>
            <p>{{ item.content }}</p>
            <small>{{ item.time }}</small>
          </div>
        </div>
      </div>
    </div>
  </ContentTitle>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Bell } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

// 消息列表（computed 包裹，切换语言自动更新）
const notices = computed(() => [
  {
    id: 1,
    title: t("message.item1Title"),
    content: t("message.item1Content"),
    time: "2024-06-06 09:10",
    read: false,
    color: "#409EFF",
  },
  {
    id: 2,
    title: t("message.item2Title"),
    content: t("message.item2Content"),
    time: "2024-06-06 08:15",
    read: false,
    color: "#E6A23C",
  },
  {
    id: 3,
    title: t("message.item3Title"),
    content: t("message.item3Content"),
    time: "2024-06-05 17:27",
    read: true,
    color: "#67C23A",
  },
  {
    id: 4,
    title: t("message.item4Title"),
    content: t("message.item4Content"),
    time: "2024-06-04 16:40",
    read: true,
    color: "#F56C6C",
  },
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

.message-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  background: #fff;
  border-radius: 14px;
  padding: 18px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.04);
}

.message-card.unread {
  border-left: 4px solid #409eff;
}

.message-icon {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
}

.message-main {
  flex: 1;
}

.message-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.message-main strong {
  font-size: 16px;
  color: #1f2430;
}

.badge {
  background: #f56c6c;
  color: #fff;
  font-size: 10px;
  padding: 3px 6px;
  border-radius: 999px;
}

.message-main p {
  margin: 0 0 8px;
  color: #5a6473;
  line-height: 1.7;
}

.message-main small {
  color: #8a93a6;
}
</style>
