<script setup lang="ts">
import { nextTick, onMounted, ref } from "vue";
import { ChatDotRound, Promotion } from "@element-plus/icons-vue";
import userAvatar from "@/assets/pictrue/avatar.png";
import { sendMessage } from "@/api/chat";

interface ChatItem {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: number;
}

const HISTORY_PAGE_SIZE = 18;
const INITIAL_VISIBLE_COUNT = 22;

const input = ref("");
const loading = ref(false);
const loadingHistory = ref(false);
const hasMore = ref(true);
const error = ref("");
const messages = ref<ChatItem[]>([]);
const listRef = ref<HTMLElement | null>(null);

let oldestVisibleIndex = 0;
let localId = 0;

const historyPool: Array<Pick<ChatItem, "role" | "content">> = [
  {
    role: "user",
    content: "帮我看看最近有哪些重点消息。",
  },
  {
    role: "assistant",
    content: "已为你整理最近的重要事项：三条订单提醒、两条系统通知。",
  },
  {
    role: "user",
    content: "订单总量和销售额分别有多少？",
  },
  {
    role: "assistant",
    content: "当前订单总量为 1,256 单，销售额约 98,560 元。",
  },
  {
    role: "user",
    content: "如果客户要求退款，应该走什么流程？",
  },
  {
    role: "assistant",
    content: "先在订单详情中确认支付状态，再提交退款申请，财务审核后原路退回。",
  },
  {
    role: "user",
    content: "把这些数据生成一份简洁的日报。",
  },
  {
    role: "assistant",
    content:
      "好的，日报已生成：今日访问 1,280，新增订单 36 单，销售额 12,450 元。",
  },
];

function createMockHistory(): ChatItem[] {
  const now = Date.now();
  const total = 42;

  return Array.from({ length: total }, (_, index) => {
    const source = historyPool[index % historyPool.length];

    return {
      id: `history-${index}`,
      role: source.role,
      content: source.content,
      time: now - (total - 1 - index) * 3 * 60 * 1000,
    };
  });
}

const history = createMockHistory();

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatTime(timestamp: number) {
  const date = new Date(timestamp);
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`;

  if (date.toDateString() === now.toDateString()) {
    return time;
  }

  if (date.getFullYear() === now.getFullYear()) {
    return `${date.getMonth() + 1}月${date.getDate()}日 ${time}`;
  }

  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${time}`;
}

function shouldShowTime(index: number) {
  if (index === 0) return true;

  return (
    messages.value[index].time - messages.value[index - 1].time > 5 * 60 * 1000
  );
}

function nextId(role: ChatItem["role"]) {
  localId += 1;

  return `${role}-${Date.now()}-${localId}`;
}

