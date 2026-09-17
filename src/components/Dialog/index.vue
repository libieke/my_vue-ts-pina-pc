<template>
  <el-dialog
    v-model="visible"
    :title="title"
    :width="width"
    :top="top"
    :close-on-click-modal="closeOnClickModal"
    :close-on-press-escape="closeOnPressEscape"
    :show-close="showClose"
    :append-to-body="appendToBody"
    :destroy-on-close="destroyOnClose"
    :draggable="draggable"
    :center="center"
    @open="handleOpen"
    @closed="handleClosed"
  >
    <div class="dialog-content">
      <slot />
    </div>

    <template #footer v-if="showFooter">
      <slot
        name="footer"
        :confirm="handleConfirm"
        :cancel="handleCancel"
        :close="closeDialog"
      >
        <div class="dialog-footer">
          <el-button v-if="showCancelButton" plain @click="handleCancel">
            {{ cancelText }}
          </el-button>
          <el-button type="primary" :loading="confirmLoading" @click="handleConfirm">
            {{ confirmText }}
          </el-button>
        </div>
      </slot>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "提示",
  },
  width: {
    type: String,
    default: "520px",
  },
  top: {
    type: String,
    default: "10vh",
  },
  showClose: {
    type: Boolean,
    default: true,
  },
  closeOnClickModal: {
    type: Boolean,
    default: false,
  },
  closeOnPressEscape: {
    type: Boolean,
    default: true,
  },
  appendToBody: {
    type: Boolean,
    default: true,
  },
  destroyOnClose: {
    type: Boolean,
    default: false,
  },
  draggable: {
    type: Boolean,
    default: false,
  },
  center: {
    type: Boolean,
    default: false,
  },
  confirmText: {
    type: String,
    default: "确定",
  },
  cancelText: {
    type: String,
    default: "取消",
  },
  showFooter: {
    type: Boolean,
    default: true,
  },
  showCancelButton: {
    type: Boolean,
    default: true,
  },
  confirmLoading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "update:modelValue",
  "confirm",
  "cancel",
  "open",
  "closed",
]);

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value),
});

const closeDialog = () => {
  visible.value = false;
};

const handleConfirm = () => {
  emit("confirm");
};

const handleCancel = () => {
  closeDialog();
  emit("cancel");
};

const handleOpen = () => {
  emit("open");
};

const handleClosed = () => {
  emit("closed");
};
</script>

<style lang="scss" scoped>
.dialog-content {
  color: #303133;
  line-height: 1.8;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.el-dialog__header) {
  padding: 18px 20px 12px;
  border-bottom: 1px solid #f0f2f5;
}

:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-dialog__footer) {
  padding: 14px 20px 18px;
  border-top: 1px solid #f0f2f5;
}
</style>
