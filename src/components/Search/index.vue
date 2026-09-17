<template>
  <div class="search-wrapper">
    <el-form :model="formModel" class="search-form">
      <el-form-item
        v-for="field in fields"
        :key="field.prop"
        :label="field.label || field.prop"
        :label-width="labelWidth"
        :style="{ width: field.width || itemWidth }"
        class="search-form-item"
      >
        <el-input
          v-if="field.type === 'input'"
          v-model="formModel[field.prop]"
          v-bind="getControlProps(field, '请输入' + (field.label || field.prop))"
          @keyup.enter="handleSearch"
        />

        <el-input
          v-else-if="field.type === 'textarea'"
          v-model="formModel[field.prop]"
          type="textarea"
          :rows="3"
          v-bind="getControlProps(field, '请输入' + (field.label || field.prop))"
        />

        <el-input-number
          v-else-if="field.type === 'number'"
          v-model="formModel[field.prop]"
          v-bind="getControlProps(field)"
        />

        <el-select
          v-else-if="field.type === 'select'"
          v-model="formModel[field.prop]"
          v-bind="getControlProps(field, '请选择' + (field.label || field.prop))"
        >
          <el-option
            v-for="option in field.options || []"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>

        <el-date-picker
          v-else-if="field.type === 'date'"
          v-model="formModel[field.prop]"
          type="date"
          v-bind="getControlProps(field, '请选择' + (field.label || field.prop))"
        />

        <el-date-picker
          v-else-if="field.type === 'daterange'"
          v-model="formModel[field.prop]"
          type="daterange"
          v-bind="getControlProps(field, '请选择' + (field.label || field.prop))"
        />

        <el-date-picker
          v-else-if="field.type === 'datetime'"
          v-model="formModel[field.prop]"
          type="datetime"
          v-bind="getControlProps(field, '请选择' + (field.label || field.prop))"
        />

        <el-switch
          v-else-if="field.type === 'switch'"
          v-model="formModel[field.prop]"
          v-bind="getControlProps(field)"
        />

        <slot
          v-else-if="field.type === 'slot'"
          :name="field.slot || field.prop"
          :field="field"
          :model="formModel"
          :value="formModel[field.prop]"
        />

        <el-input
          v-else
          v-model="formModel[field.prop]"
          v-bind="getControlProps(field, '请输入' + (field.label || field.prop))"
          @keyup.enter="handleSearch"
        />
      </el-form-item>

      <el-form-item class="search-form-actions" label="">
        <el-button type="primary" :icon="Search" @click="handleSearch">
          {{ searchText }}
        </el-button>
        <el-button v-if="showReset" :icon="RefreshLeft" @click="handleReset">
          {{ resetText }}
        </el-button>
        <slot name="actions" :model="formModel" :search="handleSearch" :reset="handleReset" />
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, type PropType } from "vue";
import { RefreshLeft, Search } from "@element-plus/icons-vue";

type SearchFieldType =
  | "input"
  | "textarea"
  | "number"
  | "select"
  | "date"
  | "daterange"
  | "datetime"
  | "switch"
  | "slot";

interface SearchOption {
  label: string;
  value: string | number | boolean;
  [key: string]: any;
}

interface SearchField {
  prop: string;
  label?: string;
  type?: SearchFieldType;
  placeholder?: string;
  options?: SearchOption[];
  width?: string;
  clearable?: boolean;
  defaultValue?: any;
  slot?: string;
  props?: Record<string, any>;
}

const props = defineProps({
  fields: {
    type: Array as PropType<SearchField[]>,
    default: () => [],
  },
  modelValue: {
    type: Object as PropType<Record<string, any>>,
    default: () => ({}),
  },
  labelWidth: {
    type: String,
    default: "90px",
  },
  itemWidth: {
    type: String,
    default: "260px",
  },
  searchText: {
    type: String,
    default: "查询",
  },
  resetText: {
    type: String,
    default: "重置",
  },
  showReset: {
    type: Boolean,
    default: true,
  },
  valueFormat: {
    type: String,
    default: "YYYY-MM-DD",
  },
});

const emit = defineEmits(["search", "reset", "change", "update:modelValue"]);

const formModel = reactive<Record<string, any>>({});

const cloneValue = (value: any) => {
  if (Array.isArray(value)) {
    return value.slice();
  }
  if (value && typeof value === "object") {
    return { ...value };
  }
  return value;
};

const getDefaultValue = (field: SearchField) => {
  if (Object.prototype.hasOwnProperty.call(field, "defaultValue")) {
    return cloneValue(field.defaultValue);
  }

  if (Object.prototype.hasOwnProperty.call(props.modelValue, field.prop)) {
    return cloneValue(props.modelValue[field.prop]);
  }

  if (field.type === "daterange") {
    return [];
  }
  if (field.type === "switch") {
    return false;
  }
  return undefined;
};

const syncModel = () => {
  Object.keys(formModel).forEach((key) => {
    delete formModel[key];
  });

  props.fields.forEach((field) => {
    formModel[field.prop] = cloneValue(props.modelValue[field.prop]);
  });
};

watch(
  () => [props.fields, props.modelValue],
  () => {
    syncModel();
  },
  { deep: true, immediate: true }
);

const getControlProps = (field: SearchField, defaultPlaceholder?: string) => {
  const placeholder = field.placeholder || defaultPlaceholder;
  const baseProps: Record<string, any> = {
    clearable: field.clearable !== false,
    placeholder,
    style: { width: "100%" },
  };

  if (["date", "daterange", "datetime"].includes(field.type || "")) {
    baseProps["value-format"] = props.valueFormat;
    baseProps.startPlaceholder = "开始日期";
    baseProps.endPlaceholder = "结束日期";
    baseProps.rangeSeparator = "至";
  }

  return {
    ...baseProps,
    ...(field.props || {}),
  };
};

const emitModel = () => {
  emit("update:modelValue", cloneValue(formModel));
};

const handleSearch = () => {
  emitModel();
  emit("search", cloneValue(formModel));
};

const handleReset = () => {
  Object.keys(formModel).forEach((key) => {
    delete formModel[key];
  });

  props.fields.forEach((field) => {
    formModel[field.prop] = getDefaultValue(field);
  });

  emitModel();
  emit("reset", cloneValue(formModel));
};

const handleChange = (field: SearchField) => {
  emit("change", {
    prop: field.prop,
    value: cloneValue(formModel[field.prop]),
    model: cloneValue(formModel),
  });
};

defineExpose({
  formModel,
  search: handleSearch,
  reset: handleReset,
});
</script>

<style lang="scss" scoped>
.search-wrapper {
  width: 100%;
  padding: 16px 16px 0;
  background: #fff;
  border-radius: 8px;

  .search-form {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 20px;

    :deep(.el-form-item) {
      margin-right: 0;
      margin-bottom: 16px;
    }

    :deep(.el-form-item__content) {
      flex: 1;
      width: 100%;
    }

    :deep(.el-select),
    :deep(.el-date-editor) {
      width: 100%;
    }

    .search-form-item {
      flex-shrink: 0;
    }

    .search-form-actions {
      flex: 1;
      min-width: 200px;

      :deep(.el-form-item__content) {
        justify-content: flex-end;
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .search-wrapper {
    .search-form {
      gap: 8px 12px;
    }

    .search-form-item,
    .search-form-actions {
      width: 100% !important;
      min-width: 100% !important;
    }

    .search-form-actions {
      :deep(.el-form-item__content) {
        justify-content: flex-start;
      }
    }
  }
}
</style>