function scrollToBottom(smooth = false) {
  void nextTick(() => {
    const element = listRef.value;

    if (!element) return;

    if (typeof element.scrollTo === "function") {
      element.scrollTo({
        top: element.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
      return;
    }

    element.scrollTop = element.scrollHeight;
  });
}

async function loadOlderMessages() {
  if (loadingHistory.value || !hasMore.value) return;

  const element = listRef.value;

  if (!element) return;

  const previousHeight = element.scrollHeight;
  const previousTop = element.scrollTop;

  loadingHistory.value = true;
  await wait(450);

  const start = Math.max(0, oldestVisibleIndex - HISTORY_PAGE_SIZE);
  const olderMessages = history.slice(start, oldestVisibleIndex);

  messages.value = [...olderMessages, ...messages.value];
  oldestVisibleIndex = start;
  hasMore.value = oldestVisibleIndex > 0;
  loadingHistory.value = false;

  await nextTick();
  element.scrollTop = previousTop + (element.scrollHeight - previousHeight);
}

function handleScroll() {
  const element = listRef.value;

  if (!element) return;

  if (element.scrollTop <= 40) {
    void loadOlderMessages();
  }
}

async function submit() {
  const text = input.value.trim();

  if (!text || loading.value) return;

  messages.value.push({
    id: nextId("user"),
    role: "user",
    content: text,
    time: Date.now(),
  });

  input.value = "";
  error.value = "";
  loading.value = true;
  scrollToBottom(true);

  try {
    const result = await sendMessage(text);

    messages.value.push({
      id: nextId("assistant"),
      role: "assistant",
      content: result.answer,
      time: Date.now(),
    });
    scrollToBottom(true);
  } catch (e) {
    error.value = "请求失败，请检查后端服务和网络。";
    console.error(e);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  oldestVisibleIndex = history.length - INITIAL_VISIBLE_COUNT;
  messages.value = history.slice(oldestVisibleIndex);
  hasMore.value = oldestVisibleIndex > 0;
  scrollToBottom();
});
</script>

<template>
  <main class="chat-panel">
    <header class="chat-header">
      <div class="ai-avatar">
        <el-icon><ChatDotRound /></el-icon>
      </div>
      <!-- <div class="chat-header__meta">
        <strong>AI Agent 助手</strong>
        <span>在线</span>
      </div> -->
    </header>

    <section ref="listRef" class="chat-list" @scroll.passive="handleScroll">
      <div v-if="loadingHistory" class="history-tip">正在加载历史消息…</div>
      <div v-else-if="!hasMore && messages.length" class="history-tip">
        没有更多消息了
      </div>

      <template v-for="(item, index) in messages" :key="item.id">
        <div v-if="shouldShowTime(index)" class="time-divider">
          {{ formatTime(item.time) }}
        </div>

        <div
          class="message-row"
          :class="{ 'message-row--right': item.role === 'user' }"
        >
          <div class="avatar" :class="item.role">
            <img v-if="item.role === 'user'" :src="userAvatar" alt="我" />
            <el-icon v-else><ChatDotRound /></el-icon>
          </div>

          <div class="message-body">
            <div class="bubble" :class="item.role">{{ item.content }}</div>
          </div>
        </div>
      </template>

      <div v-if="loading" class="message-row message-row--left">
        <div class="avatar assistant">
          <el-icon><ChatDotRound /></el-icon>
        </div>
        <div class="message-body">
          <div class="bubble assistant typing">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>

      <div v-if="error" class="error-tip">{{ error }}</div>
    </section>

    <form class="chat-input" @submit.prevent="submit">
      <div class="chat-input__row">
        <input v-model="input" :disabled="loading" placeholder="输入消息…" />

        <button
          type="submit"
          class="send-button"
          :disabled="loading || !input.trim()"
        >
          <span>发送</span>
          <el-icon><Promotion /></el-icon>
        </button>
      </div>
    </form>
  </main>
</template>

<style lang="scss" scoped>
.chat-panel {
  width: 100%;
  max-width: 600px;
  height: min(680px, calc(100vh - 350px));
  min-height: 480px;
  margin: 0 auto 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ededed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.chat-header {
  flex-shrink: 0;
  height: 64px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 18px;
  border-bottom: 1px solid #e5e7eb;
  background: #f7f7f7;

  .ai-avatar {
    width: 40px;
    height: 40px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #07c160;
    color: #fff;
    font-size: 22px;
  }

  .chat-header__meta {
    display: flex;
    flex-direction: column;
    line-height: 1.3;

    strong {
      font-size: 16px;
      font-weight: 600;
      color: #1f2329;
    }

    span {
      margin-top: 2px;
      font-size: 12px;
      color: #86909c;
    }
  }
}

.chat-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 14px 16px 18px;
  scrollbar-width: thin;
  scrollbar-color: #c9cdd4 transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 3px;
    background: #c9cdd4;
  }
}

.history-tip,
.time-divider,
.error-tip {
  margin: 10px 0 14px;
  text-align: center;
  font-size: 12px;
  color: #86909c;
}

.time-divider {
  color: #b0b3b8;
}

.error-tip {
  color: #e54d42;
}

.message-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 16px 0;

  .avatar {
    width: 38px;
    height: 38px;
    flex-shrink: 0;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    font-size: 20px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    &.assistant {
      background: #07c160;
      color: #fff;
    }

    &.user {
      background: #d9d9d9;
    }
  }

  .message-body {
    max-width: calc(100% - 52px);
  }

  .bubble {
    position: relative;
    display: inline-block;
    max-width: 100%;
    padding: 10px 12px;
    border-radius: 4px 10px 10px 10px;
    font-size: 14px;
    line-height: 1.6;
    color: #1f2329;
    background: #fff;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  &.message-row--right {
    flex-direction: row-reverse;

    .bubble {
      border-radius: 10px 4px 10px 10px;
      background: #95ec69;
    }
  }
}

.bubble.typing {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 12px 14px;

  span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #86909c;
    animation: typing 1.2s ease-in-out infinite;

    &:nth-child(2) {
      animation-delay: 0.15s;
    }

    &:nth-child(3) {
      animation-delay: 0.3s;
    }
  }
}

.chat-input {
  flex-shrink: 0;
  padding: 12px 16px 16px;
  border-top: 1px solid #e5e7eb;
  background: #f7f7f7;

  .chat-input__row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  input {
    flex: 1;
    min-width: 0;
    height: 40px;
    padding: 0 14px;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    background: #fff;
    font-size: 14px;
    color: #1f2329;
    outline: none;

    &:focus {
      border-color: #07c160;
    }

    &::placeholder {
      color: #b0b3b8;
    }

    &:disabled {
      cursor: not-allowed;
      background: #f2f3f5;
    }
  }

  .send-button {
    height: 40px;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 0 18px;
    border: 0;
    border-radius: 6px;
    background: #07c160;
    color: #fff;
    font-size: 14px;
    cursor: pointer;

    &:hover:not(:disabled) {
      background: #06ad56;
    }

    &:disabled {
      cursor: not-allowed;
      background: #9fe0be;
    }
  }
}

@keyframes typing {
  0%,
  60%,
  100% {
    opacity: 0.35;
    transform: translateY(0);
  }

  30% {
    opacity: 1;
    transform: translateY(-3px);
  }
}

@media screen and (max-width: 768px) {
  .chat-panel {
    height: 72vh;
    min-height: 420px;
  }

  .message-row .message-body {
    max-width: calc(100% - 48px);
  }
}
</style>
