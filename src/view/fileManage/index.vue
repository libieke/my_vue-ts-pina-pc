<template>
  <ContentTitle>
    <div class="page-shell">
      <div class="page-header">
        <div>
          <!-- <p class="eyebrow">资源管理</p> -->
          <h2>文件管理</h2>
        </div>
        <el-button type="primary">上传文件</el-button>
      </div>

      <div class="file-list">
        <div v-for="item in files" :key="item.name" class="file-row">
          <div class="file-type" :style="{ background: item.bg }">
            {{ item.type }}
          </div>
          <div class="file-body">
            <strong>{{ item.name }}</strong>
            <span>{{ item.path }}</span>
          </div>
          <span class="file-size">{{ item.size }}</span>
          <el-button size="small" link>下载</el-button>
        </div>
      </div>
    </div>
  </ContentTitle>
</template>

<script setup lang="ts">
const files = [
  {
    name: "项目介绍.pptx",
    path: "/docs/项目介绍.pptx",
    size: "5.2 MB",
    type: "PPT",
    bg: "#dfeaff",
  },
  {
    name: "logo.png",
    path: "/assets/logo.png",
    size: "840 KB",
    type: "PNG",
    bg: "#e8faef",
  },
  {
    name: "接口参数表.xlsx",
    path: "/docs/接口参数表.xlsx",
    size: "430 KB",
    type: "XLS",
    bg: "#fef1d9",
  },
  {
    name: "用户资料.zip",
    path: "/archive/user资料.zip",
    size: "12.7 MB",
    type: "ZIP",
    bg: "#f2e8ff",
  },
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

.file-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.file-row {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #fff;
  border-radius: 14px;
  padding: 16px 18px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.04);
}

.file-type {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #337ef6;
}

.file-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.file-body strong {
  color: #1f2430;
  font-size: 16px;
}

.file-body span {
  color: #8a93a6;
  font-size: 12px;
}

.file-size {
  color: #5a6473;
  font-weight: 600;
}
</style>
