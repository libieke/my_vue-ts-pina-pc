<template>
  <div class="rich-text-editor">
    <QuillEditor
      ref="quillRef"
      :model-value="modelValue"
      :options="editorOptions"
      :disabled="disabled"
      :style="{ minHeight: `${height}px` }"
      @update:model-value="handleUpdate"
    />
    <input
      v-if="showImageUpload"
      ref="imageInputRef"
      type="file"
      :accept="imageAccept"
      class="hidden-image-input"
      @change="handleImageSelected"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";

type ToolbarItem =
  | string
  | Record<string, number[] | boolean | string>
  | Array<string | Record<string, any>>;

const defaultToolbar = [
  ["bold", "italic", "underline"],
  [{ header: [1, 2, 3, false] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["link"],
  ["clean"],
] as Array<ToolbarItem>;

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    placeholder?: string;
    height?: number;
    disabled?: boolean;
    toolbar?: Array<ToolbarItem>;
    maxLength?: number;
    showImageUpload?: boolean;
    imageAccept?: string;
    uploadImage?: (file: File) => Promise<string> | string;
  }>(),
  {
    modelValue: "",
    placeholder: "请输入内容...",
    height: 260,
    disabled: false,
    toolbar: () => [
      ["bold", "italic", "underline"],
      [{ header: [1, 2, 3, false] }],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      ["clean"],
    ] as Array<ToolbarItem>,
    maxLength: 0,
    showImageUpload: false,
    imageAccept: "image/*",
    uploadImage: undefined,
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "change", value: string): void;
  (e: "image-upload-error", error: Error): void;
}>();

const quillRef = ref<any>(null);
const imageInputRef = ref<HTMLInputElement | null>(null);

const getQuillInstance = () => quillRef.value?.getQuill?.();

const stripHtml = (html: string) => {
  const temp = document.createElement("div");
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || "";
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const truncateRichText = (value: string) => {
  const text = stripHtml(value).replace(/\s+/g, " ").trim();
  if (!props.maxLength || text.length <= props.maxLength) {
    return value;
  }
  const truncated = text.slice(0, props.maxLength).trim();
  return `<p>${escapeHtml(truncated).replace(/\n/g, "<br>")}</p>`;
};

const handleImageClick = () => {
  if (!props.showImageUpload) return;
  imageInputRef.value?.click();
};

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("文件读取失败"));
    reader.readAsDataURL(file);
  });

const insertImageToEditor = (imageUrl: string) => {
  const quill = getQuillInstance();
  if (!quill) return;
  const range = quill.getSelection(true);
  const index = range ? range.index : quill.getLength();
  quill.insertEmbed(index, "image", imageUrl, "user");
  quill.setSelection(index + 1, 0);
};

const handleImageSelected = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  try {
    const imageUrl = props.uploadImage
      ? await props.uploadImage(file)
      : await fileToDataUrl(file);
    insertImageToEditor(imageUrl);
  } catch (error) {
    emit("image-upload-error", error as Error);
  } finally {
    input.value = "";
  }
};

const editorOptions = computed(() => {
  const toolbarConfig = [...(props.toolbar ?? defaultToolbar)];
  if (
    props.showImageUpload &&
    !toolbarConfig.some((item) => Array.isArray(item) && item.includes("image"))
  ) {
    toolbarConfig.push(["image"] as unknown as ToolbarItem);
  }

  return {
    theme: "snow",
    placeholder: props.placeholder,
    modules: {
      toolbar: {
        container: toolbarConfig,
        handlers: {
          image: handleImageClick,
        },
      },
    },
  };
});

const handleUpdate = (value: string) => {
  const safeValue = props.maxLength
    ? truncateRichText(value || "")
    : value || "";
  emit("update:modelValue", safeValue);
  emit("change", safeValue);
};
</script>

<style scoped>
.rich-text-editor {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
  overflow: hidden;
}

.hidden-image-input {
  display: none;
}

:deep(.ql-toolbar) {
  border: none;
  border-bottom: 1px solid #f1f2f3;
  background: #fafafa;
}

:deep(.ql-container) {
  border: none;
  min-height: 200px;
  font-size: 14px;
  color: #1f2937;
}

:deep(.ql-editor) {
  min-height: 200px;
  line-height: 1.8;
  padding: 14px 16px;
}

:deep(.ql-editor.ql-blank::before) {
  color: #9ca3af;
  font-style: normal;
}
</style>
