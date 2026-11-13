<template>
  <div class="big-file-uploader">
    <input
      ref="inputRef"
      type="file"
      style="display: none"
      @change="onFileChange"
    />

    <div v-if="!fileName" class="picker">
      <button class="btn primary" @click="triggerSelect">选择文件</button>
    </div>

    <div v-else class="info">
      <div class="row">
        <span class="label">文件：</span
        ><span class="value">{{ fileName }}</span>
      </div>
      <div class="row">
        <span class="label">大小：</span
        ><span class="value">{{ formatSize(fileSize) }}</span>
      </div>
      <div class="row">
        <span class="label">哈希：</span
        ><span class="value mono">{{ fileHash || "-" }}</span>
      </div>
      <div class="row">
        <span class="label">状态：</span
        ><span class="value">{{ statusText }}</span>
      </div>
      <div class="row">
        <span class="label">进度：</span
        ><span class="value">{{ progress }}%</span>
      </div>
      <div class="row">
        <span class="label">分片：</span
        ><span class="value">{{ uploadedCount }} / {{ totalChunks }}</span>
      </div>

      <div class="bar">
        <div class="bar-inner" :style="{ width: progress + '%' }" />
      </div>

      <div v-if="errorMsg" class="error">{{ errorMsg }}</div>
      <div v-if="resultUrl" class="success">
        上传成功：<a :href="resultUrl" target="_blank">{{ resultUrl }}</a>
      </div>

      <div class="actions">
        <button
          v-if="status === 'idle' || status === 'error'"
          class="btn primary"
          @click="handleStart"
        >
          开始上传
        </button>
        <button
          v-if="status === 'uploading'"
          class="btn warning"
          @click="pause"
        >
          暂停
        </button>
        <button v-if="status === 'paused'" class="btn primary" @click="resume">
          继续
        </button>

        <button
          v-if="status !== 'success'"
          class="btn danger"
          @click="handleRemove"
        >
          {{
            status === "uploading" || status === "paused"
              ? "取消上传"
              : "删除文件"
          }}
        </button>
        <button
          v-if="status === 'success'"
          class="btn danger"
          @click="handleRemove"
        >
          清空重新上传
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useChunkUpload } from "./useChunkUpload";
import type { UploaderOptions } from "./types";
import { ElMessageBox, ElMessage } from "element-plus";

const props = defineProps<{
  uploadUrl: string;
  checkUrl: string;
  mergeUrl: string;
  removeUrl: string;
  headers?: Record<string, string>;
  chunkSize?: number;
  concurrency?: number;
  retryCount?: number;
  request?: (url: string, init: RequestInit) => Promise<Response>;
}>();

const options: UploaderOptions = {
  uploadUrl: props.uploadUrl,
  checkUrl: props.checkUrl,
  mergeUrl: props.mergeUrl,
  removeUrl: props.removeUrl,
  headers: props.headers,
  chunkSize: props.chunkSize,
  concurrency: props.concurrency,
  retryCount: props.retryCount,
  request: props.request,
};

const {
  status,
  progress,
  uploadedCount,
  totalChunks,
  errorMsg,
  fileHash,
  resultUrl,
  start,
  pause,
  resume,
  cancel: clearUpload,
} = useChunkUpload(options);

const inputRef = ref<HTMLInputElement>();
const selectedFile = ref<File | null>(null);
const fileName = computed(() => selectedFile.value?.name || "");
const fileSize = computed(() => selectedFile.value?.size || 0);

const statusText = computed(() => {
  const map: Record<string, string> = {
    idle: "待上传",
    hashing: "计算哈希中…",
    checking: "校验断点中…",
    uploading: "上传中…",
    paused: "已暂停",
    merging: "合并中…",
    success: "上传成功",
    error: "上传失败",
  };
  return map[status.value] || status.value;
});

function triggerSelect() {
  inputRef.value?.click();
}

function onFileChange(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0];
  if (f) {
    selectedFile.value = f;
    clearUpload();
  }
  if (inputRef.value) inputRef.value.value = "";
}



async function handleStart() {
  if (!selectedFile.value) return;
  try {
    await ElMessageBox.confirm(
      `确认开始上传文件「${selectedFile.value.name}」吗？`,
      "上传确认",
      {
        confirmButtonText: "开始上传",
        cancelButtonText: "取消",
        type: "info",
        customStyle: {
          marginTop: "-10vh",
        },
      },
    );
    start(selectedFile.value);
  } catch {
  }
}




async function handleRemove() {
  const actionName =
    status.value === "uploading" || status.value === "paused"
      ? "取消上传"
      : "删除文件";

  try {
    await ElMessageBox.confirm(
      `确定要${actionName}吗？已上传的进度将被清空。`,
      "操作确认",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        customStyle: {
          marginTop: "-10vh",
        },
      },
    );
    clearUpload();
    selectedFile.value = null;
    ElMessage.success(`${actionName}成功`);
  } catch {
  }
}

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 ** 2) return (bytes / 1024).toFixed(1) + " KB";
  if (bytes < 1024 ** 3) return (bytes / 1024 ** 2).toFixed(1) + " MB";
  return (bytes / 1024 ** 3).toFixed(2) + " GB";
}
</script>

<style scoped>
.big-file-uploader {
  max-width: 100%;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
}
.info {
  margin-top: 12px;
}
.row {
  display: flex;
  margin: 6px 0;
}
.label {
  width: 64px;
  color: #6b7280;
  flex-shrink: 0;
}
.value {
  color: #111827;
  word-break: break-all;
}
.mono {
  font-family: monospace;
  font-size: 12px;
}
.bar {
  margin: 12px 0;
  height: 8px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
}
.bar-inner {
  height: 100%;
  background: #3b82f6;
  transition: width 0.2s;
}
.error {
  color: #dc2626;
  margin: 8px 0;
}
.success {
  color: #16a34a;
  margin: 8px 0;
  word-break: break-all;
}
.actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.btn {
  padding: 6px 14px;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}
.btn.primary {
  background: #3b82f6;
  color: white;
}
.btn.primary:hover {
  background: #2563eb;
}
.btn.warning {
  background: #f59e0b;
  color: white;
}
.btn.warning:hover {
  background: #d97706;
}
.btn.danger {
  background: #ef4444;
  color: white;
}
.btn.danger:hover {
  background: #dc2626;
}
</style>
