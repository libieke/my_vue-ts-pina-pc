<template>
  <ContentTitle>
    <div class="page-shell">
      <div class="page-header">
        <div>
          <!-- <p class="eyebrow">知识库</p> -->
          <h2>文档中心</h2>
        </div>
        <el-button type="primary">上传文档</el-button>
      </div>

      <div class="doc-grid">
        <div v-for="item in docs" :key="item.name" class="doc-card">
          <div class="doc-icon">{{ item.type }}</div>
          <div class="doc-body">
            <h3>{{ item.name }}</h3>
            <p>{{ item.desc }}</p>
            <div class="doc-meta">
              <span>{{ item.size }}</span>
              <span>{{ item.time }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ContentTitle>
</template>

<script setup lang="ts">
const docs = [
  {
    name: "后台管理系统说明书.pdf",
    desc: "包含系统概览、权限说明和功能列表",
    size: "2.4 MB",
    time: "2024-06-06",
    type: "PDF",
  },
  {
    name: "用户手册.docx",
    desc: "适用于普通用户的操作说明和常见问题",
    size: "1.1 MB",
    time: "2024-06-02",
    type: "DOC",
  },
  {
    name: "接口文档.md",
    desc: "后端接口说明、字段定义及调用示例",
    size: "0.3 MB",
    time: "2024-06-01",
    type: "MD",
  },
  {
    name: "安全规范.xlsx",
    desc: "权限管理、日志审计和标准流程汇总",
    size: "780 KB",
    time: "2024-05-30",
    type: "XLS",
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

.doc-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(260px, 1fr));
  gap: 18px;
}

.doc-card {
  display: flex;
  gap: 16px;
  background: #fff;
  border-radius: 14px;
  padding: 18px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.04);
}

.doc-icon {
  width: 54px;
  height: 54px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e9f3ff, #d9ebff);
  color: #337ef6;
  font-weight: 700;
}

.doc-body {
  flex: 1;
}

.doc-body h3 {
  margin: 0 0 8px;
  font-size: 17px;
  color: #1f2430;
}

.doc-body p {
  margin: 0 0 10px;
  color: #6b7280;
  line-height: 1.7;
}

.doc-meta {
  display: flex;
  gap: 18px;
  color: #8a93a6;
  font-size: 12px;
}
</style>
